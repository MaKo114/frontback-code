import axios from "axios";

const API = import.meta.env.VITE_API_URL;

// api/exchange.ts
export const requestExchangeApi = (token: string, post_id: number) =>
  axios.post(`${API}/exchanges/request`, { post_id }, {
    headers: { Authorization: `Bearer ${token}` }
  });

export const getReceivedRequests = (token: string) =>
  axios.get(`${API}/exchanges/received`, {
    headers: { Authorization: `Bearer ${token}` },
  });
export const getSentRequests = (token: string) =>
  axios.get(`${API}/exchanges/sent`, {
    headers: { Authorization: `Bearer ${token}` },
  });
export const acceptExchange = (token: string, id: number) =>
  axios.put(
    `${API}/exchanges/${id}/status`,
    { status: "ACCEPTED" },
    { headers: { Authorization: `Bearer ${token}` } },
  );
export const rejectExchange = (token: string, id: number) =>
  axios.put(
    `${API}/exchanges/${id}/status`,
    { status: "REJECTED" },
    { headers: { Authorization: `Bearer ${token}` } },
  );
export const ownerConfirm = (token: string, id: number) =>
  axios.post(
    `${API}/exchanges/${id}/owner-confirm`,
    {},
    { headers: { Authorization: `Bearer ${token}` } },
  );
export const requesterConfirm = (token: string, id: number) =>
  axios.post(
    `${API}/exchanges/${id}/requester-confirm`,
    {},
    { headers: { Authorization: `Bearer ${token}` } },
  );
export const cancelExchange = (token: string, id: number) =>
  axios.put(
    `${API}/exchanges/${id}/cancel`,
    {},
    { headers: { Authorization: `Bearer ${token}` } },
  );