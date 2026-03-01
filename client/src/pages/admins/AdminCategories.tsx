import { useEffect, useState } from "react";
import useTestStore from "@/store/tokStore";
import { getCategories, createCategory, deleteCategory, updateCategory } from "@/api/category";

interface Category {
  category_id: number;
  category_name: string;
}

const AdminCategories = () => {
  const token = useTestStore((state) => state.token);
  const [categories, setCategories] = useState<Category[]>([]);
  const [newCategory, setNewCategory] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingName, setEditingName] = useState("");

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setIsLoading(true);
      const res = await getCategories();
      setCategories(res.data.data);
    } catch (err) {
      console.error(err);
      alert("ไม่สามารถดึงข้อมูลหมวดหมู่ได้");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAdd = async () => {
    const trimmed = newCategory.trim();
    if (!trimmed) return;

    try {
      if (!token) return;
      await createCategory(token, { category_name: trimmed });
      setNewCategory("");
      fetchCategories();
      alert("เพิ่มหมวดหมู่สำเร็จ");
    } catch (err: any) {
      console.error(err);
      alert(err.response?.data?.error || "เกิดข้อผิดพลาด");
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("คุณแน่ใจหรือไม่ว่าต้องการลบหมวดหมู่นี้?")) return;

    try {
      if (!token) return;
      await deleteCategory(token, id);
      fetchCategories();
      alert("ลบหมวดหมู่สำเร็จ");
    } catch (err: any) {
      console.error(err);
      alert(err.response?.data?.error || "เกิดข้อผิดพลาด");
    }
  };

  const handleUpdate = async (id: number) => {
    const trimmed = editingName.trim();
    if (!trimmed) return;

    try {
      if (!token) return;
      await updateCategory(token, id, { category_name: trimmed });
      setEditingId(null);
      fetchCategories();
      alert("แก้ไขหมวดหมู่สำเร็จ");
    } catch (err: any) {
      console.error(err);
      alert(err.response?.data?.error || "เกิดข้อผิดพลาด");
    }
  };

  const startEditing = (category: Category) => {
    setEditingId(category.category_id);
    setEditingName(category.category_name);
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="flex">
        <main className="flex-1 p-8">
          <h1 className="text-2xl font-bold text-gray-800 mb-6">จัดการหมวดหมู่</h1>

          <div className="bg-white rounded-lg shadow p-6">
            {/* Add Category */}
            <div className="flex items-center gap-3 mb-6">
              <span className="text-gray-700 font-medium whitespace-nowrap">เพิ่มหมวดหมู่</span>
              <input
                type="text"
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAdd()}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                placeholder="ชื่อหมวดหมู่"
              />
              <button
                onClick={handleAdd}
                className="px-6 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors font-medium"
              >
                บันทึก
              </button>
            </div>

            {/* Category List */}
            {isLoading ? (
              <div className="text-center py-12 text-gray-500">กำลังโหลด...</div>
            ) : (
              <div className="divide-y divide-gray-200">
                {categories.map((cat) => (
                  <div key={cat.category_id} className="flex items-center justify-between py-4 px-2">
                    {editingId === cat.category_id ? (
                      <div className="flex-1 flex gap-2 items-center">
                        <input
                          type="text"
                          value={editingName}
                          onChange={(e) => setEditingName(e.target.value)}
                          className="flex-1 px-3 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-orange-500"
                        />
                        <button
                          onClick={() => handleUpdate(cat.category_id)}
                          className="px-3 py-1 bg-green-500 text-white text-sm rounded hover:bg-green-600"
                        >
                          บันทึก
                        </button>
                        <button
                          onClick={() => setEditingId(null)}
                          className="px-3 py-1 bg-gray-500 text-white text-sm rounded hover:bg-gray-600"
                        >
                          ยกเลิก
                        </button>
                      </div>
                    ) : (
                      <>
                        <span className="text-gray-700">{cat.category_name}</span>
                        <div className="flex gap-2">
                          <button
                            onClick={() => startEditing(cat)}
                            className="px-4 py-1.5 bg-blue-500 text-white text-sm rounded-lg hover:bg-blue-600 transition-colors"
                          >
                            แก้ไข
                          </button>
                          <button
                            onClick={() => handleDelete(cat.category_id)}
                            className="px-4 py-1.5 bg-red-500 text-white text-sm rounded-lg hover:bg-red-600 transition-colors"
                          >
                            ลบ
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>
            )}

            {!isLoading && categories.length === 0 && (
              <div className="text-center py-12 text-gray-500">ยังไม่มีหมวดหมู่</div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminCategories;