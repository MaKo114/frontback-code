import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ImagePlus, X, Loader2, Tag, ShoppingBag, Pencil } from "lucide-react";
import { useState } from "react";
import { createPost, uploadFile, deleteImage } from "@/api/post"; // เพิ่ม deleteImage
import useTestStore from "@/store/tokStore";
import Swal from "sweetalert2";

interface PostDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const PostDialog = ({ open, onOpenChange }: PostDialogProps) => {
  const [postForm, setPostForm] = useState({
    category_id: null as number | null,
    title: "",
    description: "",
    // ✅ เปลี่ยนชื่อให้ตรงกับที่ Backend รอรับ
    image_data: [] as { url: string; public_id: string }[],
  });

  const [loading, setLoading] = useState(false);
  const categories = useTestStore((state) => state.categories);
  const token = useTestStore((state) => state.token);

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !token) return;

    const files = Array.from(e.target.files);

    try {
      setLoading(true);
      const uploadedResults = await Promise.all(
        files.map(async (file) => {
          const reader = new FileReader();
          return new Promise<{ url: string; public_id: string }>(
            (resolve, reject) => {
              reader.readAsDataURL(file);
              reader.onloadend = async () => {
                try {
                  const res = await uploadFile(token, reader.result as string);

                  resolve({
                    url: res.data.url,
                    public_id: res.data.public_id, // ตรวจสอบชื่อ key จาก backend (public หรือ public_id)
                  });
                } catch (err) {
                  reject(err);
                }
              };
              reader.onerror = reject;
            },
          );
        }),
      );

      // ✅ Update เข้า image_data
      setPostForm((prev) => ({
        ...prev,
        image_data: [...prev.image_data, ...uploadedResults],
      }));
    } catch (err) {
      Swal.fire("เกิดข้อผิดพลาด", "ไม่สามารถอัปโหลดรูปภาพได้", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveImage = async (index: number, public_id: string) => {
    try {
      // ลบจาก UI ทันที
      const newImages = [...postForm.image_data];
      newImages.splice(index, 1);
      setPostForm({ ...postForm, image_data: newImages });

      // สั่งลบใน Cloudinary (Optional: เพื่อไม่ให้ไฟล์ขยะค้าง)
      await deleteImage(token!, public_id);
    } catch (err) {
      console.error("Remove image error:", err);
    }
  };

  const handleSubmit = async () => {
    if (!postForm.title.trim() || !postForm.category_id) {
      Swal.fire("ข้อมูลไม่ครบ", "กรุณาระบุชื่อสิ่งของและหมวดหมู่", "warning");
      return;
    }

    try {
      setLoading(true);
      // ✅ ส่ง postForm ที่มี image_data ไปหา Backend
      await createPost(token!, postForm);

      Swal.fire({
        icon: "success",
        title: "โพสต์สำเร็จ!",
        timer: 1500,
        showConfirmButton: false,
      });

      // Reset Form
      setPostForm({
        category_id: null,
        title: "",
        description: "",
        image_data: [],
      });
      onOpenChange(false);
    } catch (err) {
      console.error(err);
      Swal.fire("เกิดข้อผิดพลาด", "ไม่สามารถสร้างโพสต์ได้", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[550px] max-h-[90vh] rounded-[28px] p-0 overflow-hidden border-none shadow-2xl flex flex-col">
        <div className="h-1.5 bg-linear-to-r from-[#FFB800] to-[#FF5800] shrink-0" />

        <div className="px-8 pt-8 pb-4 shrink-0">
          <DialogHeader>
            <DialogTitle className="text-2xl font-black text-gray-900 tracking-tight flex items-center gap-2">
              <Pencil className="text-[#FF5800]" size={24} />
              เขียนโพสต์ของคุณ
            </DialogTitle>
            <DialogDescription className="text-gray-500">
              ระบุรายละเอียดสิ่งของที่ต้องการนำมาแลกเปลี่ยนให้ชัดเจน
            </DialogDescription>
          </DialogHeader>
        </div>

        <div className="px-8 py-2 overflow-y-auto flex-1 custom-scrollbar">
          <div className="space-y-5 pb-4">
            {/* Title */}
            <div className="relative group">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#FF5800] transition-colors">
                <ShoppingBag size={18} />
              </div>
              <input
                type="text"
                placeholder="ชื่อสิ่งของที่ต้องการแลก..."
                value={postForm.title}
                className="w-full rounded-2xl bg-gray-50 border-none py-3.5 pl-10 pr-4 text-sm font-bold shadow-inner ring-1 ring-gray-200 outline-none focus:ring-2 focus:ring-[#FF5800]/50 transition-all"
                onChange={(e) =>
                  setPostForm({ ...postForm, title: e.target.value })
                }
              />
            </div>

            {/* Category */}
            <div className="relative group">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                <Tag size={18} />
              </div>
              <select
                value={postForm.category_id ?? ""}
                onChange={(e) =>
                  setPostForm({
                    ...postForm,
                    category_id: Number(e.target.value),
                  })
                }
                className="w-full rounded-2xl bg-gray-50 border-none py-3.5 pl-10 pr-10 text-sm font-bold shadow-inner ring-1 ring-gray-200 outline-none focus:ring-2 focus:ring-[#FF5800]/50 appearance-none cursor-pointer"
              >
                <option value="">เลือกหมวดหมู่สิ่งของ</option>
                {categories.map((cat: any) => (
                  <option key={cat.category_id} value={cat.category_id}>
                    {cat.category_name}
                  </option>
                ))}
              </select>
            </div>

            {/* Description */}
            <Textarea
              placeholder="รายละเอียดสิ่งของ..."
              value={postForm.description}
              className="min-h-[120px] rounded-2xl bg-gray-50 border-none p-4 text-sm font-medium shadow-inner ring-1 ring-gray-200 focus-visible:ring-2 focus-visible:ring-[#FF5800]/50 transition-all resize-none"
              onChange={(e) =>
                setPostForm({ ...postForm, description: e.target.value })
              }
            />

            {/* Upload Area */}
            <div className="space-y-4">
              <label className="flex w-full cursor-pointer flex-col items-center justify-center gap-3 rounded-[24px] border-2 border-dashed border-gray-200 bg-gray-50/50 py-10 transition-all hover:border-[#FF5800] hover:bg-orange-50/30 group">
                <div className="p-4 bg-white rounded-2xl shadow-sm text-gray-400 group-hover:text-[#FF5800]">
                  {loading ? (
                    <Loader2 className="animate-spin" size={24} />
                  ) : (
                    <ImagePlus size={24} />
                  )}
                </div>
                <p className="text-sm font-bold text-gray-700">
                  เพิ่มรูปภาพสิ่งของ
                </p>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                  disabled={loading}
                />
              </label>

              {/* Preview Grid */}
              {postForm.image_data.length > 0 && (
                <div className="grid grid-cols-3 gap-3 pt-2">
                  {postForm.image_data.map((img, index) => (
                    <div
                      key={index}
                      className="relative group/img aspect-square animate-in fade-in zoom-in-95"
                    >
                      <button
                        type="button"
                        onClick={() => handleRemoveImage(index, img.public_id)}
                        className="absolute -right-1 -top-1 z-20 flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-white shadow-lg hover:bg-red-600 transition-all"
                      >
                        <X size={12} strokeWidth={3} />
                      </button>
                      <img
                        src={img.url}
                        alt="preview"
                        className="h-full w-full object-cover rounded-xl ring-1 ring-gray-100 shadow-sm"
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="p-8 bg-gray-50/50 border-t border-gray-100 shrink-0">
          <DialogFooter className="gap-3 sm:gap-0">
            <Button
              variant="ghost"
              onClick={() => onOpenChange(false)}
              className="flex-1 rounded-xl font-bold text-gray-400"
            >
              ยกเลิก
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={loading}
              className="flex-2 rounded-xl bg-[#FF5800] font-black text-white hover:bg-[#E64F00] shadow-lg active:scale-95 transition-all"
            >
              {loading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                "ลงประกาศเลย"
              )}
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PostDialog;
