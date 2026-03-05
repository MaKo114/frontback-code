import axios from "axios";

const API_URL = "http://localhost:8000"; // ปรับตามจริง

export const addFavoriteApi = (token: string, postId: number) =>
  axios.post(
    `${API_URL}/favorites`,
    { post_id: postId }, // 👈 ส่งเป็น Object ไปใน Body
    { headers: { Authorization: `Bearer ${token}` } },
  );

export const removeFavoriteApi = (token: string, postId: number) =>
  axios.delete(`${API_URL}/favorites/${postId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

export const checkIsFavoriteApi = (token: string, postId: number) =>
  axios.get(`${API_URL}/favorites/check/${postId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

export const getFavCountApi = async (post_id: number) => {
  return axios.get(`http://localhost:8000/posts/${post_id}/favorites/count`);
};
