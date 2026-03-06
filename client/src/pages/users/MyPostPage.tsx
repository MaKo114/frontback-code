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
} from "lucide-react"; // เพิ่ม Trash2
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import PostDialog from "@/components/posts/PostDialog";
import usePostStore from "@/store/postStore";
import useTestStore from "@/store/tokStore";
import Swal from "sweetalert2"; // สำหรับปุ่มลบที่ดูโปร

const MyPostPage = () => {
  const navigate = useNavigate();
  const fetchMyPosts = usePostStore((state) => state.fetchMyPosts);
  const deletePost = usePostStore((state) => state.deletePost); // สมมติว่าพี่มี function นี้ใน store
  const myPosts = usePostStore((state) => state.myPosts);
  const [isPostDialogOpen, setIsPostDialogOpen] = useState(false);
  const userInformation = useTestStore((state) => state.userInformation);
  const getUserInformation = useTestStore((state) => state.getUserInformation);

  // console.log(information);

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
      // เรียกใช้ function ลบจาก store
      // await deletePost(postId);
      Swal.fire("ลบสำเร็จ!", "โพสต์ของคุณถูกลบแล้ว", "success");
    }
  };

  // const firstPost = myPosts.length > 0 ? myPosts[0] : null;

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
      {/* --- 1. Profile Header --- */}
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
          <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/cuisines.png')]"></div>
        </div>

        <div className="relative px-8 pb-8">
          <div className="relative -mt-12 mb-4 flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="flex flex-col md:flex-row items-center md:items-end gap-4">
              <Avatar className="h-28 w-28 border-4 border-white shadow-xl bg-white">
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

                {/* <p className="text-sm font-bold text-gray-400 uppercase tracking-widest flex items-center justify-center md:justify-start gap-2">
                  <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                  KMITL Swapper • คณะวิศวกรรมศาสตร์
                </p> */}

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

          <TabsContent value="posts" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {myPosts.map((post) => (
                <div
                  key={post.post_id}
                  className="group rounded-[32px] border border-gray-100 bg-white p-5 shadow-sm hover:shadow-md transition-all relative"
                >
                  <div className="flex items-center justify-between mb-4">
                    <Badge
                      variant="secondary"
                      className="bg-orange-50 text-[#FF5800] border-none font-bold"
                    >
                      {post.category_name || "ทั่วไป"}
                    </Badge>
                    {/* ปุ่มลบโพสต์ */}
                    <button
                      onClick={() => handleDelete(post.post_id)}
                      className="text-gray-300 hover:text-red-500 transition-colors p-1"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                  <h3 className="font-bold text-gray-900 line-clamp-1">
                    {post.title}
                  </h3>
                  {post.images?.[0]?.image_url && (
                    <div className="relative aspect-video rounded-2xl overflow-hidden bg-gray-100 my-4">
                      <img
                        src={post.images[0].image_url}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="info">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <InfoCard
                icon={<Phone size={20} />}
                label="เบอร์โทรศัพท์"
                value={`${userData.phone.slice(0, 3)}-${userData.phone.slice(3,6)}-${userData.phone.slice(6)}`}
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

// --- Component InfoCard (พี่ต้องมีตัวนี้ด้วยนะครับ) ---
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
