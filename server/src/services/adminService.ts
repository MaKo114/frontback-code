import sql from "../../db";

export class AdminService {
  // --- User Management ---
  async getAllUsers() {
    return await sql`
      SELECT student_id, first_name, last_name, email, role, status, created_at, updated_at
      FROM "User"
      ORDER BY created_at DESC
    `;
  }

  async getUserDetails(student_id: number) {
    const user = await sql`
      SELECT student_id, first_name, last_name, email, role, status, created_at, updated_at
      FROM "User"
      WHERE student_id = ${student_id}
      LIMIT 1
    `;
    
    if (user.length === 0) return null;

    const posts = await sql`
      SELECT post_id, title, status, created_at
      FROM "Post"
      WHERE student_id = ${student_id}
      ORDER BY created_at DESC
    `;

    return { ...user[0], posts };
  }

  async updateUserStatus(student_id: number, status: 'ACTIVE' | 'BANNED' | 'INACTIVE') {
    const updated = await sql`
      UPDATE "User"
      SET status = ${status}::"UserStatus", updated_at = NOW()
      WHERE student_id = ${student_id}
      RETURNING student_id, first_name, last_name, email, status
    `;
    return updated[0] || null;
  }

  // --- Listing Management ---
  async getAllListings() {
    return await sql`
      SELECT p.post_id, p.title, p.status, p.created_at, u.first_name, u.last_name,
             (SELECT count(*) FROM "report" r WHERE r.post_id = p.post_id) as report_count
      FROM "Post" p
      JOIN "User" u ON p.student_id = u.student_id
      ORDER BY p.created_at DESC
    `;
  }

  async deletePost(post_id: number) {
    return await sql.begin(async (tx: any) => {
      // Clean up relations
      await tx`DELETE FROM "post_image" WHERE post_id = ${post_id}`;
      await tx`DELETE FROM "post_category" WHERE post_id = ${post_id}`;
      await tx`DELETE FROM "favorite" WHERE post_id = ${post_id}`;
      await tx`DELETE FROM "report" WHERE post_id = ${post_id}`;
      
      const deleted = await tx`
        DELETE FROM "Post"
        WHERE post_id = ${post_id}
        RETURNING post_id, title
      `;
      return deleted[0] || null;
    });
  }

  // --- Report Management ---
  async getAllReports() {
    return await sql`
      SELECT r.report_id, r.text, r.created_at, 
             p.post_id, p.title as post_title,
             u.first_name as reporter_name, u.last_name as reporter_surname
      FROM "report" r
      JOIN "Post" p ON r.post_id = p.post_id
      JOIN "User" u ON r.reporter_id = u.student_id
      ORDER BY r.created_at DESC
    `;
  }

  async getReportDetails(report_id: number) {
    const report = await sql`
      SELECT r.report_id, r.text, r.created_at,
             p.post_id, p.title as post_title, p.description as post_description,
             u.student_id as reporter_id, u.first_name as reporter_name, u.last_name as reporter_surname
      FROM "report" r
      JOIN "Post" p ON r.post_id = p.post_id
      JOIN "User" u ON r.reporter_id = u.student_id
      WHERE r.report_id = ${report_id}
      LIMIT 1
    `;
    return report[0] || null;
  }

  async resolveReport(report_id: number) {
    // In this schema, we don't have a 'resolved' status in the report table, 
    // so we'll just delete the report to mark it as handled.
    // Alternatively, we could add a column to the schema, but we'll stick to deletion for now.
    const deleted = await sql`
      DELETE FROM "report"
      WHERE report_id = ${report_id}
      RETURNING report_id
    `;
    return deleted[0] || null;
  }
}

export const adminService = new AdminService();
