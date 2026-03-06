import sql from "../../db";
import { notificationService } from "./notificationService";

// FavoriteService.ts
export class FavoriteService {
  private server: any;

  setServer(server: any) {
    this.server = server;
  }

  async addFavorite(userId: number, postId: number) {
    return await sql.begin(async (tx: any) => {
      // 1. เช็คซ้ำ
      const existing =
        await tx`SELECT favorite_id FROM "favorite" WHERE user_id = ${userId} AND post_id = ${postId} LIMIT 1`;
      if (existing.length > 0) throw new Error("Post already in favorites");

      // 2. หาเจ้าของโพสต์
      const posts =
        await tx`SELECT student_id, title FROM "Post" WHERE post_id = ${postId} LIMIT 1`;
      if (posts.length === 0) throw new Error("Post not found");
      const post = posts[0];

      // 3. บันทึก Favorite
      const favorite = await tx`
        INSERT INTO "favorite" (user_id, post_id, created_at)
        VALUES (${userId}, ${postId}, NOW()) RETURNING *
      `;

      // 🚩 จังหวะส่งสัญญาณ Real-time แจ้งกระดิ่ง
      if (post.student_id !== userId) {
        const noti = await notificationService.createNotification(
          tx,
          post.student_id,
          "NEW_FAVORITE",
          `มีคนถูกใจโพสต์ของคุณ: ${post.title}`,
          String(postId),
        );

        if (this.server?.server) {
          this.server.server.publish(
            `user-${post.student_id}`,
            JSON.stringify({
              type: "NEW_NOTIFICATION",
              data: noti,
            }),
          );
          console.log(`✅ Published to user-${post.student_id}`); // ลองใส่ Log เช็คที่ Terminal
        } else {
          console.log("❌ Server instance not found in Service");
        }

        // ตรวจสอบว่า server พร้อมใช้งานไหม (ใช้ app.server สำหรับ Elysia)
        const wsServer = this.server?.server || this.server;

        if (wsServer) {
          wsServer.publish(
            `user-${post.student_id}`,
            JSON.stringify({
              type: "NEW_NOTIFICATION",
              data: noti,
            }),
          );
        }
      }
      return favorite[0];
    });
  }

  async removeFavorite(userId: number, postId: number) {
    const deleted = await sql`
      DELETE FROM "favorite"
      WHERE user_id = ${userId} AND post_id = ${postId}
      RETURNING *
    `;
    return deleted[0] || null;
  }

  async getUserFavorites(userId: number) {
    return await sql`
      SELECT f.favorite_id, f.created_at, p.*, u.first_name, u.last_name
      FROM "favorite" f
      JOIN "Post" p ON f.post_id = p.post_id
      JOIN "User" u ON p.student_id = u.student_id
      WHERE f.user_id = ${userId}
      ORDER BY f.created_at DESC
    `;
  }

  async checkIsFavorite(userId: number, postId: number) {
    const found = await sql`
      SELECT favorite_id FROM "favorite"
      WHERE user_id = ${userId} AND post_id = ${postId}
      LIMIT 1
    `;
    return found.length > 0;
  }

  async getFavoriteCount(postId: number) {
    const rows = await sql`
      SELECT COUNT(*)::int AS count
      FROM "favorite"
      WHERE post_id = ${postId}
    `;
    return rows[0]?.count ?? 0;
  }
}

export const favoriteService = new FavoriteService();
