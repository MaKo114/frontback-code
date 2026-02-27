import sql from "../../db";
import { strictBody } from "../utils/validate";

// POST /chat/room  (สร้างหรือคืนห้องเดิม)
// body: { post_id }
export const createOrGetChatRoom = async ({ body, user, set }: any) => {
  try {
    if (!user?.student_id) {
      set.status = 401;
      return { error: "Please login first" };
    }

    const v = strictBody(body, ["post_id"], ["post_id"]);
    if (!v.ok) {
      set.status = 400;
      return { error: v.error };
    }

    const post_id = Number(body.post_id);
    if (!post_id || Number.isNaN(post_id)) {
      set.status = 400;
      return { error: "invalid post_id" };
    }

    // หา seller จาก post
    const postRows = await sql`
      SELECT post_id, student_id
      FROM "Post"
      WHERE post_id = ${post_id}
      LIMIT 1
    `;
    if (postRows.length === 0) {
      set.status = 404;
      return { error: "Post not found" };
    }

    const seller_id = postRows[0].student_id;
    const buyer_id = user.student_id;

    if (seller_id === buyer_id) {
      set.status = 400;
      return { error: "You cannot chat with yourself (owner of this post)." };
    }

    // ถ้ามีห้องเดิมแล้วคืนห้องเดิม (กันสร้างซ้ำ)
    const existing = await sql`
      SELECT chat_id, post_id, buyer_id, seller_id, created_at, last_message_at
      FROM "chat_room"
      WHERE post_id = ${post_id}
        AND buyer_id = ${buyer_id}
        AND seller_id = ${seller_id}
      LIMIT 1
    `;

    if (existing.length > 0) {
      return { message: "Chat room exists", data: existing[0] };
    }

    // สร้างห้องใหม่
    const created = await sql`
      INSERT INTO "chat_room"(post_id, buyer_id, seller_id, created_at, last_message_at)
      VALUES (${post_id}, ${buyer_id}, ${seller_id}, NOW(), NULL)
      RETURNING chat_id, post_id, buyer_id, seller_id, created_at, last_message_at
    `;

    set.status = 201;
    return { message: "Chat room created", data: created[0] };
  } catch (err: any) {
    set.status = 500;
    return { error: err.message };
  }
};

// GET /chat/rooms  (ห้องของฉันทั้งหมด)
export const getMyChatRooms = async ({ user, set }: any) => {
  try {
    if (!user?.student_id) {
      set.status = 401;
      return { error: "Please login first" };
    }

    const rooms = await sql`
      SELECT
        cr.chat_id,
        cr.post_id,
        cr.buyer_id,
        cr.seller_id,
        cr.created_at,
        cr.last_message_at,

        p.title AS post_title,

        -- คู่สนทนา (อีกฝั่ง)
        CASE
          WHEN cr.buyer_id = ${user.student_id} THEN seller.email
          ELSE buyer.email
        END AS other_email,

        CASE
          WHEN cr.buyer_id = ${user.student_id} THEN seller.first_name
          ELSE buyer.first_name
        END AS other_first_name,

        CASE
          WHEN cr.buyer_id = ${user.student_id} THEN seller.last_name
          ELSE buyer.last_name
        END AS other_last_name

      FROM "chat_room" cr
      JOIN "Post" p ON p.post_id = cr.post_id
      JOIN "User" buyer ON buyer.student_id = cr.buyer_id
      JOIN "User" seller ON seller.student_id = cr.seller_id
      WHERE cr.buyer_id = ${user.student_id}
         OR cr.seller_id = ${user.student_id}
      ORDER BY COALESCE(cr.last_message_at, cr.created_at) DESC
    `;

    return { data: rooms };
  } catch (err: any) {
    set.status = 500;
    return { error: err.message };
  }
};

// GET /chat/rooms/:chat_id/messages  (ข้อความในห้อง)
export const getMessagesByRoom = async ({ params, user, set }: any) => {
  try {
    if (!user?.student_id) {
      set.status = 401;
      return { error: "Please login first" };
    }

    const chat_id = Number(params.chat_id);
    if (!chat_id || Number.isNaN(chat_id)) {
      set.status = 400;
      return { error: "invalid chat_id" };
    }

    // เช็คสิทธิ์: ต้องเป็น buyer หรือ seller ของห้อง
    const room = await sql`
      SELECT chat_id, buyer_id, seller_id
      FROM "chat_room"
      WHERE chat_id = ${chat_id}
      LIMIT 1
    `;

    if (room.length === 0) {
      set.status = 404;
      return { error: "Chat room not found" };
    }

    const isMember =
      room[0].buyer_id === user.student_id || room[0].seller_id === user.student_id;

    if (!isMember) {
      set.status = 403;
      return { error: "Forbidden" };
    }

    const messages = await sql`
      SELECT
        m.message_id,
        m.chat_id,
        m.sender_id,
        u.first_name,
        u.last_name,
        u.email,
        m.text,
        m.created_at
      FROM "message" m
      JOIN "User" u ON u.student_id = m.sender_id
      WHERE m.chat_id = ${chat_id}
      ORDER BY m.created_at ASC
    `;

    return { data: messages };
  } catch (err: any) {
    set.status = 500;
    return { error: err.message };
  }
};

// POST /chat/rooms/:chat_id/messages  (ส่งข้อความ)
// body: { text }
export const sendMessage = async ({ params, body, user, set }: any) => {
  try {
    if (!user?.student_id) {
      set.status = 401;
      return { error: "Please login first" };
    }

    const chat_id = Number(params.chat_id);
    if (!chat_id || Number.isNaN(chat_id)) {
      set.status = 400;
      return { error: "invalid chat_id" };
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

    const result = await sql.begin(async (tx: any) => {
      // เช็ค membership
      const room = await tx`
        SELECT chat_id, buyer_id, seller_id
        FROM "chat_room"
        WHERE chat_id = ${chat_id}
        LIMIT 1
      `;

      if (room.length === 0) {
        set.status = 404;
        return { error: "Chat room not found" };
      }

      const isMember =
        room[0].buyer_id === user.student_id || room[0].seller_id === user.student_id;

      if (!isMember) {
        set.status = 403;
        return { error: "Forbidden" };
      }

      // insert message
      const msgRows = await tx`
        INSERT INTO "message"(chat_id, sender_id, text, created_at)
        VALUES (${chat_id}, ${user.student_id}, ${text}, NOW())
        RETURNING message_id, chat_id, sender_id, text, created_at
      `;
      const msg = msgRows[0];

      // update last_message_at
      await tx`
        UPDATE "chat_room"
        SET last_message_at = ${msg.created_at}
        WHERE chat_id = ${chat_id}
      `;

      return msg;
    });

    if ((result as any)?.error) return result;

    set.status = 201;
    return { message: "Message sent", data: result };
  } catch (err: any) {
    set.status = 500;
    return { error: err.message };
  }
};