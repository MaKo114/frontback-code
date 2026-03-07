import { app } from "..";
import sql from "../../db";
import { notificationService } from "../services/notificationService";

export const getNotifications = async ({ user, set }: any) => {
  try {
    if (!user || !user.student_id) {
      set.status = 401;
      return { error: "Please login first" };
    }

    const notifications = await notificationService.getNotificationsByUser(
      user.student_id,
    );
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

    const updated = await notificationService.markAsRead(
      notification_id,
      user.student_id,
    );
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
    return {
      message: "All notifications marked as read",
      count: updated.length,
    };
  } catch (err: any) {
    set.status = 500;
    return { error: err.message };
  }
};

// ดึงจำนวน Unread สำหรับโชว์ Badge ที่ปุ่มกระดิ่ง
export const getUnreadCount = async ({ user, set }: any) => {
  try {
    if (!user || !user.student_id) {
      set.status = 401;
      return { error: "Please login first" };
    }

    const count = await notificationService.getUnreadCount(user.student_id);
    return { count };
  } catch (err: any) {
    set.status = 500;
    return { error: err.message };
  }
};

// ลบแจ้งเตือน (เผื่อ User อยากเคลียร์ทิ้ง)
export const deleteNotification = async ({ params, user, set }: any) => {
  try {
    if (!user || !user.student_id) {
      set.status = 401;
      return { error: "Please login first" };
    }

    const { notification_id } = params;
    const deleted = await notificationService.deleteNotification(
      notification_id,
      user.student_id,
    );

    if (!deleted) {
      set.status = 404;
      return { error: "Notification not found" };
    }

    return { message: "Notification deleted" };
  } catch (err: any) {
    set.status = 500;
    return { error: err.message };
  }
};

// notificationController.ts
export const markChatAsRead = async ({ params, user, set }: any) => {
  try {
    const { chat_id } = params;
    const student_id = user?.student_id;

    // 🚩 UPDATE ทุกข้อความในห้องนี้ ที่เราเป็นคนรับ ให้เป็น 'อ่านแล้ว'
    await sql`
      UPDATE "message"
      SET is_read = true
      WHERE chat_id = ${Number(chat_id)} 
        AND sender_id != ${student_id}  -- เราไม่อ่านข้อความตัวเอง
        AND is_read = false             -- อัปเดตเฉพาะที่ยังไม่อ่าน
    `;

    return { success: true };
  } catch (err: any) {
    set.status = 500;
    return { error: err.message };
  }
};
