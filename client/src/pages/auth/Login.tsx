import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import type { loginForm } from "../../interfaces/form";
import useTestStore from "../../store/tokStore";
import Title from "../../titles/Title";

// https://img.freepik.com/free-vector/hand-drawn-business-communication-concept_23-2149140766.jpg?t=st=1769230982~exp=1769234582~hmac=8822c530fa44c0b9fb9027bb83bca487939f2b61da0053bbe9a1b1949442875d

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

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const res = await actionLogin(form);
      roleRedirect(res);
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <Title />
      {/* Card */}
      <div className="flex bg-white rounded-lg shadow-lg overflow-hidden max-w-6xl w-full">
        {/* Left side: Image */}
        <div className="w-2/3 p-8 bg-white">
          <img
            src="https://img.freepik.com/free-vector/hand-drawn-business-communication-concept_23-2149140766.jpg?t=st=1769230982~exp=1769234582~hmac=8822c530fa44c0b9fb9027bb83bca487939f2b61da0053bbe9a1b1949442875d"
            alt="Login illustration"
            className="object-cover h-full w-full"
          />
        </div>

        {/* Right side: Title + Form */}
        <div className="w-1/3 p-8 flex flex-col justify-center">
          {/* Title */}
          <h1 className="text-2xl font-semibold text-center mb-6">
            เข้าสู่ระบบ
          </h1>

          {/* Form */}
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <label>อีเมล</label>
              <input
                className="border rounded-sm w-full px-2"
                placeholder="อีเมล"
                type="email"
                name="email"
                onChange={handleOnChange}
              />
            </div>

            <div className="space-y-2">
              <label>รหัสผ่าน</label>
              <input
                className="border rounded-sm w-full px-2"
                placeholder="รหัสผ่าน"
                type="password"
                name="password"
                onChange={handleOnChange}
              />
            </div>

            <button className="text-white bg-red-500 rounded-md w-full py-2 mt-4">
              เข้าสู่ระบบ
            </button>

            <p className="text-center text-gray-500 mt-4">
              หากยังไม่ได้ลงทะเบียน,{" "}
              <Link
                to={"/register"}
                className="text-red-500 hover:underline font-medium"
              >
                สมัครสมาชิก
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
