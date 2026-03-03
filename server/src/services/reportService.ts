import sql from "../../db";
import { notificationService } from "./notificationService";

export class ReportService {
  async createReport(reporterId: number, postId: number, reason: string, description?: string) {
    return await sql.begin(async (tx: any) => {
      // Check if duplicate report exists
      const post = await tx`
        SELECT post_id, student_id
        FROM "Post"
        WHERE post_id = ${postId}
        LIMIT 1
      `;
      if (post.length === 0) {
        throw new Error("Post not found");
      }

      const ownerId = post[0].student_id;

      // 1) กัน report โพสต์ตัวเอง
      if (ownerId === reporterId) {
        throw new Error("You cannot report your own post");
      }
      const existing = await tx`
        SELECT report_id FROM "report"
        WHERE post_id = ${postId} AND reporter_id = ${reporterId}
        LIMIT 1
      `;
      if (existing.length > 0) {
        throw new Error("You have already reported this post");
      }

      // Create report
      const report = await tx`
        INSERT INTO "report" (post_id, reporter_id, reason, description, status, created_at)
        VALUES (${postId}, ${reporterId}, ${reason}, ${description || null}, 'PENDING', NOW())
        RETURNING *
      `;

      // Find all admins to notify
      const admins = await tx`
        SELECT student_id FROM "User" WHERE role = 'ADMIN'
      `;

      // Notify all admins
      for (const admin of admins) {
        await notificationService.createNotification(
          tx,
          admin.student_id,
          'POST_REPORTED',
          `New report for Post #${postId}: ${reason}`,
          report[0].report_id
        );
      }

      return report[0];
    });
  }

  async getReportsByPost(postId: number) {
    return await sql`
      SELECT r.*, u.first_name, u.last_name
      FROM "report" r
      JOIN "User" u ON r.reporter_id = u.student_id
      WHERE r.post_id = ${postId}
      ORDER BY r.created_at DESC
    `;
  }
}

export const reportService = new ReportService();