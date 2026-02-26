import axios from "axios";

const API_URL = "http://localhost:8000";

export const getCategories = async () => {
  return await axios.get(`${API_URL}/categories`);
};

export const createCategory = async (token: string, data: { category_name: string }) => {
  return await axios.post(`${API_URL}/categories`, data, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

export const updateCategory = async (token: string, category_id: number, data: { category_name: string }) => {
  return await axios.put(`${API_URL}/categories/${category_id}`, data, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

export const deleteCategory = async (token: string, category_id: number) => {
  return await axios.delete(`${API_URL}/categories/${category_id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};
