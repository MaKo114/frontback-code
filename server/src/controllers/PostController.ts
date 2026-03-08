import sql from "../../db";
import cloudinary from "../lib/clodinary";
import { strictBody } from "../utils/validate"; // ปรับ path ให้ตรงโปรเจกต์คุณ

export const createPost = async ({ body, user, set }: any) => {
  try {
    if (!user || !user.student_id) {
      set.status = 401;
      return { error: "Please login first" };
    }

    // ✅ 1. ปรับชื่อฟิลด์จาก image_urls เป็น image_data (ให้สื่อความหมายว่าเป็น object)
    const allowed = ["category_id", "title", "description", "image_data"];
    const required = ["category_id", "title", "image_data"];
    const v = strictBody(body, allowed, required);
    if (!v.ok) {
      set.status = 400;
      return { error: v.error };
    }

    const category_id = Number(body.category_id);
    const { title, description, image_data } = body;

    // ✅ 2. ปรับการ Check: ตรวจสอบว่าเป็น Array ของ Object หรือไม่
    if (!Array.isArray(image_data) || image_data.length === 0) {
      set.status = 400;
      return { error: "image_data must be a non-empty array" };
    }

    // ตรวจสอบว่าข้างในมี url และ public_id ครบไหม
    if (image_data.some((img) => !img.url || !img.public_id)) {
      set.status = 400;
      return { error: "Each image must have both url and public_id" };
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

      // ✅ 3. ปรับการ Insert: บันทึกทั้ง image_url และ public_id
      for (const img of image_data) {
        await tx`
  INSERT INTO "post_image"(post_id, image_url, public_id)
  VALUES (${post.post_id}, ${img.url}, ${img.public_id || ""})
`;
      }

      const imgs = await tx`
        SELECT image_id, image_url, public_id
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
          'image_url', pi.image_url,
          'public_id', pi.public_id
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

// แทนที่ function editPost ใน PostController.ts

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

    // ✅ เปลี่ยน image_urls → image_data, ตัด status ออก (ไม่ได้ส่งมา)
    const allowed = ["category_id", "title", "description", "image_data"];
    const required = ["category_id", "title", "image_data"];
    const v = strictBody(body, allowed, required);
    if (!v.ok) {
      set.status = 400;
      return { error: v.error };
    }

    const { category_id, title, description, image_data } = body;

    // ✅ validate image_data เหมือน createPost
    if (!Array.isArray(image_data) || image_data.length === 0) {
      set.status = 400;
      return { error: "image_data must be a non-empty array" };
    }
    // แต่ละ item ต้องมี url (public_id อาจเป็น "" ถ้ารูปเก่าไม่มี public_id)
    if (image_data.some((img: any) => !img.url)) {
      set.status = 400;
      return { error: "Each image must have a url" };
    }

    // เช็ค category มีจริง
    const cat = await sql`
      SELECT category_id FROM "Category"
      WHERE category_id = ${category_id} LIMIT 1
    `;
    if (cat.length === 0) {
      set.status = 400;
      return { error: "category_id not found" };
    }

    const result = await sql.begin(async (tx: any) => {
      const found = await tx`
        SELECT post_id, student_id FROM "Post"
        WHERE post_id = ${post_id} LIMIT 1
      `;
      if (found.length === 0) {
        set.status = 404;
        return { error: "Post not found" };
      }

      const isOwner = found[0].student_id === user.student_id;
      const isAdmin = user.role === "ADMIN";
      if (!isOwner && !isAdmin) {
        set.status = 403;
        return { error: "Forbidden" };
      }

      // Update Post (ไม่แตะ status)
      await tx`
        UPDATE "Post"
        SET title = ${title}, description = ${description ?? null}, updated_at = NOW()
        WHERE post_id = ${post_id}
      `;

      // Update category
      await tx`DELETE FROM "post_category" WHERE post_id = ${post_id}`;
      await tx`
        INSERT INTO "post_category"(category_id, post_id)
        VALUES (${Number(category_id)}, ${post_id})
      `;

      // ✅ Replace images — ลบเก่า insert ใหม่ด้วย url + public_id
      await tx`DELETE FROM "post_image" WHERE post_id = ${post_id}`;
      for (const img of image_data) {
        await tx`
  INSERT INTO "post_image"(post_id, image_url, public_id)
  VALUES (${post_id}, ${img.url}, ${img.public_id || ""})
`;
      }

      const fullRows = await tx`
        SELECT 
          p.post_id, p.title, p.description, p.status,
          c.category_id, c.category_name,
          TO_CHAR(
            p.created_at AT TIME ZONE 'UTC' AT TIME ZONE 'Asia/Bangkok',
            'DD/MM/YYYY HH24:MI:SS'
          ) AS created_at_th,
          COALESCE(
            json_agg(
              DISTINCT jsonb_build_object(
                'image_id', pi.image_id,
                'image_url', pi.image_url,
                'public_id', pi.public_id
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

    if (result?.error) return result;

    set.status = 200;
    return result;
  } catch (err: any) {
    console.error("editPost error:", err);
    set.status = 500;
    return { error: err.message };
  }
};

export const changePostStatus = async ({ params, body, user, set }: any) => {
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

    // strict body
    const allowed = ["status"];
    const required = ["status"];
    const v = strictBody(body, allowed, required);
    if (!v.ok) {
      set.status = 400;
      return { error: v.error };
    }

    const { status } = body;
    const allowedStatus = ["OPEN", "CLOSED"];
    if (!allowedStatus.includes(status)) {
      set.status = 400;
      return { error: `status must be one of: ${allowedStatus.join(", ")}` };
    }

    const result = await sql.begin(async (tx: any) => {
      // 1) check post exists
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

      // 2) auth: owner or admin
      const owner_id = found[0].student_id;
      const isOwner = owner_id === user.student_id;
      const isAdmin = user.role === "ADMIN";
      if (!isOwner && !isAdmin) {
        set.status = 403;
        return { error: "Forbidden" };
      }

      // 3) update status (+ updated_at)
      const updated = await tx`
        UPDATE "Post"
        SET status = ${status}, updated_at = NOW()
        WHERE post_id = ${post_id}
        RETURNING post_id, status, updated_at
      `;

      return { message: "Post status updated", data: updated[0] };
    });

    if (result?.error) return result;

    set.status = 200;
    return result;
  } catch (err: any) {
    console.error("changePostStatus error:", err);
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
        SELECT post_id, student_id FROM "Post"
        WHERE post_id = ${post_id} LIMIT 1
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

      const imagesToDelete = await tx`
        SELECT public_id FROM "post_image" WHERE post_id = ${post_id}
      `;

      if (imagesToDelete.length > 0) {
        for (const img of imagesToDelete) {
          if (img.public_id) {
            await cloudinary.uploader.destroy(img.public_id);
          }
        }
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

export const getPostByCategory = async ({ params, set }: any) => {
  try {
    const category_id = Number(params.category_id);

    if (!category_id || Number.isNaN(category_id)) {
      set.status = 400;
      return { error: "invalid category_id" };
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
      JOIN "User" u ON u.student_id = p.student_id
      JOIN "post_category" pc ON pc.post_id = p.post_id
      JOIN "Category" c ON c.category_id = pc.category_id
      LEFT JOIN "post_image" pi ON pi.post_id = p.post_id

      WHERE c.category_id = ${category_id}

      GROUP BY 
        p.post_id,
        u.first_name,
        u.last_name,
        c.category_id

      ORDER BY p.created_at DESC
    `;

    return { data: posts };
  } catch (err: any) {
    set.status = 500;
    return { error: err.message };
  }
};

export const getAllPost = async ({ set }: any) => {
  try {
    const posts = await sql`
      SELECT 
        p.post_id,
        p.student_id,
        u.first_name,
        u.last_name,
        u.profile_img,
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
      JOIN "User" u ON u.student_id = p.student_id
      LEFT JOIN "post_category" pc ON pc.post_id = p.post_id
      LEFT JOIN "Category" c ON c.category_id = pc.category_id
      LEFT JOIN "post_image" pi ON pi.post_id = p.post_id

      GROUP BY 
        p.post_id,
        u.student_id,
        u.first_name,
        u.last_name,
        u.profile_img,
        c.category_id,
        c.category_name,
        p.created_at


      ORDER BY p.created_at DESC
    `;

    return { data: posts };
  } catch (err: any) {
    set.status = 500;
    return { error: err.message };
  }
};

export const createImage = async ({ body, set }: any) => {
  try {
    const { image } = body;

    if (!image) {
      set.status = 400;
      return { message: "Image is required" };
    }

    const result = await cloudinary.uploader.upload(
      image, // ตัวแรกคือ base64 string
      {
        public_id: `Tokladkrabang-${Date.now()}`,
        resource_type: "auto",
        folder: "Tokladkrabang",
      },
    );

    set.status = 200;
    return {
      url: result.secure_url,
      public_id: result.public_id,
    };
  } catch (err) {
    console.log(err);
  }
};

export const deleteImage = async ({ body, set }: any) => {
  try {
    const { public_id } = body;

    if (!public_id) {
      set.status = 400;
      return { message: "public_id is required" };
    }

    // สั่งลบรูปที่ Cloudinary
    const result = await cloudinary.uploader.destroy(public_id);

    // เช็คว่า Cloudinary ลบสำเร็จไหม (มันจะตอบกลับมาว่า { result: 'ok' })
    if (result.result !== "ok") {
      set.status = 400;
      return { message: "Failed to delete image or image not found" };
    }

    set.status = 200;
    return {
      message: "Image deleted successfully",
      result,
    };
  } catch (err) {
    console.log(err);
    set.status = 500;
    return { message: "Internal Server Error" };
  }
};

export const getPostById = async ({ params, set }: any) => {
  try {
    const post_id = Number(params.post_id);
    if (!post_id) {
      set.status = 400;
      return { error: "invalid post_id" };
    }

    const rows = await sql`
      SELECT 
        p.*,
        u.first_name, u.last_name, u.profile_img,
        c.category_name,
        COALESCE(
  json_agg(
    DISTINCT jsonb_build_object(
      'image_id', pi.image_id,
      'image_url', pi.image_url,
      'public_id', pi.public_id
    )
  ) FILTER (WHERE pi.image_id IS NOT NULL),
  '[]'
) as images
      FROM "Post" p
      JOIN "User" u ON u.student_id = p.student_id
      LEFT JOIN "post_category" pc ON pc.post_id = p.post_id
      LEFT JOIN "Category" c ON c.category_id = pc.category_id
      LEFT JOIN "post_image" pi ON pi.post_id = p.post_id
      WHERE p.post_id = ${post_id}
      GROUP BY p.post_id, u.first_name, u.last_name, u.profile_img, c.category_name
      LIMIT 1
    `;

    if (rows.length === 0) {
      set.status = 404;
      return { error: "Post not found" };
    }
    
    return { data: rows[0] };
  } catch (err: any) {
    set.status = 500;
    return { error: err.message };
  }
};
