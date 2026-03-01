import { create, type StateCreator } from "zustand";
import type { loginForm } from "../interfaces/form";
import axios, { type AxiosResponse } from "axios";
import { createJSONStorage, persist } from "zustand/middleware";

// กำหนด type ของ store
interface TestState {
  user: null
  token: null;
  actionLogin: (form: loginForm) => Promise<AxiosResponse<any> | void>;
}

// สร้าง store
const testStore: StateCreator<TestState> = (set) => ({
  user: null,
  token: null,
  actionLogin: async (form: loginForm) => {
    try{
      const res = await axios.post("http://localhost:8000/login", form);
      // เก็บ token ลง localStorage และอัปเดต state
      set({ 
        user: res.data.payload,
        token: res.data.token,
       });
      return res

    }catch(err){
      console.log(err);
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