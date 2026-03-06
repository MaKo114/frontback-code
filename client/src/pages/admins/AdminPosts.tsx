import Title from "../../titles/Title";
import { Edit, Trash2, Search, FileText, User, Calendar, Tag } from "lucide-react";
import { useEffect, useState } from "react";
import usePostStore from "@/store/postStore";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";

const AdminPosts = () => {
  const fetchPosts = usePostStore((s) => s.fetchPosts);
  const deletePost = usePostStore((s) => s.deletePost);
  const posts = usePostStore((state) => state.posts);
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate()

  useEffect(() => {
    fetchPosts();
  }, [posts]);

  const filteredPosts = posts.filter(
    (p) =>
      p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      `${p.first_name} ${p.last_name}`
        .toLowerCase()
        .includes(searchTerm.toLowerCase())
  );

  const handleDelete = async (id: number) => {
    const result = await Swal.fire({
      title: "ยืนยันการลบโพสต์?",
      text: "คุณไม่สามารถกู้คืนโพสต์นี้ได้หลังจากลบออกไปแล้ว",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "ใช่, ลบเลย!",
      cancelButtonText: "ยกเลิก",
      borderRadius: "15px",
      reverseButtons: true
    });

    if (result.isConfirmed) {
      const success = await deletePost(id);
      if (success) {
        Swal.fire({
          title: "ลบสำเร็จ!",
          text: "โพสต์ถูกลบออกจากระบบแล้ว",
          icon: "success",
          timer: 1500,
          showConfirmButton: false
        });
      } else {
        Swal.fire("ผิดพลาด", "ไม่สามารถลบโพสต์ได้ กรุณาลองใหม่", "error");
      }
    }
  };

  return (
    <div className="space-y-6 font-['Inter', sans-serif]">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <Title />
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">
            Post <span className="text-[#FF5800]">Management</span>
          </h1>
          <p className="text-gray-500 text-sm mt-1 font-medium">จัดการบทความและเนื้อหาทั้งหมดในระบบ</p>
        </div>

        {/* Search Bar */}
        <div className="relative group w-full md:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#FF5800] transition-colors" size={18} />
          <input
            type="text"
            placeholder="ค้นหาชื่อโพสต์ หรือผู้เขียน..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-2xl shadow-sm outline-none focus:ring-2 focus:ring-[#FF5800]/20 focus:border-[#FF5800] transition-all"
          />
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-white rounded-[24px] shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="bg-gray-50/50 border-b border-gray-100">
                <th className="px-8 py-5 text-[11px] font-black text-gray-400 uppercase tracking-[0.15em] w-1/3">
                  <div className="flex items-center gap-2"><FileText size={14}/> Title</div>
                </th>
                <th className="px-8 py-5 text-[11px] font-black text-gray-400 uppercase tracking-[0.15em]">
                  <div className="flex items-center gap-2"><User size={14}/> Author</div>
                </th>
                <th className="px-8 py-5 text-[11px] font-black text-gray-400 uppercase tracking-[0.15em]">
                  <div className="flex items-center gap-2"><Tag size={14}/> Category</div>
                </th>
                <th className="px-8 py-5 text-[11px] font-black text-gray-400 uppercase tracking-[0.15em]">
                  <div className="flex items-center gap-2"><Calendar size={14}/> Created Date</div>
                </th>
                <th className="px-8 py-5 text-[11px] font-black text-gray-400 uppercase tracking-[0.15em] text-center">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredPosts.length > 0 ? (
                filteredPosts.map((post) => (
                  <tr key={post.post_id} className="hover:bg-orange-50/20 transition-all duration-200 group">
                    <td className="px-8 py-6">
                      <div className="font-bold text-gray-900 group-hover:text-[#FF5800] transition-colors truncate max-w-xs" title={post.title}>
                        {post.title}
                      </div>
                      <div className="text-[10px] text-gray-400 font-mono mt-0.5">ID: {post.post_id}</div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="text-sm font-semibold text-gray-700">
                        {post.first_name} {post.last_name}
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-blue-50 text-blue-600 text-xs font-black">
                        {post.category_name}
                      </span>
                    </td>
                    <td className="px-8 py-6">
                      <div className="text-sm text-gray-500 font-medium">
                        {post.created_at_th?.split(" ")[0] || "N/A"}
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex gap-2 justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                        <button 
                          className="p-2.5 bg-gray-50 text-gray-500 rounded-xl hover:bg-white hover:text-blue-600 hover:shadow-md transition-all"
                          title="Edit Post"
                          onClick={()=> navigate(`post/${post.post_id}`)}
                        >
                          <Edit size={18} />
                        </button>
                        <button
                          onClick={() => handleDelete(post.post_id)}
                          className="p-2.5 bg-red-50 text-red-500 rounded-xl hover:bg-red-500 hover:text-white hover:shadow-lg hover:shadow-red-200 transition-all"
                          title="Delete Post"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-8 py-24 text-center">
                    <div className="flex flex-col items-center gap-3 opacity-20">
                      <Search size={48} />
                      <p className="font-bold text-lg">ไม่พบโพสต์ที่ตรงกับการค้นหา</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminPosts;