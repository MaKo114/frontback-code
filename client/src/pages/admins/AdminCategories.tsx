import { useState } from "react";

const initialCategories = [
  "เครื่องใช้ไฟฟ้า",
  "อาหาร",
  "เทคโนโลยี",
  "ท่องเที่ยว",
  "หนังสือ",
];

const AdminCategories = () => {
  const [categories, setCategories] = useState<string[]>(initialCategories);
  const [newCategory, setNewCategory] = useState("");

  const handleAdd = () => {
    const trimmed = newCategory.trim();
    if (trimmed && !categories.includes(trimmed)) {
      setCategories([...categories, trimmed]);
      setNewCategory("");
    }
  };

  const handleDelete = (index: number) => {
    setCategories(categories.filter((_, i) => i !== index));
  };

  return (
    <div className="min-h-screen bg-gray-100">


      <div className="flex">

        <main className="flex-1 p-8">
          <h1 className="text-2xl font-bold text-gray-800 mb-6">หมวดหมู่</h1>

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
            <div className="divide-y divide-gray-200">
              {categories.map((cat, index) => (
                <div key={index} className="flex items-center justify-between py-4 px-2">
                  <span className="text-gray-700">{cat}</span>
                  <button
                    onClick={() => handleDelete(index)}
                    className="px-4 py-1.5 bg-red-500 text-white text-sm rounded-lg hover:bg-red-600 transition-colors"
                  >
                    ลบ
                  </button>
                </div>
              ))}
            </div>

            {categories.length === 0 && (
              <div className="text-center py-12 text-gray-500">ยังไม่มีหมวดหมู่</div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminCategories;