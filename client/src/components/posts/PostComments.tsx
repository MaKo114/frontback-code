import { useEffect, useState, useCallback } from "react";
import { Avatar, AvatarFallback } from "../ui/avatar";
import {
  User,
  SendHorizonal,
  Loader2,
  Pencil,
  Trash2,
  Check,
  X,
} from "lucide-react";
import useTestStore from "@/store/tokStore";
import {
  getCommentAPI,
  inputCommentAPI,
  editCommentAPI,
  deleteCommentAPI,
} from "@/api/comment";

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

  // edit state
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editText, setEditText] = useState("");
  const [editSubmitting, setEditSubmitting] = useState(false);

  const fetchComments = useCallback(async () => {
    if (!postId) return;
    setLoading(true);
    try {
      const res = await getCommentAPI(token, postId);
      const data = res.data.data || [];
      const count = res.data.count || 0;
      setComments(data);
      if (setCommentCount) setCommentCount(count);
    } catch (err) {
      console.error("Fetch comments error:", err);
    } finally {
      setLoading(false);
    }
  }, [postId, token, setCommentCount]);

  useEffect(() => {
    fetchComments();
  }, [fetchComments]);

  const handleSendComment = async () => {
    if (!text.trim() || !token) return;
    setIsSubmitting(true);
    try {
      await inputCommentAPI(token, postId, text.trim());
      setText("");
      fetchComments();
    } catch (err) {
      console.error("Send comment error:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStartEdit = (comment: any) => {
    setEditingId(comment.comment_id);
    setEditText(comment.text);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditText("");
  };

  const handleSaveEdit = async (commentId: number) => {
    if (!editText.trim()) return;
    setEditSubmitting(true);
    try {
      await editCommentAPI(token, commentId, editText.trim());
      setEditingId(null);
      fetchComments();
    } catch (err) {
      console.error("Edit comment error:", err);
    } finally {
      setEditSubmitting(false);
    }
  };

  const handleDelete = async (commentId: number) => {
    try {
      await deleteCommentAPI(token, commentId);
      fetchComments();
    } catch (err) {
      console.error("Delete comment error:", err);
    }
  };

  return (
    <div className="mt-4 pt-4 border-t border-gray-50 space-y-5">
      {/* Comment List */}
      <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
        {loading ? (
          <div className="flex justify-center py-4">
            <Loader2 className="animate-spin text-gray-300" size={20} />
          </div>
        ) : comments.length > 0 ? (
          comments.map((comment) => {
            const isOwner = String(comment.user_id) === String(postOwnerId);
            const isMyComment =
              String(comment.user_id) === String(currentUser?.student_id);
            const isEditing = editingId === comment.comment_id;

            return (
              <div key={comment.comment_id} className="flex gap-3 group">
                {/* Avatar */}
                <Avatar
                  className={`h-8 w-8 shrink-0 border-2 overflow-hidden ${isOwner ? "border-[#FF5800]" : "border-gray-100"}`}
                >
                  {comment.profile_img ? (
                    <img
                      src={comment.profile_img}
                      alt="profile"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <AvatarFallback
                      className={`${isOwner ? "bg-orange-500 text-white" : "bg-gray-100 text-gray-400"} text-[10px] font-black`}
                    >
                      {comment.first_name?.[0] || <User size={14} />}
                    </AvatarFallback>
                  )}
                </Avatar>

                {/* Bubble */}
                <div
                  className={`flex flex-col gap-1.5 p-3 rounded-2xl rounded-tl-none flex-1 ${
                    isOwner
                      ? "bg-orange-50 border border-orange-100"
                      : "bg-gray-50 border border-gray-100"
                  }`}
                >
                  {/* Name row */}
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5">
                      <p
                        className={`text-[11px] font-black ${isOwner ? "text-[#FF5800]" : "text-gray-900"}`}
                      >
                        {comment.first_name} {comment.last_name}
                      </p>
                      {isOwner && (
                        <span className="bg-[#FF5800] text-white text-[8px] px-1.5 py-0.5 rounded-full font-black uppercase">
                          ผู้เขียน
                        </span>
                      )}

                      <p className="text-[9px] text-gray-400 font-bold">
                        {new Date(comment.created_at).toLocaleDateString(
                          "th-TH",
                        )}
                      </p>
                    </div>
                    <div className="flex items-center gap-1">
                      {/* Edit/Delete — เห็นเฉพาะ comment ของตัวเอง */}
                      {isMyComment && !isEditing && (
                        <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity ml-1">
                          <button
                            onClick={() => handleStartEdit(comment)}
                            className="p-1 rounded-lg hover:bg-gray-200 text-gray-400 hover:text-blue-500 transition-colors"
                          >
                            <Pencil size={11} />
                          </button>
                          <button
                            onClick={() => handleDelete(comment.comment_id)}
                            className="p-1 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors"
                          >
                            <Trash2 size={11} />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Text หรือ Edit input */}
                  {isEditing ? (
                    <div className="flex items-center gap-2 mt-1">
                      <input
                        autoFocus
                        value={editText}
                        onChange={(e) => setEditText(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter")
                            handleSaveEdit(comment.comment_id);
                          if (e.key === "Escape") handleCancelEdit();
                        }}
                        className="flex-1 text-xs bg-white border border-gray-200 rounded-xl px-3 py-1.5 outline-none focus:ring-2 focus:ring-[#FF5800]/20 font-medium"
                      />
                      <button
                        onClick={() => handleSaveEdit(comment.comment_id)}
                        disabled={editSubmitting || !editText.trim()}
                        className="p-1.5 rounded-lg bg-[#FF5800] text-white hover:bg-[#e04f00] disabled:opacity-40 transition-colors"
                      >
                        {editSubmitting ? (
                          <Loader2 size={12} className="animate-spin" />
                        ) : (
                          <Check size={12} />
                        )}
                      </button>
                      <button
                        onClick={handleCancelEdit}
                        className="p-1.5 rounded-lg bg-gray-100 text-gray-500 hover:bg-gray-200 transition-colors"
                      >
                        <X size={12} />
                      </button>
                    </div>
                  ) : (
                    <p
                      className={`text-xs leading-relaxed font-medium ${isOwner ? "text-gray-800" : "text-gray-700"}`}
                    >
                      {comment.text}
                    </p>
                  )}
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

      {/* Input */}
      <div className="flex items-center gap-3 pt-2 bg-white sticky bottom-0">
        <Avatar className="h-9 w-9 shrink-0 border-2 border-orange-50">
          <AvatarFallback className="bg-orange-50 text-[#FF5800]">
            {currentUser?.profile_img ? (
              <img
                src={currentUser.profile_img}
                alt="profile"
                className="h-full w-full object-cover"
              />
            ) : (
              <AvatarFallback className="bg-orange-50 text-[#FF5800] font-bold">
                {currentUser?.first_name?.[0] || <User size={18} />}
              </AvatarFallback>
            )}
          </AvatarFallback>
        </Avatar>
        <div className="relative flex-1">
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
