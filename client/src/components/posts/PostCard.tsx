import { useEffect, useState } from "react";
import { User, Heart, MessageCircle, SendHorizonal, ChevronDown } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import MoreDot from "@/components/posts/MoreDot";
import PostComments from "@/components/posts/PostComments";
import { useNavigate } from "react-router-dom";
import { createChat } from "@/api/chat";
import useTestStore from "@/store/tokStore";
import {
  addFavoriteApi,
  checkIsFavoriteApi,
  getFavCountApi,
  removeFavoriteApi,
} from "@/api/favorite";
import Swal from "sweetalert2";
import { getCommentAPI } from "@/api/comment";
import { motion, AnimatePresence } from "framer-motion";

interface PostCardProps {
  post: any;
}

const PostCard = ({ post }: PostCardProps) => {
  const navigate = useNavigate();
  const [isCommentsOpen, setIsCommentsOpen] = useState(false);
  const token = useTestStore((state) => state.token);
  const user = useTestStore((state) => state.user);
  const [isFavorite, setIsFavorite] = useState(false);
  const [favLoading, setFavLoading] = useState(false);
  const [favCount, setFavCount] = useState(0);
  const [commentCount, setCommentCount] = useState(0);
  const [selectedImg, setSelectedImg] = useState<string | null>(null);

  const handleChat = async (post_id: number) => {
    try {
      const res = await createChat(token, post_id);
      const chatId = res.data.data.chat_id;
      navigate(`/user/chat/${chatId}`);
    } catch (err: any) {
      Swal.fire({
        toast: true, position: "bottom",
        showConfirmButton: false, timer: 3000,
        icon: "error",
        title: err?.response?.data?.error || "ไม่สามารถเปิดแชทได้",
      });
    }
  };

  useEffect(() => {
    const getInitialData = async () => {
      if (!post.post_id) return;
      try {
        const countRes = await getFavCountApi(post.post_id);
        setFavCount(countRes.data.count ?? 0);
        if (token) {
          const statusRes = await checkIsFavoriteApi(token, post.post_id);
          setIsFavorite(statusRes.data.isFavorite);
        }
        const commentRes = await getCommentAPI(token, post.post_id);
        setCommentCount(commentRes.data.count ?? 0);
      } catch (err) {
        console.error("Fetch initial data error:", err);
      }
    };
    getInitialData();
  }, [post.post_id, token]);

  const toggleFavorite = async () => {
    if (!token || favLoading) return;
    setFavLoading(true);
    const wasAlreadyFav = isFavorite;
    setIsFavorite(!wasAlreadyFav);
    setFavCount((prev) => (wasAlreadyFav ? prev - 1 : prev + 1));
    try {
      if (wasAlreadyFav) await removeFavoriteApi(token, post.post_id);
      else await addFavoriteApi(token, post.post_id);
    } catch (err) {
      setIsFavorite(wasAlreadyFav);
      setFavCount((prev) => (wasAlreadyFav ? prev + 1 : prev - 1));
      Swal.fire({ toast: true, position: "bottom", showConfirmButton: false, timer: 3000, icon: "error", title: "เกิดข้อผิดพลาด" });
    } finally {
      setFavLoading(false);
    }
  };

  const images = post.images || [];

  return (
    <>
      {/* Image Lightbox */}
      <AnimatePresence>
        {selectedImg && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedImg(null)}
            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 cursor-zoom-out"
          >
            <motion.img
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              src={selectedImg}
              className="max-w-full max-h-[90vh] rounded-2xl object-contain shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            />
          </motion.div>
        )}
      </AnimatePresence>

      <div className="rounded-[24px] bg-white border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden">

        {/* Header */}
        <div className="px-5 pt-5 pb-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10 border-2 border-orange-50 overflow-hidden">
              {post.profile_img ? (
                <img src={post.profile_img} alt="profile" className="h-full w-full object-cover" />
              ) : (
                <AvatarFallback className="bg-orange-50 text-[#FF5800]">
                  <User size={18} />
                </AvatarFallback>
              )}
            </Avatar>
            <div>
              <p className="text-sm font-black text-gray-900 leading-tight">
                {`${post.first_name} ${post.last_name}`}
              </p>
              <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
                {post.created_at_th}
              </p>
            </div>
          </div>
          <MoreDot post={post} />
        </div>

        {/* Title & Description */}
        <div className="px-5 pb-3">
          <h2 className="text-[17px] font-black text-gray-900 leading-snug mb-1">
            {post.title}
          </h2>
          {post.description && (
            <p className="text-sm text-gray-500 leading-relaxed line-clamp-2">
              {post.description}
            </p>
          )}
        </div>

        {/* Images — fixed aspect ratio กัน stretch */}
        {images.length === 1 && (
          <div
            className="mx-4 mb-4 rounded-2xl overflow-hidden cursor-zoom-in bg-gray-100"
            style={{ aspectRatio: "4/3" }}
            onClick={() => setSelectedImg(images[0].image_url)}
          >
            <img
              src={images[0].image_url}
              alt=""
              className="w-full h-full object-cover hover:scale-[1.02] transition-transform duration-500"
            />
          </div>
        )}

        {images.length === 2 && (
          <div className="mx-4 mb-4 grid grid-cols-2 gap-1.5 rounded-2xl overflow-hidden">
            {images.map((img: any, i: number) => (
              <div
                key={i}
                className="relative overflow-hidden bg-gray-100 cursor-zoom-in"
                style={{ aspectRatio: "1/1" }}
                onClick={() => setSelectedImg(img.image_url)}
              >
                <img
                  src={img.image_url}
                  alt=""
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                />
              </div>
            ))}
          </div>
        )}

        {images.length === 3 && (
          <div className="mx-4 mb-4 grid grid-cols-2 gap-1.5 rounded-2xl overflow-hidden">
            <div
              className="row-span-2 relative overflow-hidden bg-gray-100 cursor-zoom-in"
              style={{ aspectRatio: "3/4" }}
              onClick={() => setSelectedImg(images[0].image_url)}
            >
              <img src={images[0].image_url} alt="" className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
            </div>
            {images.slice(1).map((img: any, i: number) => (
              <div
                key={i}
                className="relative overflow-hidden bg-gray-100 cursor-zoom-in"
                style={{ aspectRatio: "3/2" }}
                onClick={() => setSelectedImg(img.image_url)}
              >
                <img src={img.image_url} alt="" className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
              </div>
            ))}
          </div>
        )}

        {images.length >= 4 && (
          <div className="mx-4 mb-4 grid grid-cols-2 gap-1.5 rounded-2xl overflow-hidden">
            {images.slice(0, 3).map((img: any, i: number) => (
              <div
                key={i}
                className="relative overflow-hidden bg-gray-100 cursor-zoom-in"
                style={{ aspectRatio: "1/1" }}
                onClick={() => setSelectedImg(img.image_url)}
              >
                <img src={img.image_url} alt="" className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
              </div>
            ))}
            {/* รูปสุดท้ายแสดง +N */}
            <div
              className="relative overflow-hidden bg-gray-100 cursor-zoom-in"
              style={{ aspectRatio: "1/1" }}
              onClick={() => setSelectedImg(images[3].image_url)}
            >
              <img src={images[3].image_url} alt="" className="w-full h-full object-cover" />
              {images.length > 4 && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                  <span className="text-white text-2xl font-black">+{images.length - 4}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Footer Actions */}
        <div className="px-5 pb-4 flex items-center justify-between border-t border-gray-50 pt-3">
          <div className="flex items-center gap-1">

            {/* ❤️ Favorite */}
            <button
              onClick={toggleFavorite}
              disabled={favLoading}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl transition-all ${
                isFavorite
                  ? "text-red-500 bg-red-50"
                  : "text-gray-400 hover:text-red-500 hover:bg-red-50"
              }`}
            >
              <Heart
                size={18}
                fill={isFavorite ? "currentColor" : "none"}
                className={`transition-transform ${favLoading ? "scale-75 opacity-50" : "scale-100"}`}
              />
              {favCount > 0 && (
                <span className="text-xs font-black">{favCount}</span>
              )}
            </button>

            {/* 💬 Comment */}
            <button
              onClick={() => setIsCommentsOpen(!isCommentsOpen)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl transition-all ${
                isCommentsOpen
                  ? "text-[#FF5800] bg-orange-50"
                  : "text-gray-400 hover:text-[#FF5800] hover:bg-orange-50"
              }`}
            >
              <MessageCircle size={18} />
              {commentCount > 0 && (
                <span className="text-xs font-black">{commentCount}</span>
              )}
            </button>

          </div>

          {/* ปุ่มแชท */}
          {user?.student_id !== post.student_id && (
            <button
              onClick={() => handleChat(post.post_id)}
              className="flex items-center gap-2 rounded-xl bg-gray-900 px-4 py-2 text-xs font-black text-white hover:bg-[#FF5800] transition-all active:scale-95"
            >
              <SendHorizonal size={14} /> แชทเลย
            </button>
          )}
        </div>

        {/* Comments */}
        <AnimatePresence>
          {isCommentsOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ type: "spring", duration: 0.5, bounce: 0.2 }}
              className="overflow-hidden border-t border-gray-50"
            >
              <div className="px-5 py-4">
                <PostComments
                  postId={post.post_id}
                  postOwnerId={post.student_id}
                  setCommentCount={setCommentCount}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
};

export default PostCard;