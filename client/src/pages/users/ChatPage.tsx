import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Send, ImagePlus } from "lucide-react";


const mockMessages = [
  { id: 1, sender: "other", text: "สวัสดีครับ สนใจแลกของชิ้นนี้ไหมครับ?", time: "15:30" },
  { id: 2, sender: "me", text: "สนใจครับ! ของยังอยู่ไหมครับ?", time: "15:32" },
  { id: 3, sender: "other", text: "ยังอยู่ครับ สภาพดีมากเลย ใช้ไปแค่ 2 ครั้ง", time: "15:33" },
  { id: 4, sender: "me", text: "ราคาเท่าไหร่ครับ หรือว่าจะแลกกับอะไร?", time: "15:35" },
  { id: 5, sender: "other", text: "แลกกับหูฟังบลูทูธได้ไหมครับ ถ้ามี", time: "15:36" },
];

const ChatPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const postOwner = searchParams.get("user") || "นมศักดิ์ มาโล";
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState(mockMessages);

  const handleSend = () => {
    if (!message.trim()) return;
    setMessages((prev) => [
      ...prev,
      { id: Date.now(), sender: "me", text: message, time: new Date().toLocaleTimeString("th-TH", { hour: "2-digit", minute: "2-digit" }) },
    ]);
    setMessage("");
  };

  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Messages */}
      <main className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        {messages.map((msg, i) => (
          <div
            key={msg.id}
            className={`flex ${msg.sender === "me" ? "justify-end" : "justify-start"} animate-fade-in`}
            style={{ animationDelay: `${i * 60}ms` }}
          >
            <div
              className={`max-w-[75%] rounded-2xl px-4 py-2.5 text-sm shadow-sm transition-all hover:shadow-md ${
                msg.sender === "me"
                  ? "bg-gradient-to-r from-amber-400 to-orange-400 text-white rounded-br-md"
                  : "bg-card border border-input text-foreground rounded-bl-md"
              }`}
            >
              <p>{msg.text}</p>
              <p className={`mt-1 text-[10px] ${msg.sender === "me" ? "text-white/70" : "text-muted-foreground"}`}>
                {msg.time}
              </p>
            </div>
          </div>
        ))}
      </main>

      {/* Input */}
      <div className="sticky bottom-0 border-t border-input bg-background px-4 py-3 animate-fade-in">
        <div className="flex items-center gap-2">
          <button className="shrink-0 text-muted-foreground hover:text-amber-500 transition-colors hover:scale-110 transition-transform">
            <ImagePlus size={22} />
          </button>
          <input
            type="text"
            placeholder="พิมพ์ข้อความ..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            className="flex-1 rounded-full border border-input bg-muted/50 px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-amber-400 transition-all"
          />
          <button
            onClick={handleSend}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-r from-amber-400 to-orange-400 text-white shadow-md hover:shadow-lg hover:scale-105 active:scale-95 transition-all"
          >
            <Send size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatPage;
