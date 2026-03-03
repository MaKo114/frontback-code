import { useNavigate } from "react-router-dom";
import { ArrowLeft, User, Search } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useState } from "react";

const mockChats = [
  {
    id: 1,
    name: "นมศักดิ์ มาโล",
    lastMessage: "แลกกับหูฟังบลูทูธได้ไหมครับ ถ้ามี",
    time: "15:36",
    unread: 2,
  },
  {
    id: 2,
    name: "สมชาย ใจดี",
    lastMessage: "โอเคครับ เจอกันวันเสาร์นะ",
    time: "14:20",
    unread: 0,
  },
  {
    id: 3,
    name: "วิภา สุขสันต์",
    lastMessage: "ส่งรูปเพิ่มได้ไหมคะ?",
    time: "12:05",
    unread: 1,
  },
  {
    id: 4,
    name: "พิชัย รักษ์ดี",
    lastMessage: "ขอบคุณครับ!",
    time: "เมื่อวาน",
    unread: 0,
  },
  {
    id: 5,
    name: "อรุณี แสงทอง",
    lastMessage: "ของยังอยู่ไหมคะ สนใจมากเลย",
    time: "เมื่อวาน",
    unread: 3,
  },
];

const ChatListPage = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");

  const filtered = mockChats.filter(
    (c) => c.name.includes(search) || c.lastMessage.includes(search),
  );

  return (
    <div className="min-h-screen bg-background">
      <div className="flex justify-center">
        <div className="w-full max-w-6xl px-6 py-6">
          {/* จำกัดความกว้าง chat list ให้อยู่กลางอีกชั้น */}
          <div className="mx-auto max-w-xl">
            {/* Search */}
            <div className="mb-4">
              <div className="relative">
                <input
                  type="text"
                  placeholder="ค้นหาแชท..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full rounded-full border border-input bg-background py-2 pl-4 pr-10 text-sm outline-none focus:ring-2 focus:ring-amber-400"
                />
                <Search
                  size={18}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                />
              </div>
            </div>

            {/* Chat list */}
            <div className="space-y-2">
              {filtered.map((chat) => (
                <button
                  key={chat.id}
                  onClick={() =>
                    navigate(`/chat?user=${encodeURIComponent(chat.name)}`)
                  }
                  className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left hover:bg-muted/60 transition"
                >
                  <Avatar className="h-12 w-12 border-2 border-muted">
                    <AvatarFallback>
                      <User size={22} />
                    </AvatarFallback>
                  </Avatar>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-semibold truncate">
                        {chat.name}
                      </p>
                      <span className="text-[11px] text-muted-foreground">
                        {chat.time}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground truncate">
                      {chat.lastMessage}
                    </p>
                  </div>

                  {chat.unread > 0 && (
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-amber-400 text-[10px] font-bold text-white">
                      {chat.unread}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default ChatListPage;
