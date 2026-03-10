import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  User,
  Plus,
  Edit3,
  Package,
  MapPin,
  Phone,
  Trash2,
  Heart,
  MessageCircle,
  X,
  Pen,
} from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import PostDialog from "@/components/posts/PostDialog";
import usePostStore from "@/store/postStore";
import useTestStore from "@/store/tokStore";
import Swal from "sweetalert2";
import { motion, AnimatePresence } from "framer-motion";
import {
  addFavoriteApi,
  checkIsFavoriteApi,
  getFavCountApi,
  removeFavoriteApi,
} from "@/api/favorite";
import { getCommentAPI } from "@/api/comment";

const MyPostPage = () => {
  const navigate = useNavigate();
  const fetchMyPosts = usePostStore((state) => state.fetchMyPosts);
  const deletePost = usePostStore((state) => state.deletePost);
  const myPosts = usePostStore((state) => state.myPosts);
  const [isPostDialogOpen, setIsPostDialogOpen] = useState(false);
  const userInformation = useTestStore((state) => state.userInformation);
  const getUserInformation = useTestStore((state) => state.getUserInformation);
  const [selectedImg, setSelectedImg] = useState<string | null>(null);

  useEffect(() => {
    fetchMyPosts();
    getUserInformation();
  }, [fetchMyPosts, getUserInformation]);

  const handleDelete = async (postId: number) => {
    const result = await Swal.fire({
      title: "ยืนยันการลบ?",
      text: "คุณจะไม่สามารถกู้คืนโพสต์นี้ได้!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#FF5800",
      cancelButtonColor: "#d33",
      confirmButtonText: "ใช่, ลบเลย!",
      cancelButtonText: "ยกเลิก",
    });
    if (result.isConfirmed) {
      await deletePost(postId);
      Swal.fire("ลบสำเร็จ!", "โพสต์ของคุณถูกลบแล้ว", "success");
    }
  };

  const userData = {
    name: userInformation?.first_name
      ? `${userInformation.first_name} ${userInformation.last_name}`
      : "กำลังโหลด...",
    profile_img: userInformation?.profile_img || null,
    cover_img: userInformation?.cover_img || null,
    initial: userInformation?.first_name ? userInformation.first_name[0] : "?",
    phone: userInformation?.phone_number || "ไม่ได้ระบุ",
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA] pb-20">
      {/* Lightbox */}
      <AnimatePresence>
        {selectedImg && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedImg(null)}
            className="fixed inset-0 z-100 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 cursor-zoom-out"
          >
            <button className="absolute top-6 right-6 text-white/70 hover:text-white">
              <X size={28} />
            </button>
            <motion.img
              initial={{ scale: 0.92, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.92, opacity: 0 }}
              src={selectedImg}
              className="max-w-full max-h-[90vh] rounded-2xl object-contain"
              onClick={(e) => e.stopPropagation()}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Profile Header */}
      <div className="mx-auto max-w-4xl bg-white shadow-sm border-b border-gray-100 rounded-b-[40px] overflow-hidden">
        <div
          className="relative h-48 bg-orange-500"
          style={{
            backgroundImage: userData.cover_img
              ? `url(${userData.cover_img})`
              : `linear-gradient(to bottom right, #FFB800, #FF5800)`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
          <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/cuisines.png')]" />
        </div>
        <div className="relative px-8 pb-8">
          <div className="relative -mt-12 mb-4 flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="flex flex-col md:flex-row items-center md:items-end gap-4">
              <Avatar className="h-28 w-28 border-4 border-white shadow-xl bg-white overflow-hidden">
                {userData.profile_img ? (
                  <img
                    src={userData.profile_img}
                    className="h-full w-full object-cover"
                    alt="profile"
                  />
                ) : (
                  <AvatarFallback className="bg-orange-50 text-[#FF5800] text-3xl font-black">
                    {userData.initial}
                  </AvatarFallback>
                )}
              </Avatar>
              <div className="text-center md:text-left mb-2">
                <h1 className="text-3xl font-black text-gray-900 tracking-tight">
                  {userData.name}
                </h1>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button
                onClick={() => setIsPostDialogOpen(true)}
                className="rounded-xl bg-[#FF5800] hover:bg-[#E64F00] text-white font-bold shadow-lg shadow-orange-100"
              >
                <Plus size={18} className="mr-2" /> สร้างโพสต์
              </Button>
              <Button
                variant="outline"
                onClick={() => navigate("/user/edit-profile")}
                className="rounded-xl border-gray-200 font-bold"
              >
                <Edit3 size={18} className="mr-2" /> แก้ไขโปรไฟล์
              </Button>
            </div>
          </div>
        </div>
      </div>

      <PostDialog open={isPostDialogOpen} onOpenChange={setIsPostDialogOpen} />

      <main className="mx-auto max-w-4xl px-4 mt-8">
        <Tabs defaultValue="posts" className="w-full">
          <TabsList className="bg-gray-200/50 p-1 rounded-2xl mb-8 w-full md:w-[400px]">
            <TabsTrigger
              value="posts"
              className="rounded-xl gap-2 font-bold flex-1"
            >
              <Package size={18} /> โพสต์ของฉัน ({myPosts.length})
            </TabsTrigger>
            <TabsTrigger
              value="info"
              className="rounded-xl gap-2 font-bold flex-1"
            >
              <User size={18} /> ข้อมูลส่วนตัว
            </TabsTrigger>
          </TabsList>

          <TabsContent value="posts">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {myPosts.map((post) => (
                <PostCard
                  key={post.post_id}
                  post={post}
                  onDelete={() => handleDelete(post.post_id)}
                  onImageClick={setSelectedImg}
                  onCommentClick={() => navigate(`/user/post/${post.post_id}`)}
                />
              ))}
            </div>
            {myPosts.length === 0 && (
              <div className="text-center py-20 bg-white rounded-[32px] border border-dashed border-gray-200">
                <Package className="mx-auto text-gray-200 mb-4" size={48} />
                <p className="text-gray-400 font-bold">ยังไม่มีโพสต์ของคุณ</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="info">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <InfoCard
                icon={<Phone size={20} />}
                label="เบอร์โทรศัพท์"
                value={
                  userData.phone !== "ไม่ได้ระบุ"
                    ? `${userData.phone.slice(0, 3)}-${userData.phone.slice(3, 6)}-${userData.phone.slice(6)}`
                    : "ไม่ได้ระบุ"
                }
              />
              <InfoCard
                icon={<MapPin size={20} />}
                label="จุดนัดรับที่สะดวก"
                value="หอสมุดกลาง / ตึก HM"
              />
            </div>
          </TabsContent>
        </Tabs>
      </main>

      <style>{`.no-scrollbar::-webkit-scrollbar{display:none}.no-scrollbar{-ms-overflow-style:none;scrollbar-width:none}`}</style>
    </div>
  );
};

/* ── PostCard — มี state ครบในตัวเอง ── */
const PostCard = ({ post, onDelete, onImageClick, onCommentClick }: any) => {
  const token = useTestStore((state) => state.token);
  const [imgIdx, setImgIdx] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);
  const [favCount, setFavCount] = useState(0);
  const [favLoading, setFavLoading] = useState(false);
  const [commentCount, setCommentCount] = useState(0);
  const images = post.images || [];

  const [isEditOpen, setIsEditOpen] = useState(false);

  // ดึง fav + comment count ของโพสต์นี้
  useEffect(() => {
    const load = async () => {
      try {
        const [countRes, commentRes] = await Promise.all([
          getFavCountApi(post.post_id),
          getCommentAPI(token, post.post_id),
        ]);
        setFavCount(countRes.data.count ?? 0);
        setCommentCount(commentRes.data.count ?? 0);
        if (token) {
          const statusRes = await checkIsFavoriteApi(token, post.post_id);
          setIsFavorite(statusRes.data.isFavorite);
        }
      } catch (err) {
        console.error(err);
      }
    };
    load();
  }, [post.post_id, token]);

  const toggleFavorite = async () => {
    if (!token || favLoading) return;
    setFavLoading(true);
    const was = isFavorite;
    setIsFavorite(!was);
    setFavCount((p) => (was ? p - 1 : p + 1));
    try {
      if (was) await removeFavoriteApi(token, post.post_id);
      else await addFavoriteApi(token, post.post_id);
    } catch {
      setIsFavorite(was);
      setFavCount((p) => (was ? p + 1 : p - 1));
    } finally {
      setFavLoading(false);
    }
  };
  const categories = useTestStore((state) => state.categories); 
  const categoryName = categories.find((c: any) => c.category_id === post.category_id)?.category_name;

  return (
    <div className="rounded-[28px] border border-gray-100 bg-white shadow-sm hover:shadow-md transition-all overflow-hidden">
      {/* Carousel */}
      {images.length > 0 && (
        <div className="relative" style={{ aspectRatio: "4/3" }}>
          <div className="w-full h-full overflow-hidden">
            <motion.img
              key={imgIdx}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.2 }}
              src={images[imgIdx].image_url}
              className="w-full h-full object-cover cursor-zoom-in"
              onClick={() => onImageClick(images[imgIdx].image_url)}
            />
          </div>
          {images.length > 1 && (
            <>
              <button
                onClick={() => setImgIdx((i) => Math.max(0, i - 1))}
                className={`absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/40 backdrop-blur-sm text-white flex items-center justify-center transition-opacity text-lg ${imgIdx === 0 ? "opacity-0 pointer-events-none" : "opacity-100"}`}
              >
                ‹
              </button>
              <button
                onClick={() =>
                  setImgIdx((i) => Math.min(images.length - 1, i + 1))
                }
                className={`absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/40 backdrop-blur-sm text-white flex items-center justify-center transition-opacity text-lg ${imgIdx === images.length - 1 ? "opacity-0 pointer-events-none" : "opacity-100"}`}
              >
                ›
              </button>
              <div className="absolute top-2.5 right-2.5 bg-black/50 text-white text-[10px] font-bold px-2 py-0.5 rounded-full backdrop-blur-sm">
                {imgIdx + 1}/{images.length}
              </div>
              <div className="absolute bottom-2.5 left-1/2 -translate-x-1/2 flex gap-1">
                {images.map((_: any, i: number) => (
                  <button
                    key={i}
                    onClick={() => setImgIdx(i)}
                    className={`h-1.5 rounded-full transition-all duration-200 ${i === imgIdx ? "w-4 bg-white" : "w-1.5 bg-white/50"}`}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      )}

      {/* Content */}
      <div className="p-5">
        <div className="flex items-start justify-between gap-2 mb-2">
          {post.category_name && (
            <Badge
              variant="secondary"
              className="bg-orange-50 text-[#FF5800] border-none font-bold shrink-0"
            >
              {post.category_name}
            </Badge>
          )}

          <div className="space-x-4">
            {/* 🚩 ปุ่มแก้ไข */}
            <button
              onClick={() => setIsEditOpen(true)} // เปิด Dialog
              className="text-gray-300 hover:text-blue-500 transition-colors shrink-0"
            >
              <Pen size={16} />
            </button>

            <PostDialog
              open={isEditOpen}
              onOpenChange={setIsEditOpen}
              mode="edit"
              initialData={{
                post_id: post.post_id,
                title: post.title,
                description: post.description,
                category_id: post.category_id,
                images: post.images, // ส่ง array รูปเดิมเข้าไปแสดง
              }}
            />
            
            <button
              onClick={onDelete}
              className="text-gray-300 hover:text-red-500 transition-colors shrink-0"
            >
              <Trash2 size={16} />
            </button>
          </div>
        </div>

        <h3 className="font-bold text-gray-900 line-clamp-1 mb-4">
          {post.title}
        </h3>

        <div className="flex items-center justify-between border-t border-gray-50 pt-3">
          <div className="flex items-center gap-3">
            {/* ❤️ กดได้ */}
            <button
              onClick={toggleFavorite}
              disabled={favLoading}
              className={`flex items-center gap-1 transition-colors ${isFavorite ? "text-red-500" : "text-gray-400 hover:text-red-400"}`}
            >
              <Heart
                size={15}
                fill={isFavorite ? "currentColor" : "none"}
                className={favLoading ? "opacity-50" : ""}
              />
              <span className="text-xs font-bold">{favCount}</span>
            </button>

            {/* 💬 comment */}
            <button
              onClick={onCommentClick}
              className="flex items-center gap-1 text-gray-400 hover:text-[#FF5800] transition-colors"
            >
              <MessageCircle size={15} />
              <span className="text-xs font-bold">{commentCount}</span>
            </button>
          </div>
          <span className="text-[10px] font-bold text-gray-300">
            {`${post.created_at_th}`}
          </span>
        </div>
      </div>
    </div>
  );
};

const InfoCard = ({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) => (
  <div className="flex items-center gap-4 p-6 bg-white rounded-[24px] border border-gray-100 shadow-sm">
    <div className="p-3 bg-orange-50 text-[#FF5800] rounded-2xl">{icon}</div>
    <div>
      <p className="text-xs text-gray-400 font-bold uppercase">{label}</p>
      <p className="text-lg font-black text-gray-900">{value}</p>
    </div>
  </div>
);

export default MyPostPage;
