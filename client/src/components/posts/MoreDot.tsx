import {
  DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { MoreHorizontal, Flag, AlertTriangle, Loader2, Trash, Pencil } from "lucide-react";
import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import { createReport } from "@/api/repost";
import useTestStore from "@/store/tokStore";
import usePostStore from "@/store/postStore";
import PostDialog from "@/components/posts/PostDialog";

interface ReportForm {
  reason: string;
  description: string;
}

const MoreDot = ({ post }: { post: any }) => {
  const deletePost = usePostStore((state) => state.deletePost);
  const { student_id, post_id } = post;
  const user = useTestStore((state) => state.user);
  const token = useTestStore((state) => state.token);

  const [alertType, setAlertType] = useState<"success" | "error" | null>(null);
  const [showReportModal, setShowReportModal] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [loading, setLoading] = useState(false);
  const [reportForm, setReportForm] = useState<ReportForm>({ reason: "", description: "" });

  const reportReasons = [
    "เนื้อหาไม่เหมาะสม / ลามกอนาจาร",
    "เป็นการหลอกลวง / มิจฉาชีพ",
    "ใช้คำหยาบคาย / บูลลี่",
    "สินค้าต้องห้าม / ผิดกฎหมาย",
    "สแปม / โฆษณาชวนเชื่อ",
    "อื่นๆ",
  ];

  const handleReportSubmit = async () => {
    if (!reportForm.reason) { setShowReportModal(false); setAlertType("error"); return; }
    try {
      setLoading(true);
      await createReport({ ...reportForm, post_id }, token);
      setShowReportModal(false);
      setAlertType("success");
    } catch {
      setShowReportModal(false);
      setAlertType("error");
    } finally { setLoading(false); }
  };

  const handleDeletePost = async () => {
    const result = await Swal.fire({
      title: "ยืนยันการลบโพสต์?",
      text: "หากลบโพสต์จะหายถาวร",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#FF5800",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "ยืนยันการลบ",
      cancelButtonText: "ยกเลิก",
    });
    if (result.isConfirmed) await deletePost(post_id);
  };

  useEffect(() => {
    if (!showReportModal && alertType) {
      Swal.fire({
        icon: alertType,
        title: alertType === "success" ? "ส่งรายงานสำเร็จ" : "เกิดข้อผิดพลาด",
        text: alertType === "success" ? "ขอบคุณที่ช่วยตรวจสอบครับ" : "ไม่สามารถส่งรายงานได้",
        confirmButtonColor: "#d33",
      });
      setAlertType(null);
    }
  }, [showReportModal, alertType]);

  const isOwner = user?.student_id === student_id;

  return (
    <>
      {/* Dropdown */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition">
            <MoreHorizontal size={20} />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48 rounded-xl p-1 shadow-lg border-gray-100">
          {/* Edit — เฉพาะเจ้าของ */}
          {isOwner && (
            <DropdownMenuItem
              className="cursor-pointer gap-2 text-gray-600 focus:text-gray-600 focus:bg-blue-50 rounded-lg p-2.5 font-medium"
              onClick={() => setShowEditDialog(true)}
            >
              <Pencil size={16} />
              <span>แก้ไขโพสต์</span>
            </DropdownMenuItem>
          )}

          <DropdownMenuItem
            className="cursor-pointer gap-2 text-gray-600 focus:text-gray-600 focus:bg-red-50 rounded-lg p-2.5 font-medium"
            onClick={() => setShowReportModal(true)}
          >
            <Flag size={16} />
            <span>รายงานโพสต์</span>
          </DropdownMenuItem>

          {isOwner && (
            <DropdownMenuItem
              className="cursor-pointer gap-2 text-red-600 focus:text-red-700 focus:bg-red-50 rounded-lg p-2.5 font-medium"
              onClick={handleDeletePost}
            >
              <Trash size={16} />
              <span>ลบโพสต์</span>
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Edit Dialog — reuse PostDialog */}
      <PostDialog
        open={showEditDialog}
        onOpenChange={setShowEditDialog}
        mode="edit"
        initialData={{
          post_id,
          title: post.title,
          description: post.description || "",
          category_id: post.category_id || null,
          images: post.images || [],
        }}
      />

      {/* Report Dialog */}
      <Dialog open={showReportModal} onOpenChange={setShowReportModal}>
        <DialogContent className="sm:max-w-[425px] rounded-[28px]">
          <DialogHeader className="flex flex-col items-center pt-4">
            <div className="bg-red-50 p-3 rounded-full mb-2">
              <AlertTriangle className="text-red-500" size={28} />
            </div>
            <DialogTitle className="text-xl font-bold text-gray-900">รายงานโพสต์นี้</DialogTitle>
            <p className="text-sm text-gray-500 text-center">เหตุใดคุณจึงต้องการรายงานโพสต์นี้? การรายงานของคุณจะเป็นความลับ</p>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700 ml-1">หัวข้อการรายงาน</label>
              <select
                value={reportForm.reason}
                onChange={(e) => setReportForm({ ...reportForm, reason: e.target.value })}
                className="w-full rounded-xl bg-gray-50 border-gray-200 py-3 px-4 text-sm font-medium focus:ring-2 focus:ring-red-500/20 outline-none cursor-pointer"
              >
                <option value="">เลือกเหตุผล...</option>
                {reportReasons.map((reason) => (
                  <option key={reason} value={reason}>{reason}</option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700 ml-1">รายละเอียดเพิ่มเติม (ไม่บังคับ)</label>
              <Textarea
                placeholder="ระบุข้อมูลเพิ่มเติม..."
                className="min-h-[100px] rounded-xl bg-gray-50 border-gray-200 p-3 text-sm resize-none"
                value={reportForm.description}
                onChange={(e) => setReportForm({ ...reportForm, description: e.target.value })}
              />
            </div>
          </div>

          <DialogFooter className="flex gap-2 sm:gap-0">
            <Button variant="ghost" className="flex-1 rounded-xl font-bold text-gray-500" onClick={() => setShowReportModal(false)}>
              ยกเลิก
            </Button>
            <Button className="flex-1 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold" onClick={handleReportSubmit} disabled={loading}>
              {loading ? <Loader2 className="animate-spin mr-2" size={18} /> : "ส่งรายงาน"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default MoreDot;