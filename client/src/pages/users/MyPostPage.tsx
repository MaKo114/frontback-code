import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  User,
  Plus,
  Edit3,
  Package,
  MapPin,
  Phone,
  MessageSquare,
  MoreHorizontal,
} from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import PostDialog from "@/components/posts/PostDialog";
import usePostStore from "@/store/postStore";

const MyPostPage = () => {
  const navigate = useNavigate();
  const fetchMyPosts = usePostStore((state) => state.fetchMyPosts);
  const myPosts = usePostStore((state) => state.myPosts);
  const [isPostDialogOpen, setIsPostDialogOpen] = useState(false);

  useEffect(() => {
    fetchMyPosts();
  }, []); // รันครั้งแรกครั้งเดียว หรือตามที่ store กำหนด

  // ดึงข้อมูลผู้ใช้จากโพสต์แรก (ถ้ามี)
  const userData =
    myPosts.length > 0
      ? {
          name: `${myPosts[0].first_name} ${myPosts[0].last_name}`,
          initial: myPosts[0].first_name[0],
        }
      : { name: "ผู้ใช้งานทั่วไป", initial: "U" };

  return (
    <div className="min-h-screen bg-[#FAFAFA] pb-20">
      {/* --- 1. Profile Header (ดีไซน์จาก MyPosts) --- */}
      <div className="mx-auto max-w-4xl bg-white shadow-sm border-b border-gray-100 rounded-b-[40px] overflow-hidden">
        <div className="relative h-48 bg-linear-to-br from-[#FFB800] via-[#FF8A00] to-[#FF5800]">
          <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/cuisines.png')]"></div>
        </div>

        <div className="relative px-8 pb-8">
          <div className="relative -mt-12 mb-4 flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="flex flex-col md:flex-row items-center md:items-end gap-4">
              <Avatar className="h-28 w-28 border-4 border-white shadow-xl">
                <AvatarFallback className="bg-orange-50 text-[#FF5800] text-3xl font-black">
                  {userData.initial}
                </AvatarFallback>
              </Avatar>

              <div className="text-center md:text-left mb-2">
                <h1 className="text-3xl font-black text-gray-900 tracking-tight">
                  {userData.name}
                </h1>
                <p className="text-sm font-bold text-gray-400 uppercase tracking-widest flex items-center justify-center md:justify-start gap-2">
                  <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                  KMITL Swapper • คณะวิศวกรรมศาสตร์
                </p>
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

      {/* --- 2. Content Sections (ใช้ Tabs รวมโลกทั้งสองใบ) --- */}
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

          {/* --- Tab: รายการโพสต์ --- */}
          <TabsContent value="posts" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {myPosts.map((post) => (
                <div
                  key={post.post_id}
                  className="group rounded-[32px] border border-gray-100 bg-white p-5 shadow-sm hover:shadow-md transition-all"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <Badge
                        variant="secondary"
                        className="bg-orange-50 text-[#FF5800] border-none font-bold"
                      >
                        {post.category_name || "ทั่วไป"}
                      </Badge>
                    </div>
                    <button className="p-2 text-gray-300 hover:text-gray-600 rounded-full">
                      <MoreHorizontal size={20} />
                    </button>
                  </div>

                  <div className="mb-4">
                    <h3 className="font-bold text-gray-900 line-clamp-1">
                      {post.title}
                    </h3>
                    <p className="text-sm text-gray-500 line-clamp-2 mt-1">
                      {post.description}
                    </p>
                  </div>

                  {post.images?.length > 0 && (
                    <div className="relative aspect-video rounded-2xl overflow-hidden bg-gray-100 mb-4">
                      <img
                        src={post.images[0].image_url}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                    </div>
                  )}

                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      className="flex-1 rounded-xl text-xs font-bold text-gray-500 hover:text-[#FF5800]"
                    >
                      <MessageSquare size={14} className="mr-2" /> แชท
                    </Button>
                    <Button
                      variant="ghost"
                      className="flex-1 rounded-xl text-xs font-bold text-red-500 hover:bg-red-50"
                    >
                      ลบโพสต์
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            {myPosts.length === 0 && (
              <div className="text-center py-20 bg-white rounded-[32px] border-2 border-dashed border-gray-100">
                <p className="text-gray-400 font-medium">ยังไม่มีรายการโพสต์</p>
              </div>
            )}
          </TabsContent>

          {/* --- Tab: ข้อมูลส่วนตัว --- */}
          <TabsContent value="info">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <InfoCard
                icon={<Phone size={20} />}
                label="เบอร์โทรศัพท์"
                value="08x-xxx-xxxx"
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
    </div>
  );
};

// Component ย่อยสำหรับหน้า Info
const InfoCard = ({ icon, label, value }: any) => (
  <div className="flex items-center gap-4 p-6 bg-white rounded-[24px] border border-gray-100 shadow-sm">
    <div className="p-3 bg-orange-50 text-[#FF5800] rounded-2xl">{icon}</div>
    <div>
      <p className="text-xs text-gray-400 font-bold uppercase">{label}</p>
      <p className="text-lg font-black text-gray-900">{value}</p>
    </div>
  </div>
);

// ลืมไม่ได้: ต้อง Import Badge เพิ่มด้วยนะครับ
import { Badge } from "@/components/ui/badge";

export default MyPostPage;
