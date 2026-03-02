import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import { reportPostApi } from "@/api/post";
import useTestStore from "@/store/tokStore";

interface ReportDialogProps {
  post_id: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const REPORT_REASONS = [
  "สิ่งของไม่เหมาะสม",
  "ข้อมูลเป็นเท็จ",
  "พฤติกรรมไม่เหมาะสม",
  "สแปม",
  "อื่นๆ",
];

const ReportDialog = ({ post_id, open, onOpenChange }: ReportDialogProps) => {
  const [reason, setReason] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const token = useTestStore((state) => state.token);

  const handleSubmit = async () => {
    if (!token || !reason) return;
    try {
      setLoading(true);
      await reportPostApi(token, {
        post_id,
        reason,
        description,
      });
      alert("รายงานโพสต์สำเร็จ");
      onOpenChange(false);
      setReason("");
      setDescription("");
    } catch (err: any) {
      console.error(err);
      alert(err.response?.data?.error || "รายงานโพสต์ไม่สำเร็จ");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>รายงานโพสต์</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            ระบุเหตุผลที่คุณรายงานโพสต์นี้
          </p>
          
          <select
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="w-full rounded-md border border-input px-3 py-2"
          >
            <option value="">เลือกเหตุผล</option>
            {REPORT_REASONS.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>

          <Textarea
            placeholder="รายละเอียดเพิ่มเติม (ไม่บังคับ)"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            ยกเลิก
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={loading || !reason}
            variant="destructive"
          >
            {loading ? "กำลังส่ง..." : "รายงาน"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ReportDialog;
