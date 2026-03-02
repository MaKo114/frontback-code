import { exchangeService } from "../services/exchangeService";
import { strictBody } from "../utils/validate";

export const createExchangeRequest = async ({ body, user, set }: any) => {
  try {
    if (!user || !user.student_id) {
      set.status = 401;
      return { error: "Please login first" };
    }

    const allowed = ["post_id"];
    const required = ["post_id"];
    const v = strictBody(body, allowed, required);
    if (!v.ok) {
      set.status = 400;
      return { error: v.error };
    }

    const { post_id } = body;
    const request = await exchangeService.createRequest(user.student_id, Number(post_id));

    set.status = 201;
    return { message: "Exchange request sent successfully", data: request };
  } catch (err: any) {
    set.status = 400;
    return { error: err.message };
  }
};

export const updateExchangeStatus = async ({ params, body, user, set }: any) => {
  try {
    if (!user || !user.student_id) {
      set.status = 401;
      return { error: "Please login first" };
    }

    const exchange_id = params.exchange_id;
    if (!exchange_id) {
      set.status = 400;
      return { error: "Invalid exchange_id" };
    }

    const allowed = ["status"];
    const required = ["status"];
    const v = strictBody(body, allowed, required);
    if (!v.ok) {
      set.status = 400;
      return { error: v.error };
    }

    const { status } = body;
    const allowedStatuses = ["ACCEPTED", "REJECTED", "COMPLETED"];
    if (!allowedStatuses.includes(status)) {
      set.status = 400;
      return { error: `Invalid status. Must be one of: ${allowedStatuses.join(", ")}` };
    }

    const updated = await exchangeService.updateStatus(exchange_id, user.student_id, status);

    set.status = 200;
    return { message: `Exchange request ${status.toLowerCase()} successfully`, data: updated };
  } catch (err: any) {
    set.status = 400;
    return { error: err.message };
  }
};

export const getMySentRequests = async ({ user, set }: any) => {
  try {
    if (!user || !user.student_id) {
      set.status = 401;
      return { error: "Please login first" };
    }

    const requests = await exchangeService.getMyRequests(user.student_id);
    return { data: requests };
  } catch (err: any) {
    set.status = 500;
    return { error: err.message };
  }
};

export const getMyReceivedRequests = async ({ user, set }: any) => {
  try {
    if (!user || !user.student_id) {
      set.status = 401;
      return { error: "Please login first" };
    }

    const requests = await exchangeService.getMyPendingRequests(user.student_id);
    return { data: requests };
  } catch (err: any) {
    set.status = 500;
    return { error: err.message };
  }
};
