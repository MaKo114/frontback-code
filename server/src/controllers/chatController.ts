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

    const uid = user.student_id; // number จาก postgres.js อยู่แล้ว

    // ใช้ JOIN กับ subquery แทน CASE WHEN ที่มี parameter
    // เพราะ postgres.js template literal ไม่ส่ง param เข้า CASE WHEN ได้ถูกต้อง
    const rooms = await sql`
      SELECT
        cr.chat_id,
        cr.post_id,
        cr.buyer_id,
        cr.seller_id,
        cr.created_at,
        cr.last_message_at,
        p.title AS post_title,

        -- ดึง other user โดยตรงจาก JOIN
        other_user.email       AS other_email,
        other_user.first_name  AS other_first_name,
        other_user.last_name   AS other_last_name

      FROM "chat_room" cr
      JOIN "Post" p ON p.post_id = cr.post_id

      -- JOIN หา "อีกฝั่ง" โดยตรง ไม่ต้องใช้ CASE WHEN
      JOIN "User" other_user ON other_user.student_id = (
        CASE
          WHEN cr.buyer_id = ${uid} THEN cr.seller_id
          ELSE cr.buyer_id
        END
      )

      WHERE cr.buyer_id  = ${uid}
         OR cr.seller_id = ${uid}

      ORDER BY COALESCE(cr.last_message_at, cr.created_at) DESC
    `;
    // console.log("rooms result:", JSON.stringify(rooms, null, 2));
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
      room[0].buyer_id === user.student_id ||
      room[0].seller_id === user.student_id;

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
    const roomInfo = await sql`
      SELECT 
        p.title as post_title,
        -- ดึงทั้งชื่อและนามสกุลของคู่สนทนา
        CASE 
          WHEN cr.buyer_id = ${user.student_id} THEN seller.first_name 
          ELSE buyer.first_name 
        END AS other_name,
        
        CASE 
          WHEN cr.buyer_id = ${user.student_id} THEN seller.last_name 
          ELSE buyer.last_name 
        END AS other_last_name -- 👈 เพิ่มบรรทัดนี้เข้าไปครับ!
        
      FROM "chat_room" cr
      JOIN "Post" p ON p.post_id = cr.post_id
      JOIN "User" buyer ON buyer.student_id = cr.buyer_id
      JOIN "User" seller ON seller.student_id = cr.seller_id
      WHERE cr.chat_id = ${chat_id}
      LIMIT 1
    `;

    return {
      data: messages,
      room_info: roomInfo[0],
    };
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
        room[0].buyer_id === user.student_id ||
        room[0].seller_id === user.student_id;

      if (!isMember) {
        set.status = 403;
        return { error: "Forbidden" };
      }
      const roomPost = await tx`
  SELECT cr.post_id, p.status AS post_status
  FROM "chat_room" cr
  JOIN "Post" p ON p.post_id = cr.post_id
  WHERE cr.chat_id = ${chat_id}
  LIMIT 1
`;

if (roomPost.length === 0) {
  set.status = 404;
  return { error: "Chat room not found" };
}

if (roomPost[0].post_status === "CLOSED") {
  set.status = 409;
  return { error: "Chat is closed because the post is closed" };
}

// เช็ค exchange ของคู่นี้ในโพสต์นี้ (ถ้ามี)
const buyerId = room[0].buyer_id;
const sellerId = room[0].seller_id;

const ex = await tx`
  SELECT status
  FROM "exchange"
  WHERE post_id = ${roomPost[0].post_id}
    AND owner_id = ${sellerId}
    AND requester_id = ${buyerId}
  ORDER BY created_at DESC
  LIMIT 1
`;

if (ex.length > 0) {
  const st = ex[0].status;
  if (st === "REJECTED" || st === "CANCELED" || st === "COMPLETED") {
    set.status = 409;
    return { error: `Chat is closed because exchange is ${st}` };
  }
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
