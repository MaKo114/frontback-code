import Title from "../../titles/Title";
import { Edit, Eye, Trash2 } from "lucide-react";
import { useState } from "react";
// import { FileText, Flag, FolderOpen, Users, LogOut, Shield, Eye, Trash2, Edit } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";

interface Post {
  id: number;
  title: string;
  author: string;
  category: string;
  date: string;
  status: "published" | "draft" | "hidden";
  views: number;
}

const mockPosts: Post[] = [
  { id: 1, title: "วิธีทำอาหารไทยง่ายๆ ที่บ้าน", author: "user123", category: "อาหาร", date: "19/01/2026", status: "published", views: 1250 },
  { id: 2, title: "รีวิวมือถือรุ่นใหม่ล่าสุด 2026", author: "techguru", category: "เทคโนโลยี", date: "18/01/2026", status: "published", views: 3420 },
  { id: 3, title: "เที่ยวเชียงใหม่ 3 วัน 2 คืน", author: "traveler_th", category: "ท่องเที่ยว", date: "17/01/2026", status: "draft", views: 0 },
  { id: 4, title: "แนะนำหนังสือน่าอ่านประจำเดือน", author: "bookworm", category: "หนังสือ", date: "16/01/2026", status: "published", views: 890 },
  { id: 5, title: "โพสต์ที่ถูกซ่อน", author: "hidden_user", category: "อื่นๆ", date: "15/01/2026", status: "hidden", views: 50 },
];

const AdminPosts = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [posts, setPosts] = useState<Post[]>(mockPosts);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");


  const handleDelete = (id: number) => {
    setPosts(posts.filter(post => post.id !== id));
  };

  const handleToggleVisibility = (id: number) => {
    setPosts(posts.map(post => {
      if (post.id === id) {
        return { 
          ...post, 
          status: post.status === "hidden" ? "published" : "hidden" 
        };
      }
      return post;
    }));
  };

  const filteredPosts = posts
    .filter(p => filterStatus === "all" || p.status === filterStatus)
    .filter(p => 
      p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.author.toLowerCase().includes(searchTerm.toLowerCase())
    );

  const publishedCount = posts.filter(p => p.status === "published").length;
  const draftCount = posts.filter(p => p.status === "draft").length;
  const hiddenCount = posts.filter(p => p.status === "hidden").length;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "published":
        return <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">เผยแพร่</span>;
      case "draft":
        return <span className="px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-800">แบบร่าง</span>;
      case "hidden":
        return <span className="px-2 py-1 text-xs rounded-full bg-red-100 text-red-800">ซ่อน</span>;
      default:
        return null;
    }
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="min-h-screen bg-gray-100">

    <Title/>
        {/* Main Content */}
        <main className="flex-1 p-8">
          {/* Stats Cards */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="bg-white rounded-lg p-4 shadow">
              <p className="text-gray-500 text-sm">เผยแพร่แล้ว</p>
              <p className="text-2xl font-bold text-green-600">{publishedCount}</p>
            </div>
            <div className="bg-white rounded-lg p-4 shadow">
              <p className="text-gray-500 text-sm">แบบร่าง</p>
              <p className="text-2xl font-bold text-yellow-600">{draftCount}</p>
            </div>
            <div className="bg-white rounded-lg p-4 shadow">
              <p className="text-gray-500 text-sm">ซ่อนอยู่</p>
              <p className="text-2xl font-bold text-red-600">{hiddenCount}</p>
            </div>
          </div>

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
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                <option value="all">ทั้งหมด</option>
                <option value="published">เผยแพร่</option>
                <option value="draft">แบบร่าง</option>
                <option value="hidden">ซ่อน</option>
              </select>
            </div>
          </div>

          {/* Posts Table */}
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">หัวข้อ</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">ผู้เขียน</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">หมวดหมู่</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">วันที่</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">ยอดดู</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">สถานะ</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">การจัดการ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredPosts.map((post) => (
                  <tr key={post.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm text-gray-800 max-w-xs truncate font-medium">{post.title}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{post.author}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{post.category}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{post.date}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{post.views.toLocaleString()}</td>
                    <td className="px-6 py-4">{getStatusBadge(post.status)}</td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleToggleVisibility(post.id)}
                          className="p-2 text-gray-500 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
                          title={post.status === "hidden" ? "แสดงโพสต์" : "ซ่อนโพสต์"}
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="แก้ไข"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(post.id)}
                          className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="ลบ"
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