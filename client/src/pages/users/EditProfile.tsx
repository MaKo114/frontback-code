import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, User, Camera, Phone, Save, Loader2 } from "lucide-react";
import { Avatar, AvatarFallback } from "../../components/ui/avatar";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Button } from "../../components/ui/button";
import Swal from "sweetalert2";
import { getMyProfileApi, updateProfileApi, uploadFile, deleteImage } from "@/api/post";
import useTestStore from "@/store/tokStore";

const EditProfile = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const getUserInformation = useTestStore((state) => state.getUserInformation);
  const token = useTestStore((state) => state.token);

  const [previewAvatar, setPreviewAvatar] = useState<string | null>(null);
  const [previewCover, setPreviewCover] = useState<string | null>(null);

  // เก็บ public_id ของรูปเก่าที่อยู่ใน Cloudinary อยู่แล้ว
  const [oldAvatarPublicId, setOldAvatarPublicId] = useState<string | null>(null);
  const [oldCoverPublicId, setOldCoverPublicId] = useState<string | null>(null);

  const [form, setForm] = useState({ name: "", email: "", phone: "", password: "" });

  const avatarRef = useRef<HTMLInputElement>(null);
  const coverRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        if (!token) return;
        const res = await getMyProfileApi(token);
        const user = res.data;
        setForm({
          name: `${user.first_name} ${user.last_name}`,
          email: user.email,
          phone: user.phone_number || "",
          password: "",
        });
        setPreviewAvatar(user.profile_img);
        setPreviewCover(user.cover_img);
        // เก็บ public_id เดิมไว้ เพื่อลบทีหลังถ้ามีการเปลี่ยน
        setOldAvatarPublicId(user.profile_public_id || null);
        setOldCoverPublicId(user.cover_public_id || null);
      } catch (err) {
        console.error("Fetch profile error", err);
      }
    };
    fetchProfile();
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: "avatar" | "cover") => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result as string;
      if (type === "avatar") setPreviewAvatar(base64);
      else setPreviewCover(base64);
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    if (!token) return Swal.fire("กรุณาเข้าสู่ระบบ");
    setLoading(true);

    try {
      let finalAvatarUrl = previewAvatar;
      let finalCoverUrl = previewCover;
      let newAvatarPublicId: string | null = null;
      let newCoverPublicId: string | null = null;

      // อัปโหลดรูป avatar ใหม่ (base64) → ลบรูปเก่าออกจาก Cloudinary ก่อน
      if (previewAvatar?.startsWith("data:image")) {
        if (oldAvatarPublicId) {
          try { await deleteImage(token, oldAvatarPublicId); } catch (e) { console.error("Delete old avatar:", e); }
        }
        const res = await uploadFile(token, previewAvatar);
        finalAvatarUrl = res.data.url;
        newAvatarPublicId = res.data.public_id;
      }

      // อัปโหลดรูป cover ใหม่ (base64) → ลบรูปเก่าออกจาก Cloudinary ก่อน
      if (previewCover?.startsWith("data:image")) {
        if (oldCoverPublicId) {
          try { await deleteImage(token, oldCoverPublicId); } catch (e) { console.error("Delete old cover:", e); }
        }
        const res = await uploadFile(token, previewCover);
        finalCoverUrl = res.data.url;
        newCoverPublicId = res.data.public_id;
      }

      const nameParts = form.name.trim().split(/\s+/);
      const first_name = nameParts[0] || "";
      const last_name = nameParts.slice(1).join(" ") || "";

      await updateProfileApi(token, {
        first_name,
        last_name,
        phone_number: form.phone,
        profile_img: finalAvatarUrl,
        cover_img: finalCoverUrl,
        profile_public_id: newAvatarPublicId ?? oldAvatarPublicId,
        cover_public_id: newCoverPublicId ?? oldCoverPublicId,
      });

      await getUserInformation();

      await Swal.fire({ icon: "success", title: "บันทึกสำเร็จ", showConfirmButton: false, timer: 1500 });
      navigate(-1);
    } catch (err) {
      console.error(err);
      Swal.fire({ icon: "error", title: "บันทึกไม่สำเร็จ" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen bg-[#FAFAFA] flex flex-col items-center justify-center p-4 overflow-hidden">
      <div className="w-full max-w-2xl bg-white rounded-[32px] shadow-2xl border border-gray-100 flex flex-col max-h-[95vh] overflow-hidden">

        {/* Cover */}
        <div className="relative h-40 shrink-0 bg-gray-200 overflow-hidden"
          style={{ backgroundImage: `url(${previewCover})`, backgroundSize: "cover", backgroundPosition: "center" }}>
          <div className="absolute inset-0 bg-black/20" />
          <button onClick={() => navigate(-1)}
            className="absolute top-4 left-4 p-2 bg-white/20 backdrop-blur-md rounded-full text-white hover:bg-white/40 z-10">
            <ChevronLeft size={20} />
          </button>
          <button type="button" onClick={() => coverRef.current?.click()}
            className="absolute bottom-3 right-4 z-50 cursor-pointer flex items-center gap-2 rounded-xl bg-black/60 backdrop-blur-md px-3 py-1.5 text-[10px] font-bold text-white border border-white/20 hover:bg-black/80 transition-all">
            <Camera size={14} /> เปลี่ยนรูปหน้าปก
          </button>
          <input type="file" ref={coverRef} className="hidden" accept="image/*"
            onChange={(e) => handleFileChange(e, "cover")} />
        </div>

        {/* Avatar */}
        <div className="relative -mt-14 flex justify-center shrink-0">
          <div className="relative group cursor-pointer" onClick={() => avatarRef.current?.click()}>
            <Avatar className="h-28 w-28 border-[5px] border-white shadow-xl">
              {previewAvatar
                ? <img src={previewAvatar} alt="avatar" className="h-full w-full object-cover" />
                : <AvatarFallback className="bg-orange-50 text-[#FF5800]"><User size={40} /></AvatarFallback>
              }
            </Avatar>
            <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity border-[5px] border-white">
              <Camera size={20} className="text-white" />
            </div>
            <input type="file" ref={avatarRef} className="hidden" accept="image/*"
              onChange={(e) => handleFileChange(e, "avatar")} />
          </div>
        </div>

        {/* Form */}
        <div className="flex-1 px-8 md:px-12 py-6 overflow-y-auto custom-scrollbar">
          <div className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-1.5">
                <Label className="text-[10px] font-black text-gray-400 uppercase ml-1">ชื่อ-นามสกุล</Label>
                <div className="relative">
                  <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="pl-9 h-11 rounded-xl bg-gray-50 border-none ring-1 ring-gray-100 focus:ring-2 focus:ring-[#FF5800]/20 font-bold" />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label className="text-[10px] font-black text-gray-400 uppercase ml-1">เบอร์โทรศัพท์</Label>
                <div className="relative">
                  <Phone size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    className="pl-9 h-11 rounded-xl bg-gray-50 border-none ring-1 ring-gray-100 focus:ring-2 focus:ring-[#FF5800]/20 font-bold" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="p-6 bg-gray-50/50 border-t border-gray-100">
          <div className="flex gap-3">
            <Button variant="ghost" className="flex-1 h-12 rounded-xl font-bold text-gray-400" onClick={() => navigate(-1)}>
              ยกเลิก
            </Button>
            <Button className="flex-2 h-12 rounded-xl bg-[#FF5800] text-white font-black hover:bg-[#E64F00] shadow-lg shadow-orange-100 disabled:opacity-50"
              onClick={handleSave} disabled={loading}>
              {loading ? <Loader2 className="animate-spin" /> : <><Save size={18} className="mr-2" /> บันทึกข้อมูล</>}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditProfile;