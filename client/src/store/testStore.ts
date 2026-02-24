import { create, type StateCreator } from "zustand";
import type { loginForm } from "../interfaces/form";
import axios, { type AxiosResponse } from "axios";

// กำหนด type ของ store
interface TestState {
  token: string;
  actionLogin: (form: loginForm) => Promise<AxiosResponse<any> | void>;
}

// สร้าง store
const testStore: StateCreator<TestState> = (set) => ({
  token: "",
  actionLogin: async (form: loginForm) => {
    try{
      const res = await axios.post("http://localhost:8000/login", form);
      // เก็บ token ลง localStorage และอัปเดต state
      localStorage.setItem("token", res.data.token);
      set({ token: res.data.token });
      return res
    }catch(err){
      console.log(err);
    }
  },
});

// hook สำหรับใช้งาน store
const useTestStore = create<TestState>(testStore);
export default useTestStore;