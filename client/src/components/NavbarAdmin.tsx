
import {
  FileText,
  Flag,
  FolderOpen,
  Users,
  LogOut,
  Shield,
} from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";


const NavbarAdmin = () => {
  const [activeMenu, setActiveMenu] = useState("โพสต์ทั้งหมด");
  const navigate = useNavigate()

const menuItems = [
  { name: "โพสต์ทั้งหมด", icon: FileText, path: "/admin" },
  { name: "รายงาน", icon: Flag, path: "/admin/reports" },
  { name: "หมวดหมู่", icon: FolderOpen, path: "/admin/categories" },
  { name: "ผู้ใช้", icon: Users, path: "/admin/users" },
];


    const pendingCount = 2; // mock ไว้ก่อน


  return (
    <div className="flex">

      {/* Sidebar */}
      <aside className="w-64 min-h-screen bg-gradient-to-b from-orange-500 to-orange-600 flex flex-col shadow-xl">
        {/* Logo Section */}
        <div className="px-4 py-6 border-b border-orange-400/30">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-white font-bold text-lg">Admin Panel</h1>
              <p className="text-orange-200 text-xs">Management System</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-4 px-3">
          <p className="text-orange-200 text-xs font-semibold uppercase tracking-wider px-3 mb-3">
            เมนูหลัก
          </p>
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeMenu === item.name;
            return (
              <button
                key={item.name}
                onClick={() => {setActiveMenu(item.name); navigate(item.path)}}
                className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg mb-1 transition-all duration-200 ${
                  isActive
                    ? "bg-white text-orange-600 shadow-lg transform scale-[1.02]"
                    : "text-white hover:bg-white/10 hover:translate-x-1"
                }`}
                
              >
                <Icon
                  className={`w-5 h-5 ${isActive ? "text-orange-500" : "text-orange-200"}`}
                />
                <span
                  className={`font-medium ${isActive ? "text-orange-600" : ""}`}
                >
                  {item.name}
                </span>
                {item.name === "รายงาน" && pendingCount > 0 && (
                  <span
                    className={`ml-auto px-2 py-0.5 text-xs rounded-full font-bold ${
                      isActive
                        ? "bg-red-500 text-white"
                        : "bg-red-500 text-white"
                    }`}
                  >
                    {pendingCount}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Admin Profile & Logout */}
        <div className="p-4 border-t border-orange-400/30">
          {/* Admin Info */}
          <div className="flex items-center gap-3 mb-4 px-2">
            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center overflow-hidden">
              <img
                src="https://api.dicebear.com/7.x/avataaars/svg?seed=admin"
                alt="Admin Avatar"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white font-medium text-sm truncate">
                Admin User
              </p>
              <p className="text-orange-200 text-xs truncate">
                admin@example.com
              </p>
            </div>
          </div>

          {/* Logout Button */}
          <button className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-all duration-200 hover:shadow-lg">
            <LogOut className="w-4 h-4" />
            <span className="font-medium">ออกจากระบบ</span>
          </button>
        </div>
      </aside>
    </div>
  );
};

export default NavbarAdmin;
