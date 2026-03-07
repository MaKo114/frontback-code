import { create, type StateCreator } from "zustand";
import type { loginForm } from "../interfaces/form";
import axios, { type AxiosResponse } from "axios";
import { createJSONStorage, persist } from "zustand/middleware";
import { getCategories } from "@/api/category";
import { getInformation, getMe } from "@/api/user";
// import { getCategories } from "@/api/category";

interface TestState {
  user: any | null;
  token: string;
  categories: any[];
  // ✅ 1. เปลี่ยนชื่อใน Interface ให้ตรงกับที่ Navbar ใช้
  userInformation: any | null;
  actionLogin: (form: loginForm) => Promise<AxiosResponse<any> | void>;
  fetchCategories: () => Promise<void>;
  actionLogOut: () => void;
  getUserInformation: () => Promise<AxiosResponse<any> | void>;
}
// สร้าง store
const testStore: StateCreator<TestState> = (set, get) => ({
  user: null,
  token: "",
  userInformation: null, // ✅ 2. เริ่มต้นเป็น null (Navbar จะได้ไม่พังตอนโหลด)
  categories: [],
  actionLogin: async (form: loginForm) => {
    try {
      const res = await axios.post("http://localhost:8000/login", form);
      // เก็บ token ลง localStorage และอัปเดต state
      set({
        user: res.data.payload,
        token: res.data.token,
      });
      return res;
    } catch (err) {
      console.log(err);
    }
  },
  fetchCategories: async () => {
    try {
      const token = get().token;
      const res = await getCategories(token);
      set({ categories: res.data.data });
    } catch (err) {
      console.log(err);
    }
  },
  actionLogOut: () => {
    set({
      user: null,
      token: "",
      categories: [],
    });
    useTestStore.persist.clearStorage();
  },

  // ภายใน testStore
  getUserInformation: async () => {
    try {
      const token = get().token;
      if (!token) return;

      // ✅ เรียกใช้ getMe ที่เราเพิ่งแก้ (Backend จะรู้เองว่าเราเป็นใครจาก Token)
      const res = await getMe(token);

      // อัปเดตข้อมูลส่วนตัวที่ถูกต้องลงใน Store
      set({ userInformation: res.data });
      return res;
    } catch (err) {
      console.error("Error fetching my info:", err);
    }
  },
});

const userPersist = {
  name: "tokladkrabang-store",
  store: createJSONStorage(() => localStorage),
};

// hook สำหรับใช้งาน store
const useTestStore = create(persist(testStore, userPersist));
export default useTestStore;
