import { Bell } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import useTestStore from "@/store/tokStore";
import { markAllAsReadAPI } from "@/api/notification";
import { useNavigate } from "react-router-dom";

interface Props {
  notifications: any[];
  onRefresh: () => void;
}

const NotificationDropdown = ({ notifications, onRefresh }: Props) => {
  const token = useTestStore((state) => state.token);
  const navigate = useNavigate();

  const unreadCount = notifications.filter((n: any) => !n.is_read).length;
  console.log(notifications);

  const handleClick = (n: any) => {
    // EXCHANGE_* → ไปหน้า exchange
    if (n.type.startsWith("EXCHANGE_")) {
      navigate("/user/exchanges");
      return;
    }
    // COMMENT หรืออื่นๆ → ไปโพสต์ (ต้องมี /user/ นำหน้า)
    navigate(`/user/post/${n.reference_id}`);
  };
  const handleMarkAll = async () => {
    try {
      await markAllAsReadAPI(token);
      onRefresh();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button className="p-2 text-white hover:bg-white/20 rounded-xl transition-all relative group">
          <Bell
            size={20}
            strokeWidth={2.5}
            className="group-hover:rotate-12 transition-transform"
          />
          {unreadCount > 0 && (
            <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full border-2 border-[#FF8A00] flex items-center justify-center animate-in zoom-in">
              {unreadCount}
            </span>
          )}
        </button>
      </PopoverTrigger>

      <PopoverContent
        align="end"
        className="w-80 p-0 rounded-2xl shadow-2xl border-gray-100 overflow-hidden"
      >
        <div className="p-4 border-b border-gray-50 bg-gray-50/50 flex justify-between items-center">
          <h3 className="font-bold text-gray-900">การแจ้งเตือน</h3>
          {unreadCount > 0 && (
            <button
              onClick={handleMarkAll}
              className="text-[10px] text-[#FF5800] hover:underline font-bold"
            >
              อ่านทั้งหมด
            </button>
          )}
        </div>

        <div className="max-h-[400px] overflow-y-auto">
          {notifications.length > 0 ? (
            notifications.map((n: any) => (
              <div
                key={n.notification_id}
                className={`p-4 border-b border-gray-50 hover:bg-orange-50/50 cursor-pointer transition-colors ${
                  !n.is_read
                    ? "bg-orange-50/30 border-l-4 border-l-[#FF5800]"
                    : ""
                }`}
                onClick={() => handleClick(n)}
              >
                <p
                  className={`text-sm leading-snug ${!n.is_read ? "font-bold text-gray-900" : "text-gray-600"}`}
                >
                  {n.message}
                </p>
                <p className="text-[10px] text-gray-400 mt-1">
                  {new Date(n.created_at).toLocaleString("th-TH")}
                </p>
              </div>
            ))
          ) : (
            <div className="p-8 text-center text-gray-400 text-sm">
              ไม่มีการแจ้งเตือนใหม่
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default NotificationDropdown;
