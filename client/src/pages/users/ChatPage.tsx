import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Send, ImagePlus  } from "lucide-react";

const mockMessages = [
  {
    id: 1,
    sender: "other",
    text: "สวัสดีครับ สนใจแลกของชิ้นนี้ไหมครับ?",
    time: "15:30",
  },
  { id: 2, sender: "me", text: "สนใจครับ! ของยังอยู่ไหมครับ?", time: "15:32" },
  {
    id: 3,
    sender: "other",
    text: "ยังอยู่ครับ สภาพดีมากเลย ใช้ไปแค่ 2 ครั้ง",
    time: "15:33",
  },
  {
    id: 4,
    sender: "me",
    text: "ราคาเท่าไหร่ครับ หรือว่าจะแลกกับอะไร?",
    time: "15:35",
  },
  {
    id: 5,
    sender: "other",
    text: "แลกกับหูฟังบลูทูธได้ไหมครับ ถ้ามี",
    time: "15:36",
  },
];

const ChatPage = () => {
  const [searchParams] = useSearchParams();
  const postOwner = searchParams.get("user") || "Manasak Mako";
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState(mockMessages);

  const handleSend = () => {
    if (!message.trim()) return;
    setMessages((prev) => [
      ...prev,
      {
        id: Date.now(),
        sender: "me",
        text: message,
        time: new Date().toLocaleTimeString("th-TH", {
          hour: "2-digit",
          minute: "2-digit",
        }),
      },
    ]);
    setMessage("");
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto flex max-w-6xl flex-col px-6 py-6 h-screen">
        {/* Messages */}
        <main className="flex-1 overflow-y-auto space-y-3 pr-2">
          {messages.map((msg, i) => (
            <div
              key={msg.id}
              className={`flex ${
                msg.sender === "me" ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`max-w-[60%] rounded-2xl px-4 py-2.5 text-sm shadow-sm ${
                  msg.sender === "me"
                    ? "bg-gradient-to-r from-amber-400 to-orange-400 text-white rounded-br-md"
                    : "bg-card border border-input text-foreground rounded-bl-md"
                }`}
              >
                <p>{msg.text}</p>
                <p
                  className={`mt-1 text-[10px] ${
                    msg.sender === "me"
                      ? "text-white/70"
                      : "text-muted-foreground"
                  }`}
                >
                  {msg.time}
                </p>
              </div>
            </div>
          ))}
        </main>

        {/* Input */}
        <div className="border-t border-input bg-background pt-3">
          <div className="flex items-center gap-2">
            <button className="text-muted-foreground hover:text-amber-500 transition">
              <ImagePlus size={22} />
            </button>

            <input
              type="text"
              placeholder="พิมพ์ข้อความ..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              className="flex-1 rounded-full border border-input bg-muted/50 px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-amber-400"
            />

            <button
              onClick={handleSend}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-r from-amber-400 to-orange-400 text-white shadow-md hover:scale-105 transition"
            >
              <Send size={18} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatPage;
