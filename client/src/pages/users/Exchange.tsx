import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  CheckCircle2,
  Clock,
  Package,
  ArrowRightLeft,
  MessageCircle,
} from "lucide-react";

const ExchangePage = () => {
  return (
    <div className="min-h-screen bg-[#FAFAFA] pb-20 pt-10">
      {/* 2. ใช้ Container max-w-4xl mx-auto เหมือนหน้า MyPost */}
      <main className="mx-auto max-w-4xl px-4">
        {/* Header Section: ปรับให้ดูเป็นสัดส่วนเดียวกับ Header ข้างล่าง */}
        <div className="flex items-center gap-4 mb-8">
          <div className="p-3 bg-white rounded-2xl shadow-sm border border-gray-100 text-[#FF5800]">
            <ArrowRightLeft size={28} strokeWidth={2.5} />
          </div>
          <div>
            <h1 className="text-3xl font-black text-gray-900 tracking-tight">
              การแลกเปลี่ยน
            </h1>
            <p className="text-sm font-bold text-gray-400 uppercase tracking-widest">
              จัดการรายการที่คุณสนใจ
            </p>
          </div>
        </div>

        <Tabs defaultValue="inbound" className="w-full">
          {/* ปรับขนาด TabsList ให้เท่ากับหน้า MyPost (w-full md:w-[400px]) */}
          <TabsList className="bg-gray-200/50 p-1 rounded-2xl mb-8 w-full md:w-[450px]">
            <TabsTrigger
              value="inbound"
              className="rounded-xl font-bold py-2.5 flex-1"
            >
              ของของฉัน (มีคนมาขอแลก)
            </TabsTrigger>
            <TabsTrigger
              value="outbound"
              className="rounded-xl font-bold py-2.5 flex-1"
            >
              ฉันไปขอแลก
            </TabsTrigger>
          </TabsList>

          <TabsContent value="inbound" className="space-y-6">
            <ExchangeCard
              role="owner"
              itemTitle="กล้องฟิล์ม Olympus"
              partnerName="Somchai"
              status="OPEN"
              description="สนใจแลกกับหูฟังครับ"
            />
          </TabsContent>

          {/* --- ฝั่งคนไปขอแลก --- */}
          <TabsContent value="outbound" className="space-y-4">
            <ExchangeCard
              role="requester"
              itemTitle="Keyboard Mechanical"
              partnerName="Owner: AdminTok"
              status="MATCHED"
              description="คุณได้รับเลือกให้แลกเปลี่ยนสิ่งของนี้"
            />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

// --- Component ย่อยสำหรับ Card การแลกเปลี่ยน ---
const ExchangeCard = ({
  role,
  itemTitle,
  partnerName,
  status,
  description,
}: any) => {
  return (
    <Card className="rounded-[24px] border-none shadow-sm ring-1 ring-gray-200 overflow-hidden hover:shadow-md transition-shadow">
      <div className="flex flex-col md:flex-row">
        {/* รูปสิ่งของเล็กๆ */}
        <div className="w-full md:w-32 h-32 bg-gray-200 shrink-0">
          <img
            src="https://via.placeholder.com/150"
            alt="item"
            className="w-full h-full object-cover"
          />
        </div>

        <div className="p-5 flex-1 flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="font-black text-lg text-gray-900">{itemTitle}</h3>
              <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                {role === "owner" ? "ผู้สนใจ: " : "เจ้าของโพสต์: "}
                <span className="font-bold text-[#FF5800]">{partnerName}</span>
              </p>
            </div>
            <StatusBadge status={status} />
          </div>

          <div className="mt-4 flex items-center justify-between">
            <p className="text-xs text-gray-400 italic">"{description}"</p>

            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="rounded-xl gap-1">
                <MessageCircle size={16} /> แชท
              </Button>

              {/* Logic ปุ่มเปลี่ยนตามสถานะ */}
              {role === "owner" && status === "OPEN" && (
                <Button className="bg-[#FF5800] hover:bg-[#E64F00] text-white rounded-xl size-sm font-bold">
                  ยืนยันเลือกคนนี้
                </Button>
              )}

              {role === "requester" && status === "MATCHED" && (
                <Button className="bg-green-600 hover:bg-green-700 text-white rounded-xl size-sm font-bold gap-1">
                  <CheckCircle2 size={16} /> ฉันได้รับของแล้ว
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};

// Badge แสดงสถานะ
const StatusBadge = ({ status }: { status: string }) => {
  const config: any = {
    OPEN: {
      label: "รอเลือกผู้แลก",
      class: "bg-blue-100 text-blue-600",
      icon: <Clock size={12} />,
    },
    MATCHED: {
      label: "กำลังแลกเปลี่ยน",
      class: "bg-orange-100 text-orange-600",
      icon: <Package size={12} />,
    },
    SUCCESS: {
      label: "สำเร็จแล้ว",
      class: "bg-green-100 text-green-600",
      icon: <CheckCircle2 size={12} />,
    },
  };
  const s = config[status] || config.OPEN;
  return (
    <Badge
      className={`${s.class} border-none rounded-full px-3 py-1 flex gap-1 items-center`}
    >
      {s.icon} {s.label}
    </Badge>
  );
};

export default ExchangePage;
