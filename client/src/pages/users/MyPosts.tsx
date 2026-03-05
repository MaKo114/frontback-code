import { useNavigate } from "react-router-dom";
import {
  User,
  Plus,
  MoreHorizontal,
  Edit3,
  Image as ImageIcon,
  MessageSquare,
} from "lucide-react";
import { Avatar, AvatarFallback } from "../../components/ui/avatar";
import Title from "../../titles/Title";
import usePostStore from "@/store/postStore";
import { useEffect, useState } from "react";
import PostDialog from "@/components/posts/PostDialog";

const MyPosts = () => {
  const navigate = useNavigate();
  const fetchMyPosts = usePostStore((state) => state.fetchMyPosts);
  const myPosts = usePostStore((state) => state.myPosts);
  const [isPostDialogOpen, setIsPostDialogOpen] = useState(false);

  useEffect(() => {
    fetchMyPosts();
  }, [myPosts]);

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      <Title />

      {/* --- Profile Section --- */}
      <div className="mx-auto max-w-2xl bg-white shadow-sm border-b border-gray-100">
        <div className="relative h-44 bg-linear-to-br from-[#FFB800] via-[#FF8A00] to-[#FF5800] overflow-hidden">
          <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/cuisines.png')]"></div>
        </div>

        {/* --- ส่วนที่ปรับปรุงระยะห่าง --- */}
        <div className="relative px-6 pb-8">
          {/* ส่วน Avatar: ดันขึ้นไปครึ่งหนึ่ง */}
          <div className="relative -mt-12 mb-4">
            <Avatar className="h-24 w-24 border-4 border-white shadow-xl">
              <AvatarFallback className="bg-orange-50 text-[#FF5800]">
                <User size={44} />
              </AvatarFallback>
            </Avatar>
          </div>

          {/* ชื่อและปุ่ม: แยกบรรทัดจากระดับ Avatar มาอยู่ด้านล่างเพื่อให้ไม่เบียดหน้าปก */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div className="space-y-1">
              <h1 className="text-2xl font-black text-gray-900 tracking-tight">
                {myPosts.length > 0
                  ? `${myPosts[0].first_name} ${myPosts[0].last_name}`
                  : "ผู้ใช้งานทั่วไป"}
              </h1>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                KMITL Swapper
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsPostDialogOpen(true)}
                className="group flex items-center gap-2 rounded-xl border-2 border-orange-100 bg-white px-4 py-2.5 text-sm font-bold text-[#FF5800] shadow-sm hover:border-[#FF5800] transition-all active:scale-95"
              >
                <Plus
                  size={16}
                  strokeWidth={3}
                  className="group-hover:rotate-90 transition-transform"
                />
                เพิ่มโพสต์
              </button>

              <button
                onClick={() => navigate("/user/edit-profile")}
                className="flex items-center gap-2 rounded-xl bg-gray-900 px-4 py-2.5 text-sm font-bold text-white shadow-lg shadow-gray-200 hover:bg-gray-800 transition-all active:scale-95"
              >
                <Edit3 size={16} />
                แก้ไขโปรไฟล์
              </button>
            </div>
          </div>
        </div>
      </div>

      <PostDialog open={isPostDialogOpen} onOpenChange={setIsPostDialogOpen} />

      {/* --- Posts List --- */}
      <main className="mx-auto max-w-2xl px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-black text-gray-800 flex items-center gap-2">
            <ImageIcon size={20} className="text-[#FF5800]" />
            โพสต์ของคุณ ({myPosts.length})
          </h2>
        </div>

        <div className="space-y-6">
          {myPosts.map((post) => (
            <div
              key={post.post_id}
              className="group rounded-[24px] border border-gray-100 bg-white p-5 shadow-sm hover:shadow-md transition-all duration-300"
            >
              {/* Card Header */}
              <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10 ring-2 ring-orange-50">
                    <AvatarFallback className="bg-orange-50 text-[#FF5800] font-bold text-xs">
                      {post.first_name[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-bold text-gray-900">
                      {post.first_name} {post.last_name}
                    </p>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">
                      Just Now
                    </p>
                  </div>
                </div>

                <button className="p-2 text-gray-300 hover:text-gray-600 hover:bg-gray-50 rounded-full transition-all">
                  <MoreHorizontal size={20} />
                </button>
              </div>

              {/* Description */}
              <div className="mb-4">
                <h3 className="font-bold text-gray-900 mb-1">{post.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed line-clamp-3">
                  {post.description}
                </p>
              </div>

              {/* Image Section */}
              {post.images?.length > 0 && (
                <div className="relative aspect-video w-full overflow-hidden rounded-2xl bg-gray-100 ring-1 ring-gray-50">
                  <img
                    src={post.images[0].image_url}
                    alt={post.title}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  {post.images.length > 1 && (
                    <div className="absolute bottom-3 right-3 bg-black/60 backdrop-blur-md text-white text-[10px] font-black px-2 py-1 rounded-lg">
                      +{post.images.length - 1} รูปภาพ
                    </div>
                  )}
                </div>
              )}

              {/* Footer Actions (Optional) */}
              <div className="mt-4 pt-4 border-t border-gray-50 flex gap-4">
                <button className="flex items-center gap-2 text-gray-400 hover:text-[#FF5800] transition-colors text-xs font-bold">
                  <MessageSquare size={16} />
                  ดูข้อความแชท
                </button>
              </div>
            </div>
          ))}

          {/* Empty State */}
          {myPosts.length === 0 && (
            <div className="text-center py-20 bg-white rounded-[32px] border-2 border-dashed border-gray-100">
              <div className="inline-flex p-4 bg-orange-50 rounded-full text-[#FF5800] mb-4">
                <ImageIcon size={32} />
              </div>
              <h3 className="text-lg font-bold text-gray-900">
                ยังไม่มีโพสต์เลย
              </h3>
              <p className="text-sm text-gray-400 mt-1">
                เริ่มลงประกาศสิ่งของที่คุณอยากแลกเปลี่ยนได้เลย!
              </p>
              <button
                onClick={() => setIsPostDialogOpen(true)}
                className="mt-6 px-6 py-2 bg-[#FF5800] text-white rounded-xl font-bold text-sm shadow-lg shadow-orange-100 hover:bg-[#E64F00] transition-all"
              >
                สร้างโพสต์แรก
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default MyPosts;
