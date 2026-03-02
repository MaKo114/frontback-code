import sql from "../../db";
import { notificationService } from "./notificationService";

export class ExchangeService {
  async createRequest(requesterId: number, postId: number) {
    return await sql.begin(async (tx: any) => {
      // Get post details to find owner
      const post = await tx`
        SELECT student_id, title FROM "Post" WHERE post_id = ${postId} LIMIT 1
      `;
      if (post.length === 0) throw new Error("Post not found");
      const ownerId = post[0].student_id;

      if (ownerId === requesterId) throw new Error("You cannot request your own post");

      // Check for existing pending request
      const existing = await tx`
        SELECT exchange_id FROM "exchanges" 
        WHERE post_id = ${postId} AND requester_id = ${requesterId} AND status = 'PENDING'
        LIMIT 1
      `;
      if (existing.length > 0) throw new Error("You already have a pending request for this post");

      // Create request
      const exchange = await tx`
        INSERT INTO "exchanges" (post_id, requester_id, owner_id, status, created_at, updated_at)
        VALUES (${postId}, ${requesterId}, ${ownerId}, 'PENDING', NOW(), NOW())
        RETURNING *
      `;

      // Notify owner
      await notificationService.createNotification(
        tx,
        ownerId,
        'EXCHANGE_REQUEST',
        `Someone requested to exchange with your post: ${post[0].title}`,
        exchange[0].exchange_id
      );

      return exchange[0];
    });
  }

  async updateStatus(exchangeId: string, ownerId: number, status: 'ACCEPTED' | 'REJECTED' | 'COMPLETED') {
    return await sql.begin(async (tx: any) => {
      // Verify post owner
      const found = await tx`
        SELECT e.*, p.title 
        FROM "exchanges" e
        JOIN "Post" p ON e.post_id = p.post_id
        WHERE e.exchange_id = ${exchangeId} AND e.owner_id = ${ownerId}
        LIMIT 1
      `;
      if (found.length === 0) throw new Error("Exchange request not found or you are not the owner");

      const exchange = found[0];

      // Update exchange status
      const updated = await tx`
        UPDATE "exchanges"
        SET status = ${status}, updated_at = NOW()
        WHERE exchange_id = ${exchangeId}
        RETURNING *
      `;

      // Notify requester
      let type: any = 'EXCHANGE_ACCEPTED';
      let message = `Your request for ${exchange.title} has been ${status.toLowerCase()}`;
      if (status === 'REJECTED') type = 'EXCHANGE_REJECTED';
      if (status === 'COMPLETED') type = 'EXCHANGE_COMPLETED';

      await notificationService.createNotification(
        tx,
        exchange.requester_id,
        type,
        message,
        exchangeId
      );

      // If accepted/completed, potentially update post status
      if (status === 'COMPLETED') {
        await tx`
          UPDATE "Post" SET status = 'CLOSED', updated_at = NOW() WHERE post_id = ${exchange.post_id}
        `;
      }

      return updated[0];
    });
  }

  async getMyRequests(userId: number) {
    return await sql`
      SELECT e.*, p.title, u.first_name as owner_name, u.last_name as owner_surname
      FROM "exchanges" e
      JOIN "Post" p ON e.post_id = p.post_id
      JOIN "User" u ON e.owner_id = u.student_id
      WHERE e.requester_id = ${userId}
      ORDER BY e.created_at DESC
    `;
  }

  async getMyPendingRequests(userId: number) {
    return await sql`
      SELECT e.*, p.title, u.first_name as requester_name, u.last_name as requester_surname
      FROM "exchanges" e
      JOIN "Post" p ON e.post_id = p.post_id
      JOIN "User" u ON e.requester_id = u.student_id
      WHERE e.owner_id = ${userId}
      ORDER BY e.created_at DESC
    `;
  }
}

export const exchangeService = new ExchangeService();
