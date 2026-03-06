import { useNavigate } from "react-router-dom";
import { Search, Loader2, MessageSquare, Clock } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useState, useEffect } from "react";
import useTestStore from "@/store/tokStore";
import { getMyChatRoomsApi } from "@/api/chat";

const ChatListPage = () => {
  const navigate = useNavigate();
  const token = useTestStore((state) => state.token);
  const [rooms, setRooms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const fetchRooms = async () => {
      if (!token) return;
      try {
        const res = await getMyChatRoomsApi(token);
        setRooms(res.data || []);
      } catch (err) {
        console.error("Fetch rooms failed:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchRooms();
  }, [token]);

  const filtered = rooms.filter(
    (r) =>
      r.other_first_name?.toLowerCase().includes(search.toLowerCase()) ||
      r.post_title?.toLowerCase().includes(search.toLowerCase()),
  );

  const formatTime = (dateStr: string) => {
    if (!dateStr) return null;
    const date = new Date(dateStr);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    if (diffDays === 0) return date.toLocaleTimeString("th-TH", { hour: "2-digit", minute: "2-digit" });
    if (diffDays === 1) return "เมื่อวาน";
    if (diffDays < 7) return `${diffDays} วันที่แล้ว`;
    return date.toLocaleDateString("th-TH", { day: "numeric", month: "short" });
  };

  // สีพื้นหลัง avatar หมุนเวียน
  const avatarColors = [
    "bg-orange-100 text-orange-600",
    "bg-blue-100 text-blue-600",
    "bg-green-100 text-green-600",
    "bg-purple-100 text-purple-600",
    "bg-pink-100 text-pink-600",
  ];

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#FAFAFA]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="animate-spin text-[#FF5800]" size={36} />
          <p className="text-sm font-bold text-gray-400">กำลังโหลดแชท...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F7F7F5] py-10 px-4">
      <div className="mx-auto max-w-xl">

        {/* Header */}
        <div className="flex items-center justify-between mb-8 px-1">
          <div>
            <h1 className="text-3xl font-black text-gray-900 tracking-tight">ข้อความ</h1>
            <p className="text-xs font-bold text-gray-400 mt-0.5">
              {rooms.length > 0 ? `${rooms.length} การสนทนา` : "ยังไม่มีการสนทนา"}
            </p>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-white shadow-sm border border-gray-100 flex items-center justify-center text-[#FF5800]">
            <MessageSquare size={20} strokeWidth={2.5} />
          </div>
        </div>

        {/* Search */}
        <div className="mb-6 relative">
          <input
            type="text"
            placeholder="ค้นหาชื่อคนหรือชื่อโพสต์..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-2xl bg-white border border-gray-100 shadow-sm py-3.5 pl-12 pr-5 outline-none focus:ring-2 focus:ring-[#FF5800]/20 focus:border-[#FF5800]/30 transition-all font-medium text-sm text-gray-700 placeholder:text-gray-300"
          />
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" />
        </div>

        {/* Chat List */}
        {filtered.length > 0 ? (
          <div className="flex flex-col gap-2">
            {filtered.map((room, index) => {
              const colorClass = avatarColors[index % avatarColors.length];
              const timeStr = formatTime(room.last_message_at);
              const isNew = !room.last_message_at;

              return (
                <button
                  key={room.chat_id}
                  onClick={() => navigate(`/user/chat/${room.chat_id}`)}
                  className="flex w-full items-center gap-4 p-4 text-left bg-white rounded-[20px] border border-gray-100 shadow-sm hover:shadow-md hover:border-[#FF5800]/20 hover:-translate-y-0.5 transition-all duration-200 group"
                >
                  {/* Avatar */}
                  <div className="relative shrink-0">
                    <Avatar className="h-14 w-14 border-2 border-white shadow-sm">
                      <AvatarFallback className={`${colorClass} font-black text-lg`}>
                        {room.other_first_name?.[0]?.toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    {/* dot แสดงว่ามีข้อความใหม่หรือเปล่า */}
                    {isNew && (
                      <span className="absolute bottom-0.5 right-0.5 w-3 h-3 bg-[#FF5800] rounded-full border-2 border-white" />
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <p className="text-[15px] font-black text-gray-900 truncate group-hover:text-[#FF5800] transition-colors">
                        {room.other_first_name} {room.other_last_name}
                      </p>
                      <span className="shrink-0 flex items-center gap-1 text-[11px] font-bold text-gray-400">
                        {timeStr ? (
                          <><Clock size={10} /> {timeStr}</>
                        ) : (
                          <span className="bg-[#FF5800] text-white text-[10px] font-black px-2 py-0.5 rounded-full">ใหม่</span>
                        )}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="shrink-0 text-[9px] font-black text-[#FF5800] bg-orange-50 px-1.5 py-0.5 rounded-md uppercase tracking-wide">
                        POST
                      </span>
                      <p className="text-xs text-gray-400 font-medium truncate">
                        {room.post_title}
                      </p>
                    </div>
                  </div>

                  {/* Arrow indicator */}
                  <div className="shrink-0 w-8 h-8 rounded-xl bg-gray-50 group-hover:bg-orange-50 flex items-center justify-center transition-colors">
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                      <path d="M5 3L9 7L5 11" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                        className="text-gray-300 group-hover:text-[#FF5800] transition-colors" />
                    </svg>
                  </div>
                </button>
              );
            })}
          </div>
        ) : (
          /* Empty State */
          <div className="text-center py-24 bg-white rounded-[32px] border border-gray-100 shadow-sm">
            <div className="w-16 h-16 bg-orange-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <MessageSquare size={28} className="text-[#FF5800]" strokeWidth={1.5} />
            </div>
            <p className="text-gray-800 font-black text-lg">
              {search ? "ไม่พบรายการแชท" : "ยังไม่มีการสนทนา"}
            </p>
            <p className="text-xs text-gray-400 font-medium mt-2 max-w-[200px] mx-auto leading-relaxed">
              {search
                ? "ลองพิมพ์ค้นหาด้วยชื่ออื่นดูนะครับ"
                : "กดปุ่ม 'แชทเลย' ที่โพสต์ที่สนใจเพื่อเริ่มคุยได้เลย"}
            </p>
          </div>
        )}

        <p className="text-center mt-8 text-[10px] font-black text-gray-300 uppercase tracking-[0.2em]">
          All conversations are secured
        </p>
      </div>
    </div>
  );
};

export default ChatListPage;