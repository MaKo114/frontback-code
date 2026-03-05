import { useState } from "react";
import { User, Heart, MessageCircle, SendHorizonal } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import MoreDot from "@/components/posts/MoreDot";
import ImageCard from "@/components/posts/ImageCard";
import PostComments from "@/components/posts/PostComments";
import { useNavigate } from "react-router-dom";
import { createChat } from "@/api/chat";
import useTestStore from "@/store/tokStore";

interface PostCardProps {
  post: any;
}

const PostCard = ({ post }: PostCardProps) => {
  const navigate = useNavigate();
  const [isCommentsOpen, setIsCommentsOpen] = useState(false);
  const token = useTestStore((state) => state.token);
  const user = useTestStore((state) => state.user);

  const handleChat = async (post_id: number) => {
    try {
      const res = await createChat(token, post_id);
      const chatId = res.data.data.chat_id;
      navigate(`/user/chat/${chatId}`); // ✅ absolute path
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <div className="rounded-[24px] bg-white border border-gray-50 p-6 shadow-sm hover:shadow-md transition-all duration-300">
      {/* Post Header */}
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Avatar className="h-11 w-11 border-2 border-orange-50">
            <AvatarFallback className="bg-orange-50 text-[#FF5800]">
              <User size={22} />
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="text-sm font-bold text-gray-900 hover:text-[#FF5800] cursor-pointer transition-colors">
              {`${post.first_name} ${post.last_name}`}
            </p>
            <p className="text-[11px] font-medium text-gray-400 uppercase tracking-wider">
              {post.created_at_th}
            </p>
          </div>
        </div>
        <MoreDot post={post} />
      </div>

      {/* Post Content */}
      <div
        className="mb-5 space-y-2 cursor-pointer"
        onClick={() => setIsCommentsOpen(!isCommentsOpen)}
      >
        {/* ไฟล์ที่โชว์โพสต์หน้า Feed */}
        <div className="p-4">
          {/* title */}
          <h2 className="text-xl font-bold wrap-break-word">{post.title}</h2>

          {/* description: เปลี่ยนมาใช้ whitespace-pre-wrap */}
          <p className="mt-2 text-gray-700 whitespace-pre-wrap wrap-break-word">
            {post.description}
          </p>
        </div>
      </div>

      {/* Post Images */}
      {post.images?.length > 0 && (
        <div className="mb-5 overflow-hidden rounded-[18px]">
          <ImageCard images={post.images} />
        </div>
      )}

      {/* Post Footer Actions */}
      <div className="flex items-center justify-between pt-3 border-t border-gray-50">
        <div className="flex items-center gap-2">
          <button className="group flex items-center gap-1.5 text-gray-400 hover:text-red-500 transition-colors">
            <div className="p-2 group-hover:bg-red-50 rounded-full transition-colors">
              <Heart size={20} />
            </div>
            <span className="text-xs font-bold sm:inline hidden">ถูกใจ</span>
          </button>

          <button
            onClick={() => setIsCommentsOpen(!isCommentsOpen)}
            className={`group flex items-center gap-1.5 transition-colors ${
              isCommentsOpen
                ? "text-[#FF5800]"
                : "text-gray-400 hover:text-[#FF5800]"
            }`}
          >
            <div
              className={`p-2 rounded-full transition-colors ${
                isCommentsOpen ? "bg-orange-50" : "group-hover:bg-orange-50"
              }`}
            >
              <MessageCircle size={20} />
            </div>
            <span className="text-xs font-bold">แสดงความคิดเห็น</span>
          </button>
        </div>

        {
          user.student_id === post.student_id ? <></> : <button
          className="flex items-center gap-2 rounded-xl bg-gray-900 px-5 py-2.5 text-xs font-black text-white shadow-lg shadow-gray-200 hover:bg-[#FF5800] transition-all active:scale-95"
          onClick={() => {
            handleChat(post.post_id);
          }}
        >
          <SendHorizonal size={16} />
          เริ่มแชทเลย
        </button>
        }
      </div>

      {/* Comment Section */}
      {isCommentsOpen && <PostComments postId={post.post_id} />}
    </div>
  );
};

export default PostCard;
