import usePostStore from "@/store/postStore";
import useTestStore from "@/store/tokStore";
import { useEffect, useState } from "react";

const CategoriesMenu = () => {
  const fetchPostByCategory = usePostStore(
    (state) => state.fetchPostByCategory
  );
  const fetchPosts = usePostStore((state) => state.fetchPosts);
  const token = useTestStore((state)=> state.token)

  const [activeCategory, setActiveCategory] = useState("ทั้งหมด");

  const fetchCategories = useTestStore((state) => state.fetchCategories);
  const categories = useTestStore((state) => state.categories);

  useEffect(() => {
    fetchCategories();
  }, []);

  return (
    <div className="flex flex-col gap-2">
      {/* 🔥 ปุ่มทั้งหมด */}
      <button
        onClick={() => {
          setActiveCategory("ทั้งหมด");
          fetchPosts(token); // ดึงโพสทั้งหมด
        }}
        className={`rounded-lg px-3 py-2 text-left text-sm font-medium transition ${
          activeCategory === "ทั้งหมด"
            ? "bg-amber-400 text-white shadow"
            : "text-foreground hover:bg-muted"
        }`}
      >
        ทั้งหมด
      </button>

      {/* 🔥 หมวดหมู่ปกติ */}
      {categories.map((cat) => (
        <button
          key={cat.category_id}
          onClick={() => {
            setActiveCategory(cat.category_name);
            fetchPostByCategory(cat.category_id);
          }}
          className={`rounded-lg px-3 py-2 text-left text-sm font-medium transition ${
            activeCategory === cat.category_name
              ? "bg-amber-400 text-white shadow"
              : "text-foreground hover:bg-muted"
          }`}
        >
          {cat.category_name}
        </button>
      ))}
    </div>
  );
};

export default CategoriesMenu;