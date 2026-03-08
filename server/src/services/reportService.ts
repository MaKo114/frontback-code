// services/reportService.ts
import sql from "../../db";

export class ReportService {
  private server: any;

  setServer(server: any) {
    this.server = server;
  }

  async createReport(
    reporterId: number,
    postId: number,
    reason: string,
    description?: string,
  ) {
    return await sql.begin(async (tx: any) => {
      // 1-3. ตรวจสอบข้อมูล (โค้ดเดิมของพี่ดีอยู่แล้ว)
      const post =
        await tx`SELECT student_id FROM "Post" WHERE post_id = ${postId} LIMIT 1`;
      if (post.length === 0) throw new Error("Post not found");
      if (post[0].student_id === reporterId)
        throw new Error("You cannot report your own post");

      const existing =
        await tx`SELECT report_id FROM "report" WHERE post_id = ${postId} AND reporter_id = ${reporterId} LIMIT 1`;
      if (existing.length > 0)
        throw new Error("You have already reported this post");

      // 4. บันทึก Report ลง DB
      const report = await tx`
        INSERT INTO "report" (post_id, reporter_id, reason, description, status, created_at)
        VALUES (${postId}, ${reporterId}, ${reason}, ${description || null}, 'PENDING', NOW())
        RETURNING *
      `;

      const admins =
        await tx`SELECT student_id FROM "User" WHERE role = 'ADMIN'`;

      for (const admin of admins) {
        // ใช้ publish ไปยังท่อรายบุคคลของ admin
        if (this.server?.server) {
          this.server.server.publish(
            `user-${admin.student_id}`,
            JSON.stringify({
              type: "REFRESH_REPORT_COUNT", 
              data: { report_id: report[0].report_id },
            }),
          );
        }
      }

      return report[0];
    });
  }
  async ignoreReport(reportId: number) {
    return await sql.begin(async (tx: any) => {
      // 1. ตรวจสอบว่ามี Report อยู่จริงและยังเป็น PENDING
      const report = await tx`
        SELECT report_id, status FROM "report" 
        WHERE report_id = ${reportId} LIMIT 1
      `;

      if (report.length === 0) throw new Error("Report not found");
      if (report[0].status !== "PENDING")
        throw new Error("Report already processed");

      // 2. อัปเดตสถานะเป็น IGNORED
      const updated = await tx`
        UPDATE "report" 
        SET status = 'IGNORED'
        WHERE report_id = ${reportId}
        RETURNING *
      `;

      return updated[0];
    });
  }
}

export const reportService = new ReportService();
