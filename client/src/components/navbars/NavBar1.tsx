import { Link } from "react-router-dom";
import { LogIn, UserPlus } from "lucide-react";
import NavLink from "../../layouts/NavLink";
import logo from '../../assets/logo/logo_tokladkrabang.png';

const Navbar1 = () => {
  return (
    <nav className="sticky top-0 z-50 w-full border-b border-gray-100 bg-white/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
        
        {/* Logo Section */}
        <Link to="/" className="flex items-center gap-2 group">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-white shadow-lg shadow-orange-200 transition-transform group-hover:scale-105">
            {/* <Home size={22} strokeWidth={2.5} /> */}
            <img
              src={logo} className="rounded-xl w-full h-full object-contain mx-auto my-auto block"
            />
          </div>
          <div className="hidden sm:block">
            <p className="text-lg font-black leading-none tracking-tighter text-gray-900">
              KMITL <span className="text-[#FF5800]">TokLadKraBang</span>
            </p>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]">Community</p>
          </div>
        </Link>

        {/* Navigation Actions */}
        <div className="flex items-center gap-1 sm:gap-2">
          <NavLink to="/login" icon={LogIn} label="เข้าสู่ระบบ" />
          <NavLink to="/register" icon={UserPlus} label="สมัครสมาชิก" variant="solid" />
        </div>

      </div>
    </nav>
  );
};

export default Navbar1;