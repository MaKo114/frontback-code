import { useNavigate } from "react-router-dom";
import {
  Home,
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
import NotificationDropdown from "./NotificationDropdown";
import { useEffect, useState } from "react";
import { getNotificationsAPI } from "@/api/notification";

const Navbar = () => {
  const navigate = useNavigate();
  const logOut = useTestStore((state) => state.actionLogOut);
  const [hasNewMessage, setHasNewMessage] = useState(false);
  const userInformation = useTestStore((state) => state.userInformation);
  const token = useTestStore((state) => state.token);
  const [chatUnreadCount, setChatUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const checkNotifications = async () => {
    if (!token) return;
    try {
      const res = await getNotificationsAPI(token);
      const allNotis = res.data.data || [];
      setNotifications(allNotis);

      // แยกนับเฉพาะ Notification ทั่วไป (ไม่นับแชท) สำหรับเลขที่กระดิ่ง
      const generalCount = allNotis.filter(
        (n: any) => !n.is_read && n.type !== "CHAT_MESSAGE",
      ).length;
      setUnreadCount(generalCount);

      // 🚩 ถ้าพี่มี API สำหรับนับแชทที่ยังไม่อ่าน ให้เรียกตรงนี้
      // หรือจะใช้ Logic เช็คจาก Notis (ถ้าพี่เก็บแชทลง Noti table ด้วย)
      const hasUnreadChat = allNotis.some(
        (n: any) => n.type === "CHAT_MESSAGE" && !n.is_read,
      );
      setHasNewMessage(hasUnreadChat);
    } catch (err) {
      console.error("Fetch notifications error:", err);
    }
  };

  useEffect(() => {
    if (!token || !userInformation?.student_id) return;

    checkNotifications();

    const wsUrl = `ws://localhost:8000/ws/notifications/${userInformation.student_id}`;
    const ws = new WebSocket(wsUrl);

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);

        // 🚩 เคสที่ 1: แจ้งเตือนทั่วไป (เด้งที่กระดิ่ง)
        if (data.type === "NEW_NOTIFICATION") {
          checkNotifications();
        }

        // 🚩 เคสที่ 2: มีคนทักแชทมา (เด้งที่ไอคอนแชท)
        if (data.type === "NEW_CHAT_MESSAGE") {
          console.log("💬 New Chat Message via WS!");
          setHasNewMessage(true);
          setChatUnreadCount((prev) => prev + 1); // บวกเลขแชทเพิ่ม
          // พี่สามารถสั่งสั่น หรือเล่นเสียงแจ้งเตือนแชทตรงนี้ได้เลย
        }

        if (data.type === "READ_NOTI") {
          checkNotifications();
        }
      } catch (err) {
        console.error("WS Parse Error:", err);
      }
    };

    return () => {
      if (ws.readyState === WebSocket.OPEN) ws.close();
    };
  }, [token, userInformation?.student_id]);

  useEffect(() => {
    const handleRefresh = () => {
      console.log("🔔 Navbar received refresh signal");
      checkNotifications(); // ไปดึงข้อมูลใหม่จาก DB (ซึ่ง is_read ควรเป็น true แล้ว)
      // หรือจะ force ปิดเองเลยก็ได้เพื่อความเร็ว
      // setHasNewMessage(false);
    };

    // 🚩 รอรับสัญญาณ "refreshNotifications"
    window.addEventListener("refreshNotifications", handleRefresh);

    return () => {
      window.removeEventListener("refreshNotifications", handleRefresh);
    };
  }, [token]);

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
        <div className="flex items-center bg-black/10 p-1 rounded-2xl backdrop-blur-sm mr-2">
          <button
            onClick={() => navigate("/user")}
            className="p-2 text-white hover:bg-white/20 rounded-xl transition-all"
            title="หน้าแรก"
          >
            <Home size={20} strokeWidth={2.5} />
          </button>

          <NotificationDropdown
            notifications={notifications}
            onRefresh={checkNotifications}
          />

          <button
            onClick={() => navigate("chat-list")}
            className="p-2 text-white hover:bg-white/20 rounded-xl transition-all relative" // เติม relative ตรงนี้
            title="แชท"
          >
            <MessageCircle size={20} strokeWidth={2.5} />
            {hasNewMessage && (
              <span className="absolute top-1 right-1 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500 border-2 border-[#FF8A00]"></span>
              </span>
            )}
          </button>
        </div>

        {/* Profile Dropdown */}
        <DropdownMenu modal={false}>
          <DropdownMenuTrigger asChild>
            <button className="group flex items-center gap-2 pl-1 pr-3 py-1 bg-white/10 hover:bg-white/20 rounded-full transition-all border border-white/20">
              <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-[#FF5800] font-bold shadow-sm group-hover:scale-105 transition-transform overflow-hidden border border-gray-100">
                {userInformation?.profile_img ? (
                  <img
                    key={userInformation.profile_img}
                    src={userInformation.profile_img}
                    alt="profile"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <User size={16} />
                )}
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
                  {userInformation?.first_name || "กำลังโหลด..."}{" "}
                  {userInformation?.last_name || ""}
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
