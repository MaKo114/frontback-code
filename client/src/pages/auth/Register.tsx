import { useEffect } from "react";

const Register = () => {
  
  useEffect(()=>{
    document.title = "ลงทะเบียน"
  }, [])

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center bg-background px-4">
      <div className="bg-white p-8 rounded-xl shadow-md w-full max-w-lg">
        <h1 className="text-2xl font-semibold text-center text-foreground mb-8">
          ลงทะเบียน
        </h1>

        <form className="space-y-4" action="">
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col space-y-2">
              ชื่อ
              <input
                className="border rounded-sm px-2"
                placeholder="ชื่อ"
                type="text"
              />
            </div>

            <div className="flex flex-col space-y-2">
              นามสกุล
              <input
                className="border rounded-sm w-full  px-2"
                placeholder="นามสกุล"
                type="text"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col space-y-2">
              เบอร์โทรศัพท์
              <input
                className="border rounded-sm w-full px-2"
                placeholder="เบอร์โทรศัพท์"
                type="text"
              />
            </div>

            <div className="flex flex-col space-y-2">
              วันเกิด
              <input className="border rounded-sm w-full px-2" type="date" />
            </div>
          </div>

          <div className="space-y-2">
            อีเมล
            <input
              className="border rounded-sm w-full  px-2"
              placeholder="อีเมล"
              type="email"
            />
          </div>

          <div className="space-y-2">
            รหัสผ่าน
            <input
              className="border rounded-sm w-full  px-2"
              placeholder="รหัสผ่าน"
              type="text"
            />
          </div>

          <div className="space-y-2">
            ยืนยันรหัสผ่าน
            <input
              className="border rounded-sm w-full  px-2"
              placeholder="ยืนยันรหัสผ่าน"
              type="text"
            />
          </div>

          <button className="text-white bg-red-500 rounded-md w-full h-full mt-4 py-1">
            สมัครสมาชิก
          </button>

          <p className="text-center text-muted-foreground mt-4">
            เป็นสมาชิกอยู่แล้ว,{" "}
            <a className="text-red-500 hover:underline font-medium">
              เข้าสู่ระบบ
            </a>
          </p>
        </form>
      </div>
    </div>
  );
};

export default Register;
