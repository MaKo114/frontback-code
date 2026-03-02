import axios from "axios";

const API = import.meta.env.VITE_API_URL;

/* ================= POSTS ================= */

export const createPost = (token: string, data: any) => {
  return axios.post(`${API}/create-post`, data, {
    headers: { Authorization: `Bearer ${token}` },
  });
};

export const getAllPost = (token: string) => {
  return axios.get(`${API}/get-all-post`, {
    headers: { Authorization: `Bearer ${token}` },
  });
};

export const getPostByCategory = (token: string, category_id: number) => {
  return axios.get(`${API}/post-by-category/${category_id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
};

export const deletePostApi = (token: string, post_id: number) => {
  return axios.delete(`${API}/post/${post_id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
};

export const uploadFile = (token: string, image: string) => {
  return axios.post(
    `${import.meta.env.VITE_API_URL}/upload-image`,
    { image },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );
};

export const getMyPost = (token: string) => {
  return axios.get(`${API}/getpost`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

/* ================= REPORTS ================= */

export const reportPostApi = (token: string, data: { post_id: number, reason: string, description?: string }) => {
  return axios.post(`${API}/reports`, data, {
    headers: { Authorization: `Bearer ${token}` },
  });
};

/* ================= EXCHANGES ================= */

export const requestExchangeApi = (token: string, post_id: number) => {
  return axios.post(`${API}/exchanges/request`, { post_id }, {
    headers: { Authorization: `Bearer ${token}` },
  });
};

export const updateExchangeStatusApi = (token: string, exchange_id: string, status: string) => {
  return axios.put(`${API}/exchanges/${exchange_id}/status`, { status }, {
    headers: { Authorization: `Bearer ${token}` },
  });
};

export const getSentExchangesApi = (token: string) => {
  return axios.get(`${API}/exchanges/sent`, {
    headers: { Authorization: `Bearer ${token}` },
  });
};

export const getReceivedExchangesApi = (token: string) => {
  return axios.get(`${API}/exchanges/received`, {
    headers: { Authorization: `Bearer ${token}` },
  });
};

/* ================= NOTIFICATIONS ================= */

export const getNotificationsApi = (token: string) => {
  return axios.get(`${API}/notifications`, {
    headers: { Authorization: `Bearer ${token}` },
  });
};

export const markNotificationReadApi = (token: string, notification_id: string) => {
  return axios.put(`${API}/notifications/${notification_id}/read`, {}, {
    headers: { Authorization: `Bearer ${token}` },
  });
};

export const markAllNotificationsReadApi = (token: string) => {
  return axios.put(`${API}/notifications/read-all`, {}, {
    headers: { Authorization: `Bearer ${token}` },
  });
};

/* ================= FAVORITES ================= */

export const addFavoriteApi = (token: string, post_id: number) => {
  return axios.post(`${API}/favorites`, { post_id }, {
    headers: { Authorization: `Bearer ${token}` },
  });
};

export const removeFavoriteApi = (token: string, post_id: number) => {
  return axios.delete(`${API}/favorites/${post_id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
};

export const getMyFavoritesApi = (token: string) => {
  return axios.get(`${API}/favorites`, {
    headers: { Authorization: `Bearer ${token}` },
  });
};

export const checkIsFavoriteApi = (token: string, post_id: number) => {
  return axios.get(`${API}/favorites/check/${post_id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
};
