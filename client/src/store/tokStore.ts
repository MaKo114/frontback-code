import { create, type StateCreator } from "zustand";
import type { loginForm } from "../interfaces/form";
import axios, { type AxiosResponse } from "axios";
import { createJSONStorage, persist } from "zustand/middleware";
import { getCategories } from "@/api/category";
import { getInformation } from "@/api/user";
// import { getCategories } from "@/api/category";

// กำหนด type ของ store
interface TestState {
  user: any | null;
  token: string;
  categories: any[];
  userInformation: Information | null;
  actionLogin: (form: loginForm) => Promise<AxiosResponse<any> | void>;
  fetchCategories: () => Promise<void>;
  actionLogOut: () => void;
  getUserInformation: () => Promise<AxiosResponse<any> | void>;
}

interface Information {
  userInformation: {
    student_id: number
    first_name: string
    last_name: string
    email: string
    role: string
    status: string
    created_at: string
    updated_at: string
  },
}
// สร้าง store
const testStore: StateCreator<TestState> = (set, get) => ({
  user: null,
  token: "",
  userInformation: null,
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

  getUserInformation: async () => {
    try{
      const token = get().token;
      const student_id = get().user.student_id
      const res = await getInformation(token, student_id)
      set({
        userInformation: res.data
      })
      return res
    }catch(err){
      console.log(err);
    }
  }
});

const userPersist = {
  name: "tokladkrabang-store",
  store: createJSONStorage(() => localStorage),
};

// hook สำหรับใช้งาน store
const useTestStore = create(persist(testStore, userPersist));
export default useTestStore;
