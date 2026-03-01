import { useState } from "react";
import Resize from "react-image-file-resizer";
import { uploadFile } from "@/api/post";
import useTestStore from "@/store/tokStore";

interface Props {
  postForm: any;
  setPostForm: any;
}

const UploadImage = ({ postForm, setPostForm }: Props) => {
  const token = useTestStore((s) => s.token);
  const [isLoading, setIsLoading] = useState(false);

  const handleOnChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    setIsLoading(true);

    Array.from(files).forEach((file) => {
      if (!file.type.startsWith("image/")) {
        return;
      }

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

            setPostForm((prev: any) => ({
              ...prev,
              image_urls: [...prev.image_urls, res.data.url],
            }));

          } catch (err) {
            console.error(err);
          } finally {
            setIsLoading(false);
          }
        },
        "base64"
      );
    });
  };

  return (
    <div>
      <input
        type="file"
        multiple
        accept="image/*"
        onChange={handleOnChange}
      />

      {isLoading && <p>กำลังอัปโหลด...</p>}
    </div>
  );
};

export default UploadImage;