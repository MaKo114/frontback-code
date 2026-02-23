import { useNavigate } from "react-router-dom";
import { User, Plus, MoreHorizontal} from "lucide-react";
import { Avatar, AvatarFallback } from "../../components/ui/avatar";
import Title from "../../titles/Title";

const mockPosts = [
  {
    id: 1,
    author: "นมศักดิ์ มาโล",
    content: "ค่าเลลหมิ๊มครั้ง อยากเช่นน้าแนน อยากค่ายลลลอะจะไร้กืๆครั้ง ให้หมอนมอง สนใจทักแชทมาก็ได้",
  },
  {
    id: 2,
    author: "นมศักดิ์ มาโล",
    content: "ค่าเลลหมิ๊มครั้ง อยากเช่นน้าแนน อยากค่ายลลลอะจะไร้กืๆครั้ง ให้หมอนมอง สนใจทักแชทมาก็ได้",
  },
];

const MyPosts = () => {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-background">
      <Title/>
      {/* Cover & Profile Section */}
      <div className="mx-auto max-w-2xl">
        {/* Cover photo */}
        <div className="relative h-36 bg-gradient-to-r from-amber-300 to-orange-300">
        </div>

        {/* Avatar & Info */}
        <div className="relative px-4 pb-4">
          <div className="-mt-10 flex items-end justify-between">
            <div className="flex items-end gap-3">
              <Avatar className="h-20 w-20 border-4 border-background shadow-md">
                <AvatarFallback className="bg-muted text-muted-foreground">
                  <User size={36} />
                </AvatarFallback>
              </Avatar>
              <p className="mb-1 text-base font-bold text-foreground">นมศักดิ์ มาโล</p>
            </div>
            <div className="flex items-center gap-2 pb-1">
              <button className="flex items-center gap-1 rounded-full border border-amber-400 bg-white px-4 py-1.5 text-xs font-semibold text-amber-600 shadow-sm hover:bg-amber-50 transition">
                <Plus size={14} />
                เพิ่มโพส
              </button>
              <button
                onClick={() => navigate("/edit-profile")}
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
          {mockPosts.map((post) => (
            <div key={post.id} className="rounded-xl border border-input bg-card p-4 shadow-sm">
              {/* Post header */}
              <div className="mb-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10 border-2 border-muted">
                    <AvatarFallback className="bg-muted text-muted-foreground">
                      <User size={20} />
                    </AvatarFallback>
                  </Avatar>
                  <p className="text-sm font-semibold text-foreground">{post.author}</p>
                </div>
                <button className="text-muted-foreground hover:text-foreground transition">
                  <MoreHorizontal size={20} />
                </button>
              </div>

              {/* Content */}
              <p className="mb-3 text-sm text-foreground leading-relaxed">{post.content}</p>

              {/* Image placeholder */}
              <div className="h-52 rounded-lg bg-amber-100" />
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};

export default MyPosts;
