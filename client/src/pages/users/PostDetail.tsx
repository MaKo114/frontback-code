import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ChevronLeft,
  User,
  ImageOff,
  Loader2,
  MessageCircle,
  Heart,
  SendHorizonal,
  Clock,
  Trash2,
  ShieldCheck,
  MapPin,
} from "lucide-react";
import axios from "axios";
import useTestStore from "@/store/tokStore";
import Swal from "sweetalert2";
import { createChat } from "@/api/chat";
import { motion, AnimatePresence } from "framer-motion";
import {
  addFavoriteApi,
  checkIsFavoriteApi,
  getFavCountApi,
  removeFavoriteApi,
} from "@/api/favorite";
import { getCommentAPI } from "@/api/comment";
import PostComments from "@/components/posts/PostComments";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { getPostByIdApi } from "@/api/post";

const API = import.meta.env.VITE_API_URL;

const PostDetailPage = () => {
  const { post_id } = useParams();
  const navigate = useNavigate();
  const token = useTestStore((state) => state.token);
  const user = useTestStore((state) => state.userInformation); // ข้อมูล user ที่ login

  const [post, setPost] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isFavorite, setIsFavorite] = useState(false);
  const [favCount, setFavCount] = useState(0);
  const [commentCount, setCommentCount] = useState(0);
  const [selectedImg, setSelectedImg] = useState<string | null>(null);

  useEffect(() => {
    if (post_id) {
      fetchPost();
      getInitialSocialData();
    }
  }, [post_id, token]);

  const fetchPost = async () => {
    try {
      const res = await getPostByIdApi(token, post_id);
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

  // --- Logic การลบสำหรับ Admin ---
  const handleDeletePost = async () => {
    const result = await Swal.fire({
      title: "ยืนยันการลบโพสต์?",
      text: "ในฐานะ Admin คุณสามารถลบโพสต์ที่ทำผิดกฎได้",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "ใช่, ลบเลย!",
      cancelButtonText: "ยกเลิก",
    });

    if (result.isConfirmed) {
      try {
        await axios.delete(`${API}/posts/${post_id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        await Swal.fire("ลบสำเร็จ!", "โพสต์นี้ถูกลบออกจากระบบแล้ว", "success");
        navigate("/"); // ลบเสร็จให้เด้งกลับหน้าหลัก
      } catch (err) {
        Swal.fire("ผิดพลาด", "ไม่สามารถลบโพสต์ได้", "error");
      }
    }
  };

  const handleChat = async () => {
    if (!token) return Swal.fire("เข้าสู่ระบบก่อน", "", "info");
    try {
      const res = await createChat(token, Number(post_id));
      navigate(`/user/chat/${res.data.data.chat_id}`);
    } catch (err: any) {
      Swal.fire({ icon: "error", title: "ไม่สามารถเปิดแชทได้" });
    }
  };

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <Loader2 className="animate-spin text-[#FF5800]" size={32} />
      </div>
    );

  if (!post) return null;

  const images = post.images || [];
  const isAdmin = user?.role === "ADMIN"; // เช็คว่าเป็น Admin ไหม
  const isOwner = user?.student_id === post.student_id;

  return (
    <div className="min-h-screen bg-[#F0F2F5] pb-10 font-sans">
      {/* Lightbox (เหมือนใน PostCard) */}
      <AnimatePresence>
        {selectedImg && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedImg(null)}
            className="fixed inset-0 z-100 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 cursor-zoom-out"
          >
            <motion.img
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              src={selectedImg}
              className="max-w-full max-h-[90vh] rounded-2xl object-contain shadow-2xl"
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Top Bar */}
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
          {/* Header เหมือน PostCard */}
          <div className="p-5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Avatar className="h-11 w-11 border-2 border-orange-50 overflow-hidden shadow-sm">
                {/* 🚩 แสดงรูปโปรไฟล์ถ้ามี URL */}
                {post.profile_img ? (
                  <img
                    src={post.profile_img}
                    alt={`${post.first_name} profile`}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  // 🚩 ถ้าไม่มีรูปโปรไฟล์ ให้แสดง Fallback เป็นอักษรตัวแรกของชื่อ
                  <AvatarFallback className="bg-orange-50 text-[#FF5800] font-black text-xl uppercase">
                    {/* ดึงอักษรตัวแรกของชื่อมาแสดง ถ้าไม่มีชื่อเลยให้ใช้ไอคอน User แทน */}
                    {post.first_name?.[0] || <User size={20} />}
                  </AvatarFallback>
                )}
              </Avatar>
              <div>
                <p className="font-black text-gray-900 leading-tight">
                  {post.first_name} {post.last_name}
                </p>
                <p className="text-[11px] font-bold text-gray-400 flex items-center gap-1 uppercase tracking-wider">
                  <Clock size={12} />{" "}
                  {new Date(post.created_at).toLocaleDateString("th-TH")}
                </p>
              </div>
            </div>

            {/* ปุ่มลบสำหรับ Admin */}
            {isAdmin && (
              <button
                onClick={handleDeletePost}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 text-red-600 rounded-full hover:bg-red-100 transition-colors text-xs font-black"
              >
                <Trash2 size={14} /> ลบโพสต์นี้
              </button>
            )}
          </div>

          {/* Title & Category */}
          <div className="px-5 pb-3">
            <div className="flex items-center gap-2 mb-2">
              <span className="bg-orange-50 text-[#FF5800] text-[10px] font-black px-2 py-0.5 rounded uppercase border border-orange-100">
                {post.category_name}
              </span>
              <span className="bg-green-50 text-green-600 text-[10px] font-black px-2 py-0.5 rounded uppercase border border-green-100">
                {post.status}
              </span>
            </div>
            <h1 className="text-xl font-black text-gray-900 mb-2">
              {post.title}
            </h1>
            <p className="text-gray-600 leading-relaxed whitespace-pre-line text-[15px]">
              {post.description}
            </p>
          </div>

          {/* รูปภาพ (แสดงทุกรูปเรียงลงมาแบบ Feed) */}
          <div className="space-y-1 bg-gray-50">
            {images.map((img: any, i: number) => (
              <div
                key={i}
                className="cursor-zoom-in overflow-hidden bg-white flex justify-center"
                onClick={() => setSelectedImg(img.image_url)}
              >
                <img
                  src={img.image_url}
                  className="w-full h-auto max-h-[600px] object-contain"
                  alt={`img-${i}`}
                />
              </div>
            ))}
          </div>

          {/* Social Stats เหมือน PostCard */}
          <div className="px-5 py-3 flex items-center justify-between border-t border-gray-50 mt-4">
            <div className="flex items-center gap-2">
              <button
                className={`flex items-center gap-1.5 px-4 py-2 rounded-xl transition-all ${isFavorite ? "text-red-500 bg-red-50" : "text-gray-400 hover:bg-gray-50"}`}
              >
                <Heart size={20} fill={isFavorite ? "currentColor" : "none"} />
                <span className="text-sm font-black">{favCount}</span>
              </button>
              <div className="flex items-center gap-1.5 px-4 py-2 text-gray-400 bg-gray-50 rounded-xl">
                <MessageCircle size={20} />
                <span className="text-sm font-black">{commentCount}</span>
              </div>
            </div>

            {!isOwner && (
              <button
                onClick={handleChat}
                className="flex items-center gap-2 rounded-xl bg-gray-900 px-5 py-2.5 text-xs font-black text-white hover:bg-[#FF5800] transition-all active:scale-95"
              >
                <SendHorizonal size={16} /> แชทคุยเลย
              </button>
            )}
          </div>

          {/* Comment Section (เปิดไว้เลยสำหรับหน้า Detail) */}
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
