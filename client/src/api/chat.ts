import axios from "axios";

const API = import.meta.env.VITE_API_URL;

export const createChat = async (token: string, post_id: number) => {
  return await axios.post(`${API}/chat/room`, { post_id }, {
    headers: { Authorization: `Bearer ${token}` },
  });
};

export const getChatMessages = async (token: string, chatId: string) => {
  const res = await axios.get(`${API}/chat/rooms/${chatId}/messages`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return res.data;
};

export const sendMessageApi = async (token: string, chatId: string, text: string) => {
  const res = await axios.post(`${API}/chat/rooms/${chatId}/messages`, { text }, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return res.data;
};

export const getMyChatRoomsApi = async (token: string) => {
  const res = await axios.get(`${API}/chat/rooms`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return res.data; // จะได้ { data: [ { chat_id, other_first_name, ... }, ... ] }
};