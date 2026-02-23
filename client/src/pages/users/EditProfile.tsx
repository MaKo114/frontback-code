import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, User, Camera } from "lucide-react";
import { Avatar, AvatarFallback } from "../../components/ui/avatar";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Button } from "../../components/ui/button";

const EditProfile = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "นมศักดิ์ มาโล",
    email: "nomsak@example.com",
    phone: "081-234-5678",
    password: "",
  });

  const handleChange = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    // TODO: save logic
    navigate("/my-posts");
  };

  return (
    <div className="min-h-screen bg-background">

      <div className="mx-auto max-w-2xl">
        {/* Cover photo editable */}
        <div className="relative h-36 bg-gradient-to-r from-amber-300 to-orange-300">
          <button className="absolute bottom-2 right-3 flex items-center gap-1 rounded-md bg-white/90 px-3 py-1 text-xs font-medium text-foreground shadow-sm hover:bg-white transition">
            <Camera size={14} />
            เปลี่ยนรูปหน้าปก
          </button>
        </div>

        {/* Avatar editable */}
        <div className="relative -mt-10 flex justify-center">
          <div className="relative">
            <Avatar className="h-20 w-20 border-4 border-background shadow-md">
              <AvatarFallback className="bg-muted text-muted-foreground">
                <User size={36} />
              </AvatarFallback>
            </Avatar>
            <button className="absolute bottom-0 right-0 flex h-7 w-7 items-center justify-center rounded-full bg-amber-400 text-white shadow-sm hover:bg-amber-500 transition">
              <Camera size={14} />
            </button>
          </div>
        </div>

        {/* Form */}
        <div className="mt-6 space-y-5 px-6 pb-10">
          <div className="space-y-2">
            <Label htmlFor="name">ชื่อ-นามสกุล</Label>
            <Input
              id="name"
              value={form.name}
              onChange={(e) => handleChange("name", e.target.value)}
              maxLength={100}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">อีเมล</Label>
            <Input
              id="email"
              type="email"
              value={form.email}
              onChange={(e) => handleChange("email", e.target.value)}
              maxLength={255}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">เบอร์โทรศัพท์</Label>
            <Input
              id="phone"
              type="tel"
              value={form.phone}
              onChange={(e) => handleChange("phone", e.target.value)}
              maxLength={20}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">รหัสผ่านใหม่</Label>
            <Input
              id="password"
              type="password"
              placeholder="กรอกเฉพาะเมื่อต้องการเปลี่ยน"
              value={form.password}
              onChange={(e) => handleChange("password", e.target.value)}
              maxLength={128}
            />
          </div>

          <div className="flex gap-3 pt-2">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => navigate(-1)}
            >
              ยกเลิก
            </Button>
            <Button
              className="flex-1 bg-amber-400 text-white hover:bg-amber-500"
              onClick={handleSave}
            >
              บันทึก
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditProfile;