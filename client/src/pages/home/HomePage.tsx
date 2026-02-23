import { useState } from "react";
import { User, Search, Heart, MoreHorizontal, Pencil } from "lucide-react";
import { Avatar, AvatarFallback } from "../../components/ui/avatar";
import Title from "../../titles/Title";

const categories = [
  "ทั้งหมด",
  "อุปกรณ์ไฟฟ้า",
  "เครื่องครัว",
  "อุปกรณ์กีฬา",
  "ของใช้ในบ้าน",
  "เครื่องมือวัด",
  "บรรจุภัณฑ์",
];

const mockPosts = [
  {
    id: 1,
    author: "นมศักดิ์ มาโล",
    date: "20 มกราคม 2569 เวลา 15:42 น.",
    content:
      "ค่าเลลหมิ๊มครั้ง อยากเช่นน้าแนน อยากค่ายลลลอะจะไร้กืๆครั้ง ให้หมอนมอง สนใจทักแชทมาก็ได้",
    liked: true,
    images: 4,
  },
  {
    id: 2,
    author: "นมศักดิ์ มาโล",
    date: "20 มกราคม 2569 เวลา 15:42 น.",
    content:
      "ค่าเลลหมิ๊มครั้ง อยากเช่นน้าแนน อยากค่ายลลลอะจะไร้กืๆครั้ง ให้หมอนมอง สนใจทักแชทมาก็ได้",
    liked: false,
    images: 4,
  },
];

const HomePage = () => {
  const [activeCategory, setActiveCategory] = useState("ทั้งหมด");
  const [searchQuery, setSearchQuery] = useState("");
  const [posts, setPosts] = useState(mockPosts);

  const toggleLiked = (id:any) => {
    setPosts((prevPosts) =>
      prevPosts.map((post) =>
        post.id === id
          ? { ...post, liked: !post.liked }
          : post
      )
    );
  };
  
  return (

  <div className="min-h-screen bg-background">
    <Title/>
    <div className="mx-auto flex max-w-6xl gap-6 px-6 py-6">
      
      {/* Sidebar */}
      <aside className="w-64 shrink-0">
        <div className="sticky top-6 rounded-xl border border-input bg-card p-4 shadow-sm">
          <p className="mb-3 text-sm font-semibold text-foreground">
            หมวดหมู่
          </p>

          <div className="flex flex-col gap-2">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`rounded-lg px-3 py-2 text-left text-sm font-medium transition ${
                  activeCategory === cat
                    ? "bg-amber-400 text-white shadow"
                    : "text-foreground hover:bg-muted"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
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

        {/* Posts */}
        <div className="space-y-6">
          {posts.map((post) => (
            <div
              key={post.id}
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
                      {post.author}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {post.date}
                    </p>
                  </div>
                </div>
                <button className="text-muted-foreground hover:text-foreground transition">
                  <MoreHorizontal size={20} />
                </button>
              </div>

              {/* Content */}
              <p className="mb-3 text-sm text-foreground leading-relaxed">
                {post.content}
              </p>

              <div className="mb-3 h-56 rounded-lg bg-amber-100" />

              <div className="flex items-center gap-3">
                <button className="transition hover:scale-110" onClick={()=>toggleLiked(post.id)}>
                  <Heart
                    size={22}
                    className={
                      post.liked
                        ? "fill-red-500 text-red-500"
                        : "text-muted-foreground"
                    }
                  />
                </button>
                <button className="rounded-lg bg-amber-400 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-amber-500 transition">
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
      className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-full bg-amber-400 px-5 py-3 font-semibold text-white shadow-lg hover:bg-amber-500 transition"
    >
      <Pencil size={18} />
      เขียนโพสต์
    </button>
  </div>
)
}
export default HomePage;
