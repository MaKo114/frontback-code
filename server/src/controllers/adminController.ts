import { adminService } from "../services/adminService";

// Helper to check admin permission (already handled by middleware but good for safety)
const checkAdmin = (user: any, set: any) => {
  if (!user) {
    set.status = 401;
    return { error: "Unauthorized" };
  }
  if (user.role !== "ADMIN") {
    set.status = 403;
    return { error: "Forbidden: Admin only" };
  }
  return null;
};

// --- User Management ---

export const getAllUsers = async ({ user, set }: any) => {
  const err = checkAdmin(user, set);
  if (err) return err;

  try {
    const users = await adminService.getAllUsers();
    return { data: users };
  } catch (err: any) {
    set.status = 500;
    return { error: err.message };
  }
};

export const getUserDetails = async ({ params, user, set }: any) => {
  const err = checkAdmin(user, set);
  if (err) return err;

  const student_id = Number(params.student_id);
  if (!student_id || Number.isNaN(student_id)) {
    set.status = 400;
    return { error: "Invalid student_id" };
  }

  try {
    const details = await adminService.getUserDetails(student_id);
    if (!details) {
      set.status = 404;
      return { error: "User not found" };
    }
    return { data: details };
  } catch (err: any) {
    set.status = 500;
    return { error: err.message };
  }
};

export const blockUser = async ({ params, user, set }: any) => {
  const err = checkAdmin(user, set);
  if (err) return err;

  const student_id = Number(params.student_id);
  if (!student_id || student_id === user.student_id) {
    set.status = 400;
    return { error: "Invalid student_id or trying to block yourself" };
  }

  try {
    const updated = await adminService.updateUserStatus(student_id, "BANNED");
    if (!updated) {
      set.status = 404;
      return { error: "User not found" };
    }
    return { message: "User blocked successfully", data: updated };
  } catch (err: any) {
    set.status = 500;
    return { error: err.message };
  }
};

export const unblockUser = async ({ params, user, set }: any) => {
  const err = checkAdmin(user, set);
  if (err) return err;

  const student_id = Number(params.student_id);
  try {
    const updated = await adminService.updateUserStatus(student_id, "ACTIVE");
    if (!updated) {
      set.status = 404;
      return { error: "User not found" };
    }
    return { message: "User unblocked successfully", data: updated };
  } catch (err: any) {
    set.status = 500;
    return { error: err.message };
  }
};

// --- Listing Management ---

export const getAllListings = async ({ user, set }: any) => {
  const err = checkAdmin(user, set);
  if (err) return err;

  try {
    const listings = await adminService.getAllListings();
    return { data: listings };
  } catch (err: any) {
    set.status = 500;
    return { error: err.message };
  }
};

export const adminDeletePost = async ({ params, user, set }: any) => {
  const err = checkAdmin(user, set);
  if (err) return err;

  const post_id = Number(params.post_id);
  try {
    const deleted = await adminService.deletePost(post_id);
    if (!deleted) {
      set.status = 404;
      return { error: "Post not found" };
    }
    return { message: "Post deleted successfully", data: deleted };
  } catch (err: any) {
    set.status = 500;
    return { error: err.message };
  }
};

// --- Report Management ---

export const getAllReports = async ({ user, set }: any) => {
  const err = checkAdmin(user, set);
  if (err) return err;

  try {
    const reports = await adminService.getAllReports();
    return { data: reports };
  } catch (err: any) {
    set.status = 500;
    return { error: err.message };
  }
};

export const getReportDetails = async ({ params, user, set }: any) => {
  const err = checkAdmin(user, set);
  if (err) return err;

  const report_id = Number(params.report_id);
  try {
    const report = await adminService.getReportDetails(report_id);
    if (!report) {
      set.status = 404;
      return { error: "Report not found" };
    }
    return { data: report };
  } catch (err: any) {
    set.status = 500;
    return { error: err.message };
  }
};

export const resolveReport = async ({ params, user, set }: any) => {
  const err = checkAdmin(user, set);
  if (err) return err;

  const report_id = Number(params.report_id);
  try {
    const resolved = await adminService.resolveReport(report_id);
    if (!resolved) {
      set.status = 404;
      return { error: "Report not found" };
    }
    return { message: "Report resolved successfully" };
  } catch (err: any) {
    set.status = 500;
    return { error: err.message };
  }
};
