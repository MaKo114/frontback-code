import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";

import { MoreHorizontal, Flag, Trash2 } from "lucide-react";
import useTestStore from "@/store/tokStore";
import { deletePostApi } from "@/api/post";
import usePostStore from "@/store/postStore";

interface MoreDotProps {
  post_id: number;
  student_id: number;
  onReportClick?: () => void;
}

const MoreDot = ({ post_id, student_id, onReportClick }: MoreDotProps) => {
  const user = useTestStore((state) => state.user);
  const token = useTestStore((state) => state.token);
  const fetchPosts = usePostStore((state) => state.fetchPosts);

  const isOwner = user?.student_id === student_id;
  const isAdmin = user?.role === "ADMIN";

  const handleDelete = async () => {
    if (!token) return;
    if (confirm("คุณแน่ใจหรือไม่ว่าต้องการลบโพสต์นี้?")) {
      try {
        await deletePostApi(token, post_id);
        alert("ลบโพสต์สำเร็จ");
        fetchPosts(token);
      } catch (err: any) {
        console.error(err);
        alert(err.response?.data?.error || "ลบโพสต์ไม่สำเร็จ");
      }
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="text-muted-foreground hover:text-foreground transition">
          <MoreHorizontal size={20} />
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-44">
        {!isOwner && (
          <DropdownMenuItem 
            className="cursor-pointer gap-2"
            onClick={onReportClick}
          >
            <Flag size={16} />
            <span>รายงานโพสต์</span>
          </DropdownMenuItem>
        )}

        {(isOwner || isAdmin) && (
          <DropdownMenuItem 
            className="cursor-pointer gap-2 text-destructive"
            onClick={handleDelete}
          >
            <Trash2 size={16} />
            <span>ลบโพสต์</span>
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default MoreDot;
