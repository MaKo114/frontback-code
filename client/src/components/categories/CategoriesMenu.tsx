import usePostStore from "@/store/postStore";
import useTestStore from "@/store/tokStore";
import { useEffect, useState, useRef } from "react";
import { Hash, Layers, Plus } from "lucide-react";

const CategoriesMenu = () => {
  const fetchPostByCategory = usePostStore((state) => state.fetchPostByCategory);
  const fetchPosts = usePostStore((state) => state.fetchPosts);
  
  // 🟢 1. เพิ่มฟังก์ชัน setActiveCategoryId จาก Store
  const setActiveCategoryId = usePostStore((state) => state.setActiveCategoryId); 
  
  const token = useTestStore((state) => state.token);

  type Category = {
    category_id:number;
    category_name:string;
  };
  const [activeCategory, setActiveCategory] = useState("ทั้งหมด");
  const [showMore, setShowMore] = useState(false);
  const [displayCategories, setDisplayCategories] = useState<Category[]>([]);

  const fetchCategories = useTestStore((state) => state.fetchCategories);
  const categories = useTestStore((state) => state.categories);
  
  useEffect(() => {
    fetchCategories();
  }, []);
  
  useEffect(() => {
    setDisplayCategories(categories);
  }, [categories]);
  
  const visibleCategories = displayCategories.slice(0,5);
  const hiddenCategories = displayCategories.slice(5);
  
  const handleSelectCate = (cat: Category) => {
    setActiveCategory(cat.category_name);
    // 🟢 2. เซ็ตค่าลง Store เมื่อเลือกหมวดหมู่จาก Dropdown
    setActiveCategoryId(cat.category_id); 
    
    fetchPostByCategory(cat.category_id);
    setShowMore(false);
    
    setDisplayCategories((prev) => {
      const filterd = prev.filter((c) => c.category_id !== cat.category_id);
      return [cat, ...filterd];
    })
  };

  const dropdownRef = useRef<HTMLDivElement | null >(null);
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowMore(false);
      }
    };
    
    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);
  
  return (
    <div className="flex flex-col gap-1.5 font-['Inter',sans-serif]">
      {/* --- ปุ่มทั้งหมด --- */}
      <button
        onClick={() => {
          setActiveCategory("ทั้งหมด");
          // 🟢 3. เคลียร์ค่าใน Store เมื่อกดดูทั้งหมด
          setActiveCategoryId(null); 
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
        {visibleCategories.map((cat) => (
          <button
            key={cat.category_id}
            onClick={() => {
              setActiveCategory(cat.category_name);
              // 🟢 4. เซ็ตค่าลง Store เมื่อกดเลือกหมวดหมู่ปกติ
              setActiveCategoryId(cat.category_id); 
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
        
        { /*ปุ่มบวก*/ }
        {hiddenCategories.length > 0 && (
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setShowMore(!showMore)}
              className="flex items-center justify-center w-full rounded-xl px-4 py-2 text-gray-400 hover:bg-orange-50 hover:text-[#FF5800] transition"
            >
              <Plus size={20} />
            </button>
            
            { /* DropDown */ }
            {showMore && (
              <div className="absolute left-0 right-0 mt-1 max-h-48 overflow-y-auto rounded-xl border bg-white shadow-lg z-10">
                {hiddenCategories.map((cat) => (
                  <button
                    key={cat.category_id}
                    onClick={() => handleSelectCate(cat)}
                    className="flex items-center gap-3 w-full px-4 py-2 text-sm text-gray-500 hover:bg-orange-50 hover:text-[#FF5800]"
                  >
                    <Hash size={16} />
                    {cat.category_name}
                  </button>
                ))}
              </div>
            )}

          </div>
        )}
      </div>

      {/* กรณีไม่มีข้อมูล */}
      {categories.length === 0 && (
        <p className="px-4 py-3 text-xs text-gray-400 italic">ไม่มีหมวดหมู่</p>
      )}
    </div>
  );
};

export default CategoriesMenu;