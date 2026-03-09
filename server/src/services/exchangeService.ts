import { app } from "..";
import sql from "../../db";
import { notificationService } from "./notificationService";

export class ExchangeService {
  private publishNoti(userId: number, noti: any) {
    app.server?.publish(
      `user-${userId}`,
      JSON.stringify({ type: "NEW_NOTIFICATION", data: noti }),
    );
  }

  async createRequest(requesterId: number, postId: number) {
    return await sql.begin(async (tx: any) => {
      const post = (
        await tx`
        SELECT student_id, title FROM "Post" WHERE post_id = ${postId} LIMIT 1
      `
      )[0];
      if (!post) throw new Error("Post not found");

      const ownerId = post.student_id;
      if (ownerId === requesterId)
        throw new Error("You cannot request your own post");

      // กันซ้ำ
      const existingActive = await tx`
  SELECT exchange_id, status
  FROM "exchange"
  WHERE post_id = ${postId}
    AND requester_id = ${requesterId}
    AND owner_id = ${ownerId}
    AND status IN ('PENDING','ACCEPTED','COMPLETED')
  ORDER BY created_at DESC
  LIMIT 1
`;

      if (existingActive.length > 0) {
        const st = existingActive[0].status;
        if (st === "PENDING")
          throw new Error("You already have a pending request");
        if (st === "ACCEPTED")
          throw new Error("You already have an accepted request for this post");
        if (st === "COMPLETED")
          throw new Error("This exchange is already completed");
      }
      const exchange = await tx`
        INSERT INTO "exchange" (post_id, requester_id, owner_id, status, created_at, updated_at)
        VALUES (${postId}, ${requesterId}, ${ownerId}, 'PENDING', NOW(), NOW())
        RETURNING *
      `;

      // แจ้ง Owner
      const noti = await notificationService.createNotification(
        tx,
        ownerId,
        "EXCHANGE_REQUEST",
        `มีคนสนใจขอแลกเปลี่ยนในโพสต์ของคุณ: ${post.title}`,
        String(exchange[0].exchange_id),
      );
      this.publishNoti(ownerId, noti);

      return exchange[0];
    });
  }

  async ownerConfirm(exchangeId: number, ownerId: number) {
    return await sql.begin(async (tx: any) => {
      const found = (
        await tx`
        SELECT e.*, p.title FROM "exchange" e 
        JOIN "Post" p ON e.post_id = p.post_id 
        WHERE e.exchange_id = ${exchangeId} AND e.owner_id = ${ownerId}
      `
      )[0];

      if (!found) throw new Error("Exchange not found or not owner");
      if (found.status !== "ACCEPTED")
        throw new Error("Status must be ACCEPTED");

      await tx`UPDATE "exchange" SET owner_confirm = true, updated_at = NOW() WHERE exchange_id = ${exchangeId}`;

      // แจ้ง Requester
      const noti = await notificationService.createNotification(
        tx,
        found.requester_id,
        "EXCHANGE_OWNER_CONFIRMED",
        `เจ้าของโพสต์ยืนยันการแลกเปลี่ยนแล้วสำหรับ: ${found.title}`,
        String(exchangeId),
      );
      this.publishNoti(found.requester_id, noti);

      return await this._completeIfBothConfirmed(tx, exchangeId);
    });
  }

  async requesterConfirm(exchangeId: number, requesterId: number) {
    return await sql.begin(async (tx: any) => {
      const found = (
        await tx`
        SELECT e.*, p.title FROM "exchange" e 
        JOIN "Post" p ON e.post_id = p.post_id 
        WHERE e.exchange_id = ${exchangeId} AND e.requester_id = ${requesterId}
      `
      )[0];

      if (!found) throw new Error("Exchange not found");
      if (found.status !== "ACCEPTED")
        throw new Error("Status must be ACCEPTED");

      await tx`UPDATE "exchange" SET receiver_confirm = true, updated_at = NOW() WHERE exchange_id = ${exchangeId}`;

      // แจ้ง Owner
      const noti = await notificationService.createNotification(
        tx,
        found.owner_id,
        "EXCHANGE_REQUESTER_CONFIRMED",
        `ผู้ขอแลกยืนยันการรับของแล้วสำหรับโพสต์: ${found.title}`,
        String(exchangeId),
      );
      this.publishNoti(found.owner_id, noti);

      return await this._completeIfBothConfirmed(tx, exchangeId);
    });
  }

  private async _completeIfBothConfirmed(tx: any, exchangeId: number) {
    const e = (
      await tx`SELECT * FROM "exchange" WHERE exchange_id = ${exchangeId}`
    )[0];

    if (e.owner_confirm && e.receiver_confirm && e.status !== "COMPLETED") {
      const completed = await tx`
        UPDATE "exchange" SET status = 'COMPLETED', updated_at = NOW() 
        WHERE exchange_id = ${exchangeId} RETURNING *
      `;
      await tx`UPDATE "Post" SET status = 'CLOSED' WHERE post_id = ${e.post_id}`;

      // แจ้งทั้งคู่
      const msg = `การแลกเปลี่ยนเสร็จสมบูรณ์แล้ว! (รหัส: ${exchangeId})`;
      const nOwner = await notificationService.createNotification(
        tx,
        e.owner_id,
        "EXCHANGE_COMPLETED",
        msg,
        String(exchangeId),
      );
      const nReq = await notificationService.createNotification(
        tx,
        e.requester_id,
        "EXCHANGE_COMPLETED",
        msg,
        String(exchangeId),
      );

      this.publishNoti(e.owner_id, nOwner);
      this.publishNoti(e.requester_id, nReq);

      return completed[0];
    }
    return e;
  }

  async updateStatus(
    exchangeId: number,
    ownerId: number,
    status: "ACCEPTED" | "REJECTED",
  ) {
    return await sql.begin(async (tx: any) => {
      const found = (
        await tx`
        SELECT e.*, p.title FROM "exchange" e 
        JOIN "Post" p ON e.post_id = p.post_id 
        WHERE e.exchange_id = ${exchangeId} AND e.owner_id = ${ownerId}
      `
      )[0];

      if (!found) throw new Error("Exchange request not found");

      if (status === "ACCEPTED") {
        const updated =
          await tx`UPDATE "exchange" SET status = 'ACCEPTED' WHERE exchange_id = ${exchangeId} RETURNING *`;
        const others = await tx`
          UPDATE "exchange" SET status = 'CANCELED' 
          WHERE post_id = ${found.post_id} AND exchange_id <> ${exchangeId} AND status = 'PENDING'
          RETURNING exchange_id, requester_id
        `;

        // แจ้งคนถูก Accept
        const nAcc = await notificationService.createNotification(
          tx,
          found.requester_id,
          "EXCHANGE_ACCEPTED",
          `ยินดีด้วย! คำขอสำหรับ ${found.title} ได้รับการตอบรับแล้ว`,
          String(exchangeId),
        );
        this.publishNoti(found.requester_id, nAcc);

        // แจ้งคนถูก Cancel
        for (const o of others) {
          const nCan = await notificationService.createNotification(
            tx,
            o.requester_id,
            "EXCHANGE_CANCELED",
            `คำขอสำหรับ ${found.title} ถูกยกเลิกเนื่องจากเจ้าของโพสต์เลือกผู้แลกอื่น`,
            String(o.exchange_id),
          );
          this.publishNoti(o.requester_id, nCan);
        }
        return updated[0];
      }

      const updated =
        // เปลี่ยนกลับจาก DELETE เป็น UPDATE
        await tx`UPDATE "exchange" SET status = 'REJECTED', updated_at = NOW() WHERE exchange_id = ${exchangeId}`;
      const nRej = await notificationService.createNotification(
        tx,
        found.requester_id,
        "EXCHANGE_REJECTED",
        `คำขอสำหรับ ${found.title} ถูกปฏิเสธ`,
        String(exchangeId),
      );
      this.publishNoti(found.requester_id, nRej);

      return updated[0];
    });
  }
  // services/exchangeService.ts

  // 1. สำหรับดึงรายการที่เรา "ส่งไปขอคนอื่น" (Sent Requests)
  async getMyRequests(studentId: number) {
    return await sql`
    SELECT 
      e.*, 
      p.title as post_title,
      u.first_name as owner_first_name,
      u.last_name as owner_last_name,
      u.profile_img as owner_img,
      cr.chat_id                          -- ← เพิ่ม
    FROM "exchange" e
    JOIN "Post" p ON e.post_id = p.post_id
    JOIN "User" u ON e.owner_id = u.student_id
    LEFT JOIN "chat_room" cr              -- ← เพิ่ม
      ON cr.post_id = e.post_id
      AND cr.buyer_id = e.requester_id
      AND cr.seller_id = e.owner_id
    WHERE e.requester_id = ${studentId}
    ORDER BY e.created_at DESC
  `;
  }

  async getMyPendingRequests(studentId: number) {
    return await sql`
    SELECT 
      e.*, 
      p.title as post_title,
      u.first_name as requester_first_name,
      u.last_name as requester_last_name,
      u.profile_img as requester_img,
      cr.chat_id                          -- ← เพิ่ม
    FROM "exchange" e
    JOIN "Post" p ON e.post_id = p.post_id
    JOIN "User" u ON e.requester_id = u.student_id
    LEFT JOIN "chat_room" cr              -- ← เพิ่ม
      ON cr.post_id = e.post_id
      AND cr.buyer_id = e.requester_id
      AND cr.seller_id = e.owner_id
    WHERE e.owner_id = ${studentId}
    ORDER BY e.created_at DESC
  `;
  }
 

  async cancelRequest(exchangeId: number, requesterId: number) {
    return await sql.begin(async (tx: any) => {
      // ✅ SELECT ก่อน เช็คว่ามีและ status === PENDING
      const found = (
        await tx`
        SELECT e.*, p.title
        FROM "exchange" e
        JOIN "Post" p ON e.post_id = p.post_id
        WHERE e.exchange_id = ${exchangeId}
          AND e.requester_id = ${requesterId}
        LIMIT 1
      `
      )[0];

      if (!found) throw new Error("Exchange request not found");
      if (found.status !== "PENDING")
        throw new Error("You can only cancel a pending request");

      // ✅ แล้วค่อย UPDATE เป็น CANCELED
      const updated = (
        await tx`
        UPDATE "exchange"
        SET status = 'CANCELED', updated_at = NOW()
        WHERE exchange_id = ${exchangeId}
        RETURNING *
      `
      )[0];

      const noti = await notificationService.createNotification(
        tx,
        found.owner_id,
        "EXCHANGE_CANCELED",
        `ผู้ขอแลกได้ยกเลิกคำขอสำหรับโพสต์: ${found.title}`,
        String(exchangeId),
      );
      this.publishNoti(found.owner_id, noti);

      return updated;
    });
  }
}

export const exchangeService = new ExchangeService();
