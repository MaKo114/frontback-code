import sql from "../../db";

export class NotificationService {
  async createNotification(tx: any, userId: number, type: string, message: string, referenceId?: string) {
    return await tx`
      INSERT INTO "notifications" (user_id, type, message, reference_id, created_at)
      VALUES (${userId}, ${type}, ${message}, ${referenceId || null}, NOW())
      RETURNING *
    `;
  }

  async getNotificationsByUser(userId: number) {
    return await sql`
      SELECT notification_id, user_id, type, reference_id, message, is_read, created_at
      FROM "notifications"
      WHERE user_id = ${userId}
      ORDER BY created_at DESC
    `;
  }

  async markAsRead(notificationId: string, userId: number) {
    const updated = await sql`
      UPDATE "notifications"
      SET is_read = true
      WHERE notification_id = ${notificationId} AND user_id = ${userId}
      RETURNING *
    `;
    return updated[0] || null;
  }

  async markAllAsRead(userId: number) {
    return await sql`
      UPDATE "notifications"
      SET is_read = true
      WHERE user_id = ${userId} AND is_read = false
      RETURNING *
    `;
  }
}

export const notificationService = new NotificationService();