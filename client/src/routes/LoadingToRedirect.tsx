import { useEffect, useState } from "react";
import { ShieldAlert, ArrowRight } from "lucide-react"; // ใช้ไอคอนเตือน
import { useNavigate } from "react-router-dom";

const LoadingToRedirect = () => {
  const navigate = useNavigate();
  const [count, setCount] = useState(3);
  const [redirect, setRedirect] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setCount((currentCount) => {
        if (currentCount === 1) {
          clearInterval(interval);
          setRedirect(true);
        }
        return currentCount - 1;
      });
    }, 1000);

    return () => clearInterval(interval); // Cleanup interval กัน memory leak
  }, []);

  if (redirect) {
    navigate(-1);
    return
  }

  return (
    <div className="min-h-screen bg-[#F8F9FA] flex flex-col items-center justify-center px-4 font-['Inter', sans-serif]">
      {/* Container กล่องข้อความ */}
      <div className="bg-white p-10 rounded-[40px] shadow-[0_20px_50px_rgba(0,0,0,0.03)] border border-gray-100 max-w-md w-full text-center">
        {/* Icon แอนิเมชันสั่นเบาๆ */}
        <div className="inline-flex h-20 w-20 items-center justify-center rounded-3xl bg-red-50 text-red-500 mb-8 animate-bounce">
          <ShieldAlert size={40} strokeWidth={2.5} />
        </div>

        <h1 className="text-2xl font-black text-gray-900 mb-3 tracking-tight">
          ไม่มีสิทธิ์เข้าถึงหน้านี้
        </h1>

        <p className="text-gray-400 text-sm font-medium mb-8 leading-relaxed">
          ขออภัย บัญชีของคุณไม่มีสิทธิ์เข้าใช้งานในส่วนนี้ <br />
          ระบบกำลังพาท่านกลับไปหน้าหลัก
        </p>

        {/* Countdown Visual */}
        <div className="relative inline-flex items-center justify-center mb-6">
          <div className="text-4xl font-black text-[#FF5800]">{count}</div>
          {/* วงกลมหมุนๆ รอบตัวเลข */}
          <div className="absolute h-16 w-16 border-4 border-orange-100 rounded-full"></div>
          <div className="absolute h-16 w-16 border-4 border-[#FF5800] border-t-transparent rounded-full animate-spin"></div>
        </div>

        <div className="flex items-center justify-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-[0.2em] mt-4">
          Redirecting in seconds
          <ArrowRight size={14} className="animate-pulse" />
        </div>
      </div>

      {/* Footer Branding */}
      <p className="mt-8 text-gray-300 text-[10px] font-bold uppercase tracking-widest">
        Security System • KMITL CONNECT
      </p>
    </div>
  );
};

export default LoadingToRedirect;
