import axios from "axios";

const API = import.meta.env.VITE_API_URL;

/* ================= CREATE ================= */

export const createPost = (token: string, data: any) => {
  return axios.post(`${API}/create-post`, data, {
    headers: { Authorization: `Bearer ${token}` },
  });
};

/* ================= GET ALL ================= */

export const getAllPost = (token: string) => {
  return axios.get(`${API}/get-all-post`, {
    headers: { Authorization: `Bearer ${token}` },
  });
};

/* ================= GET BY CATEGORY ================= */

export const getPostByCategory = (token: string, category_id: number) => {
  return axios.get(`${API}/post-by-category/${category_id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
};

/* ================= DELETE ================= */

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

export const deleteImage = (token: string, public_id: string) => {
  return axios.delete(`${API}/deleted-image`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    data: { public_id }
  });
}

export const getMyPost = async (token: string) => {
  try {
    const res = await axios.get(`${API}/getpost`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return res
  } catch (err) {
    console.log(err);
  }
};
/* ================= USER PROFILE ================= */

// 1. API สำหรับอัปเดตข้อมูล Profile (ชื่อ, เบอร์, รูปภาพ URL)
export const updateProfileApi = (token: string, data: any) => {
  return axios.put(`${API}/update-profile`, data, {
    headers: { Authorization: `Bearer ${token}` },
  });
};

// 2. API สำหรับดึงข้อมูล Profile ของตัวเอง (เอามาโชว์ใน Input ตอนโหลดหน้า Edit)
export const getMyProfileApi = (token: string) => {
  return axios.get(`${API}/me`, {
    headers: { Authorization: `Bearer ${token}` },
  });
};

/* ================= GET POST BY ID (เพิ่มอันนี้เข้าไปครับ) ================= */

export const getPostByIdApi = (token: string, post_id: number) => {
  return axios.get(`${API}/posts/${post_id}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
};