import { useNavigate } from "react-router-dom";
import { Home, Bell, MessageCircle, User, Pencil, ArrowRightLeft, Heart } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../components/ui/dropdown-menu";
import useTestStore from "@/store/tokStore";
import { useEffect, useState } from "react";
import { getNotificationsApi } from "@/api/post";

const Navbar = () => {
  const navigate = useNavigate();
  const logOut = useTestStore((state)=> state.actionLogOut)
  const token = useTestStore((state) => state.token);
  const user = useTestStore((state) => state.user);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (token) {
      loadUnreadCount();
      const interval = setInterval(loadUnreadCount, 30000); // Poll every 30s
      return () => clearInterval(interval);
    }
  }, [token]);

  const loadUnreadCount = async () => {
    try {
      const res = await getNotificationsApi(token!);
      const unread = res.data.data.filter((n: any) => !n.is_read).length;
      setUnreadCount(unread);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <nav className="bg-background">
      {/* Top Navbar */}
      <header className="fixed top-0 left-0 right-0 z-50 h-16 flex items-center justify-between px-4 md:px-8 bg-gradient-to-r from-amber-400 to-orange-400 shadow-md">
        
          <span 
            className="text-lg font-bold text-white cursor-pointer" 
            onClick={() => navigate("/user")}
          >
            Tokladkrabang
          </span>
          
          <div className="flex items-center gap-2 md:gap-3">
            <button 
              className="flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-foreground shadow-sm hover:bg-white transition" 
              onClick={() => navigate("/user")}
              title="หน้าหลัก"
            >
              <Home size={18} />
            </button>
            
            <button 
              className="relative flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-foreground shadow-sm hover:bg-white transition"
              onClick={() => navigate("/user/notifications")}
              title="การแจ้งเตือน"
            >
              <Bell size={18} />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white ring-2 ring-amber-400">
                  {unreadCount > 99 ? '99+' : unreadCount}
                </span>
              )}
            </button>

            <button 
              className="flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-foreground shadow-sm hover:bg-white transition" 
              onClick={() => navigate("/user/chat")}
              title="แชท"
            >
              <MessageCircle size={18} />
            </button>

            {/* Person icon with dropdown */}
            <DropdownMenu modal={false}>
              <DropdownMenuTrigger asChild>
                <button className="flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-foreground shadow-sm hover:bg-white transition">
                  <User size={18} />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 bg-popover p-2 rounded-xl shadow-xl border-input" >
                <div className="px-2 py-3 mb-2 border-b border-muted">
                  <p className="text-sm font-bold text-foreground">
                    {user ? `${user.first_name} ${user.last_name}` : 'ผู้ใช้งาน'}
                  </p>
                  <p className="text-[10px] text-muted-foreground font-medium truncate">{user?.email}</p>
                </div>

                <DropdownMenuItem
                  onClick={() => navigate("/user/my-posts")}
                  className="cursor-pointer gap-2 py-2.5 rounded-lg focus:bg-amber-50 focus:text-amber-600 transition"
                >
                  <Pencil size={16} />
                  <span className="font-medium">โพสต์ทั้งหมดของฉัน</span>
                </DropdownMenuItem>

                <DropdownMenuItem
                  onClick={() => navigate("/user/exchanges")}
                  className="cursor-pointer gap-2 py-2.5 rounded-lg focus:bg-amber-50 focus:text-amber-600 transition"
                >
                  <ArrowRightLeft size={16} />
                  <span className="font-medium">รายการแลกเปลี่ยน</span>
                </DropdownMenuItem>

                <DropdownMenuItem
                  onClick={() => navigate("/user/favorites")}
                  className="cursor-pointer gap-2 py-2.5 rounded-lg focus:bg-amber-50 focus:text-amber-600 transition"
                >
                  <Heart size={16} />
                  <span className="font-medium">รายการที่ถูกใจ</span>
                </DropdownMenuItem>

                <div className="my-1 border-t border-muted"></div>
                
                <DropdownMenuItem
                  onClick={() => {logOut(); navigate("/login"); }}
                  className="cursor-pointer gap-2 py-2.5 rounded-lg text-red-500 focus:bg-red-50 focus:text-red-600 transition"
                >
                  <User size={16} className="rotate-180" />
                  <span className="font-bold">ออกจากระบบ</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
      </header>
    </nav>
  );
};

export default Navbar;
