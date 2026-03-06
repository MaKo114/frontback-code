import { useEffect, useState, useCallback } from "react";
import { Avatar, AvatarFallback } from "../ui/avatar";
import { User, SendHorizonal, Loader2 } from "lucide-react";
import useTestStore from "@/store/tokStore";
import { getCommentAPI, inputCommentAPI } from "@/api/comment";

interface PostCommentsProps {
  postId: number;
  postOwnerId?: string;
  setCommentCount?: (count: number) => void;
}

const PostComments = ({
  postId,
  postOwnerId,
  setCommentCount,
}: PostCommentsProps) => {
  const token = useTestStore((state) => state.token);
  const currentUser = useTestStore((state) => state.userInformation);
  const [comments, setComments] = useState<any[]>([]);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ดึงข้อมูลคอมเมนต์
  const fetchComments = useCallback(async () => {
    if (!postId) return;
    setLoading(true);
    try {
      const res = await getCommentAPI(token, postId);
      const data = res.data.data || [];
      const count = res.data.count || 0;

      setComments(data);

      // ✅ แก้จาก onCountChange เป็น setCommentCount ให้ตรงกับ Props
      if (setCommentCount) {
        setCommentCount(count);
      }
    } catch (err) {
      console.error("Fetch comments error:", err);
    } finally {
      setLoading(false);
    }
  }, [postId, token, setCommentCount]);

  useEffect(() => {
    fetchComments();
  }, [fetchComments]);

  // ส่งคอมเมนต์
  const handleSendComment = async () => {
    if (!text.trim() || !token) return;

    setIsSubmitting(true);
    try {
      await inputCommentAPI(token, postId, text.trim());
      setText(""); // ล้างช่อง input
      fetchComments(); // โหลดคอมเมนต์ใหม่
    } catch (err) {
      console.error("Send comment error:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mt-4 pt-4 border-t border-gray-50 space-y-5 duration-300">
      {/* --- Comment List --- */}
      <div className="space-y-4 max-h-72 overflow-y-auto pr-2 custom-scrollbar">
        {loading ? (
          <div className="flex justify-center py-4">
            <Loader2 className="animate-spin text-gray-300" />
          </div>
        ) : comments.length > 0 ? (
          comments.map((comment) => {
            // ✅ เช็คว่าเป็นเจ้าของโพสต์หรือไม่ (ตรวจสอบว่า ID ตรงกันไหม)
            const isOwner = String(comment.user_id) === String(postOwnerId);

            return (
              <div
                key={comment.comment_id}
                className="flex gap-3"
              >
                {/* Avatar */}
                <Avatar
                  className={`h-8 w-8 shrink-0 border-2 ${isOwner ? "border-[#FF5800]" : "border-gray-100"}`}
                >
                  <AvatarFallback
                    className={`${
                      isOwner
                        ? "bg-orange-500 text-white"
                        : "bg-gray-100 text-gray-400"
                    } text-[10px] font-black`}
                  >
                    {comment.first_name?.[0] || <User size={14} />}
                  </AvatarFallback>
                </Avatar>

                {/* Comment Bubble */}
                <div
                  className={`flex flex-col gap-1 p-3 rounded-20px rounded-tl-none flex-1 shadow-sm transition-all ${
                    isOwner
                      ? "bg-orange-50 border-2 border-orange-200 ring-1 ring-[#FF5800]/10"
                      : "bg-gray-50 border border-gray-100"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <p
                        className={`text-[11px] font-black ${isOwner ? "text-[#FF5800]" : "text-gray-900"}`}
                      >
                        {comment.first_name} {comment.last_name}
                      </p>

                      {/* ✅ เพิ่ม Badge "ผู้เขียน" หรือ "เจ้าของโพสต์" */}
                      {isOwner && (
                        <span className="bg-[#FF5800] text-white text-[8px] px-1.5 py-0.5 rounded-full font-black uppercase tracking-wider shadow-sm">
                          ผู้เขียน
                        </span>
                      )}
                    </div>

                    <p className="text-[9px] font-bold text-gray-400 uppercase tracking-tighter">
                      {new Date(comment.created_at).toLocaleDateString()}
                    </p>
                  </div>

                  <p
                    className={`text-xs leading-relaxed font-medium ${isOwner ? "text-gray-800" : "text-gray-700"}`}
                  >
                    {comment.text}
                  </p>
                </div>
              </div>
            );
          })
        ) : (
          <p className="text-center text-gray-400 text-[10px] py-4 font-bold uppercase tracking-widest">
            ยังไม่มีคอมเมนต์
          </p>
        )}
      </div>

      {/* --- Comment Input --- */}
      <div className="flex items-center gap-3 pt-2 bg-white sticky bottom-0">
        <Avatar className="h-9 w-9 shrink-0 border-2 border-orange-50">
          <AvatarFallback className="bg-orange-50 text-[#FF5800]">
            {currentUser?.first_name?.[0] || <User size={18} />}
          </AvatarFallback>
        </Avatar>
        <div className="relative flex-1 group">
          <input
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSendComment()}
            placeholder="เขียนคอมเมนต์ของคุณ..."
            className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-4 py-3 text-xs outline-none focus:ring-2 focus:ring-[#FF5800]/20 focus:bg-white transition-all font-medium pr-12"
          />
          <button
            onClick={handleSendComment}
            disabled={isSubmitting || !text.trim()}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-gray-300 hover:text-[#FF5800] disabled:opacity-30 transition-colors active:scale-90"
          >
            {isSubmitting ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              <SendHorizonal size={18} strokeWidth={2.5} />
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PostComments;
