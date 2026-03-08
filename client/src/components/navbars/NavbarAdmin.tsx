import useTestStore from "@/store/tokStore";
import {
  FileText,
  Flag,
  FolderOpen,
  Users,
  LogOut,
  Shield,
} from "lucide-react";
import { useEffect, useState } from "react"; // เพิ่ม useEffect
import { useNavigate } from "react-router-dom";
import { getUserReport } from "@/api/repost"; // import API มาเพื่อใช้นับจำนวน
import  logo_admin  from "../../assets/logo/logo_admin.png";

const NavbarAdmin = () => {
  const [activeMenu, setActiveMenu] = useState("โพสต์ทั้งหมด");
  const [pendingCount, setPendingCount] = useState(0); // สร้าง state ไว้เก็บตัวเลข

  const token = useTestStore((state) => state.token);
  const user = useTestStore((state) => state.user);
  const logOut = useTestStore((state) => state.actionLogOut);
  const navigate = useNavigate();

  const { email, role } = user;

  // ฟังก์ชันดึงจำนวนรายงานที่ยังค้างอยู่
  const fetchPendingCount = async () => {
    try {
      const res = await getUserReport(token);
      const allReports = res?.data?.data || [];
      // กรองเฉพาะอันที่เป็น PENDING แล้วนับจำนวน
      const count = allReports.filter(
        (r: any) => r.status === "PENDING",
      ).length;
      setPendingCount(count);
    } catch (err) {
      console.error("Failed to fetch pending count", err);
    }
  };

  useEffect(() => {
    if (!token || !user?.student_id) return;

    // ดึงยอดครั้งแรก
    fetchPendingCount();
    const wsUrl = `ws://localhost:8000/ws/notifications/${user.student_id}`;
    const socket = new WebSocket(wsUrl);

    socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === "REFRESH_REPORT_COUNT") {
          console.log("👮 New report detected, refreshing count...");
          fetchPendingCount();
        }
      } catch (err) {
        console.error("WS Error:", err);
      }
    };

    return () => {
      if (socket.readyState === WebSocket.OPEN) socket.close();
    };
  }, [token, user?.student_id]);

  const menuItems = [
    { name: "โพสต์ทั้งหมด", icon: FileText, path: "/admin" },
    { name: "รายงาน", icon: Flag, path: "/admin/reports" },
    { name: "หมวดหมู่", icon: FolderOpen, path: "/admin/categories" },
    { name: "ผู้ใช้", icon: Users, path: "/admin/users" },
  ];

  return (
    <aside className="w-72 h-screen sticky top-0 bg-white flex flex-col border-r border-gray-200 shadow-sm font-['Inter',sans-serif]">
      {/* KMITL Logo Section */}
      <div className="p-8 border-b border-gray-100 shrink-0">
        <div className="flex flex-col items-center text-center gap-2">
          <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-lg shadow-[#FF5800]/20">
            <img src={logo_admin}  className="rounded-xl w-full h-full object-contain mx-auto my-auto block" />
          </div>
          <div className="mt-2">
            
            <h1 className="text-[#FF5800] font-black text-xl tracking-tighter uppercase">TOK ADMIN</h1>
            <p className="text-gray-400 text-[10px] font-bold uppercase tracking-[0.2em]">Management System</p>

          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
        <p className="px-4 text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">
          Main Menu
        </p>
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeMenu === item.name;
          return (
            <button
              key={item.name}
              onClick={() => {
                setActiveMenu(item.name);
                navigate(item.path);
              }}
              className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-xl transition-all duration-200 ${
                isActive
                  ? "bg-[#FF5800] text-white shadow-md shadow-orange-200"
                  : "text-gray-500 hover:bg-orange-50 hover:text-[#FF5800]"
              }`}
            >
              <Icon
                className={`w-5 h-5 ${isActive ? "text-white" : "text-gray-400"}`}
              />
              <span className={`font-semibold ${isActive ? "font-bold" : ""}`}>
                {item.name}
              </span>

              {/* แสดงตัวเลขเฉพาะเมนูรายงาน และถ้ามีจำนวนมากกว่า 0 */}
              {item.name === "รายงาน" && pendingCount > 0 && (
                <span
                  className={`ml-auto px-2 py-0.5 text-[10px] rounded-full font-black min-w-20px text-center ${
                    isActive
                      ? "bg-white text-[#FF5800]"
                      : "bg-red-500 text-white shadow-sm"
                  }`}
                >
                  {pendingCount}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Admin Profile & Logout Section */}
      <div className="p-6 border-t border-gray-100 shrink-0 bg-gray-50/50">
        <div className="flex items-center gap-3 mb-4 px-1">
          <div className="w-10 h-10 rounded-full border-2 border-[#FF5800]/20 p-0.5 overflow-hidden">
            <img
              src="https://api.dicebear.com/7.x/avataaars/svg?seed=admin"
              alt="Admin"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="flex-1 min-w-0 text-left">
            <p className="text-gray-900 font-bold text-sm truncate">{role}</p>
            <p className="text-[#FF5800] text-[10px] font-bold truncate">
              {email}
            </p>
          </div>
        </div>
        <button
          onClick={() => {
            logOut();
            navigate("/login");
          }}
          className="w-full flex items-center justify-center gap-2 py-3 bg-white border border-gray-200 text-gray-400 hover:text-red-500 hover:border-red-100 hover:bg-red-50 rounded-xl transition-all font-bold text-xs shadow-sm active:scale-95"
        >
          <LogOut className="w-4 h-4" />
          ออกจากระบบ
        </button>
      </div>
    </aside>
  );
};

export default NavbarAdmin;
