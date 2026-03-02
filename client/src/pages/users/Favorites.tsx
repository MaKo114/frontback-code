import { useEffect, useState } from "react";
import useTestStore from "@/store/tokStore";
import { getMyFavoritesApi, removeFavoriteApi } from "@/api/post";
import { Heart, User, Clock, MessageCircle } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import ImageCard from "@/components/posts/ImageCard";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

const Favorites = () => {
  const [favorites, setFavorites] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const token = useTestStore((state) => state.token);
  const navigate = useNavigate();

  useEffect(() => {
    if (token) {
      loadFavorites();
    }
  }, [token]);

  const loadFavorites = async () => {
    try {
      setLoading(true);
      const res = await getMyFavoritesApi(token!);
      setFavorites(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveFavorite = async (postId: number) => {
    try {
      await removeFavoriteApi(token!, postId);
      setFavorites(prev => prev.filter(f => f.post_id !== postId));
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <div className="flex items-center gap-4 mb-8">
        <div className="bg-red-100 p-3 rounded-2xl shadow-lg shadow-red-50">
          <Heart className="text-red-500 fill-red-500" size={28} />
        </div>
        <h1 className="text-3xl font-bold text-foreground tracking-tight">รายการที่ถูกใจ</h1>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-24 space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500"></div>
          <p className="text-muted-foreground font-medium">กำลังโหลดรายการโปรดของคุณ...</p>
        </div>
      ) : favorites.length === 0 ? (
        <div className="text-center py-24 bg-card rounded-2xl border border-dashed border-input shadow-sm">
          <div className="bg-red-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
            <Heart className="text-red-300" size={36} />
          </div>
          <h3 className="text-2xl font-bold text-foreground mb-2">ยังไม่มีรายการที่ถูกใจ</h3>
          <p className="text-muted-foreground max-w-sm mx-auto mb-8 font-medium">กดปุ่มหัวใจในหน้าหลักเพื่อบันทึกสิ่งของที่คุณสนใจไว้ดูภายหลัง</p>
          <Button 
            onClick={() => navigate("/user")}
            className="bg-amber-400 hover:bg-amber-500 text-white font-bold px-8 h-12 rounded-xl"
          >
            ไปหน้าหลัก
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {favorites.map((post) => (
            <div
              key={post.post_id}
              className="bg-card border border-input rounded-2xl p-5 shadow-sm hover:shadow-lg transition-all flex flex-col group overflow-hidden"
            >
              <div className="mb-4 relative rounded-xl overflow-hidden">
                <ImageCard images={post.images} />
                <button 
                  onClick={() => handleRemoveFavorite(post.post_id)}
                  className="absolute top-2 right-2 z-10 p-2 rounded-full bg-white/90 text-red-500 shadow-sm hover:bg-red-50 transition"
                  title="ลบออกจากรายการโปรด"
                >
                  <Heart size={20} fill="currentColor" />
                </button>
              </div>

              <div className="mb-4">
                <div className="flex items-center gap-2 mb-2">
                  <Avatar className="h-6 w-6">
                    <AvatarFallback className="text-[10px] font-bold">
                      {post.first_name[0]}
                    </AvatarFallback>
                  </Avatar>
                  <p className="text-xs font-bold text-muted-foreground">{post.first_name} {post.last_name}</p>
                </div>
                <h3 className="font-bold text-foreground leading-tight group-hover:text-amber-500 transition-colors line-clamp-1">{post.title}</h3>
                <p className="text-xs text-muted-foreground mt-1 line-clamp-2 leading-relaxed h-8">
                  {post.description}
                </p>
              </div>

              <div className="flex items-center justify-between mt-auto pt-4 border-t border-muted">
                <span className={`text-[10px] px-2.5 py-1 rounded-full font-bold uppercase ${
                  post.status === 'OPEN' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                }`}>
                  {post.status === 'OPEN' ? 'พร้อมแลก' : 'ปิดแล้ว'}
                </span>
                
                <Button 
                  size="sm" 
                  variant="ghost"
                  onClick={() => navigate(`/user/chat?post_id=${post.post_id}`)}
                  className="text-amber-500 hover:text-amber-600 hover:bg-amber-50 font-bold gap-1.5 h-9"
                >
                  <MessageCircle size={16} />
                  แชทเลย
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Favorites;
