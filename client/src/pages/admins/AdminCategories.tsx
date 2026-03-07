import { useEffect, useState } from "react";
import useTestStore from "@/store/tokStore";
import { getCategories, createCategory, deleteCategory, updateCategory } from "@/api/category";
import Title from "../../titles/Title";
import Swal from "sweetalert2";
import { Plus, Edit3, Trash2, Check, X, FolderPlus, Tag, Loader2, ChevronLeft, ChevronRight } from "lucide-react";

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
      const res = await getCategories(token);
      setCategories(res.data.data || []);
    } catch (err) {
      console.error(err);
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
      Swal.fire({
        icon: 'success',
        title: 'เพิ่มหมวดหมู่สำเร็จ',
        timer: 1500,
        showConfirmButton: false,
        borderRadius: "15px"
      });
    } catch (err: any) {
      Swal.fire("เกิดข้อผิดพลาด", err.response?.data?.error || "ไม่สามารถเพิ่มหมวดหมู่ได้", "error");
    }
  };

  const handleDelete = async (id: number) => {
    const result = await Swal.fire({
      title: "ยืนยันการลบ?",
      text: "การลบหมวดหมู่ส่งผลต่อโพสต์ที่ใช้งานหมวดหมู่นี้อยู่",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      confirmButtonText: "ลบเลย",
      cancelButtonText: "ยกเลิก",
      borderRadius: "15px",
    });

    if (result.isConfirmed) {
      try {
        if (!token) return;
        await deleteCategory(token, id);
        fetchCategories();
        Swal.fire({
          icon: 'success',
          title: 'ลบเรียบร้อย',
          timer: 1000,
          showConfirmButton: false
        });
      } catch (err: any) {
        Swal.fire("เกิดข้อผิดพลาด", err.response?.data?.error || "ไม่สามารถลบได้", "error");
      }
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
      Swal.fire({
        icon: 'success',
        title: 'แก้ไขสำเร็จ',
        timer: 1000,
        showConfirmButton: false
      });
    } catch (err: any) {
      Swal.fire("เกิดข้อผิดพลาด", err.response?.data?.error || "ไม่สามารถแก้ไขได้", "error");
    }
  };

  const startEditing = (category: Category) => {
    setEditingId(category.category_id);
    setEditingName(category.category_name);
  };

  { /* Pagination Calculation */ }
  const itemsPerPage = 5; //เอาไว้เปลี่ยนการจำกัดของ row
  const [currentPage, setCurrentPage] = useState(1);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentCategories = categories.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(categories.length / itemsPerPage);
  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(totalPages);
    }
  },[categories.length, totalPages]);
  
  return (
    <div className="space-y-6 font-['Inter',_sans-serif]">
      {/* Page Header */}
      <div>
        <Title />
        <h1 className="text-3xl font-black text-gray-900 tracking-tight">
          Category <span className="text-[#FF5800]">Management</span>
        </h1>
        <p className="text-gray-500 text-sm mt-1 font-medium">จัดการหมวดหมู่เนื้อหาภายในระบบ</p>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left: Add Category Form */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-[24px] shadow-sm border border-gray-100 p-6 sticky top-6">
            <div className="flex items-center gap-2 mb-4">
              <div className="p-2 bg-orange-50 text-[#FF5800] rounded-lg">
                <FolderPlus size={20} />
              </div>
              <h2 className="text-lg font-bold text-gray-800">เพิ่มหมวดหมู่ใหม่</h2>
            </div>
            <div className="space-y-4">
              <input
                type="text"
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAdd()}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-[#FF5800]/20 focus:border-[#FF5800] transition-all"
                placeholder="ระบุชื่อหมวดหมู่..."
              />
              <button
                onClick={handleAdd}
                disabled={!newCategory.trim()}
                className="w-full flex items-center justify-center gap-2 py-3 bg-[#FF5800] text-white rounded-xl font-bold hover:bg-[#E64F00] transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-orange-200"
              >
                <Plus size={18} />
                บันทึกข้อมูล
              </button>
            </div>
          </div>
        </div>

        {/* Right: Category List */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-[24px] shadow-sm border border-gray-100 overflow-hidden">
            { /* Navigation Footer */ }
            {categories.length > itemsPerPage && (
              <div className="px-6 py-4 bg-gray-50/50 border-t border-gray-100 flex items-center justify-between">
                <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                    Page {currentPage} of {totalPages}
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="p-1.5 rounded-lg border border-gray-200 bg-white text-gray-500 hover:text-[#FF5800] hover:border-[#FF5800] disabled:opacity-30 transition-all"
                  >
                    <ChevronLeft size={16}/>
                  </button>

                  { /* ปุ่มแสดงหน้า */ }
                  <div className="flex gap-1 px-1">
                    {Array.from({ length: totalPages }, (_,i) => i + 1).map((page) => (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={` w-7 h-7 rounded-lg text-xs font-black transition-all ${
                          currentPage === page
                          ? "bg-[#FF5800] text-white"
                          :"text-gray-400 hover:bg-white hover:text-gray-600"
                        }`}
                      >
                        {page}
                      </button>
                    ))}
                  </div>
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="p-1.5 rounded-lg border border-gray-200 bg-white text-gray-500 hover:text-[#FF5800] hover:border-[#FF5800] disabled:opacity-30 transition-all"
                  >
                    <ChevronRight size={16}/>
                  </button>
                </div>
            </div>
          )}
            <div className="px-6 py-5 border-b border-gray-50 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Tag size={18} className="text-gray-400" />
                <h3 className="font-bold text-gray-700">หมวดหมู่ทั้งหมด</h3>
              </div>
              <span className="text-xs font-bold text-gray-400 bg-gray-50 px-2 py-1 rounded-md">
                {categories.length} รายการ
              </span>
            </div>

            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-20 text-gray-400 gap-3">
                <Loader2 className="animate-spin" size={32} />
                <p className="font-medium">กำลังโหลดข้อมูล...</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-50">
                {currentCategories.map((cat) => (
                  <div key={cat.category_id} className="group flex items-center justify-between py-4 px-6 hover:bg-orange-50/30 transition-all">
                    {editingId === cat.category_id ? (
                      <div className="flex-1 flex gap-2 items-center animate-in fade-in slide-in-from-left-2">
                        <input
                          type="text"
                          autoFocus
                          value={editingName}
                          onChange={(e) => setEditingName(e.target.value)}
                          onKeyDown={(e) => e.key === "Enter" && handleUpdate(cat.category_id)}
                          className="flex-1 px-3 py-2 bg-white border border-[#FF5800] rounded-lg outline-none shadow-sm text-sm"
                        />
                        <button
                          onClick={() => handleUpdate(cat.category_id)}
                          className="p-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors"
                        >
                          <Check size={16} />
                        </button>
                        <button
                          onClick={() => setEditingId(null)}
                          className="p-2 bg-gray-100 text-gray-500 rounded-lg hover:bg-gray-200 transition-colors"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    ) : (
                      <>
                        <div className="flex items-center gap-3">
                          <div className="w-2 h-2 rounded-full bg-orange-300 group-hover:bg-[#FF5800] transition-colors" />
                          <span className="text-gray-700 font-bold group-hover:text-gray-900 transition-colors">
                            {cat.category_name}
                          </span>
                        </div>
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => startEditing(cat)}
                            className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                          >
                            <Edit3 size={16} />
                          </button>
                          <button
                            onClick={() => handleDelete(cat.category_id)}
                            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                ))}
                
                {categories.length === 0 && (
                  <div className="text-center py-20">
                    <div className="bg-gray-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Tag size={24} className="text-gray-300" />
                    </div>
                    <p className="text-gray-400 font-medium">ยังไม่มีข้อมูลหมวดหมู่ในระบบ</p>
                  </div>
                )}
              </div>
            )}
          </div>
          

        </div>

      </div>
    </div>
  );
};

export default AdminCategories;