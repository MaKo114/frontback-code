import { useState } from "react";
import Resize from "react-image-file-resizer";
import { uploadFile } from "@/api/post";
import useTestStore from "@/store/tokStore";

interface Props {
  postForm: any;
  setPostForm: any;
}

const UploadImage = ({ setPostForm }: Props) => {
  const token = useTestStore((s) => s.token);
  const [isLoading, setIsLoading] = useState(false);

  const handleOnChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    setIsLoading(true);

    Array.from(files).forEach((file) => {
      if (!file.type.startsWith("image/")) return;

      Resize.imageFileResizer(
        file,
        720,
        720,
        "JPEG",
        90,
        0,
        async (data) => {
          try {
            const res = await uploadFile(token!, data as string);

            // ✅ แก้ตรงนี้: เก็บทั้ง url และ public_id
            setPostForm((prev: any) => ({
              ...prev,
              // เปลี่ยนชื่อเป็น image_data หรือถ้าจะใช้ image_urls เดิม
              // ก็ต้องส่งเป็น object เข้าไปครับ
              image_data: [
                ...prev.image_data,
                {
                  url: res.data.url,
                  public_id: res.data.public, // 'public' คือชื่อที่พี่ return จาก Backend
                },
              ],
            }));
          } catch (err) {
            console.error("Upload failed:", err);
          } finally {
            setIsLoading(false);
          }
        },
        "base64",
      );
    });
  };

  return (
    <div>
      <input type="file" multiple accept="image/*" onChange={handleOnChange} />

      {isLoading && <p>กำลังอัปโหลด...</p>}
    </div>
  );
};

export default UploadImage;
