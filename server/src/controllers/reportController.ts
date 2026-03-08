import { reportService } from "../services/reportService";
import { strictBody } from "../utils/validate";

export const createReport = async ({ body, user, set }: any) => {
  try {
    if (!user || !user.student_id) {
      set.status = 401;
      return { error: "Please login first" };
    }

    const payload = typeof body === "string" ? JSON.parse(body) : body; 

    const allowed = ["post_id", "reason", "description"];
    const required = ["post_id", "reason"];

    const v = strictBody(payload, allowed, required);
    if (!v.ok) {
      set.status = 400;
      return { error: v.error };
    }

    const { post_id, reason, description } = payload;

    const report = await reportService.createReport(
      user.student_id,
      Number(post_id),
      reason,
      description,
    );

    set.status = 201;
    return { message: "Post reported successfully", data: report };
  } catch (err: any) {
    set.status = 400;
    console.error("Controller Error:", err.message);
    return { error: err.message };
  }
};

export const ignoreReport = async ({ params, user, set }: any) => {
  try {
    // 1. Check Admin Permission
    if (!user || user.role !== "ADMIN") {
      set.status = 403;
      return { error: "Forbidden: Admin access only" };
    }

    const { id } = params;
    if (!id) {
      set.status = 400;
      return { error: "Report ID is required" };
    }

    // 2. Call Service
    const result = await reportService.ignoreReport(Number(id));

    set.status = 200;
    return { 
      message: "Report ignored successfully", 
      data: result 
    };
  } catch (err: any) {
    set.status = 400;
    console.error("❌ Ignore Report Error:", err.message);
    return { error: err.message };
  }
};