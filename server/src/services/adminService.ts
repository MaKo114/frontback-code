import sql from "../../db";
import { postService } from "./postService";

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
             (SELECT count(*) FROM "post_reports" r WHERE r.post_id = p.post_id) as report_count
      FROM "Post" p
      JOIN "User" u ON p.student_id = u.student_id
      ORDER BY p.created_at DESC
    `;
  }

  async deletePost(post_id: number) {
    // Use the common postService to handle complex transactional delete
    // Admin is always allowed to delete any post
    return await postService.deletePost(post_id, 0, true);
  }

  // --- Report Management ---
  async getAllReports() {
    return await sql`
      SELECT r.report_id, r.reason, r.status, r.created_at, 
             p.post_id, p.title as post_title,
             u.first_name as reporter_name, u.last_name as reporter_surname
      FROM "post_reports" r
      JOIN "Post" p ON r.post_id = p.post_id
      JOIN "User" u ON r.reporter_id = u.student_id
      ORDER BY r.created_at DESC
    `;
  }

  async getReportDetails(report_id: string) {
    const report = await sql`
      SELECT r.report_id, r.reason, r.description, r.status, r.created_at,
             p.post_id, p.title as post_title, p.description as post_description,
             u.student_id as reporter_id, u.first_name as reporter_name, u.last_name as reporter_surname
      FROM "post_reports" r
      JOIN "Post" p ON r.post_id = p.post_id
      JOIN "User" u ON r.reporter_id = u.student_id
      WHERE r.report_id = ${report_id}
      LIMIT 1
    `;
    return report[0] || null;
  }

  async resolveReport(report_id: string) {
    const updated = await sql`
      UPDATE "post_reports"
      SET status = 'RESOLVED'
      WHERE report_id = ${report_id}
      RETURNING report_id, status
    `;
    return updated[0] || null;
  }
}

export const adminService = new AdminService();
