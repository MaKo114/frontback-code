import { deleteReportAPI, getUserReport, ignoreReportAPI } from "@/api/repost";
import Title from "../../titles/Title";
import { useEffect, useState, useCallback } from "react";
import useTestStore from "@/store/tokStore";
import Swal from "sweetalert2";
import {
  AlertCircle,
  CheckCircle2,
  Trash2,
  Filter,
  ChevronLeft,
  ChevronRight,
  Edit,
  XCircle,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

// ... Interface คงเดิม ...

const AdminReport = () => {
  const navigate = useNavigate();
  const token = useTestStore((state) => state.token);

  const [reports, setReports] = useState([]);
  const [filterStatus, setFilterStatus] = useState<string>("ALL");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // 1. Fetch Data Logic (ใช้ useCallback เพื่อลดการสร้าง function ใหม่)
  const fetchReport = useCallback(async () => {
    try {
      const res = await getUserReport(token);
      setReports(res?.data?.data || []);
    } catch (err) {
      console.error("Error fetching reports:", err);
    }
  }, [token]);

  useEffect(() => {
    fetchReport();
  }, [fetchReport]); // โหลดครั้งแรก และเมื่อ token เปลี่ยนเท่านั้น

  // 2. Action Handlers
  const handleIgnoreReport = async (e, reportId: number) => {
    e.preventDefault()
    const result = await Swal.fire({
      title: "ยืนยันการเพิกเฉย?",
      text: "รายงานนี้จะหายไปจากรายการที่ต้องจัดการ",
      icon: "info",
      showCancelButton: true,
      confirmButtonColor: "#6b7280",
      confirmButtonText: "ยืนยัน",
      cancelButtonText: "ยกเลิก",
    });

    if (result.isConfirmed) {
      try {
        await ignoreReportAPI(token, reportId);
        setReports((prev) =>
          prev.map((r) =>
            r.report_id === reportId ? { ...r, status: "IGNORED" } : r,
          ),
        );
        Swal.fire({
          title: "เพิกเฉยแล้ว",
          icon: "success",
          timer: 1000,
          showConfirmButton: false,
        });
      } catch (err) {
        Swal.fire("เกิดข้อผิดพลาด", "ไม่สามารถดำเนินการได้", "error");
      }
    }
  };

  const handleDeletePost = async (e, reportId: number) => {
    e.preventDefault()
    const result = await Swal.fire({
      title: "ยืนยันการลบโพสต์?",
      text: "การดำเนินการนี้จะลบโพสต์และเปลี่ยนสถานะรายงานเป็น 'จัดการแล้ว'",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#FF5800",
      confirmButtonText: "ยืนยันการลบ",
    });

    if (result.isConfirmed) {
      try {
        await deleteReportAPI(token, reportId);
        setReports((prev) =>
          prev.map((r) =>
            r.report_id === reportId ? { ...r, status: "RESOLVED" } : r,
          ),
        );
        Swal.fire({
          title: "สำเร็จ!",
          icon: "success",
          timer: 1500,
          showConfirmButton: false,
        });
      } catch (err) {
        Swal.fire("เกิดข้อผิดพลาด", "ไม่สามารถลบโพสต์ได้", "error");
      }
    }
  };

  // 3. Filtering & Pagination Logic
  const filteredReports = reports.filter((r) =>
    filterStatus === "ALL" ? true : r.status === filterStatus,
  );

  const totalPages = Math.ceil(filteredReports.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentReports = filteredReports.slice(
    indexOfFirstItem,
    indexOfLastItem,
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [filterStatus]);

  return (
    <div className="space-y-6 font-['Inter',sans-serif]">
      {/* Header Section */}
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

      {/* Main Table */}
      <div className="bg-white rounded-[24px] shadow-sm border border-gray-200 overflow-hidden">
        {/* Table Top Info & Pagination */}
        <div className="px-8 py-5 bg-gray-50/50 border-b border-gray-100 flex items-center justify-between">
          <p className="text-xs font-bold text-gray-500">
            Showing {filteredReports.length > 0 ? indexOfFirstItem + 1 : 0} to{" "}
            {Math.min(indexOfLastItem, filteredReports.length)} of{" "}
            {filteredReports.length} Reports
          </p>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="p-2 rounded-lg hover:bg-white hover:shadow-sm disabled:opacity-30 transition-all text-gray-500"
            >
              <ChevronLeft size={16} />
            </button>
            <div className="flex items-center gap-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                (page) => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`w-8 h-8 rounded-lg text-xs font-black transition-all ${
                      currentPage === page
                        ? "bg-[#FF5800] text-white"
                        : "text-gray-400 hover:text-[#FF5800]"
                    }`}
                  >
                    {page}
                  </button>
                ),
              )}
            </div>
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
              <th className="px-8 py-5 text-[11px] font-black text-gray-400 uppercase">
                Reporter
              </th>
              <th className="px-8 py-5 text-[11px] font-black text-gray-400 uppercase">
                Post Details
              </th>
              <th className="px-8 py-5 text-[11px] font-black text-gray-400 uppercase">
                Violation Reason
              </th>
              <th className="px-8 py-5 text-[11px] font-black text-gray-400 uppercase text-center">
                Status
              </th>
              <th className="px-8 py-5 text-[11px] font-black text-gray-400 uppercase text-right">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {currentReports.length > 0 ? (
              currentReports.map((report) => (
                <tr
                  key={report.report_id}
                  className="hover:bg-orange-50/20 transition-all duration-200 group"
                >
                  {/* Reporter Column */}
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 bg-gray-100 rounded-full flex items-center justify-center text-gray-500 font-bold text-xs border border-gray-200 uppercase">
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

                  {/* Post Info Column */}
                  <td className="px-8 py-6">
                    <div className="text-sm font-bold text-gray-800 hover:text-[#FF5800] cursor-pointer transition-colors line-clamp-1">
                      {report.post_title}
                    </div>
                    <span className="text-[10px] bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded font-bold uppercase mt-1 inline-block">
                      ID: {report.post_id}
                    </span>
                  </td>

                  {/* Reason Column */}
                  <td className="px-8 py-6">
                    <div className="inline-flex items-center gap-1.5 text-red-600 bg-red-50 px-2.5 py-1 rounded-lg">
                      <AlertCircle size={14} strokeWidth={3} />
                      <span className="text-xs font-black">
                        {report.reason}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mt-2 line-clamp-2 italic leading-relaxed">
                      {report.description || "— ไม่มีรายละเอียดเพิ่มเติม —"}
                    </p>
                  </td>

                  {/* Status Column */}
                  <td className="px-8 py-6 text-center">
                    <StatusBadge status={report.status} />
                  </td>

                  {/* Action Buttons */}
                  <td className="px-8 py-6 text-right">
                    {report.status === "PENDING" ? (
                      <div className="flex gap-2 justify-end opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <ActionButton
                          icon={<Edit size={18} />}
                          color="gray"
                          onClick={() =>
                            navigate(`/admin/post/${report.post_id}`)
                          }
                          tooltip="จัดการโพสต์"
                        />
                        <ActionButton
                          icon={<XCircle size={18} />}
                          color="amber"
                          onClick={(e) => handleIgnoreReport(e, report.report_id)}
                          tooltip="เพิกเฉย"
                        />
                        <ActionButton
                          icon={<Trash2 size={18} />}
                          color="red"
                          onClick={(e) => handleDeletePost(e, report.report_id)}
                          tooltip="ลบโพสต์"
                        />
                      </div>
                    ) : (
                      <span className="text-gray-300 text-[10px] font-black uppercase tracking-widest italic">
                        Processed
                      </span>
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <EmptyState />
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// --- Sub-components for cleaner code ---

const StatusBadge = ({ status }: { status: string }) => {
  const configs: any = {
    PENDING: {
      color: "bg-amber-100 text-amber-700",
      label: "Pending",
      pulse: true,
    },
    RESOLVED: {
      color: "bg-emerald-100 text-emerald-700",
      label: "Resolved",
      icon: <CheckCircle2 size={12} />,
    },
    IGNORED: { color: "bg-gray-100 text-gray-500", label: "Ignored" },
  };
  const config = configs[status];
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider ${config.color}`}
    >
      {config.pulse && (
        <span className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-pulse" />
      )}
      {config.icon}
      {config.label}
    </span>
  );
};

const ActionButton = ({ icon, color, onClick, tooltip }: any) => {
  const colors: any = {
    gray: "bg-gray-50 text-gray-400 hover:bg-gray-200 hover:text-gray-700",
    amber: "bg-gray-50 text-gray-400 hover:bg-amber-50 hover:text-amber-600",
    red: "bg-red-50 text-red-600 hover:bg-red-600 hover:text-white",
  };
  return (
    <button
      onClick={onClick}
      title={tooltip}
      className={`p-2.5 rounded-xl transition-all shadow-sm ${colors[color]}`}
    >
      {icon}
    </button>
  );
};

const EmptyState = () => (
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
);

export default AdminReport;
