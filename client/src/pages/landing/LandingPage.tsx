import { Link } from "react-router-dom";
import {
  ArrowRight,
  MessageSquare,
  Users,
  Zap,
  ShieldCheck,
} from "lucide-react";
import Title from "@/titles/Title";

const LandingPage = () => {
  return (
    <div className="bg-white font-['Inter', sans-serif] text-gray-900">
      <Title/>
      {/* --- Hero Section --- */}
      <section className="relative overflow-hidden pt-12 pb-16 lg:pt-20 lg:pb-24">
        {/* Background Deco */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full -z-10">
          <div className="absolute top-[-5%] left-[-5%] w-[35%] h-[35%] rounded-full bg-orange-100/40 blur-[100px]" />
          <div className="absolute bottom-[-5%] right-[-5%] w-[35%] h-[35%] rounded-full bg-yellow-100/40 blur-[100px]" />
        </div>

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 rounded-full bg-orange-50 px-3.5 py-1 text-xs font-bold text-[#FF5800] mb-6 border border-orange-100">
            <Zap size={14} />
            <span className="uppercase tracking-wider">แลกเปลี่ยนสิ่งของ</span>
          </div>

          {/* ปรับขนาดจาก 7xl -> 6xl และบีบ max-w */}
          <h1 className="mx-auto max-w-3xl text-4xl font-black tracking-tight sm:text-6xl leading-[1.1]">
            ส่งต่อความช่วยเหลือ <br />
            <span className="bg-linear-to-r from-[#FFB800] to-[#FF5800] bg-clip-text text-transparent">
              ฉบับเด็กสจล.
            </span>
          </h1>

          <p className="mx-auto mt-6 max-w-xl text-base font-medium text-gray-500 leading-relaxed">
            แพลตฟอร์มที่รวบรวมสิ่งของเครื่องใช้และเครื่องมือหลากหลายรูปแบบ ที่มาจากรุ่นพี่ หรือรุ่นน้อง หรือแม้แต่จากเพื่อนๆในสถาบัน
          </p>

          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              to="/register"
              className="flex w-full sm:w-auto items-center justify-center gap-2 rounded-xl bg-gray-900 px-7 py-3.5 text-base font-black text-white shadow-lg hover:bg-[#FF5800] transition-all hover:scale-105 active:scale-95"
            >
              เริ่มใช้งานเลย
              <ArrowRight size={18} />
            </Link>
            <Link
              to="/login"
              className="flex w-full sm:w-auto items-center justify-center rounded-xl bg-white border border-gray-200 px-7 py-3.5 text-base font-bold text-gray-600 hover:bg-gray-50 transition-all"
            >
              เข้าสู่ระบบ
            </Link>
          </div>

          {/* Stats - ปรับให้เล็กลงและดูเบาขึ้น */}
          <div className="mt-14 flex items-center justify-center gap-6 opacity-60">
            <div className="flex flex-col items-center">
              <span className="text-xl font-black text-gray-900">1k+</span>
              <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Students</span>
            </div>
            <div className="h-6 w-px bg-gray-200" />
            <div className="flex flex-col items-center">
              <span className="text-xl font-black text-gray-900">500+</span>
              <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Daily Posts</span>
            </div>
          </div>
        </div>
      </section>

      {/* --- Features Section --- */}
      <section className="bg-[#FBFBFC] py-20 border-y border-gray-50">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-2xl font-black text-gray-900 sm:text-3xl tracking-tight">
              ทำไมต้อง KMITL TokLadKraBang?
            </h2>
            <p className="mt-3 text-sm text-gray-400 font-medium">
              ออกแบบมาเพื่อตอบโจทย์ชีวิตนักศึกษาโดยเฉพาะ
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Card 1 - ปรับ Padding จาก 8 -> 6 */}
            <div className="rounded-[24px] bg-white p-6 border border-gray-100 shadow-sm hover:shadow-md transition-all group">
              <div className="mb-5 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-orange-50 text-[#FF5800] group-hover:bg-[#FF5800] group-hover:text-white transition-colors">
                <Users size={24} />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Community For All</h3>
              <p className="text-gray-400 text-xs leading-relaxed">
                แบ่งหมวดหมู่ตามคณะและความสนใจ คุยเรื่องเดียวกัน เข้าใจกันง่ายกว่าเดิม
              </p>
            </div>

            {/* Card 2 */}
            <div className="rounded-[24px] bg-white p-6 border border-gray-100 shadow-sm hover:shadow-md transition-all group">
              <div className="mb-5 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-500 group-hover:bg-blue-500 group-hover:text-white transition-colors">
                <MessageSquare size={24} />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Real-time Chat</h3>
              <p className="text-gray-400 text-xs leading-relaxed">
                ทักแชทสอบถามข้อมูลเพิ่มเติมหรือนัดหมายเพื่อนร่วมอุดมการณ์ได้ทันที
              </p>
            </div>

            {/* Card 3 */}
            <div className="rounded-[24px] bg-white p-6 border border-gray-100 shadow-sm hover:shadow-md transition-all group">
              <div className="mb-5 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-green-50 text-green-500 group-hover:bg-green-500 group-hover:text-white transition-colors">
                <ShieldCheck size={24} />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Verified Users</h3>
              <p className="text-gray-400 text-xs leading-relaxed">
                มั่นใจด้วยระบบลงทะเบียนผ่านอีเมลสถาบัน ปลอดภัย ลดปัญหา Account ปลอม
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* --- Call to Action (Version Super Compact) --- */}
      <section className="py-14">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <div className="relative overflow-hidden rounded-[28px] bg-linear-to-br from-[#FFB800] to-[#FF5800] px-6 py-10 text-center text-white shadow-xl shadow-orange-100">
            <div className="relative z-10">
              <h2 className="text-xl font-black sm:text-3xl mb-3 tracking-tight">
                พร้อมแลกเปลี่ยนหรือยัง?
              </h2>
              <p className="mx-auto max-w-md text-orange-50 font-medium mb-7 text-xs sm:text-sm opacity-90 leading-relaxed">
                สมัครสมาชิกวันนี้เพื่อรับประสบการณ์การใช้งานที่ลื่นไหล
                และหาตัวช่วยที่เหมาะสมในรั้ว สจล.
              </p>

              <Link
                to="/register"
                className="inline-flex items-center gap-2 rounded-xl bg-white px-7 py-3 text-sm font-black text-[#FF5800] shadow-md hover:bg-orange-50 transition-all active:scale-95"
              >
                สมัครสมาชิกตอนนี้
              </Link>
            </div>

            {/* Deco circles - ปรับให้จางลงอีกนิด */}
            <div className="absolute top-[-40%] left-[-10%] h-40 w-40 rounded-full bg-white/5 blur-2xl" />
            <div className="absolute bottom-[-40%] right-[-10%] h-40 w-40 rounded-full bg-orange-200/10 blur-2xl" />
          </div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;