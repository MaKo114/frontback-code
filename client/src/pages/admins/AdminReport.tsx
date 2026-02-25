import Title from "../../titles/Title";
import { useState } from "react";
// import { FileText, Flag, FolderOpen, Users, LogOut, Shield } from "lucide-react";

interface Report {
  id: number;
  reporter: string;
  postTitle: string;
  reason: string;
  date: string;
  status: "pending" | "resolved" | "ignored";
}

const mockReports: Report[] = [
  { id: 1, reporter: "user123", postTitle: "โพสต์ขายสินค้าผิดกฎหมาย", reason: "สแปม", date: "15/01/2026", status: "pending" },
  { id: 2, reporter: "johndoe", postTitle: "ข้อความหยาบคาย", reason: "เนื้อหาไม่เหมาะสม", date: "14/01/2026", status: "pending" },
  { id: 3, reporter: "jane_th", postTitle: "รูปภาพละเมิดลิขสิทธิ์", reason: "ละเมิดลิขสิทธิ์", date: "13/01/2026", status: "resolved" },
  { id: 4, reporter: "mike99", postTitle: "โฆษณาหลอกลวง", reason: "หลอกลวง", date: "12/01/2026", status: "ignored" },
];

const AdminReport = () => {

  const [reports, setReports] = useState<Report[]>(mockReports);
  const [filterStatus, setFilterStatus] = useState<string>("all");

  

  const handleAction = (id: number, action: "resolve" | "ignore" | "delete") => {
    setReports(reports.map(report => {
      if (report.id === id) {
        if (action === "delete") {
          return { ...report, status: "resolved" as const };
        }
        return { ...report, status: action === "resolve" ? "resolved" as const : "ignored" as const };
      }
      return report;
    }));
  };

  const filteredReports = filterStatus === "all" 
    ? reports 
    : reports.filter(r => r.status === filterStatus);



  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <span className="px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-800">รอตรวจสอบ</span>;
      case "resolved":
        return <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">จัดการแล้ว</span>;
      case "ignored":
        return <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-800">เพิกเฉย</span>;
      default:
        return null;
    }
  };

  return (
    <div >
      <Title/>
        {/* Main Content */}

          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold text-gray-800">รายงาน</h1>
            
            {/* Filter */}
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              <option value="all">ทั้งหมด</option>
              <option value="pending">รอตรวจสอบ</option>
              <option value="resolved">จัดการแล้ว</option>
              <option value="ignored">เพิกเฉย</option>
            </select>
          </div>

          {/* Reports Table */}
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">ผู้รายงาน</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">โพสต์ที่ถูกรายงาน</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">เหตุผล</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">วันที่</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">สถานะ</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">การจัดการ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredReports.map((report) => (
                  <tr key={report.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm text-gray-800">{report.reporter}</td>
                    <td className="px-6 py-4 text-sm text-gray-800 max-w-xs truncate">{report.postTitle}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{report.reason}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{report.date}</td>
                    <td className="px-6 py-4">{getStatusBadge(report.status)}</td>
                    <td className="px-6 py-4">
                      {report.status === "pending" ? (
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleAction(report.id, "delete")}
                            className="px-3 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
                          >
                            ลบโพสต์
                          </button>
                          <button
                            onClick={() => handleAction(report.id, "ignore")}
                            className="px-3 py-1 text-xs bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors"
                          >
                            เพิกเฉย
                          </button>
                        </div>
                      ) : (
                        <span className="text-gray-400 text-sm">-</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {filteredReports.length === 0 && (
              <div className="text-center py-12 text-gray-500">
                ไม่มีรายงานที่ตรงกับตัวกรอง
              </div>
            )}
          </div>

    </div>
  );
};

export default AdminReport;
