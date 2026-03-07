import usePostStore from "@/store/postStore";
import useTestStore from "@/store/tokStore";
import { useEffect, useState } from "react";
import { Hash, Layers } from "lucide-react";

const CategoriesMenu = () => {
  const fetchPostByCategory = usePostStore((state) => state.fetchPostByCategory);
  const fetchPosts = usePostStore((state) => state.fetchPosts);
  const token = useTestStore((state) => state.token);

  const [activeCategory, setActiveCategory] = useState("ทั้งหมด");

  const fetchCategories = useTestStore((state) => state.fetchCategories);
  const categories = useTestStore((state) => state.categories);

  useEffect(() => {
    fetchCategories();
  }, []);

  return (
    <div className="flex flex-col gap-1.5 font-['Inter',sans-serif]">
      {/* --- ปุ่มทั้งหมด --- */}
      <button
        onClick={() => {
          setActiveCategory("ทั้งหมด");
          fetchPosts(token);
        }}
        className={`group relative flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-bold transition-all duration-200 ${
          activeCategory === "ทั้งหมด"
            ? "bg-linear-to-r from-[#FFB800] to-[#FF5800] text-white shadow-md shadow-orange-100 translate-x-1"
            : "text-gray-500 hover:bg-orange-50 hover:text-[#FF5800]"
        }`}
      >
        <Layers size={18} className={activeCategory === "ทั้งหมด" ? "text-white" : "text-gray-400 group-hover:text-[#FF5800]"} />
        <span className="relative z-10">ดูทั้งหมด</span>
        
        {activeCategory === "ทั้งหมด" && (
          <div className="absolute left-0 w-1 h-6 bg-white rounded-r-full shadow-[2px_0_8px_rgba(255,255,255,0.5)]" />
        )}
      </button>

      <div className="my-2 border-t border-gray-50" />

      {/* --- หมวดหมู่จาก API --- */}
      <div className="flex flex-col gap-1">
        {categories.map((cat) => (
          <button
            key={cat.category_id}
            onClick={() => {
              setActiveCategory(cat.category_name);
              fetchPostByCategory(cat.category_id);
            }}
            className={`group relative flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-bold transition-all duration-200 ${
              activeCategory === cat.category_name
                ? "bg-linear-to-r from-[#FFB800] to-[#FF5800] text-white shadow-md shadow-orange-100 translate-x-1"
                : "text-gray-500 hover:bg-orange-50 hover:text-[#FF5800]"
            }`}
          >
            <Hash 
              size={18} 
              className={activeCategory === cat.category_name ? "text-white" : "text-gray-300 group-hover:text-[#FF5800]/50"} 
            />
            <span className="truncate">{cat.category_name}</span>

            {activeCategory === cat.category_name && (
              <div className="absolute left-0 w-1 h-6 bg-white rounded-r-full shadow-[2px_0_8px_rgba(255,255,255,0.5)]" />
            )}
          </button>
        ))}
      </div>

      {/* กรณีไม่มีข้อมูล */}
      {categories.length === 0 && (
        <p className="px-4 py-3 text-xs text-gray-400 italic">ไม่มีหมวดหมู่</p>
      )}
    </div>
  );
};

export default CategoriesMenu;