import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Send, ChevronLeft, User, Loader2 } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import useTestStore from "@/store/tokStore";
import { getChatMessages, sendMessageApi } from "@/api/chat";

const ChatPage = () => {
  const { chatId } = useParams();
  const navigate = useNavigate();
  const token = useTestStore((state) => state.token);
  const currentUser = useTestStore((state) => state.userInformation);

  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<any[]>([]);
  const [roomInfo, setRoomInfo] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isConnected, setIsConnected] = useState(false);

  const scrollRef = useRef<HTMLDivElement>(null);
  const socketRef = useRef<WebSocket | null>(null);
  // ใช้ ref ป้องกัน Strict Mode รัน 2 รอบ
  const didConnect = useRef(false);

  // --- 1. ดึงประวัติแชท ---
  const fetchMessages = useCallback(async () => {
    if (!chatId || !token) return;
    try {
      const res = await getChatMessages(token, chatId);
      setMessages(res.data || []);
      setRoomInfo(res.room_info || null);
    } catch (err) {
      console.error("Fetch error:", err);
      setMessages([]);
    } finally {
      setLoading(false);
    }
  }, [chatId, token]);

  // --- 2. WebSocket (แก้ปัญหา Strict Mode + close ก่อน connect) ---
  useEffect(() => {
    if (!chatId || !token) return;
    if (didConnect.current) return; // ป้องกัน Strict Mode รันซ้ำ
    didConnect.current = true;

    fetchMessages();

    const socket = new WebSocket(`ws://localhost:8000/ws/chat/${chatId}`);
    socketRef.current = socket;

    socket.onopen = () => {
      console.log("✅ WebSocket connected");
      setIsConnected(true);
    };

    socket.onmessage = (event) => {
      try {
        const incomingData = JSON.parse(event.data);
        setMessages((prev) => {
          const isDuplicate = prev.some(
            (m) => m.message_id === incomingData.message_id,
          );
          if (isDuplicate) return prev;
          return [...prev, incomingData];
        });
      } catch (err) {
        console.error("Parse error:", err);
      }
    };

    socket.onerror = (err) => {
      console.error("❌ WebSocket error:", err);
    };

    socket.onclose = (e) => {
      console.log("🔌 WebSocket closed:", e.code, e.reason);
      setIsConnected(false);
    };

    return () => {
      // ปิดเฉพาะเมื่อ connect สำเร็จแล้ว ไม่ปิดตอนกำลัง connecting
      didConnect.current = false;
      if (
        socket.readyState === WebSocket.OPEN ||
        socket.readyState === WebSocket.CONNECTING
      ) {
        socket.close(1000, "Component unmounted");
      }
      socketRef.current = null;
    };
  }, [chatId, token]);

  // --- 3. Auto scroll ---
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // --- 4. ส่งข้อความ ---
  const handleSend = async () => {
    if (!message.trim() || !chatId || !token) return;

    const textToSend = message;
    setMessage("");

    try {
      const res = await sendMessageApi(token, chatId, textToSend);

      if (res && res.data) {
        // ส่งผ่าน WebSocket ให้ server broadcast ให้ทุกคน (รวมตัวเอง)
        // ไม่ต้อง setMessages เอง เพราะ onmessage จะรับกลับมาเอง
        if (socketRef.current?.readyState === WebSocket.OPEN) {
          socketRef.current.send(JSON.stringify(res.data));
        } else {
          // fallback ถ้า WebSocket ไม่ได้เชื่อมต่อ
          setMessages((prev) => [...prev, res.data]);
        }
      }
    } catch (err) {
      console.error("Send failed:", err);
      setMessage(textToSend);
    }
  };

  if (loading)
    return (
      <div className="flex h-screen items-center justify-center bg-[#F0F2F5]">
        <Loader2 className="animate-spin text-[#FF5800]" size={40} />
      </div>
    );

  return (
    <div className="min-h-[calc(100vh-64px)] bg-[#F0F2F5] py-6 px-4 md:py-10">
      <div className="mx-auto max-w-4xl w-full h-[85vh] bg-white rounded-[32px] shadow-xl flex flex-col overflow-hidden border border-white">
        {/* Header */}
        <header className="px-6 py-4 bg-white border-b border-gray-50 flex items-center shrink-0">
          <button
            onClick={() => navigate(-1)}
            className="p-2.5 hover:bg-gray-50 rounded-2xl text-gray-400 mr-2"
          >
            <ChevronLeft size={22} />
          </button>
          <Avatar className="h-12 w-12 border-2 border-orange-100 mr-3">
            <AvatarFallback className="bg-orange-50 text-[#FF5800] font-bold">
              {roomInfo?.other_name?.[0]?.toUpperCase() || <User size={20} />}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <p className="text-base font-black text-gray-900 leading-tight">
              {roomInfo
                ? `${roomInfo.other_name} ${roomInfo.other_last_name}`
                : "กำลังโหลด..."}
            </p>
            <p className="text-[11px] text-gray-500 font-medium">
              สนใจ:{" "}
              <span className="text-[#FF5800] font-bold">
                {roomInfo?.post_title}
              </span>
            </p>
          </div>
          {/* Status indicator */}
          <div className="flex items-center gap-1.5">
            <div
              className={`w-2 h-2 rounded-full ${
                isConnected ? "bg-green-400" : "bg-gray-300"
              }`}
            />
            <span className="text-[10px] text-gray-400">
              {isConnected ? "ออนไลน์" : "กำลังเชื่อมต่อ..."}
            </span>
          </div>
        </header>

        {/* Message List */}
        <main
          ref={scrollRef}
          className="flex-1 overflow-y-auto p-6 space-y-6 bg-[#FAFAFA]"
        >
          {messages.length > 0 ? (
            messages.map((msg, idx) => {
              const isMe = msg.sender_id === currentUser?.student_id;
              return (
                <div
                  key={msg.message_id || idx}
                  className={`flex ${isMe ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`flex flex-col max-w-[70%] ${
                      isMe ? "items-end" : "items-start"
                    }`}
                  >
                    <div
                      className={`px-5 py-3 shadow-sm ${
                        isMe
                          ? "bg-[#FF5800] text-white rounded-[22px] rounded-br-none"
                          : "bg-white border border-gray-100 text-gray-800 rounded-[22px] rounded-bl-none"
                      }`}
                    >
                      <p className="text-[14px] font-medium leading-relaxed">
                        {msg.text}
                      </p>
                    </div>
                    <span className="text-[10px] text-gray-400 font-black mt-2">
                      {new Date(msg.created_at).toLocaleTimeString("th-TH", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="text-center text-gray-400 mt-10 text-sm italic">
              ยังไม่มีข้อความ... เริ่มคุยกันเลย!
            </div>
          )}
        </main>

        {/* Input Footer */}
        <footer className="p-6 bg-white shrink-0">
          <div className="flex items-center gap-3 bg-[#F8F9FA] p-2.5 rounded-[24px]">
            <input
              type="text"
              placeholder="พิมพ์ข้อความ..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              className="flex-1 bg-transparent border-none py-2 px-3 text-[14px] font-bold outline-none"
            />
            <button
              onClick={handleSend}
              disabled={!message.trim()}
              className={`h-12 w-12 flex items-center justify-center rounded-[18px] transition-all ${
                message.trim()
                  ? "bg-[#FF5800] text-white shadow-lg"
                  : "bg-gray-200 text-gray-400"
              }`}
            >
              <Send size={20} />
            </button>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default ChatPage;
