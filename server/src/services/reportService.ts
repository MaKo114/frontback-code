// services/reportService.ts
import sql from "../../db";

export class ReportService {
  private server: any;

  // 🚩 เอา server กลับมาเพื่อใช้ publish
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

      // 🚩 5. แจ้ง Admin แบบ Real-time (ไม่สร้าง Noti ลง DB แต่ยิงผ่านท่อ WS)
      const admins =
        await tx`SELECT student_id FROM "User" WHERE role = 'ADMIN'`;

      for (const admin of admins) {
        // ใช้ publish ไปยังท่อรายบุคคลของ admin
        if (this.server?.server) {
          this.server.server.publish(
            `user-${admin.student_id}`,
            JSON.stringify({
              type: "REFRESH_REPORT_COUNT", // 🚩 หัวข้อข่าวสำหรับ Admin
              data: { report_id: report[0].report_id },
            }),
          );
        }
      }

      console.log(`📌 Report recorded and signaled to ${admins.length} admins`);
      return report[0];
    });
  }
}

export const reportService = new ReportService();
