import Navbar1 from "@/components/navbars/NavBar1";
import { Outlet } from "react-router-dom";


const Layout = () => {
  return (
    <div className="min-h-screen bg-[#F8F9FA] font-['Inter',_sans-serif]">
      {/* ใช้ Navbar Component ที่เราแยกมา */}
      <Navbar1 />

      {/* เนื้อหาหลักที่จะเปลี่ยนไปตาม Route */}
      <main className="relative">
        <Outlet />
      </main>

      {/* Footer แบบเบาๆ */}
      <footer className="py-10 text-center">
        <div className="mb-2 h-[1px] w-20 bg-gray-200 mx-auto" />
        <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">
          © 2026 TokLadkrabang • Engineering Your Connections
        </p>
      </footer>
    </div>
  );
};

export default Layout;