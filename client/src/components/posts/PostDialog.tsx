import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ImagePlus } from "lucide-react";
import { useState } from "react";

interface PostDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreatePost: (title: string, description: string) => void;
}

const PostDialog = ({
  open,
  onOpenChange,
  onCreatePost,
}: PostDialogProps) => {
  const [postTitle, setPostTitle] = useState("");
  const [postDescription, setPostDescription] = useState("");

  const handleSubmit = () => {
    if (!postTitle.trim() || !postDescription.trim()) return;

    onCreatePost(postTitle, postDescription);

    setPostTitle("");
    setPostDescription("");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md" onOpenAutoFocus={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle>เขียนโพสต์</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <input
            type="text"
            placeholder="ชื่อสิ่งของที่ต้องการแลก"
            value={postTitle}
            onChange={(e) => setPostTitle(e.target.value)}
            className="w-full rounded-md border border-input px-3 py-2"
          />

          <Textarea
            placeholder="รายละเอียด"
            value={postDescription}
            onChange={(e) => setPostDescription(e.target.value)}
          />

          <button className="flex w-full items-center justify-center gap-2 rounded-md border-2 border-dashed py-8">
            <ImagePlus size={20} />
            เพิ่มรูปภาพ
          </button>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            ยกเลิก
          </Button>
          <Button onClick={handleSubmit}>โพสต์</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default PostDialog;