import axios from "axios";

const API = "http://localhost:8000";

// api/exchange.ts
export const requestExchangeApi = (token: string, post_id: number) =>
  axios.post(`${API}/exchanges/request`, { post_id }, {
    headers: { Authorization: `Bearer ${token}` }
  });