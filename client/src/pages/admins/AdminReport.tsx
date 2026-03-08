import { getUserReport } from "@/api/repost";
import Title from "../../titles/Title";
import { useEffect, useState } from "react";
import useTestStore from "@/store/tokStore";
import axios from "axios";
import Swal from "sweetalert2";
import {
  AlertCircle,
  CheckCircle2,
  MoreHorizontal,
  Trash2,
  Filter,
  ChevronLeft,
  ChevronRight,
  Edit,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

interface Report {
  report_id: number;
  reason: string;
  description: string;
  status: "PENDING" | "RESOLVED" | "IGNORED";
  created_at: string;
  post_id: number;
  post_title: string;
  reporter_name: string;
  reporter_surname: string;
}

const AdminReport = () => {
  const token = useTestStore((state) => state.token);
  const [reports, setReports] = useState<Report[]>([]);
  const [filterStatus, setFilterStatus] = useState<string>("ALL");

  const fetchReport = async () => {
    try {
      const res = await getUserReport(token);
      setReports(res?.data?.data || []);
    } catch (err) {
      console.error("Error fetching reports:", err);
    }
  };

  useEffect(() => {
    fetchReport();
  }, [reports]);

  const handleDeletePost = async (reportId: number) => {
    const result = await Swal.fire({
      title: "ยืนยันการลบโพสต์?",
      text: "การดำเนินการนี้จะลบโพสต์ออกจากระบบและเปลี่ยนสถานะรายงานเป็น 'จัดการแล้ว'",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#FF5800",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "ยืนยันการลบ",
      cancelButtonText: "ยกเลิก",
      borderRadius: "15px",
    });

    if (result.isConfirmed) {
      try {
        await axios.delete(`http://localhost:8000/admin/reports/${reportId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setReports((prev) =>
          prev.map((r) =>
            r.report_id === reportId ? { ...r, status: "RESOLVED" } : r,
          ),
        );
        Swal.fire({
          title: "สำเร็จ!",
          text: "จัดการข้อมูลเรียบร้อยแล้ว",
          icon: "success",
          timer: 1500,
          showConfirmButton: false,
        });
      } catch (err) {
        Swal.fire({
          title: "เกิดข้อผิดพลาด!",
          text: "ไม่สามารถลบโพสต์ได้",
          icon: "error",
        });
      }
    }
  };

  const filteredReports =
    filterStatus === "ALL"
      ? reports
      : reports.filter((r) => r.status === filterStatus);

  useEffect(() => {}, [reports]);

  {
    /* Pagination Calculation */
  }
  const itemsPerPage = 5;
  const [currentPage, setCurrentPage] = useState(1);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentReports = filteredReports.slice(
    indexOfFirstItem,
    indexOfLastItem,
  );
  const totalPages = Math.ceil(filteredReports.length / itemsPerPage);

  const navigate = useNavigate()
  useEffect(() => {
    setCurrentPage(1);
  }, [filteredReports.length]);

  return (
    <div className="space-y-6 font-['Inter',sans-serif]">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <Title />
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">
            Report <span className="text-[#FF5800]">Management</span>
          </h1>
          <p className="text-gray-500 text-sm mt-1 font-medium">
            จัดการและตรวจสอบรายงานการกระทำผิดภายในระบบ
          </p>
        </div>

        {/* Filter Box */}
        <div className="flex items-center gap-3 bg-white p-2 rounded-2xl shadow-sm border border-gray-100">
          <div className="pl-3 text-gray-400">
            <Filter size={18} />
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="pr-8 py-2 bg-transparent text-sm font-bold text-gray-700 outline-none cursor-pointer"
          >
            <option value="ALL">รายงานทั้งหมด</option>
            <option value="PENDING">🟡 รอดำเนินการ</option>
            <option value="RESOLVED">🟢 จัดการแล้ว</option>
            <option value="IGNORED">⚪ เพิกเฉย</option>
          </select>
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-white rounded-[24px] shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-8 py-5 bg-gray-50/50 border-b border-gray-100 flex items-center justify-between">
          <p className="text-xs font-bold text-gray-500">
            Showing {filteredReports.length > 0 ? indexOfFirstItem + 1 : 0} to{" "}
            {Math.min(indexOfLastItem, filteredReports.length)} of{" "}
            {filteredReports.length} Reports
          </p>

          <div className="flex items-center gap-2">
            {/* ปุ่มถอยหลัง */}
            <button
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="p-2 rounded-lg hover:bg-white hover:shadow-sm disabled:opacity-30 transition-all text-gray-500"
            >
              <ChevronLeft size={16} />
            </button>

            {/* ปุ่มตัวเลขหน้า*/}
            <div className="flex items-center gap-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                (page) => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`w-8 h-8 rounded-lg text-xs font-black transition-all ${
                      currentPage === page
                        ? "bg-[#FF5800] text-white shadow-md shadow-[#FF5800]/20"
                        : "text-gray-400 hover:bg-white hover:text-[#FF5800]"
                    }`}
                  >
                    {page}
                  </button>
                ),
              )}
            </div>
            {/* ปุ่มไปด้านหน้า */}
            <button
              onClick={() =>
                setCurrentPage((prev) => Math.min(prev + 1, totalPages))
              }
              disabled={currentPage === totalPages || totalPages === 0}
              className="p-2 rounded-lg hover:bg-white hover:shadow-sm disabled:opacity-30 transition-all text-gray-500"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50/50 border-b border-gray-100">
              <th className="px-8 py-5 text-[11px] font-black text-gray-400 uppercase tracking-[0.15em]">
                Reporter
              </th>
              <th className="px-8 py-5 text-[11px] font-black text-gray-400 uppercase tracking-[0.15em]">
                Post Details
              </th>
              <th className="px-8 py-5 text-[11px] font-black text-gray-400 uppercase tracking-[0.15em]">
                Violation Reason
              </th>
              <th className="px-8 py-5 text-[11px] font-black text-gray-400 uppercase tracking-[0.15em] text-center">
                Status
              </th>
              <th className="px-8 py-5 text-[11px] font-black text-gray-400 uppercase tracking-[0.15em] text-right">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {filteredReports.length > 0 ? (
              filteredReports.map((report) => (
                <tr
                  key={report.report_id}
                  className="hover:bg-orange-50/20 transition-all duration-200 group"
                >
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 bg-gray-100 rounded-full flex items-center justify-center text-gray-500 font-bold text-xs border border-gray-200">
                        {report.reporter_name[0]}
                      </div>
                      <div>
                        <div className="font-bold text-gray-900">
                          {report.reporter_name}
                        </div>
                        <div className="text-[11px] text-gray-400 font-medium">
                          {report.reporter_surname}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="text-sm font-bold text-gray-800 hover:text-[#FF5800] cursor-pointer transition-colors line-clamp-1">
                      {report.post_title}
                    </div>
                    <div className="flex items-center gap-1.5 mt-1">
                      <span className="text-[10px] bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded font-bold uppercase tracking-tighter">
                        ID: {report.post_id}
                      </span>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="inline-flex items-center gap-1.5 text-red-600 bg-red-50 px-2.5 py-1 rounded-lg">
                      <AlertCircle size={14} strokeWidth={3} />
                      <span className="text-xs font-black">
                        {report.reason}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mt-2 line-clamp-2 leading-relaxed italic">
                      "{report.description}"
                    </p>
                  </td>
                  <td className="px-8 py-6 text-center">
                    {report.status === "PENDING" && (
                      <span className="inline-flex items-center gap-1.5 bg-amber-100 text-amber-700 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider shadow-sm">
                        <span className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-pulse" />
                        Pending
                      </span>
                    )}
                    {report.status === "RESOLVED" && (
                      <span className="inline-flex items-center gap-1.5 bg-emerald-100 text-emerald-700 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider">
                        <CheckCircle2 size={12} />
                        Resolved
                      </span>
                    )}
                    {report.status === "IGNORED" && (
                      <span className="inline-flex items-center bg-gray-100 text-gray-500 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider">
                        Ignored
                      </span>
                    )}
                  </td>
                  <td className="px-8 py-6 text-right">
                    {report.status === "PENDING" ? (
                      <div className="flex gap-2 justify-end opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <button className="p-2.5 bg-gray-50 text-gray-400 rounded-xl hover:bg-gray-200 hover:text-gray-700 transition-all shadow-sm" onClick={()=> navigate(`/admin/post/${report.post_id}`)}>
                          <Edit size={18} />
                        </button>
                        <button
                          onClick={() => handleDeletePost(report.report_id)}
                          className="p-2.5 bg-red-50 text-red-600 rounded-xl hover:bg-red-600 hover:text-white transition-all shadow-sm"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    ) : (
                      <div className="text-gray-300 text-[10px] font-black uppercase tracking-widest italic">
                        Processed
                      </div>
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="px-8 py-20 text-center">
                  <div className="flex flex-col items-center gap-2 opacity-20">
                    <CheckCircle2 size={48} />
                    <p className="font-bold text-lg text-gray-500">
                      ไม่มีรายการแจ้งรายงานในขณะนี้
                    </p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminReport;
