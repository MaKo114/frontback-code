import { useEffect, useState } from "react";
import { Search, Pencil } from "lucide-react";
import Title from "../../titles/Title";
import PostDialog from "@/components/posts/PostDialog";
// import useTestStore from "@/store/tokStore";
import usePostStore from "@/store/postStore";
import PostCard from "@/components/posts/PostCard";
import SideBar from "@/layouts/SideBar";
import useTestStore from "@/store/tokStore";

const HomePage = () => {
  const fetchPosts = usePostStore((state) => state.fetchPosts);
  const posts = usePostStore((state) => state.posts);
  const getUserInformation = useTestStore((state) => state.getUserInformation);
  const [searchQuery, setSearchQuery] = useState("");
  const [isPostDialogOpen, setIsPostDialogOpen] = useState(false);


  useEffect(() => {
    fetchPosts();
    getUserInformation();
    // poll ทุก 10 วินาที
    const interval = setInterval(() => {
      fetchPosts();
    }, 10000);

    return () => clearInterval(interval); // cleanup
  }, []);

  const filteredPosts = posts.filter(
    (post: any) =>
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.description.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <div className="min-h-screen bg-[#F8F9FA] font-['Inter',sans-serif]">
      <Title />

      <div className="mx-auto flex max-w-6xl gap-8 px-4 py-8">
        <SideBar />

        <main className="flex-1 max-w-2xl mx-auto lg:mx-0">
          {/* Search bar */}
          <div className="relative mb-8 group">
            <input
              type="text"
              placeholder="ค้นหาสิ่งที่น่าสนใจ..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-4xl border-none bg-white py-4 pl-12 pr-6 text-sm shadow-sm outline-none ring-1 ring-gray-100 focus:ring-2 focus:ring-[#FF5800]/50 transition-all"
            />
            <Search
              size={20}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#FF5800] transition-colors"
            />
          </div>

          {/* Posts List */}
          <div className="space-y-6" >
            {filteredPosts.length > 0 ? (
              filteredPosts.map((post: any) =>
                post.status === "CLOSED" ? null : (
                  <PostCard key={post.post_id} post={post} />
                ),
              )
            ) : (
              <div className="text-center py-20 bg-white rounded-[24px] border border-dashed border-gray-200">
                <Search size={30} className="mx-auto mb-4 text-gray-300" />
                <p className="text-gray-500 font-bold">
                  ไม่พบโพสต์ที่คุณกำลังมองหา
                </p>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Floating Action Button */}
      <button
        onClick={() => setIsPostDialogOpen(true)}
        className="fixed bottom-8 right-8 z-50 flex items-center gap-3 rounded-full bg-linear-to-r from-[#FFB800] to-[#FF5800] px-6 py-4 font-black text-white shadow-lg hover:scale-105 active:scale-95 transition-all group"
      >
        <div className="bg-white/20 p-1.5 rounded-lg group-hover:rotate-12 transition-transform">
          <Pencil size={18} />
        </div>
        <span className="tracking-tight">เขียนโพสต์ใหม่</span>
      </button>

      <PostDialog open={isPostDialogOpen} onOpenChange={setIsPostDialogOpen} />
    </div>
  );
};

export default HomePage;
