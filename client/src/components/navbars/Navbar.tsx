import { useNavigate } from "react-router-dom";
import {
  Home,
  Bell,
  MessageCircle,
  User,
  Pencil,
  LogOut,
  ChevronDown,
  ArrowRightLeft,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../../components/ui/dropdown-menu";
import useTestStore from "@/store/tokStore";

const Navbar = () => {
  const navigate = useNavigate();
  const logOut = useTestStore((state) => state.actionLogOut);
  const userInformation = useTestStore((state) => state.userInformation)


  return (
    <nav className="fixed top-0 left-0 right-0 z-50 h-16 bg-linear-to-r from-[#FFB800] via-[#FF8A00] to-[#FF5800] shadow-lg px-4 md:px-8 flex items-center justify-between">
      {/* Logo Section */}
      <div
        className="flex items-center gap-2 cursor-pointer"
        onClick={() => navigate("/user")}
      >
        <div className="bg-white p-1.5 rounded-xl shadow-inner">
          <div className="w-6 h-6 bg-[#FF5800] rounded-lg rotate-12 flex items-center justify-center">
            <span className="text-white font-black text-xs -rotate-12">K</span>
          </div>
        </div>
        <span className="text-xl font-black text-white tracking-tighter">
          KMITL <span className="font-light opacity-80">CONNECT</span>
        </span>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-2 md:gap-4">
        {/* Navigation Icons */}
        <div className="flex items-center bg-black/10 p-1 rounded-2xl backdrop-blur-sm mr-2">
          <button
            onClick={() => navigate("/user")}
            className="p-2 text-white hover:bg-white/20 rounded-xl transition-all"
            title="หน้าแรก"
          >
            <Home size={20} strokeWidth={2.5} />
          </button>
          <button
            className="p-2 text-white hover:bg-white/20 rounded-xl transition-all relative"
            title="การแจ้งเตือน"
          >
            <Bell size={20} strokeWidth={2.5} />
            <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-[#FF8A00]"></span>
          </button>
          <button
            onClick={() => navigate("chat-list")}
            className="p-2 text-white hover:bg-white/20 rounded-xl transition-all"
            title="แชท"
          >
            <MessageCircle size={20} strokeWidth={2.5} />
          </button>
        </div>

        {/* Profile Dropdown */}
        <DropdownMenu modal={false}>
          <DropdownMenuTrigger asChild>
            <button className="group flex items-center gap-2 pl-1 pr-3 py-1 bg-white/10 hover:bg-white/20 rounded-full transition-all border border-white/20">
              <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-[#FF5800] font-bold shadow-sm group-hover:scale-105 transition-transform">
                <User size={16} />
              </div>
              <ChevronDown
                size={14}
                className="text-white opacity-70 group-hover:opacity-100"
              />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            className="w-56 mt-2 p-2 rounded-2xl shadow-xl border-gray-100"
          >
            <DropdownMenuLabel className="font-normal p-3">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-bold leading-none text-gray-900">
                  {userInformation?.first_name || "กำลังโหลด..."} {userInformation?.last_name || ""}
                </p>
                <p className="text-xs leading-none text-gray-500">
                  {userInformation?.role || "User"}
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-gray-50" />

            <DropdownMenuItem
              onClick={() => navigate("my-posts")}
              className="cursor-pointer gap-3 p-3 rounded-xl focus:bg-orange-50 focus:text-[#FF5800]"
            >
              <User size={18} />
              <span className="font-medium">โปรไฟล์ของฉัน</span>
            </DropdownMenuItem>

            <DropdownMenuItem
              onClick={() => navigate("exchanges")}
              className="cursor-pointer gap-3 p-3 rounded-xl focus:bg-orange-50 focus:text-[#FF5800]"
            >
              <ArrowRightLeft size={18} />
              <span className="font-medium">การแลกเปลี่ยนของฉัน</span>
            </DropdownMenuItem>

            <DropdownMenuItem
              onClick={() => navigate("my-posts")}
              className="cursor-pointer gap-3 p-3 rounded-xl focus:bg-orange-50 focus:text-[#FF5800]"
            >
              <Pencil size={18} />
              <span className="font-medium">จัดการโพสต์</span>
            </DropdownMenuItem>

            <DropdownMenuSeparator className="bg-gray-50" />

            <DropdownMenuItem
              onClick={() => {
                logOut();
                navigate("/login");
              }}
              className="cursor-pointer gap-3 p-3 rounded-xl focus:bg-red-50 text-red-600 focus:text-red-700 font-bold"
            >
              <LogOut size={18} />
              <span>ออกจากระบบ</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </nav>
  );
};

export default Navbar;
