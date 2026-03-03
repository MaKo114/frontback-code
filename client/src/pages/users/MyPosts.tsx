import { useNavigate } from "react-router-dom";
import { User, Plus, MoreHorizontal } from "lucide-react";
import { Avatar, AvatarFallback } from "../../components/ui/avatar";
import Title from "../../titles/Title";
import usePostStore from "@/store/postStore";
import { useEffect, useState } from "react";
import PostDialog from "@/components/posts/PostDialog";

const MyPosts = () => {
  const navigate = useNavigate();
  const fetchMyPosts = usePostStore((state) => state.fetchMyPosts);
  const myPosts = usePostStore((state) => state.myPosts);
  const [ isPostDialogOpen, setIsPostDialogOpen] = useState(false);

  useEffect(() => {
    fetchMyPosts();
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Title />

      {/* Cover & Profile Section */}
      <div className="mx-auto max-w-2xl">
        <div className="relative h-36 bg-gradient-to-r from-amber-300 to-orange-300" />

        <div className="relative px-4 pb-4">
          <div className="-mt-10 flex items-end justify-between">
            <div className="flex items-end gap-3">
              <Avatar className="h-20 w-20 border-4 border-background shadow-md">
                <AvatarFallback>
                  <User size={36} />
                </AvatarFallback>
              </Avatar>

              {/* เอาชื่อจากโพสต์ตัวแรกมาโชว์ (ถ้ามี) */}
              <p className="mb-1 text-base font-bold text-foreground">
                {myPosts.length > 0
                  ? `${myPosts[0].first_name} ${myPosts[0].last_name}`
                  : "ผู้ใช้งาน"}
              </p>
            </div>

            <div className="flex items-center gap-2 pb-1">
              <button className="flex items-center gap-1 rounded-full border border-amber-400 bg-white px-4 py-1.5 text-xs font-semibold text-amber-600 shadow-sm hover:bg-amber-50 transition"
               onClick={() => setIsPostDialogOpen(true)}
              >
                <Plus size={14} />
                เพิ่มโพส
              </button>
                <PostDialog open={isPostDialogOpen} onOpenChange={setIsPostDialogOpen} />

              <button
                onClick={() => navigate("/user/edit-profile")}
                className="rounded-full bg-amber-400 px-4 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-amber-500 transition"
              >
                แก้ไขโปรไฟล์
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Posts list */}
      <main className="mx-auto max-w-2xl px-4 pb-8">
        <div className="space-y-4">
          {myPosts.map((post) => (
            <div
              key={post.post_id}   // ✅ แก้ตรงนี้
              className="rounded-xl border border-input bg-card p-4 shadow-sm"
            >
              {/* Post header */}
              <div className="mb-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10 border-2 border-muted">
                    <AvatarFallback>
                      <User size={20} />
                    </AvatarFallback>
                  </Avatar>

                  {/* ✅ ใช้ชื่อจริง */}
                  <p className="text-sm font-semibold text-foreground">
                    {post.first_name} {post.last_name}
                  </p>
                </div>

                <button className="text-muted-foreground hover:text-foreground transition">
                  <MoreHorizontal size={20} />
                </button>
              </div>

              {/* ✅ ใช้ description แทน content */}
              <p className="mb-3 text-sm text-foreground leading-relaxed">
                {post.description}
              </p>

              {/* ✅ แสดงรูปจริงแทน placeholder */}
              {post.images?.length > 0 && (
                <img
                  src={post.images[0].image_url}
                  alt={post.title}
                  className="h-52 w-full rounded-lg object-cover"
                />
              )}
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};

export default MyPosts;