import { useEffect, useState } from "react";
import { User, Search, Heart, Pencil, Grid2x2, CheckCircle, Clock, XCircle } from "lucide-react";
import { Avatar, AvatarFallback } from "../../components/ui/avatar";
import Title from "../../titles/Title";
import PostDialog from "@/components/posts/PostDialog";
import MoreDot from "@/components/posts/MoreDot";
import { useNavigate } from "react-router-dom";
import useTestStore from "@/store/tokStore";
import CategoriesMenu from "@/components/categories/CategoriesMenu";
import usePostStore from "@/store/postStore";
import ImageCard from "@/components/posts/ImageCard";
import ReportDialog from "@/components/posts/ReportDialog";
import { addFavoriteApi, removeFavoriteApi, getMyFavoritesApi, requestExchangeApi } from "@/api/post";

const HomePage = () => {
  const fetchPosts = usePostStore((state) => state.fetchPosts);
  const posts = usePostStore((state) => state.posts);
  const [searchQuery, setSearchQuery] = useState("");
  const [isPostDialogOpen, setIsPostDialogOpen] = useState(false);
  const [reportPostId, setReportPostId] = useState<number | null>(null);
  const [favorites, setFavorites] = useState<number[]>([]);
  const navigate = useNavigate();
  const token: any = useTestStore((s) => s.token);
  const currentUser = useTestStore((s) => s.user);

  useEffect(() => {
    if (token) {
      fetchPosts(token);
      loadFavorites();
    }
  }, [token]);

  const loadFavorites = async () => {
    if (!token) return;
    try {
      const res = await getMyFavoritesApi(token);
      const favIds = res.data.data.map((fav: any) => fav.post_id);
      setFavorites(favIds);
    } catch (err) {
      console.error(err);
    }
  };

  const toggleFavorite = async (postId: number) => {
    if (!token) return;
    const isFav = favorites.includes(postId);
    try {
      if (isFav) {
        await removeFavoriteApi(token, postId);
        setFavorites(favorites.filter(id => id !== postId));
      } else {
        await addFavoriteApi(token, postId);
        setFavorites([...favorites, postId]);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleExchangeRequest = async (postId: number) => {
    if (!token) return;
    if (confirm("คุณต้องการส่งคำขอแลกเปลี่ยนสิ่งของสำหรับโพสต์นี้ใช่หรือไม่?")) {
      try {
        await requestExchangeApi(token, postId);
        alert("ส่งคำขอแลกเปลี่ยนสำเร็จ");
      } catch (err: any) {
        console.error(err);
        alert(err.response?.data?.error || "ส่งคำขอแลกเปลี่ยนไม่สำเร็จ");
      }
    }
  };

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-6">
      <Title />
      <div className="mx-auto flex max-w-6xl gap-6 px-4 md:px-6 py-6">
        {/* Sidebar */}
        <aside className="hidden md:block w-64 shrink-0">
          <div className="sticky top-20 rounded-xl border border-input bg-card p-4 shadow-sm">
            <div className="flex gap-2 items-center mb-3">
              <Grid2x2 size={18} />
              <p className="text-sm font-semibold text-foreground">หมวดหมู่</p>
            </div>
            <CategoriesMenu />
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1">
          {/* Search bar */}
          <div className="relative mb-6">
            <input
              type="text"
              placeholder="ค้นหาสิ่งของที่คุณสนใจ..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-lg border border-input bg-background py-2.5 pl-4 pr-10 text-sm outline-none focus:ring-2 focus:ring-amber-400 shadow-sm"
            />
            <Search
              size={18}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
            />
          </div>

          <div className="space-y-6">
            {posts.map((post: any) => {
              const isOwner = currentUser?.student_id === post.student_id;
              const isFavorite = favorites.includes(post.post_id);
              
              return (
                <div
                  key={post.post_id}
                  className="rounded-xl border border-input bg-card p-4 shadow-sm hover:shadow-md transition-shadow"
                >
                  {/* Post header */}
                  <div className="mb-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10 border-2 border-muted">
                        <AvatarFallback className="bg-muted text-muted-foreground">
                          <User size={20} />
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-semibold text-foreground">
                          {`${post.first_name} ${post.last_name}`}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {post.created_at_th}
                        </p>
                      </div>
                    </div>

                    <MoreDot 
                      post_id={post.post_id} 
                      student_id={post.student_id}
                      onReportClick={() => setReportPostId(post.post_id)}
                    />
                  </div>

                  {/* Content */}
                  <div className="mb-3">
                    <h3 className="font-bold text-foreground mb-1">{post.title}</h3>
                    <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">
                      {post.description}
                    </p>
                  </div>

                  {/* Images */}
                  {post.images?.length > 0 && (
                    <div className="mb-4">
                      <ImageCard images={post.images} />
                    </div>
                  )}

                  {/* Footer */}
                  <div className="flex items-center justify-between border-t border-muted pt-3">
                    <div className="flex items-center gap-4">
                      <button 
                        onClick={() => toggleFavorite(post.post_id)}
                        className={`transition hover:scale-110 flex items-center gap-1 text-sm ${isFavorite ? "text-red-500" : "text-muted-foreground"}`}
                      >
                        <Heart size={22} fill={isFavorite ? "currentColor" : "none"} />
                        <span className="hidden sm:inline">{isFavorite ? "ถูกใจแล้ว" : "ถูกใจ"}</span>
                      </button>

                      {!isOwner && (
                        <button
                          onClick={() => handleExchangeRequest(post.post_id)}
                          className="flex items-center gap-1 text-muted-foreground hover:text-amber-500 text-sm transition"
                        >
                          <Clock size={20} />
                          <span className="hidden sm:inline">ขอแลกเปลี่ยน</span>
                        </button>
                      )}
                    </div>

                    <button
                      className="rounded-lg bg-amber-400 px-6 py-2 text-sm font-semibold text-white shadow-sm hover:bg-amber-500 transition-all active:scale-95"
                      onClick={() => navigate(`/user/chat?post_id=${post.post_id}`)}
                    >
                      แชท
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </main>
      </div>

      {/* Floating Button */}
      <button
        onClick={() => setIsPostDialogOpen(true)}
        className="fixed bottom-6 right-6 z-40 flex items-center gap-2 rounded-full bg-amber-400 px-6 py-3.5 font-bold text-white shadow-lg hover:bg-amber-500 hover:scale-105 active:scale-95 transition-all shadow-amber-200"
      >
        <Pencil size={20} />
        <span className="text-lg">แลกเปลี่ยนของกัน!</span>
      </button>

      <PostDialog open={isPostDialogOpen} onOpenChange={setIsPostDialogOpen} />
      
      {reportPostId && (
        <ReportDialog 
          post_id={reportPostId} 
          open={!!reportPostId} 
          onOpenChange={(open) => !open && setReportPostId(null)} 
        />
      )}
    </div>
  );
};
export default HomePage;
