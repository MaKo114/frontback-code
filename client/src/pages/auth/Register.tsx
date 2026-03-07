import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Title from "../../titles/Title";
import { User, Phone, Calendar, Mail, Lock, UserPlus } from "lucide-react";
import Swal from "sweetalert2";
import axios from "axios";

interface registerForm {
  first_name: string;
  last_name: string;
  phone_number: string;
  birth_date: string;
  email: string;
  password: string;
  confirmPassword: string;
}

const Register = () => {
  const navigate = useNavigate();
  const API = import.meta.env.VITE_API_URL;

  const [information, setInformation] = useState<registerForm>({
    first_name: "",
    last_name: "",
    phone_number: "",
    birth_date: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const handleOnChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInformation({
      ...information,
      [e.target.name]: e.target.value,
    });
  };

  const handleOnSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // 1. ตรวจสอบรูปแบบอีเมลนักศึกษา (รหัส 8 หลัก @kmitl.ac.th)
    // เงื่อนไข: ขึ้นต้นด้วย 60 ถึงปีปัจจุบัน (69)
    const currentYearShort = new Date().getFullYear() + 43; // 2026 + 43 = 69 (พ.ศ. 2569)
    const emailRegex = new RegExp(
      `^(6[0-${currentYearShort % 10}])[0-9]{6}@kmitl\\.ac\\.th$`,
    );

    if (!emailRegex.test(information.email)) {
      Swal.fire({
        icon: "error",
        title: "อีเมลไม่ถูกต้อง",
        text: `กรุณาใช้อีเมลนักศึกษา 8 หลัก (6XXXXXXX@kmitl.ac.th)`,
        confirmButtonColor: "#FF5800",
      });
      return;
    }

    // 2. เช็ครหัสผ่านไม่ตรงกัน
    if (information.password !== information.confirmPassword) {
      Swal.fire({
        icon: "error",
        title: "รหัสผ่านไม่ตรงกัน",
        text: "กรุณาตรวจสอบและกรอกรหัสผ่านใหม่อีกครั้ง",
        confirmButtonColor: "#FF5800",
        confirmButtonText: "ตกลง",
      });
      return;
    }

    // 3. ตรวจสอบความยาวรหัสผ่าน (แถมให้เพื่อความปลอดภัย)
    if (information.password.length < 6) {
      Swal.fire({
        icon: "warning",
        title: "รหัสผ่านสั้นเกินไป",
        text: "รหัสผ่านต้องมีความยาวอย่างน้อย 6 ตัวอักษร",
        confirmButtonColor: "#FF5800",
      });
      return;
    }

    try {
      Swal.fire({
        title: "กำลังลงทะเบียน...",
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        },
      });

      // ส่งข้อมูลไปยัง API (ลบ confirmPassword ออกก่อนส่งเพื่อความคลีน)
      const { confirmPassword, ...dataToSend } = information;
      const res = await axios.post(`${API}/register`, dataToSend);

      Swal.fire({
        icon: "success",
        title: "ลงทะเบียนสำเร็จ!",
        text: "ยินดีต้อนรับเข้าสู่ TokLadkrabang",
        confirmButtonColor: "#FF5800",
        confirmButtonText: "ไปหน้าเข้าสู่ระบบ",
      }).then((result) => {
        if (result.isConfirmed) {
          navigate("/login");
        }
      });
    } catch (err: any) {
      Swal.fire({
        icon: "error",
        title: "ลงทะเบียนไม่สำเร็จ",
        text:
          err.response?.data?.message ||
          "อีเมลนี้อาจถูกใช้งานไปแล้ว หรือระบบขัดข้อง",
        confirmButtonColor: "#FF5800",
      });
    }
  };

  // Helper สำหรับสไตล์ของ Input
  const inputStyle =
    "w-full bg-gray-50 border border-gray-100 rounded-2xl py-3 pl-11 pr-4 text-sm outline-none ring-2 ring-transparent focus:ring-[#FF5800]/10 focus:border-[#FF5800] focus:bg-white transition-all placeholder:text-gray-300";
  const labelStyle =
    "text-xs font-black text-gray-700 uppercase tracking-wider ml-1 mb-1 block";

  return (
    <div className="min-h-screen bg-[#F8F9FA] flex flex-col items-center justify-center px-4 py-12 font-['Inter',_sans-serif]">
      <Title />

      <div className="bg-white mt-8 p-8 sm:p-10 rounded-[32px] shadow-[0_20px_50px_rgba(0,0,0,0.05)] border border-gray-100 w-full max-w-2xl">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-black text-gray-900 mb-2 tracking-tight">
            สร้างบัญชีใหม่
          </h1>
          <p className="text-gray-400 text-sm font-medium">
            เข้าร่วมคอมมูนิตี้ TokLadkrabang ได้ง่ายๆ ในไม่กี่ขั้นตอน
          </p>
        </div>

        <form className="space-y-5" onSubmit={handleOnSubmit}>
          {/* ชื่อ - นามสกุล */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="relative group">
              <label className={labelStyle}>ชื่อ</label>
              <div className="absolute top-[34px] left-4 text-gray-400 group-focus-within:text-[#FF5800] transition-colors">
                <User size={18} />
              </div>
              <input
                className={inputStyle}
                placeholder="ชื่อจริง"
                type="text"
                name="first_name"
                required
                onChange={handleOnChange}
              />
            </div>

            <div className="relative group">
              <label className={labelStyle}>นามสกุล</label>
              <div className="absolute top-[34px] left-4 text-gray-400 group-focus-within:text-[#FF5800] transition-colors">
                <User size={18} />
              </div>
              <input
                className={inputStyle}
                placeholder="นามสกุล"
                type="text"
                name="last_name"
                required
                onChange={handleOnChange}
              />
            </div>
          </div>

          {/* เบอร์โทร - วันเกิด */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="relative group">
              <label className={labelStyle}>เบอร์โทรศัพท์</label>
              <div className="absolute top-[34px] left-4 text-gray-400 group-focus-within:text-[#FF5800] transition-colors">
                <Phone size={18} />
              </div>
              <input
                className={inputStyle}
                placeholder="08X-XXX-XXXX"
                type="text"
                name="phone_number"
                required
                onChange={handleOnChange}
              />
            </div>

            <div className="relative group">
              <label className={labelStyle}>วันเกิด</label>
              <div className="absolute top-[34px] left-4 text-gray-400 group-focus-within:text-[#FF5800] transition-colors">
                <Calendar size={18} />
              </div>
              <input
                className={inputStyle}
                type="date"
                name="birth_date"
                required
                onChange={handleOnChange}
              />
            </div>
          </div>

          {/* อีเมล */}
          <div className="relative group">
            <label className={labelStyle}>อีเมลสถาบัน</label>
            <div className="absolute top-[34px] left-4 text-gray-400 group-focus-within:text-[#FF5800] transition-colors">
              <Mail size={18} />
            </div>
            <input
              className={inputStyle}
              placeholder="xxxxxxxx@kmitl.ac.th"
              type="email"
              name="email"
              required
              onChange={handleOnChange}
            />
          </div>

          {/* รหัสผ่าน */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="relative group">
              <label className={labelStyle}>รหัสผ่าน</label>
              <div className="absolute top-[34px] left-4 text-gray-400 group-focus-within:text-[#FF5800] transition-colors">
                <Lock size={18} />
              </div>
              <input
                className={inputStyle}
                placeholder="••••••••"
                type="password"
                name="password"
                required
                onChange={handleOnChange}
              />
            </div>

            <div className="relative group">
              <label className={labelStyle}>ยืนยันรหัสผ่าน</label>
              <div className="absolute top-[34px] left-4 text-gray-400 group-focus-within:text-[#FF5800] transition-colors">
                <Lock size={18} />
              </div>
              <input
                className={inputStyle}
                placeholder="••••••••"
                type="password"
                name="confirmPassword"
                required
                onChange={handleOnChange}
              />
            </div>
          </div>

          <button className="flex items-center justify-center gap-2 text-white bg-linear-to-r from-[#FFB800] to-[#FF5800] font-black rounded-2xl w-full py-4 shadow-[0_10px_20px_rgba(255,88,0,0.2)] hover:shadow-[0_15px_25px_rgba(255,88,0,0.3)] hover:scale-[1.01] active:scale-[0.99] transition-all mt-6">
            <UserPlus size={20} strokeWidth={3} />
            สมัครสมาชิก
          </button>

          <p className="text-center text-gray-500 mt-6 font-medium text-sm">
            เป็นสมาชิกอยู่แล้วใช่ไหม?{" "}
            <Link
              to={"/login"}
              className="text-[#FF5800] hover:text-[#E64A00] font-black underline underline-offset-4 transition-colors"
            >
              เข้าสู่ระบบ
            </Link>
          </p>
        </form>
      </div>

      <p className="mt-8 text-gray-400 text-[10px] font-bold uppercase tracking-[0.2em]">
        TokLadkrabang • Community for Students
      </p>
    </div>
  );
};

export default Register;
