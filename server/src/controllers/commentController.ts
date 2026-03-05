import sql from "../../db";
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
    if (!post_id || Number.isNaN(post_id)) {
      set.status = 400;
      return { error: "Invalid post_id" };
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

    // ensure post exists
    const post = await sql`
      SELECT post_id
      FROM "Post"
      WHERE post_id = ${post_id}
      LIMIT 1
    `;
    if (post.length === 0) {
      set.status = 404;
      return { error: "Post not found" };
    }

    const created = await sql`
      INSERT INTO "comment"(post_id, user_id, text, created_at, updated_at)
      VALUES (${post_id}, ${user.student_id}, ${text}, NOW(), NOW())
      RETURNING comment_id, post_id, user_id, text, created_at, updated_at
    `;

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
        c.updated_at,
        u.first_name,
        u.last_name,
        u.email
      FROM "comment" c
      JOIN "User" u ON u.student_id = c.user_id
      WHERE c.post_id = ${post_id}
      ORDER BY c.created_at ASC
    `;

    set.status = 200;
    return { data: rows };
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