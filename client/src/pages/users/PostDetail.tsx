import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ChevronLeft,
  Loader2,
  Heart,
  MessageCircle,
  SendHorizonal,
} from "lucide-react";
import axios from "axios";
import useTestStore from "@/store/tokStore";
import Swal from "sweetalert2";
import { motion, AnimatePresence } from "framer-motion";
import { checkIsFavoriteApi, getFavCountApi } from "@/api/favorite";
import { getCommentAPI } from "@/api/comment";
import { getPostByIdApi } from "@/api/post";

// Import components ที่แยกมา
import PostDetailHeader from "@/components/posts/PostDetailHeader";
import PostDetailContent from "@/components/posts/PostDetailContent";
import PostComments from "@/components/posts/PostComments";

const API = import.meta.env.VITE_API_URL;

const PostDetailPage = () => {
  const { post_id } = useParams();
  const navigate = useNavigate();
  const token = useTestStore((state) => state.token);
  const currentUser = useTestStore((state) => state.user);
  // const userFullInfo = useTestStore((state) => state.userInformation);

  const [post, setPost] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isFavorite, setIsFavorite] = useState(false);
  const [favCount, setFavCount] = useState(0);
  const [commentCount, setCommentCount] = useState(0);
  const [selectedImg, setSelectedImg] = useState<string | null>(null);
  // console.log(user);

  useEffect(() => {
    if (post_id) {
      fetchPost();
      getInitialSocialData();
    }
  }, [post_id, token]);

  const fetchPost = async () => {
    try {
      const res = await getPostByIdApi(token, Number(post_id));
      setPost(res.data.data || res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getInitialSocialData = async () => {
    try {
      const pId = Number(post_id);
      const [countRes, commentRes] = await Promise.all([
        getFavCountApi(pId),
        getCommentAPI(token, pId),
      ]);
      setFavCount(countRes.data.count ?? 0);
      setCommentCount(commentRes.data.count ?? 0);
      if (token) {
        const statusRes = await checkIsFavoriteApi(token, pId);
        setIsFavorite(statusRes.data.isFavorite);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeletePost = async () => {
    const result = await Swal.fire({
      title: "ยืนยันการลบโพสต์?",
      text: "ในฐานะ Admin คุณสามารถลบโพสต์ที่ทำผิดกฎได้",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "ใช่, ลบเลย!",
    });

    if (result.isConfirmed) {
      try {
        await axios.delete(`${API}/posts/${post_id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        Swal.fire("ลบสำเร็จ!", "", "success");
        navigate("/");
      } catch (err) {
        Swal.fire("ผิดพลาด", "ไม่สามารถลบโพสต์ได้", "error");
      }
    }
  };

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <Loader2 className="animate-spin text-[#FF5800]" size={32} />
      </div>
    );

  if (!post) return null;

  return (
    <div className="min-h-screen bg-[#F0F2F5] pb-10 font-sans">
      {/* Lightbox */}
      <AnimatePresence>
        {selectedImg && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedImg(null)}
            className="fixed inset-0 z-60 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 cursor-zoom-out"
          >
            <motion.img
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              src={selectedImg}
              className="max-w-full max-h-[90vh] rounded-2xl object-contain"
            />
          </motion.div>
        )}
      </AnimatePresence>

      <nav className="sticky top-0 z-50 bg-white border-b border-gray-200 h-14 flex items-center px-4 justify-between">
        <button
          onClick={() => navigate(-1)}
          className="p-2 hover:bg-gray-100 rounded-full"
        >
          <ChevronLeft size={24} className="text-gray-600" />
        </button>
        <span className="font-bold text-gray-800">รายละเอียดโพสต์</span>
        <div className="w-10" />
      </nav>

      <main className="max-w-[700px] mx-auto mt-4 px-2">
        <div className="bg-white rounded-[24px] shadow-sm border border-gray-100 overflow-hidden">
          <PostDetailHeader
            post={post}
            // ✅ เช็คจาก currentUser โดยตรง จะแม่นยำกว่า
            isAdmin={currentUser?.role === "ADMIN"}
            onDelete={handleDeletePost}
          />

          <PostDetailContent
            post={post}
            onImageClick={(url) => setSelectedImg(url)}
          />

          {/* Actions */}
          <div className="px-5 py-3 flex items-center justify-between border-t border-gray-50 mt-4">
            <div className="flex items-center gap-2">
              <button
                className={`flex items-center gap-1.5 px-4 py-2 rounded-xl ${isFavorite ? "text-red-500 bg-red-50" : "text-gray-400"}`}
              >
                <Heart size={20} fill={isFavorite ? "currentColor" : "none"} />
                <span className="text-sm font-black">{favCount}</span>
              </button>
              <div className="flex items-center gap-1.5 px-4 py-2 text-gray-400 bg-gray-50 rounded-xl">
                <MessageCircle size={20} />
                <span className="text-sm font-black">{commentCount}</span>
              </div>
            </div>
            {currentUser?.student_id !== post.student_id && (
              <button className="flex items-center gap-2 rounded-xl bg-gray-900 px-5 py-2.5 text-xs font-black text-white hover:bg-[#FF5800] transition-all">
                <SendHorizonal size={16} /> แชทคุยเลย
              </button>
            )}
          </div>

          <div className="border-t border-gray-100 bg-[#FCFCFC] p-5">
            <h3 className="text-sm font-black text-gray-900 mb-4">
              ความคิดเห็นทั้งหมด
            </h3>
            <PostComments
              postId={Number(post_id)}
              postOwnerId={post.student_id}
              setCommentCount={setCommentCount}
            />
          </div>
        </div>
      </main>
    </div>
  );
};

export default PostDetailPage;
