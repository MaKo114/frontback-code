import { app } from "..";
import sql from "../../db";
import { notificationService } from "../services/notificationService";
import { strictBody } from "../utils/validate";

// POST /posts/:post_id/comments
// body: { text }
export const createComment = async ({ params, body, user, set }: any) => {
  try {
    if (!user?.student_id) {
      set.status = 401;
      return { error: "Please login first" };
    }

    const post_id = Number(params.post_id);
    const v = strictBody(body, ["text"], ["text"]);
    if (!v.ok) {
      set.status = 400;
      return { error: v.error };
    }

    const text = String(body.text).trim();

    // 1. ดึงข้อมูลโพสต์เพื่อเช็คว่ามีจริง และดูว่าใครคือเจ้าของโพสต์
    const postData = await sql`
      SELECT student_id, title 
      FROM "Post" 
      WHERE post_id = ${post_id} 
      LIMIT 1
    `;

    if (postData.length === 0) {
      set.status = 404;
      return { error: "Post not found" };
    }
    const targetPost = postData[0];

    // 2. บันทึกคอมเมนต์ลง DB
    // ใช้ sql.begin เพื่อให้ถ้า Noti พัง คอมเมนต์ก็จะไม่บันทึก (หรือจะแยกกันก็ได้ตามใจพี่)
    const created = await sql`
      INSERT INTO "comment"(post_id, user_id, text, created_at, updated_at)
      VALUES (${post_id}, ${user.student_id}, ${text}, NOW(), NOW())
      RETURNING comment_id, post_id, user_id, text, created_at, updated_at
    `;

    // 🚩 3. แจ้งเตือนเจ้าของโพสต์ (Real-time Notification)
    // เงื่อนไข: ต้องไม่ใช่ตัวเองคอมเมนต์โพสต์ตัวเอง
    if (targetPost.student_id !== user.student_id) {
      // สร้างข้อมูลแจ้งเตือนใน Database
      const noti = await notificationService.createNotification(
        sql, // ส่ง sql instance เข้าไป
        targetPost.student_id,
        "NEW_COMMENT", // ประเภทคอมเมนต์
        `${user.first_name} ได้แสดงความคิดเห็นในโพสต์ "${targetPost.title}": ${text.substring(0, 20)}...`,
        String(post_id),
      );

      // ยิง WebSocket ไปหาเจ้าของโพสต์ทันที
      if (app.server) {
        app.server.publish(
          `user-${targetPost.student_id}`,
          JSON.stringify({
            type: "NEW_NOTIFICATION",
            data: noti,
          }),
        );
        console.log(`✅ Comment Noti sent to user-${targetPost.student_id}`);
      }
    }

    set.status = 201;
    return { message: "Comment created", data: created[0] };
  } catch (err: any) {
    set.status = 500;
    return { error: err.message };
  }
};

// GET /posts/:post_id/comments
export const getCommentsByPost = async ({ params, set }: any) => {
  try {
    const post_id = Number(params.post_id);
    if (!post_id || Number.isNaN(post_id)) {
      set.status = 400;
      return { error: "Invalid post_id" };
    }

    const rows = await sql`
      SELECT
        c.comment_id,
        c.post_id,
        c.user_id,
        c.text,
        c.created_at,
        u.first_name,
        u.last_name,
        u.profile_img
      FROM "comment" c
      JOIN "User" u ON u.student_id = c.user_id
      WHERE c.post_id = ${post_id}
      ORDER BY c.created_at ASC
    `;

    set.status = 200;
    return {
      data: rows,
      count: rows.length,
    };
  } catch (err: any) {
    set.status = 500;
    return { error: err.message };
  }
};

// PUT /comments/:comment_id
// body: { text }
export const updateComment = async ({ params, body, user, set }: any) => {
  try {
    if (!user?.student_id) {
      set.status = 401;
      return { error: "Please login first" };
    }

    const comment_id = Number(params.comment_id);
    if (!comment_id || Number.isNaN(comment_id)) {
      set.status = 400;
      return { error: "Invalid comment_id" };
    }

    const v = strictBody(body, ["text"], ["text"]);
    if (!v.ok) {
      set.status = 400;
      return { error: v.error };
    }

    const text = String(body.text).trim();
    if (!text) {
      set.status = 400;
      return { error: "text must be non-empty" };
    }

    // only owner can update
    const found = await sql`
      SELECT comment_id, user_id
      FROM "comment"
      WHERE comment_id = ${comment_id}
      LIMIT 1
    `;
    if (found.length === 0) {
      set.status = 404;
      return { error: "Comment not found" };
    }

    const isOwner = found[0].user_id === user.student_id;
    const isAdmin = user.role === "ADMIN";
    if (!isOwner && !isAdmin) {
      set.status = 403;
      return { error: "Forbidden" };
    }

    const updated = await sql`
      UPDATE "comment"
      SET text = ${text}, updated_at = NOW()
      WHERE comment_id = ${comment_id}
      RETURNING comment_id, post_id, user_id, text, created_at, updated_at
    `;

    set.status = 200;
    return { message: "Comment updated", data: updated[0] };
  } catch (err: any) {
    set.status = 500;
    return { error: err.message };
  }
};

// DELETE /comments/:comment_id
export const deleteComment = async ({ params, user, set }: any) => {
  try {
    if (!user?.student_id) {
      set.status = 401;
      return { error: "Please login first" };
    }

    const comment_id = Number(params.comment_id);
    if (!comment_id || Number.isNaN(comment_id)) {
      set.status = 400;
      return { error: "Invalid comment_id" };
    }

    const found = await sql`
      SELECT comment_id, user_id
      FROM "comment"
      WHERE comment_id = ${comment_id}
      LIMIT 1
    `;
    if (found.length === 0) {
      set.status = 404;
      return { error: "Comment not found" };
    }

    const isOwner = found[0].user_id === user.student_id;
    const isAdmin = user.role === "ADMIN";
    if (!isOwner && !isAdmin) {
      set.status = 403;
      return { error: "Forbidden" };
    }

    const deleted = await sql`
      DELETE FROM "comment"
      WHERE comment_id = ${comment_id}
      RETURNING comment_id, post_id, user_id, text, created_at
    `;

    set.status = 200;
    return { message: "Comment deleted", data: deleted[0] };
  } catch (err: any) {
    set.status = 500;
    return { error: err.message };
  }
};
