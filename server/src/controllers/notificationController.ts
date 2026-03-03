import { notificationService } from "../services/notificationService";

export const getNotifications = async ({ user, set }: any) => {
  try {
    if (!user || !user.student_id) {
      set.status = 401;
      return { error: "Please login first" };
    }

    const notifications = await notificationService.getNotificationsByUser(user.student_id);
    return { data: notifications };
  } catch (err: any) {
    set.status = 500;
    return { error: err.message };
  }
};

export const markAsRead = async ({ params, user, set }: any) => {
  try {
    if (!user || !user.student_id) {
      set.status = 401;
      return { error: "Please login first" };
    }

    const notification_id = params.notification_id;
    if (!notification_id) {
      set.status = 400;
      return { error: "Invalid notification_id" };
    }

    const updated = await notificationService.markAsRead(notification_id, user.student_id);
    if (!updated) {
      set.status = 404;
      return { error: "Notification not found" };
    }

    set.status = 200;
    return { message: "Notification marked as read", data: updated };
  } catch (err: any) {
    set.status = 500;
    return { error: err.message };
  }
};

export const markAllAsRead = async ({ user, set }: any) => {
  try {
    if (!user || !user.student_id) {
      set.status = 401;
      return { error: "Please login first" };
    }

    const updated = await notificationService.markAllAsRead(user.student_id);
    set.status = 200;
    return { message: "All notifications marked as read", count: updated.length };
  } catch (err: any) {
    set.status = 500;
    return { error: err.message };
  }
};