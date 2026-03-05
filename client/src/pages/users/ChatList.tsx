import { useNavigate } from "react-router-dom";
import { Search, Loader2 } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useState, useEffect } from "react";
import useTestStore from "@/store/tokStore";
import { getMyChatRoomsApi } from "@/api/chat"; // import ตัวที่เราเพิ่งสร้าง

const ChatListPage = () => {
  const navigate = useNavigate();
  // const user = useTestStore((state)=> state.user)
  const token = useTestStore((state) => state.token);
  const [rooms, setRooms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  // 1. ดึงข้อมูลจาก Backend
  useEffect(() => {
    const fetchRooms = async () => {
      if (!token) return;
      try {
        const res = await getMyChatRoomsApi(token);
        // console.log("🔍 getMyChatRooms called, uid:", user?.student_id, typeof user?.student_id);

        setRooms(res.data || []);
      } catch (err) {
        console.error("Fetch rooms failed:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchRooms();
  }, [token]);

  // 2. Filter ค้นหาจากชื่อคู่สนทนา หรือ ชื่อโพสต์
  const filtered = rooms.filter((r) =>
    r.other_first_name?.toLowerCase().includes(search.toLowerCase()) ||
    r.post_title?.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="animate-spin text-orange-500" size={40} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F0F2F5] py-10">
      <div className="mx-auto max-w-xl px-4">
        <h1 className="text-2xl font-black text-gray-900 mb-6">ข้อความของคุณ</h1>
        
        {/* Search */}
        <div className="mb-6 relative">
          <input
            type="text"
            placeholder="ค้นหาชื่อคนหรือชื่อโพสต์..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-2xl border-none bg-white py-4 pl-12 pr-4 shadow-sm outline-none focus:ring-2 focus:ring-orange-400"
          />
          <Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
        </div>

        {/* Chat list */}
        <div className="space-y-3">
          {filtered.length > 0 ? (
            filtered.map((room) => (
              <button
                key={room.chat_id}
                onClick={() => navigate(`/user/chat/${room.chat_id}`)} // ยิงไปที่ ChatPage ตาม chat_id จริง
                className="flex w-full items-center gap-4 rounded-[24px] bg-white p-4 text-left hover:shadow-md transition-all border border-transparent hover:border-orange-100"
              >
                <Avatar className="h-14 w-14 border-2 border-orange-50">
                  <AvatarFallback className="bg-orange-50 text-orange-500 font-bold">
                    {room.other_first_name?.[0]?.toUpperCase()}
                  </AvatarFallback>
                </Avatar>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-[15px] font-bold text-gray-900 truncate">
                      {room.other_first_name} {room.other_last_name}
                    </p>
                    <span className="text-[11px] text-gray-400">
                      {room.last_message_at 
                        ? new Date(room.last_message_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) 
                        : "ใหม่"}
                    </span>
                  </div>
                  <p className="text-sm text-orange-600 font-bold truncate">
                    เรื่อง: {room.post_title}
                  </p>
                </div>
              </button>
            ))
          ) : (
            <div className="text-center py-20 bg-white rounded-[32px]">
              <p className="text-gray-400">ไม่พบรายการแชท</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatListPage;