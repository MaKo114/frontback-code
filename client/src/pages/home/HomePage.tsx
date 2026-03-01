import { useEffect, useState } from "react";
import { User, Search, Heart, Pencil, Grid2x2 } from "lucide-react";
import { Avatar, AvatarFallback } from "../../components/ui/avatar";
import Title from "../../titles/Title";
import PostDialog from "@/components/posts/PostDialog";
import MoreDot from "@/components/posts/MoreDot";
import { useNavigate } from "react-router-dom";
// import axios from "axios";
import useTestStore from "@/store/tokStore";
import CategoriesMenu from "@/components/categories/CategoriesMenu";
import usePostStore from "@/store/postStore";
// import { getAllPost } from "@/api/post";


const HomePage = () => {
  const fetchPosts = usePostStore((state)=> state.fetchPosts)
  const posts = usePostStore((state)=> state.posts)
  const [searchQuery, setSearchQuery] = useState("");
  const [isPostDialogOpen, setIsPostDialogOpen] = useState(false);
  // const [posts, setPosts] = useState([]);
  const navigate = useNavigate();
  const token: any = useTestStore((s) => s.token);


  useEffect(() => {
    if (token) {
      fetchPosts(token);
    }
  }, [token]);

  return (
    <div className="min-h-screen bg-background">
      <Title />
      <div className="mx-auto flex max-w-6xl gap-6 px-6 py-6">
        {/* Sidebar */}
        <aside className="w-64 shrink-0">
          <div className="sticky top-6 rounded-xl border border-input bg-card p-4 shadow-sm">
            <div className="flex gap-2 items-center mb-3">
              <Grid2x2 />
              <p className="text-sm font-semibold text-foreground">หมวดหมู่</p>
            </div>


          {/* Categories Menu */}
          <CategoriesMenu/>

          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1">
          {/* Search bar */}
          <div className="relative mb-6">
            <input
              type="text"
              placeholder="ค้นหา"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-lg border border-input bg-background py-2 pl-4 pr-10 text-sm outline-none focus:ring-2 focus:ring-amber-400"
            />
            <Search
              size={18}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
            />
          </div>

          <div className="space-y-6">
            {posts.map((post: any) => (
              <div
                key={post.post_id}
                className="rounded-xl border border-input bg-card p-4 shadow-sm"
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

                  <MoreDot />
                </div>

                {/* Content */}
                <p className="mb-3 text-sm text-foreground leading-relaxed">
                  {post.title} 
                  {post.description}
                </p>

                {/* Images */}
                {post.images?.length > 0 && (
                  <div className="mb-3 h-56 rounded-lg overflow-hidden">
                    {post.images.map((img: any) => (
                      <img
                        key={img.image_id}
                        src={img.image_url}
                        alt=""
                        className="h-full w-full object-cover rounded-lg mb-2"
                      />
                    ))}
                  </div>
                )}

                {/* Footer */}
                <div className="flex items-center gap-3">
                  <button className="transition hover:scale-110">
                    <Heart size={22} className="text-muted-foreground" />
                  </button>

                  <button
                    className="rounded-lg bg-amber-400 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-amber-500 transition"
                    onClick={() => navigate("chat")}
                  >
                    แชท
                  </button>
                </div>
              </div>
            ))}
          </div>
        </main>
      </div>

      {/* Floating Button */}
      <button
        onClick={() => setIsPostDialogOpen(true)}
        className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-full bg-amber-400 px-5 py-3 font-semibold text-white shadow-lg hover:bg-amber-500 transition"
      >
        <Pencil size={18} />
        เขียนโพสต์
      </button>

      <PostDialog
        open={isPostDialogOpen}
        onOpenChange={setIsPostDialogOpen}
      />
    </div>
  );
};
export default HomePage;