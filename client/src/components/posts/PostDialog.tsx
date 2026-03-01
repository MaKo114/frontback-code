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
import { creatPost } from "@/api/post";
import useTestStore from "@/store/tokStore";
import { uploadFile } from "@/api/post";

interface PostDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const PostDialog = ({ open, onOpenChange }: PostDialogProps) => {
  const [postForm, setPostForm] = useState({
    category_id: null as number | null,
    title: "",
    description: "",
    image_urls: [] as string[],
  });

  const [loading, setLoading] = useState(false);

  const categories = useTestStore((state) => state.categories);
  const token = useTestStore((state) => state.token);

  /* ================= Upload Image ================= */

const handleImageChange = async (
  e: React.ChangeEvent<HTMLInputElement>
) => {
  if (!e.target.files || !token) return;

  const files = Array.from(e.target.files);

  // ✅ 1. preview ทันที
  const previewUrls = files.map((file) =>
    URL.createObjectURL(file)
  );

  setPostForm((prev) => ({
    ...prev,
    image_urls: [...prev.image_urls, ...previewUrls],
  }));

  try {
    setLoading(true);

    // ✅ 2. upload จริงไป backend
    const uploadedUrls = await Promise.all(
      files.map(async (file) => {
        const reader = new FileReader();

        return new Promise<string>((resolve, reject) => {
          reader.readAsDataURL(file);

          reader.onloadend = async () => {
            try {
              const res = await uploadFile(token, reader.result as string);
              resolve(res.data.url);
            } catch (err) {
              reject(err);
            }
          };

          reader.onerror = reject;
        });
      })
    );

    // ✅ 3. replace preview ด้วย url จริงจาก cloudinary
    setPostForm((prev) => ({
      ...prev,
      image_urls: [
        ...prev.image_urls.slice(0, prev.image_urls.length - previewUrls.length),
        ...uploadedUrls,
      ],
    }));

  } catch (err) {
    console.error(err);
    alert("อัปโหลดรูปไม่สำเร็จ");
  } finally {
    setLoading(false);
  }
};

  /* ================= Submit ================= */

  const handleSubmit = async () => {
    if (!token) return alert("กรุณาเข้าสู่ระบบ");
    if (!postForm.category_id) return alert("กรุณาเลือกหมวดหมู่");
    if (!postForm.title.trim()) return alert("กรุณากรอกชื่อโพสต์");

    try {
      setLoading(true);

      await creatPost(token, postForm);

      setPostForm({
        category_id: null,
        title: "",
        description: "",
        image_urls: [],
      });

      onOpenChange(false);
    } catch (err) {
      console.error(err);
      alert("สร้างโพสต์ไม่สำเร็จ");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>เขียนโพสต์</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Title */}
          <input
            type="text"
            placeholder="ชื่อสิ่งของที่ต้องการแลก"
            name="title"
            value={postForm.title}
            className="w-full rounded-md border border-input px-3 py-2"
            onChange={(e) =>
              setPostForm({ ...postForm, title: e.target.value })
            }
          />

          {/* Category */}
          <select
            value={postForm.category_id ?? ""}
            onChange={(e) =>
              setPostForm({
                ...postForm,
                category_id: Number(e.target.value),
              })
            }
            className="w-full rounded-md border border-input px-3 py-2"
          >
            <option value="">เลือกหมวดหมู่</option>
            {categories.map((cat: any) => (
              <option key={cat.category_id} value={cat.category_id}>
                {cat.category_name}
              </option>
            ))}
          </select>

          {/* Description */}
          <Textarea
            placeholder="รายละเอียด"
            value={postForm.description}
            onChange={(e) =>
              setPostForm({ ...postForm, description: e.target.value })
            }
          />

          {/* Upload Button */}
          <label className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-md border-2 border-dashed py-8">
            <ImagePlus size={20} />
            {loading ? "กำลังอัปโหลด..." : "เพิ่มรูปภาพ"}
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={handleImageChange}
              className="hidden"
            />
          </label>

          {/* Preview Images */}
          {postForm.image_urls.length > 0 && (
            <div className="grid grid-cols-3 gap-2">
              {postForm.image_urls.map((url, index) => (
                <img
                  key={index}
                  src={url}
                  alt=""
                  className="h-24 w-full object-cover rounded-md"
                />
              ))}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            ยกเลิก
          </Button>
          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? "กำลังโพสต์..." : "โพสต์"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default PostDialog;