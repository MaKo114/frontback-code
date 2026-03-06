import sql from "../../db";

export class NotificationService {
  async createNotification(
    tx: any,
    userId: number,
    type: string,
    message: string,
    referenceId?: string,
  ) {
    // ปรับให้ return object ตัวที่สร้างทันที เพื่อเอาไปส่งต่อให้ WebSocket
    const result = await tx`
      INSERT INTO "notifications" (user_id, type, message, reference_id, is_read, created_at)
      VALUES (${userId}, ${type}, ${message}, ${referenceId || null}, false, NOW())
      RETURNING *
    `;
    return result[0]; 
  }

  async getNotificationsByUser(userId: number) {
    return await sql`
      SELECT notification_id, user_id, type, reference_id, message, is_read, created_at
      FROM "notifications"
      WHERE user_id = ${userId}
      ORDER BY created_at DESC
      LIMIT 50 
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

  async getUnreadCount(userId: number) {
    const result = await sql`
      SELECT COUNT(*)::int as count FROM "notifications" 
      WHERE user_id = ${userId} AND is_read = false
    `;
    return result[0].count; // คืนค่าตัวเลขจำนวนที่ยังไม่อ่าน
  }

  async deleteNotification(notificationId: string, userId: number) {
    return await sql`
      DELETE FROM "notifications" 
      WHERE notification_id = ${notificationId} AND user_id = ${userId}
      RETURNING *
    `;
  }
}

export const notificationService = new NotificationService();