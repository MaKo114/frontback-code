import { useEffect, useState } from "react";
import useTestStore from "@/store/tokStore";
import { getNotificationsApi, markNotificationReadApi, markAllNotificationsReadApi } from "@/api/post";
import { Bell, Check, Clock, Info, ExternalLink } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { th } from "date-fns/locale";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

const Notifications = () => {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const token = useTestStore((state) => state.token);
  const navigate = useNavigate();

  useEffect(() => {
    if (token) {
      loadNotifications();
    }
  }, [token]);

  const loadNotifications = async () => {
    try {
      setLoading(true);
      const res = await getNotificationsApi(token!);
      setNotifications(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkRead = async (id: string) => {
    try {
      await markNotificationReadApi(token!, id);
      setNotifications(prev => 
        prev.map(n => n.notification_id === id ? { ...n, is_read: true } : n)
      );
    } catch (err) {
      console.error(err);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await markAllNotificationsReadApi(token!);
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
    } catch (err) {
      console.error(err);
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case "EXCHANGE_REQUEST": return <Clock className="text-blue-500" size={20} />;
      case "EXCHANGE_ACCEPTED": return <Check className="text-green-500" size={20} />;
      case "EXCHANGE_REJECTED": return <XCircle className="text-red-500" size={20} />;
      case "POST_REPORTED": return <Info className="text-amber-500" size={20} />;
      default: return <Bell className="text-muted-foreground" size={20} />;
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="bg-amber-100 p-2 rounded-lg">
            <Bell className="text-amber-600" size={24} />
          </div>
          <h1 className="text-2xl font-bold">การแจ้งเตือน</h1>
        </div>
        
        {notifications.some(n => !n.is_read) && (
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleMarkAllRead}
            className="text-amber-600 hover:text-amber-700 hover:bg-amber-50"
          >
            อ่านทั้งหมด
          </Button>
        )}
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500"></div>
          <p className="text-muted-foreground">กำลังโหลดการแจ้งเตือน...</p>
        </div>
      ) : notifications.length === 0 ? (
        <div className="text-center py-20 bg-card rounded-xl border border-dashed border-input">
          <Bell className="mx-auto text-muted-foreground mb-4" size={48} />
          <h3 className="text-lg font-medium text-foreground">ไม่มีการแจ้งเตือน</h3>
          <p className="text-muted-foreground">เมื่อมีการอัปเดตเราจะแจ้งให้คุณทราบที่นี่</p>
        </div>
      ) : (
        <div className="space-y-3">
          {notifications.map((n) => (
            <div
              key={n.notification_id}
              onClick={() => !n.is_read && handleMarkRead(n.notification_id)}
              className={`group relative flex items-start gap-4 p-4 rounded-xl border transition-all cursor-pointer ${
                n.is_read 
                  ? "bg-card border-input opacity-75" 
                  : "bg-amber-50/50 border-amber-200 shadow-sm"
              }`}
            >
              <div className="mt-1 shrink-0">{getIcon(n.type)}</div>
              
              <div className="flex-1 min-w-0">
                <p className={`text-sm leading-relaxed mb-1 ${n.is_read ? "text-foreground" : "font-semibold text-foreground"}`}>
                  {n.message}
                </p>
                <p className="text-xs text-muted-foreground flex items-center gap-2">
                  {formatDistanceToNow(new Date(n.created_at), { addSuffix: true, locale: th })}
                  {!n.is_read && <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />}
                </p>
              </div>

              {n.reference_id && (
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/user/exchanges`);
                  }}
                  className="shrink-0 p-2 rounded-full hover:bg-amber-100 text-amber-600 transition"
                  title="ดูรายละเอียด"
                >
                  <ExternalLink size={18} />
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const XCircle = ({ className, size }: { className?: string, size?: number }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width={size || 24} 
    height={size || 24} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <circle cx="12" cy="12" r="10" />
    <path d="m15 9-6 6" />
    <path d="m9 9 6 6" />
  </svg>
);

export default Notifications;
