import sql from "../../db";
import { strictBody } from "../utils/validate"; // ปรับ path ให้ตรงโปรเจกต์คุณ

export const createPost = async ({ body, user, set }: any) => {
  try {
    if (!user || !user.student_id) {
      set.status = 401;
      return { error: "Please login first" };
    }

    const allowed = ["category_id", "title", "description", "image_urls"];
    const required = ["category_id", "title", "image_urls"];
    const v = strictBody(body, allowed, required);
    if (!v.ok) {
      set.status = 400;
      return { error: v.error };
    }

    const { category_id, title, description, image_urls } = body;

    if (!Array.isArray(image_urls) || image_urls.length === 0) {
      set.status = 400;
      return { error: "image_urls must be a non-empty array" };
    }
    if (image_urls.some((u) => typeof u !== "string" || u.trim() === "")) {
      set.status = 400;
      return { error: "image_urls must be array of non-empty strings" };
    }

    // เช็ค category มีจริง
    const cat = await sql`
      SELECT category_id FROM "Category"
      WHERE category_id = ${category_id}
      LIMIT 1
    `;
    if (cat.length === 0) {
      set.status = 400;
      return { error: "category_id not found" };
    }

    // ✅ ใช้ transaction กันหลุดครึ่งทาง (postgres.js รองรับ sql.begin)
    const result = await sql.begin(async (tx: any) => {
      const postRows = await tx`
        INSERT INTO "Post"(student_id, title, description, status, created_at, updated_at)
        VALUES (${user.student_id}, ${title}, ${description ?? null}, 'OPEN', NOW(), NOW())
        RETURNING post_id, student_id, title, description, status, created_at, updated_at
      `;
      const post = postRows[0];

      await tx`
        INSERT INTO "post_category"(category_id, post_id)
        VALUES (${category_id}, ${post.post_id})
      `;

      // insert images
      for (const url of image_urls) {
        await tx`
          INSERT INTO "post_image"(post_id, image_url)
          VALUES (${post.post_id}, ${url})
        `;
      }

      const imgs = await tx`
        SELECT image_id, image_url
        FROM "post_image"
        WHERE post_id = ${post.post_id}
        ORDER BY image_id ASC
      `;

      return { post, images: imgs };
    });

    set.status = 201;
    return { message: "Post created successfully!", data: result };
  } catch (err: any) {
    console.error("createPost error:", err);
    set.status = 500;
    return { error: err.message };
  }
};
export const getMyPosts = async ({ user, set }: any) => {
  try {
    if (!user || !user.student_id) {
      set.status = 401;
      return { error: "กรุณา Login ก่อน" };
    }

    const posts = await sql`
      SELECT 
  p.post_id,
  p.student_id,
  u.first_name,
  u.last_name,
  p.title,
  p.description,
  p.status,

  TO_CHAR(
    p.created_at AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Bangkok',
    'DD/MM/YYYY HH24:MI:SS'
  ) AS created_at_th,

  COALESCE(
    (
      SELECT json_agg(
        jsonb_build_object(
          'image_id', pi.image_id,
          'image_url', pi.image_url
        )
      )
      FROM "post_image" pi
      WHERE pi.post_id = p.post_id
    ),
    '[]'
  ) AS images

FROM "Post" p
JOIN "User" u ON u.student_id = p.student_id
WHERE p.student_id = ${user.student_id}
ORDER BY p.created_at DESC
    `;

    return { data: posts };
  } catch (err: any) {
    set.status = 500;
    return { error: err.message };
  }
};
export const editPost = async ({ params, body, user, set }: any) => {
  try {
    if (!user || !user.student_id) {
      set.status = 401;
      return { error: "Please login first" };
    }

    const post_id = Number(params.post_id ?? params.id);
    if (!post_id || Number.isNaN(post_id)) {
      set.status = 400;
      return { error: "invalid post_id" };
    }

    // strict: ขาดไม่ได้ เกินไม่ได้
    const allowed = [
      "category_id",
      "title",
      "description",
      "status",
      "image_urls",
    ];
    const required = [
      "category_id",
      "title",
      "description",
      "status",
      "image_urls",
    ];
    const v = strictBody(body, allowed, required);
    if (!v.ok) {
      set.status = 400;
      return { error: v.error };
    }

    const { category_id, title, description, status, image_urls } = body;

    if (!Array.isArray(image_urls) || image_urls.length === 0) {
      set.status = 400;
      return { error: "image_urls must be a non-empty array" };
    }
    if (image_urls.some((u) => typeof u !== "string" || u.trim() === "")) {
      set.status = 400;
      return { error: "image_urls must be array of non-empty strings" };
    }

    // เช็ค category มีจริง
    const cat = await sql`
      SELECT category_id FROM "Category"
      WHERE category_id = ${category_id}
      LIMIT 1
    `;
    if (cat.length === 0) {
      set.status = 400;
      return { error: "category_id not found" };
    }

    // ใช้ transaction กันหลุดครึ่งทาง
    const result = await sql.begin(async (tx: any) => {
      // 1) เช็คว่าโพสต์มีจริง + เป็นเจ้าของ (หรือ ADMIN)
      const found = await tx`
        SELECT post_id, student_id
        FROM "Post"
        WHERE post_id = ${post_id}
        LIMIT 1
      `;

      if (found.length === 0) {
        set.status = 404;
        return { error: "Post not found" };
      }

      const owner_id = found[0].student_id;
      const isOwner = owner_id === user.student_id;
      const isAdmin = user.role === "ADMIN";

      if (!isOwner && !isAdmin) {
        set.status = 403;
        return { error: "Forbidden" };
      }

      // 2) Update Post (อย่าลืม updated_at)
      const updatedPostRows = await tx`
        UPDATE "Post"
        SET
          title = ${title},
          description = ${description},
          status = ${status},
          updated_at = NOW()
        WHERE post_id = ${post_id}
        RETURNING post_id, student_id, title, description, status, created_at, updated_at
      `;
      const updatedPost = updatedPostRows[0];

      // 3) Update category: ลบของเก่าแล้วใส่ใหม่ (รองรับ 1 category ต่อโพสต์)
      await tx`DELETE FROM "post_category" WHERE post_id = ${post_id}`;
      await tx`
        INSERT INTO "post_category"(category_id, post_id)
        VALUES (${category_id}, ${post_id})
      `;

      // 4) Replace images: ลบรูปเก่าแล้วใส่ใหม่
      await tx`DELETE FROM "post_image" WHERE post_id = ${post_id}`;
      for (const url of image_urls) {
        await tx`
          INSERT INTO "post_image"(post_id, image_url)
          VALUES (${post_id}, ${url})
        `;
      }

      // 5) ดึงข้อมูลกลับมาให้ครบ (category + images)
      const fullRows = await tx`
        SELECT 
          p.post_id,
          p.title,
          p.description,
          p.status,
          c.category_id,
          c.category_name,
          TO_CHAR(
            p.created_at AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Bangkok',
            'DD/MM/YYYY HH24:MI:SS'
          ) AS created_at_th,
          COALESCE(
            json_agg(
              DISTINCT jsonb_build_object(
                'image_id', pi.image_id,
                'image_url', pi.image_url
              )
            ) FILTER (WHERE pi.image_id IS NOT NULL),
            '[]'::json
          ) AS images
        FROM "Post" p
        LEFT JOIN "post_category" pc ON pc.post_id = p.post_id
        LEFT JOIN "Category" c ON c.category_id = pc.category_id
        LEFT JOIN "post_image" pi ON pi.post_id = p.post_id
        WHERE p.post_id = ${post_id}
        GROUP BY p.post_id, c.category_id
        LIMIT 1
      `;

      return { message: "Post updated successfully!", data: fullRows[0] };
    });

    // ถ้า transaction return error object จากข้างใน
    if (result?.error) return result;

    set.status = 200;
    return result;
  } catch (err: any) {
    console.error("editPost error:", err);
    set.status = 500;
    return { error: err.message };
  }
};
export const deletePost = async ({ params, user, set }: any) => {
  try {
    if (!user || !user.student_id) {
      set.status = 401;
      return { error: "Please login first" };
    }

    const post_id = Number(params.post_id ?? params.id);
    if (!post_id || Number.isNaN(post_id)) {
      set.status = 400;
      return { error: "invalid post_id" };
    }

    const result = await sql.begin(async (tx: any) => {
      // 1) เช็ค post มีจริง
      const found = await tx`
        SELECT post_id, student_id
        FROM "Post"
        WHERE post_id = ${post_id}
        LIMIT 1
      `;

      if (found.length === 0) {
        set.status = 404;
        return { error: "Post not found" };
      }

      // 2) เช็คสิทธิ์ (owner หรือ admin)
      const owner_id = found[0].student_id;
      const isOwner = owner_id === user.student_id;
      const isAdmin = user.role === "ADMIN";

      if (!isOwner && !isAdmin) {
        set.status = 403;
        return { error: "Forbidden" };
      }

      // 3) ลบ children ก่อน (กัน FK error)
      await tx`DELETE FROM "post_image" WHERE post_id = ${post_id}`;
      await tx`DELETE FROM "post_category" WHERE post_id = ${post_id}`;

      // ถ้าคุณมีตารางอื่นที่อ้าง post_id (favorite/report/chat/exchange) แล้วยังไม่ได้ cascade
      // อาจต้องลบเพิ่มตรงนี้ด้วย หรือทำ ON DELETE CASCADE ใน DB

      // 4) ลบ post
      const deleted = await tx`
        DELETE FROM "Post"
        WHERE post_id = ${post_id}
        RETURNING post_id
      `;

      return { message: "Post deleted successfully!", data: deleted[0] };
    });

    if (result?.error) return result;

    set.status = 200;
    return result;
  } catch (err: any) {
    console.error("deletePost error:", err);

    // ถ้าติด Foreign Key จะมักขึ้น code 23503
    if (err.code === "23503") {
      set.status = 409;
      return {
        error:
          "Cannot delete post because it is referenced by other records (FK constraint). You may need cascade delete or soft delete.",
        detail: err.detail,
      };
    }

    set.status = 500;
    return { error: err.message };
  }
};
