import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"; // อย่าลืม import dialog จาก components ของพี่
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  MoreHorizontal,
  Flag,
  AlertTriangle,
  Loader2,
  Trash,
} from "lucide-react";
import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import { createReport } from "@/api/repost";
import useTestStore from "@/store/tokStore";
import { deletePostApi } from "@/api/post";
import usePostStore from "@/store/postStore";

interface ReportForm {
  reason: string;
  description: string;
}

const MoreDot = ({ post }) => {
  const deletePost = usePostStore((state)=> state.deletePost)
  const { student_id, post_id } = post
  const user = useTestStore((state)=> state.user)
  const [alertType, setAlertType] = useState<"success" | "error" | null>(null);
  const token = useTestStore((state) => state.token);
  const [showReportModal, setShowReportModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [reportForm, setReportForm] = useState<ReportForm>({
    reason: "",
    description: "",
  });
  

  // รายการหัวข้อการรีพอร์ต
  const reportReasons = [
    "เนื้อหาไม่เหมาะสม / ลามกอนาจาร",
    "เป็นการหลอกลวง / มิจฉาชีพ",
    "ใช้คำหยาบคาย / บูลลี่",
    "สินค้าต้องห้าม / ผิดกฎหมาย",
    "สแปม / โฆษณาชวนเชื่อ",
    "อื่นๆ",
  ];

  const handleReportSubmit = async () => {
    if (!reportForm.reason) {
      setShowReportModal(false);
      setAlertType("error");
      return;
    }

    try {
      setLoading(true);
      await createReport({ ...reportForm, post_id }, token);
      setShowReportModal(false);
      setAlertType("success");
    } catch (err) {
      setShowReportModal(false);
      setAlertType("error");
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePost = async () => {
    try {
      const result = await Swal.fire({
        title: "ยืนยันการลบโพสต์?",
        text: "หากลบโพสต์จะหายถาวร",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#FF5800",
        cancelButtonColor: "#6b7280",
        confirmButtonText: "ยืนยันการลบ",
        cancelButtonText: "ยกเลิก",
        borderRadius: "15px",
      });

      if (result.isConfirmed) {
        await deletePost(post_id);
      }
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    if (!showReportModal && alertType) {
      Swal.fire({
        icon: alertType,
        title: alertType === "success" ? "ส่งรายงานสำเร็จ" : "เกิดข้อผิดพลาด",
        text:
          alertType === "success"
            ? "ขอบคุณที่ช่วยตรวจสอบครับ"
            : "ไม่สามารถส่งรายงานได้",
        confirmButtonColor: "#d33",
      });

      setAlertType(null);
    }
  }, [showReportModal, alertType]);

  return (
    <>
      {/* 1. ปุ่ม 3 จุด และ Dropdown */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition">
            <MoreHorizontal size={20} />
          </button>
        </DropdownMenuTrigger>

        <DropdownMenuContent
          align="end"
          className="w-48 rounded-xl p-1 shadow-lg border-gray-100"
        >
          <DropdownMenuItem
            className="cursor-pointer gap-2 text-gray-600 focus:text-gray-600 focus:bg-red-50 rounded-lg p-2.5 font-medium"
            onClick={() => setShowReportModal(true)}
          >
            <Flag size={16} />
            <span>รายงานโพสต์</span>
          </DropdownMenuItem>

          {user?.student_id === student_id && (
            <DropdownMenuItem
              className="cursor-pointer gap-2 text-red-600 focus:text-red-700 focus:bg-red-50 rounded-lg p-2.5 font-medium"
              onClick={() => handleDeletePost()}
            >
              <Trash size={16} />
              <span>ลบโพสต์</span>
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* 2. Dialog สำหรับกรอกข้อมูลการรายงาน */}
      <Dialog open={showReportModal} onOpenChange={setShowReportModal}>
        <DialogContent className="sm:max-w-[425px] rounded-[28px]">
          <DialogHeader className="flex flex-col items-center pt-4">
            <div className="bg-red-50 p-3 rounded-full mb-2">
              <AlertTriangle className="text-red-500" size={28} />
            </div>
            <DialogTitle className="text-xl font-bold text-gray-900">
              รายงานโพสต์นี้
            </DialogTitle>
            <p className="text-sm text-gray-500 text-center">
              เหตุใดคุณจึงต้องการรายงานโพสต์นี้? การรายงานของคุณจะเป็นความลับ
            </p>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* ส่วนเลือกหัวข้อ */}
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700 ml-1">
                หัวข้อการรายงาน
              </label>
              <select
                value={reportForm.reason}
                onChange={(e) =>
                  setReportForm({ ...reportForm, reason: e.target.value })
                }
                className="break-all w-full rounded-xl bg-gray-50 border-gray-200 py-3 px-4 text-sm font-medium focus:ring-2 focus:ring-red-500/20 outline-none transition-all cursor-pointer"
              >
                <option value="">เลือกเหตุผล...</option>
                {reportReasons.map((reason) => (
                  <option key={reason} value={reason}>
                    {reason}
                  </option>
                ))}
              </select>
            </div>

            {/* ส่วนกรอกรายละเอียดเพิ่มเติม */}
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700 ml-1 ">
                รายละเอียดเพิ่มเติม (ไม่บังคับ)
              </label>
              <Textarea
                placeholder="ระบุข้อมูลเพิ่มเติมเพื่อให้ตรวจสอบได้ง่ายขึ้น..."
                className="break-all min-h-[100px] rounded-xl bg-gray-50 border-gray-200 p-3 text-sm focus-visible:ring-2 focus-visible:ring-red-500/20 resize-none"
                value={reportForm.description}
                onChange={(e) =>
                  setReportForm({ ...reportForm, description: e.target.value })
                }
              />
            </div>
          </div>

          <DialogFooter className="flex gap-2 sm:gap-0">
            <Button
              variant="ghost"
              className="flex-1 rounded-xl font-bold text-gray-500"
              onClick={() => setShowReportModal(false)}
            >
              ยกเลิก
            </Button>
            <Button
              className="flex-1 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold shadow-md"
              onClick={handleReportSubmit}
              disabled={loading}
            >
              {loading ? (
                <Loader2 className="animate-spin mr-2" size={18} />
              ) : (
                "ส่งรายงาน"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default MoreDot;
