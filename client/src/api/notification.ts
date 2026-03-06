import axios from "axios";

const API = "http://localhost:8000";

export const getNotificationsAPI = async (token: string) => {
  return await axios.get(`${API}/notifications`, {
    headers: { Authorization: `Bearer ${token}` },
  });
};

// 2. ดึงจำนวนที่ยังไม่ได้อ่าน (ตัวที่เราสร้างใหม่)
export const getUnreadCountAPI = async (token: string) => {
  return await axios.get(`${API}/notifications/unread-count`, {
    headers: { Authorization: `Bearer ${token}` },
  });
};

// 3. อ่านแจ้งเตือนรายอัน
export const markAsReadAPI = async (token: string, notification_id: string) => {
  return await axios.put(
    `${API}/notifications/${notification_id}/read`,
    {},
    { headers: { Authorization: `Bearer ${token}` } },
  );
};

// 4. อ่านทั้งหมด
export const markAllAsReadAPI = async (token: string) => {
  return await axios.put(
    `${API}/notifications/read-all`,
    {},
    { headers: { Authorization: `Bearer ${token}` } },
  );
};

// 5. ลบแจ้งเตือน (ตัวที่เราสร้างใหม่)
export const deleteNotificationAPI = async (
  token: string,
  notification_id: string,
) => {
  return await axios.delete(`${API}/notifications/${notification_id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
};

export const markChatAsReadApi = async (token: string, chat_id: number) => {
  return await axios.get(`${API}/mark-chat/${chat_id}`, {
    headers: {
      Authorization: `Bearer ${token}`
    }
  })
}