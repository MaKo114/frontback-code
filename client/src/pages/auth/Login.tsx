import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import type { loginForm } from "../../interfaces/form";
import useTestStore from "../../store/tokStore";
import Title from "../../titles/Title";
import { Mail, Lock, LogIn } from "lucide-react"; // เพิ่มไอคอนให้น่าใช้งาน
import Swal from "sweetalert2";

const Login = () => {
  const navigate = useNavigate();
  const actionLogin = useTestStore((s) => s.actionLogin);
  const [form, setForm] = useState<loginForm>({
    email: "",
    password: "",
  });

  const handleOnChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const roleRedirect = (res: any) => {
    const role = res.data.payload.role;
    if (role === "ADMIN") {
      navigate("/admin");
    } else {
      navigate("/user");
    }
  };

  // 2. ฟังก์ชัน Validation อีเมลนักศึกษา
  const validateKmitlEmail = (email: string) => {
    const kmitlRegex = /^(6[0-9])[0-9]{6}@kmitl\.ac\.th$/;
    return kmitlRegex.test(email);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // const isKmitl = validateKmitlEmail(form.email);
    // const isAdmin = form.email === "admin@gmail.com";
    // console.log(isAdmin, form.email);
    

    // 3. ตรวจสอบ Format อีเมลก่อนยิง API
    // if (!isKmitl && !isAdmin) {
    //   Swal.fire({
    //     icon: "error",
    //     title: "รูปแบบอีเมลไม่ถูกต้อง",
    //     text: "กรุณาใช้รูปแบบ: รหัสนักศึกษา@kmitl.ac.th",
    //     confirmButtonColor: "#FF5800",
    //   });
    //   return; // หยุดการทำงาน
    // }

    try {
      const res = await actionLogin(form);

      // ถ้า Login สำเร็จ อาจจะโชว์ Success เล็กน้อย (ทางเลือก)
      const Toast = Swal.mixin({
        toast: true,
        position: "top-end",
        showConfirmButton: false,
        timer: 2000,
        timerProgressBar: true,
      });
      Toast.fire({
        icon: "success",
        title: "เข้าสู่ระบบสำเร็จ",
      });

      roleRedirect(res);
    } catch (err: any) {
      console.error("Login failed:", err);

      // 4. กรณีรหัสผ่านผิด หรือ User ไม่มีในระบบ
      Swal.fire({
        icon: "error",
        title: "เข้าสู่ระบบไม่สำเร็จ",
        text: "อีเมลหรือรหัสผ่านไม่ถูกต้อง กรุณาลองใหม่อีกครั้ง",
        confirmButtonColor: "#FF5800",
      });
    }
  };

  // const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
  //   e.preventDefault();
  //   try {
  //     const res = await actionLogin(form);
  //     roleRedirect(res);
  //   } catch (err) {
  //     console.error("Login failed:", err);
  //     // ตรงนี้พี่อาจจะเพิ่ม Alert สวยๆ แจ้งว่า "อีเมลหรือรหัสผ่านไม่ถูกต้อง"
  //   }
  // };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#F8F9FA] px-4 font-['Inter', sans-serif]">
      <Title />

      {/* Login Card Container */}
      <div className="flex bg-white rounded-[32px] shadow-[0_20px_50px_rgba(0,0,0,0.05)] overflow-hidden max-w-5xl w-full border border-gray-100 mt-6">
        {/* Left side: Illustration (ปรับตรงนี้) */}
        {/* เปลี่ยน bg-orange-50/30 เป็น bg-white */}
        <div className="hidden md:flex md:w-1/2 lg:w-3/5 bg-white items-center justify-center p-12">
          <img
            src="https://img.freepik.com/free-vector/hand-drawn-business-communication-concept_23-2149140766.jpg?t=st=1769230982~exp=1769234582~hmac=8822c530fa44c0b9fb9027bb83bca487939f2b61da0053bbe9a1b1949442875d"
            alt="Login illustration"
            className="max-h-[450px] object-contain"
          />
        </div>

        {/* Right side: Login Form */}
        <div className="w-full md:w-1/2 lg:w-2/5 p-8 sm:p-12 flex flex-col justify-center">
          <div className="mb-10 text-center md:text-left">
            <h1 className="text-3xl font-black text-gray-900 mb-2 tracking-tight">
              ยินดีต้อนรับกลับมา!
            </h1>
            <p className="text-gray-400 text-sm font-medium">
              เข้าสู่ระบบเพื่อเชื่อมต่อกับชาว KMITL
            </p>
          </div>

          <form className="space-y-5" onSubmit={handleSubmit}>
            {/* Email Field */}
            <div className="space-y-2">
              <label className="text-xs font-black text-gray-700 uppercase tracking-wider ml-1">
                อีเมลนักศึกษา
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-[#FF5800] transition-colors">
                  <Mail size={18} />
                </div>
                <input
                  className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-3.5 pl-11 pr-4 text-sm outline-none ring-2 ring-transparent focus:ring-[#FF5800]/10 focus:border-[#FF5800] focus:bg-white transition-all placeholder:text-gray-300"
                  placeholder="xxxxxxxx@kmitl.ac.th"
                  type="email"
                  name="email"
                  required
                  onChange={handleOnChange}
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <div className="flex justify-between items-center ml-1">
                <label className="text-xs font-black text-gray-700 uppercase tracking-wider">
                  รหัสผ่าน
                </label>
                <Link
                  to="#"
                  className="text-[11px] font-bold text-[#FF5800] hover:underline"
                >
                  ลืมรหัสผ่าน?
                </Link>
              </div>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-[#FF5800] transition-colors">
                  <Lock size={18} />
                </div>
                <input
                  className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-3.5 pl-11 pr-4 text-sm outline-none ring-2 ring-transparent focus:ring-[#FF5800]/10 focus:border-[#FF5800] focus:bg-white transition-all placeholder:text-gray-300"
                  placeholder="••••••••"
                  type="password"
                  name="password"
                  required
                  onChange={handleOnChange}
                />
              </div>
            </div>

            {/* Submit Button */}
            <button className="flex items-center justify-center gap-2 text-white bg-linear-to-r from-[#FFB800] to-[#FF5800] font-black rounded-2xl w-full py-4 shadow-[0_10px_20px_rgba(255,88,0,0.2)] hover:shadow-[0_15px_25px_rgba(255,88,0,0.3)] hover:scale-[1.02] active:scale-[0.98] transition-all mt-4">
              <LogIn size={20} strokeWidth={3} />
              เข้าสู่ระบบ
            </button>

            {/* Footer Link */}
            <div className="pt-6 text-center">
              <p className="text-sm text-gray-500 font-medium">
                ยังไม่มีบัญชีผู้ใช้งาน?{" "}
                <Link
                  to={"/register"}
                  className="text-[#FF5800] hover:text-[#E64A00] font-black underline underline-offset-4 transition-colors"
                >
                  สมัครสมาชิกใหม่
                </Link>
              </p>
            </div>
          </form>
        </div>
      </div>

      <p className="mt-8 text-gray-400 text-xs font-medium uppercase tracking-widest">
        KMITL CONNECT • Engineering Your Connections
      </p>
    </div>
  );
};

export default Login;
