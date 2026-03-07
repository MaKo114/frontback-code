import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Send, ChevronLeft, User, Loader2, ArrowRightLeft } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import useTestStore from "@/store/tokStore";
import { getChatMessages, sendMessageApi } from "@/api/chat";
import { requestExchangeApi } from "@/api/exchage";
import Swal from "sweetalert2";
import { markChatAsReadApi } from "@/api/notification";

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
  const [exchangeLoading, setExchangeLoading] = useState(false);

  const scrollRef = useRef<HTMLDivElement>(null);
  const socketRef = useRef<WebSocket | null>(null);
  const didConnect = useRef(false);

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

  useEffect(() => {
    if (!chatId || !token) return;
    if (didConnect.current) return;
    didConnect.current = true;

    fetchMessages();

    const socket = new WebSocket(`ws://localhost:8000/ws/chat/${chatId}`);
    socketRef.current = socket;

    socket.onopen = () => {
      setIsConnected(true);
    };

    socket.onmessage = (event) => {
      try {
        const response = JSON.parse(event.data);

        // 🚩 ตรวจสอบก่อนว่าข้อมูลที่ส่งมาเป็นรูปแบบ ROOM_MESSAGE หรือไม่
        // ถ้า Backend ส่งมาแบบมี type ให้ดึงจาก response.data
        const incomingData =
          response.type === "ROOM_MESSAGE" ? response.data : response;

        // ตรวจสอบความถูกต้องของข้อมูลเบื้องต้น
        if (!incomingData || !incomingData.text) return;

        setMessages((prev) => {
          // เช็คซ้ำด้วย message_id
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

    socket.onerror = (err) => console.error("WebSocket error:", err);
    socket.onclose = () => setIsConnected(false);

    return () => {
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

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // ใน ChatPage.tsx
  // ChatPage.tsx
  useEffect(() => {
    const markAsRead = async () => {
      // 🚩 เปลี่ยนจาก chat_id เป็น chatId (ตามชื่อที่ดึงจาก useParams)
      if (chatId && token) {
        try {
          await markChatAsReadApi(token, chatId);
          // ตะโกนบอก Navbar ในเครื่องตัวเองให้ Fetch ข้อมูลใหม่
          window.dispatchEvent(new Event("refreshNotifications"));
        } catch (err) {
          console.error("Mark as read failed:", err);
        }
      }
    };
    markAsRead();
  }, [chatId, token]); // เพิ่ม token ใน dependency เพื่อความชัวร์

  const handleSend = async () => {
    if (!message.trim() || !chatId || !token) return;
    const textToSend = message;
    setMessage("");
    try {
      const res = await sendMessageApi(token, chatId, textToSend);
      if (res?.data) {
        if (socketRef.current?.readyState === WebSocket.OPEN) {
          socketRef.current.send(JSON.stringify(res.data));
        } else {
          setMessages((prev) => [...prev, res.data]);
        }
      }
    } catch (err) {
      console.error("Send failed error data:", err?.response?.data); // ← ต้องได้ object เช่น { error: "..." }
      console.error("Send failed status:", err?.response?.status);
      setMessage(textToSend);
    }
  };

  // ✅ ปุ่มขอแลกอยู่ในแชท — คุยตกลงกันแล้วค่อยกด
  const handleRequestExchange = async () => {
    if (!roomInfo?.post_id) return;

    const result = await Swal.fire({
      title: "ขอแลกเปลี่ยน?",
      text: `คุณต้องการส่งคำขอแลกเปลี่ยนสำหรับโพสต์ "${roomInfo.post_title}" ใช่ไหม?`,
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#FF5800",
      cancelButtonColor: "#9ca3af",
      confirmButtonText: "ขอแลกเลย!",
      cancelButtonText: "ยกเลิก",
    });

    if (!result.isConfirmed) return;

    setExchangeLoading(true);
    try {
      await requestExchangeApi(token, roomInfo.post_id);
      Swal.fire({
        toast: true,
        position: "bottom",
        showConfirmButton: false,
        timer: 3000,
        icon: "success",
        title: "ส่งคำขอแลกเปลี่ยนแล้ว! รอเจ้าของโพสต์ตอบรับ",
      });
    } catch (err: any) {
      console.error("exchange error:", err?.response?.data); // ← เพิ่มบรรทัดนี้
      Swal.fire({
        toast: true,
        position: "bottom",
        showConfirmButton: false,
        timer: 3000,
        icon: "error",
        title: err?.response?.data?.error || "เกิดข้อผิดพลาด",
      });
    }
  };

  // เช็คว่า user คนนี้เป็น buyer (คนที่จะกดขอแลกได้) หรือเปล่า
  const isBuyer = currentUser?.student_id === roomInfo?.buyer_id;

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

          <div className="flex items-center gap-3">
            {/* ✅ ปุ่มขอแลก — แสดงเฉพาะ buyer */}
            {isBuyer && (
              <button
                onClick={handleRequestExchange}
                disabled={exchangeLoading}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#FF5800] text-white text-xs font-black hover:bg-[#e04f00] transition-all active:scale-95 disabled:opacity-50"
              >
                {exchangeLoading ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  <ArrowRightLeft size={14} />
                )}
                ขอแลก
              </button>
            )}

            {/* Status indicator */}
            <div className="flex items-center gap-1.5">
              <div
                className={`w-2 h-2 rounded-full ${isConnected ? "bg-green-400" : "bg-gray-300"}`}
              />
              <span className="text-[10px] text-gray-400">
                {isConnected ? "ออนไลน์" : "กำลังเชื่อมต่อ..."}
              </span>
            </div>
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
                    className={`flex flex-col max-w-[70%] ${isMe ? "items-end" : "items-start"}`}
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
            <div className="text-center text-gray-400 mt-10 text-sm">
              <ArrowRightLeft
                size={32}
                className="mx-auto mb-3 text-gray-200"
              />
              <p className="font-bold">ยังไม่มีข้อความ</p>
              <p className="text-xs mt-1 text-gray-300">
                คุยกันก่อน ตกลงใจแล้วค่อยกด "ขอแลก" ด้านบน
              </p>
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
