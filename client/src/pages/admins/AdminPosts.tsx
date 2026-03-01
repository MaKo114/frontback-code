import useTestStore from "@/store/tokStore";
import Title from "../../titles/Title";
import { Edit, Eye, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
// import { FileText, Flag, FolderOpen, Users, LogOut, Shield, Eye, Trash2, Edit } from "lucide-react";
// import { useNavigate, useLocation } from "react-router-dom";
import usePostStore from "@/store/postStore";

interface Post {
  id: number;
  title: string;
  author: string;
  category: string;
  date: string;
  status: "published" | "draft" | "hidden";
}

const AdminPosts = () => {
  const fetchPosts = usePostStore((s) => s.fetchPosts);
  const deletePost = usePostStore((s) => s.deletePost);
  const posts = usePostStore((state) => state.posts);
  const token = useTestStore((state) => state.token);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");

  const filteredPosts = posts.filter(
    (p) =>
      p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      `${p.first_name} ${p.last_name}`
        .toLowerCase()
        .includes(searchTerm.toLowerCase()),
  );

  const handleDelete = async (id: number) => {
    const confirmDelete = window.confirm("ลบโพสต์นี้หรือไม่?");
    if (!confirmDelete) return;

    const success = await deletePost(id);
    if (!success) alert("ลบไม่สำเร็จ");
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  return (
    <div className="min-h-screen bg-gray-100">
      <Title />
      {/* Main Content */}
      <main className="flex-1 p-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-800">โพสต์ทั้งหมด</h1>

          <div className="flex gap-3">
            {/* Search */}
            <input
              type="text"
              placeholder="ค้นหาโพสต์..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-orange-500"
            />

            {/* Filter */}
          </div>
        </div>

        {/* Posts Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="w-full table-fixed">
            <thead className="bg-gray-50">
              <tr>
                <th className="w-[35%] px-6 py-4 text-left text-sm font-semibold text-gray-600">
                  หัวข้อ
                </th>
                <th className="w-[20%] px-6 py-4 text-left text-sm font-semibold text-gray-600">
                  ผู้เขียน
                </th>
                <th className="w-[15%] px-6 py-4 text-left text-sm font-semibold text-gray-600">
                  หมวดหมู่
                </th>
                <th className="w-[15%] px-6 py-4 text-left text-sm font-semibold text-gray-600">
                  วันที่
                </th>
                <th className="w-[15%] px-6 py-4 text-left text-sm font-semibold text-gray-600 text-center">
                  การจัดการ
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredPosts.map((post) => (
                <tr key={post.post_id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm text-gray-800 font-medium truncate">
                    {post.title}
                  </td>

                  <td className="px-6 py-4 text-sm text-gray-600">
                    {post.first_name} {post.last_name}
                  </td>

                  <td className="px-6 py-4 text-sm text-gray-600">
                    {post.category_name}
                  </td>

                  <td className="px-6 py-4 text-sm text-gray-600">
                    {post.created_at_th.split(" ")[0]}
                  </td>

                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      <button className="p-2 text-gray-500 hover:text-blue-600">
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(post.post_id)}
                        className="p-2 text-gray-500 hover:text-red-600"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredPosts.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              ไม่พบโพสต์ที่ตรงกับการค้นหา
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default AdminPosts;
