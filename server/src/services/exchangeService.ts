import sql from "../../db";
import { notificationService } from "./notificationService";

export class ExchangeService {
  async createRequest(requesterId: number, postId: number) {
    return await sql.begin(async (tx: any) => {
      const post = await tx`
        SELECT post_id, student_id, title
        FROM "Post"
        WHERE post_id = ${postId}
        LIMIT 1
      `;
      if (post.length === 0) throw new Error("Post not found");

      const ownerId = post[0].student_id;

      if (ownerId === requesterId)
        throw new Error("You cannot request your own post");

      // กันซ้ำ (pending)
      const existing = await tx`
        SELECT exchange_id
        FROM "exchange"
        WHERE post_id = ${postId}
          AND requester_id = ${requesterId}
          AND status = 'PENDING'
        LIMIT 1
      `;
      if (existing.length > 0)
        throw new Error("You already have a pending request for this post");

      const exchange = await tx`
        INSERT INTO "exchange" (post_id, requester_id, owner_id, status, created_at, updated_at)
        VALUES (${postId}, ${requesterId}, ${ownerId}, 'PENDING', NOW(), NOW())
        RETURNING *
      `;

      await notificationService.createNotification(
        tx,
        ownerId,
        "EXCHANGE_REQUEST",
        `Someone requested to exchange with your post: ${post[0].title}`,
        String(exchange[0].exchange_id),
      );

      return exchange[0];
    });
  }

  //   async updateStatus(
  //     exchangeId: number,
  //     ownerId: number,
  //     status: "ACCEPTED" | "REJECTED" | "COMPLETED"
  //   ) {
  //     return await sql.begin(async (tx: any) => {
  //       const found = await tx`
  //         SELECT e.*, p.title
  //         FROM "exchange" e
  //         JOIN "Post" p ON e.post_id = p.post_id
  //         WHERE e.exchange_id = ${exchangeId}
  //           AND e.owner_id = ${ownerId}
  //         LIMIT 1
  //       `;
  //       if (found.length === 0) throw new Error("Exchange request not found or you are not the owner");

  //       const exchange = found[0];

  //       const updated = await tx`
  //         UPDATE "exchange"
  //         SET status = ${status}, updated_at = NOW()
  //         WHERE exchange_id = ${exchangeId}
  //         RETURNING *
  //       `;

  //       // notify requester
  //       let type: string = "EXCHANGE_ACCEPTED";
  //       if (status === "REJECTED") type = "EXCHANGE_REJECTED";
  //       if (status === "COMPLETED") type = "EXCHANGE_COMPLETED";

  //       const msg = `Your request for ${exchange.title} has been ${status.toLowerCase()}`;

  //       await notificationService.createNotification(
  //         tx,
  //         exchange.requester_id,
  //         type,
  //         msg,
  //         String(exchangeId)
  //       );

  //       if (status === "COMPLETED") {
  //         await tx`
  //           UPDATE "Post"
  //           SET status = 'CLOSED', updated_at = NOW()
  //           WHERE post_id = ${exchange.post_id}
  //         `;
  //       }

  //       return updated[0];
  //     });
  //   }

  async getMyRequests(userId: number) {
    return await sql`
    SELECT e.*, p.title,
           u.first_name as owner_name, u.last_name as owner_surname,
           cr.chat_id
    FROM "exchange" e
    JOIN "Post" p ON e.post_id = p.post_id
    JOIN "User" u ON e.owner_id = u.student_id
    LEFT JOIN "chat_room" cr 
      ON cr.post_id = e.post_id 
      AND cr.buyer_id = e.requester_id 
      AND cr.seller_id = e.owner_id
    WHERE e.requester_id = ${userId}
    ORDER BY e.created_at DESC
  `;
  }

  async getMyPendingRequests(userId: number) {
    return await sql`
    SELECT e.*, p.title,
           u.first_name as requester_name, u.last_name as requester_surname,
           cr.chat_id
    FROM "exchange" e
    JOIN "Post" p ON e.post_id = p.post_id
    JOIN "User" u ON e.requester_id = u.student_id
    LEFT JOIN "chat_room" cr 
      ON cr.post_id = e.post_id 
      AND cr.buyer_id = e.requester_id 
      AND cr.seller_id = e.owner_id
    WHERE e.owner_id = ${userId}
    ORDER BY e.created_at DESC
  `;
  }
  // exchangeService.ts

  async ownerConfirm(exchangeId: number, ownerId: number) {
    return await sql.begin(async (tx: any) => {
      const found = await tx`
        SELECT e.*, p.title
        FROM "exchange" e
        JOIN "Post" p ON e.post_id = p.post_id
        WHERE e.exchange_id = ${exchangeId}
          AND e.owner_id = ${ownerId}
        LIMIT 1
      `;
      if (found.length === 0)
        throw new Error("Exchange not found or you are not the owner");

      const e = found[0];

      if (e.status !== "ACCEPTED") {
        throw new Error("Owner can confirm only when status is ACCEPTED");
      }

      const updated = await tx`
        UPDATE "exchange"
        SET owner_confirm = true, updated_at = NOW()
        WHERE exchange_id = ${exchangeId}
        RETURNING *
      `;

      // แจ้ง requester
      await notificationService.createNotification(
        tx,
        e.requester_id,
        "EXCHANGE_OWNER_CONFIRMED",
        `Owner confirmed exchange for: ${e.title}`,
        String(exchangeId),
      );

      // ถ้าทั้งคู่คอนเฟิร์มแล้ว -> complete
      return await this._completeIfBothConfirmed(tx, exchangeId);
    });
  }

  async requesterConfirm(exchangeId: number, requesterId: number) {
    return await sql.begin(async (tx: any) => {
      const found = await tx`
        SELECT e.*, p.title
        FROM "exchange" e
        JOIN "Post" p ON e.post_id = p.post_id
        WHERE e.exchange_id = ${exchangeId}
          AND e.requester_id = ${requesterId}
        LIMIT 1
      `;
      if (found.length === 0)
        throw new Error("Exchange not found or you are not the requester");

      const e = found[0];

      if (e.status !== "ACCEPTED") {
        throw new Error("Requester can confirm only when status is ACCEPTED");
      }

      const updated = await tx`
        UPDATE "exchange"
        SET receiver_confirm = true, updated_at = NOW()
        WHERE exchange_id = ${exchangeId}
        RETURNING *
      `;

      // แจ้ง owner
      await notificationService.createNotification(
        tx,
        e.owner_id,
        "EXCHANGE_REQUESTER_CONFIRMED",
        `Requester confirmed exchange for: ${e.title}`,
        String(exchangeId),
      );

      return await this._completeIfBothConfirmed(tx, exchangeId);
    });
  }

  // helper: ถ้าคอนเฟิร์มครบ -> set COMPLETED + ปิดโพสต์
  private async _completeIfBothConfirmed(tx: any, exchangeId: number) {
    const current = await tx`
      SELECT * FROM "exchange"
      WHERE exchange_id = ${exchangeId}
      LIMIT 1
    `;
    const e = current[0];

    if (e.owner_confirm && e.receiver_confirm && e.status !== "COMPLETED") {
      const completed = await tx`
        UPDATE "exchange"
        SET status = 'COMPLETED', updated_at = NOW()
        WHERE exchange_id = ${exchangeId}
        RETURNING *
      `;

      // ปิดโพสต์ (ถ้าต้องการ)
      await tx`
        UPDATE "Post"
        SET status = 'CLOSED', updated_at = NOW()
        WHERE post_id = ${e.post_id}
      `;

      // แจ้งทั้งคู่
      await notificationService.createNotification(
        tx,
        e.owner_id,
        "EXCHANGE_COMPLETED",
        `Exchange completed (ID: ${exchangeId})`,
        String(exchangeId),
      );
      await notificationService.createNotification(
        tx,
        e.requester_id,
        "EXCHANGE_COMPLETED",
        `Exchange completed (ID: ${exchangeId})`,
        String(exchangeId),
      );

      return completed[0];
    }

    return e; // ยังไม่ครบ confirm ก็คืนสถานะล่าสุด
  }

  // ปรับ updateStatus เดิม: ให้ owner ทำได้แค่ ACCEPT/REJECT (ไม่ให้ COMPLETED)
  async updateStatus(
    exchangeId: number,
    ownerId: number,
    status: "ACCEPTED" | "REJECTED",
  ) {
    return await sql.begin(async (tx: any) => {
      const found = await tx`
      SELECT e.*, p.title
      FROM "exchange" e
      JOIN "Post" p ON e.post_id = p.post_id
      WHERE e.exchange_id = ${exchangeId}
        AND e.owner_id = ${ownerId}
      LIMIT 1
    `;
      if (found.length === 0)
        throw new Error("Exchange request not found or you are not the owner");

      const e = found[0];
      if (e.status === "COMPLETED")
        throw new Error("Exchange is already completed");

      // ถ้า owner ACCEPT -> ยอมรับอันนี้ + ยกเลิก/ปฏิเสธอันอื่นของ post เดียวกัน
      if (status === "ACCEPTED") {
        // 1) อัปเดตอันที่เลือกเป็น ACCEPTED
        const updated = await tx`
        UPDATE "exchange"
        SET status = 'ACCEPTED', updated_at = NOW()
        WHERE exchange_id = ${exchangeId}
        RETURNING *
      `;

        // 2) ปิดคำขออื่นทั้งหมดที่ยัง PENDING (เลือกใช้ CANCELED หรือ REJECTED)
        const others = await tx`
        UPDATE "exchange"
        SET status = 'CANCELED', updated_at = NOW()
        WHERE post_id = ${e.post_id}
          AND exchange_id <> ${exchangeId}
          AND status = 'PENDING'
        RETURNING exchange_id, requester_id
      `;

        // 3) แจ้ง requester ที่ถูก accept
        await notificationService.createNotification(
          tx,
          e.requester_id,
          "EXCHANGE_ACCEPTED",
          `Your request for ${e.title} has been accepted`,
          String(exchangeId),
        );

        // 4) แจ้ง requester คนอื่นว่าถูกยกเลิก
        for (const o of others) {
          await notificationService.createNotification(
            tx,
            o.requester_id,
            "EXCHANGE_CANCELED",
            `Your request for ${e.title} was canceled because the owner accepted another request`,
            String(o.exchange_id),
          );
        }

        return updated[0];
      }

      // ถ้า REJECTED -> reject แค่อันนี้
      const updated = await tx`
      UPDATE "exchange"
      SET status = 'REJECTED', updated_at = NOW()
      WHERE exchange_id = ${exchangeId}
      RETURNING *
    `;

      await notificationService.createNotification(
        tx,
        e.requester_id,
        "EXCHANGE_REJECTED",
        `Your request for ${e.title} has been rejected`,
        String(exchangeId),
      );

      return updated[0];
    });
  }
}

export const exchangeService = new ExchangeService();
