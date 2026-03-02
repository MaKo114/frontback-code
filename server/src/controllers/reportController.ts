import { reportService } from "../services/reportService";
import { strictBody } from "../utils/validate";

export const createReport = async ({ body, user, set }: any) => {
  try {
    if (!user || !user.student_id) {
      set.status = 401;
      return { error: "Please login first" };
    }

    const allowed = ["post_id", "reason", "description"];
    const required = ["post_id", "reason"];
    const v = strictBody(body, allowed, required);
    if (!v.ok) {
      set.status = 400;
      return { error: v.error };
    }

    const { post_id, reason, description } = body;
    const report = await reportService.createReport(
      user.student_id,
      Number(post_id),
      reason,
      description
    );

    set.status = 201;
    return { message: "Post reported successfully", data: report };
  } catch (err: any) {
    set.status = 400;
    return { error: err.message };
  }
};
