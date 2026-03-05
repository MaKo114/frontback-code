import { useEffect, useState } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  CheckCircle2,
  Clock,
  Package,
  ArrowRightLeft,
  MessageCircle,
  XCircle,
  Loader2,
  RefreshCw,
} from "lucide-react";
import axios from "axios";
import Swal from "sweetalert2";
import useTestStore from "@/store/tokStore";
import { useNavigate } from "react-router-dom";
import { createChat } from "@/api/chat";

const API = import.meta.env.VITE_API_URL;

const getReceivedRequests = (token: string) =>
  axios.get(`${API}/exchanges/received`, {
    headers: { Authorization: `Bearer ${token}` },
  });
const getSentRequests = (token: string) =>
  axios.get(`${API}/exchanges/sent`, {
    headers: { Authorization: `Bearer ${token}` },
  });
const acceptExchange = (token: string, id: number) =>
  axios.put(
    `${API}/exchanges/${id}/status`,
    { status: "ACCEPTED" },
    { headers: { Authorization: `Bearer ${token}` } },
  );
const rejectExchange = (token: string, id: number) =>
  axios.put(
    `${API}/exchanges/${id}/status`,
    { status: "REJECTED" },
    { headers: { Authorization: `Bearer ${token}` } },
  );
const ownerConfirm = (token: string, id: number) =>
  axios.post(
    `${API}/exchanges/${id}/owner-confirm`,
    {},
    { headers: { Authorization: `Bearer ${token}` } },
  );
const requesterConfirm = (token: string, id: number) =>
  axios.post(
    `${API}/exchanges/${id}/requester-confirm`,
    {},
    { headers: { Authorization: `Bearer ${token}` } },
  );

// ---- swal helper ----
const toast = (title: string, icon: "success" | "error" | "warning") =>
  Swal.fire({
    toast: true,
    position: "bottom",
    showConfirmButton: false,
    timer: 3000,
    timerProgressBar: true,
    icon,
    title,
  });

const STATUS_CONFIG: Record<
  string,
  { label: string; color: string; icon: JSX.Element }
> = {
  PENDING: {
    label: "รอการตอบรับ",
    color: "bg-blue-50 text-blue-600 border-blue-100",
    icon: <Clock size={12} />,
  },
  ACCEPTED: {
    label: "กำลังแลกเปลี่ยน",
    color: "bg-orange-50 text-orange-600 border-orange-100",
    icon: <Package size={12} />,
  },
  COMPLETED: {
    label: "สำเร็จแล้ว ✓",
    color: "bg-green-50 text-green-600 border-green-100",
    icon: <CheckCircle2 size={12} />,
  },
  REJECTED: {
    label: "ถูกปฏิเสธ",
    color: "bg-red-50 text-red-500 border-red-100",
    icon: <XCircle size={12} />,
  },
  CANCELED: {
    label: "ยกเลิกแล้ว",
    color: "bg-gray-100 text-gray-400 border-gray-200",
    icon: <XCircle size={12} />,
  },
};

// ---- Main Page ----
const ExchangePage = () => {
  const token = useTestStore((s) => s.token);
  const navigate = useNavigate();

  const [received, setReceived] = useState<any[]>([]);
  const [sent, setSent] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<number | null>(null);

  const fetchAll = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const [r, s] = await Promise.all([
        getReceivedRequests(token),
        getSentRequests(token),
      ]);
      setReceived(r.data.data || []);
      setSent(s.data.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
  }, [token]);

  const handleAction = async (fn: () => Promise<any>, successMsg: string) => {
    try {
      await fn();
      await fetchAll();
      toast(successMsg, "success");
    } catch (err: any) {
      toast(err?.response?.data?.error || "เกิดข้อผิดพลาด", "error");
    } finally {
      setActionLoading(null);
    }
  };

  const goToChat = async (ex: any) => {
    try {
      if (ex.chat_id) {
        // มีห้องอยู่แล้ว → ทั้ง buyer และ seller ไปได้เลย
        navigate(`/user/chat/${ex.chat_id}`);
        return;
      }

      // ยังไม่มีห้อง → ต้องสร้าง
      // buyer สร้างได้ปกติ, seller สร้างไม่ได้ (will 400)
      // แก้โดยดูว่า currentUser เป็น buyer หรือ seller
      const currentUser = useTestStore.getState().user;
      const isBuyer = currentUser?.student_id === ex.requester_id;

      if (isBuyer) {
        const res = await createChat(token, ex.post_id);
        navigate(`/user/chat/${res.data.data.chat_id}`);
      } else {
        // seller — ยังไม่มีห้อง แปลว่า buyer ยังไม่เคยแชทมาก่อน
        Swal.fire({
          toast: true,
          position: "bottom",
          showConfirmButton: false,
          timer: 4000,
          icon: "info",
          title: "รอให้ผู้ขอแลกเปิดแชทก่อนนะครับ",
        });
      }
    } catch (err: any) {
      Swal.fire({
        toast: true,
        position: "bottom",
        showConfirmButton: false,
        timer: 3000,
        icon: "error",
        title: "ไม่สามารถเปิดแชทได้",
      });
    }
  };

  if (loading)
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="animate-spin text-[#FF5800]" size={40} />
      </div>
    );

  return (
    <div className="min-h-screen bg-[#F7F7F5] pb-20 pt-10">
      <main className="mx-auto max-w-3xl px-4">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-white rounded-2xl shadow-sm border border-gray-100 text-[#FF5800]">
              <ArrowRightLeft size={26} strokeWidth={2.5} />
            </div>
            <div>
              <h1 className="text-2xl font-black text-gray-900">
                การแลกเปลี่ยน
              </h1>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-0.5">
                จัดการรายการแลกเปลี่ยน
              </p>
            </div>
          </div>
          <button
            onClick={fetchAll}
            className="p-2.5 rounded-xl hover:bg-gray-100 text-gray-400 transition-colors"
          >
            <RefreshCw size={18} />
          </button>
        </div>

        <Tabs defaultValue="received" className="w-full">
          <TabsList className="bg-white border border-gray-100 shadow-sm p-1 rounded-2xl mb-6 w-full">
            <TabsTrigger
              value="received"
              className="rounded-xl font-bold py-2.5 flex-1 data-[state=active]:bg-[#FF5800] data-[state=active]:text-white"
            >
              มีคนมาขอแลก
              {received.filter((r) => r.status === "PENDING").length > 0 && (
                <span className="ml-2 bg-red-500 text-white text-[10px] font-black rounded-full w-4 h-4 flex items-center justify-center">
                  {received.filter((r) => r.status === "PENDING").length}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger
              value="sent"
              className="rounded-xl font-bold py-2.5 flex-1 data-[state=active]:bg-[#FF5800] data-[state=active]:text-white"
            >
              ฉันไปขอแลก
            </TabsTrigger>
          </TabsList>

          <TabsContent value="received" className="space-y-4">
            {received.length === 0 ? (
              <EmptyState text="ยังไม่มีคนมาขอแลกของคุณ" />
            ) : (
              received.map((ex) => (
                <ExchangeCard
                  key={ex.exchange_id}
                  ex={ex}
                  role="owner"
                  onAccept={() =>
                    handleAction(async () => {
                      setActionLoading(ex.exchange_id);
                      await acceptExchange(token, ex.exchange_id);
                    }, "ยอมรับคำขอแลกแล้ว! 🎉")
                  }
                  onReject={() =>
                    handleAction(async () => {
                      setActionLoading(ex.exchange_id);
                      await rejectExchange(token, ex.exchange_id);
                    }, "ปฏิเสธคำขอแล้ว")
                  }
                  onConfirm={() =>
                    handleAction(async () => {
                      setActionLoading(ex.exchange_id);
                      await ownerConfirm(token, ex.exchange_id);
                    }, "ยืนยันแล้ว รอคู่สนทนายืนยันด้วย")
                  }
                  onChat={() => goToChat(ex)}
                  actionLoading={actionLoading === ex.exchange_id}
                />
              ))
            )}
          </TabsContent>

          <TabsContent value="sent" className="space-y-4">
            {sent.length === 0 ? (
              <EmptyState text="คุณยังไม่ได้ขอแลกของใครเลย" />
            ) : (
              sent.map((ex) => (
                <ExchangeCard
                  key={ex.exchange_id}
                  ex={ex}
                  role="requester"
                  onConfirm={() =>
                    handleAction(async () => {
                      setActionLoading(ex.exchange_id);
                      await requesterConfirm(token, ex.exchange_id);
                    }, "ยืนยันแล้ว รอคู่สนทนายืนยันด้วย")
                  }
                  onChat={() => goToChat(ex)}
                  actionLoading={actionLoading === ex.exchange_id}
                />
              ))
            )}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

const ExchangeCard = ({
  ex,
  role,
  onAccept,
  onReject,
  onConfirm,
  onChat,
  actionLoading,
}: any) => {
  const s = STATUS_CONFIG[ex.status] || STATUS_CONFIG.PENDING;
  const partnerName =
    role === "owner"
      ? `${ex.requester_name} ${ex.requester_surname}`
      : `${ex.owner_name} ${ex.owner_surname}`;

  const showOwnerConfirm =
    role === "owner" && ex.status === "ACCEPTED" && !ex.owner_confirm;
  const showRequesterConfirm =
    role === "requester" && ex.status === "ACCEPTED" && !ex.receiver_confirm;
  const waitingOtherConfirm =
    (role === "owner" &&
      ex.status === "ACCEPTED" &&
      ex.owner_confirm &&
      !ex.receiver_confirm) ||
    (role === "requester" &&
      ex.status === "ACCEPTED" &&
      ex.receiver_confirm &&
      !ex.owner_confirm);

  return (
    <div className="bg-white rounded-[24px] border border-gray-100 shadow-sm hover:shadow-md transition-all overflow-hidden">
      <div
        className={`h-1 w-full ${
          ex.status === "COMPLETED"
            ? "bg-green-400"
            : ex.status === "ACCEPTED"
              ? "bg-[#FF5800]"
              : ex.status === "PENDING"
                ? "bg-blue-400"
                : "bg-gray-200"
        }`}
      />
      <div className="p-5">
        <div className="flex items-start justify-between mb-4">
          <div>
            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-1">
              {role === "owner" ? "ผู้ขอแลก" : "เจ้าของโพสต์"}
            </p>
            <p className="text-lg font-black text-gray-900">{partnerName}</p>
            <p className="text-sm text-gray-500 mt-0.5">
              โพสต์: <span className="font-bold text-gray-700">{ex.title}</span>
            </p>
          </div>
          <Badge
            className={`${s.color} border rounded-full px-3 py-1 flex gap-1 items-center text-[11px] font-bold`}
          >
            {s.icon} {s.label}
          </Badge>
        </div>

        {ex.status === "ACCEPTED" && (
          <div className="mb-4 bg-orange-50 rounded-2xl p-3 border border-orange-100">
            <p className="text-xs font-bold text-orange-600 mb-2">
              📦 ขั้นตอนการยืนยัน
            </p>
            <div className="flex gap-3 items-center">
              <StepDot label="เจ้าของยืนยัน" done={ex.owner_confirm} />
              <div className="flex-1 h-px bg-orange-200" />
              <StepDot label="ผู้ขอแลกยืนยัน" done={ex.receiver_confirm} />
            </div>
          </div>
        )}

        <div className="flex items-center gap-2 flex-wrap">
          <Button
            variant="outline"
            size="sm"
            onClick={onChat}
            className="rounded-xl gap-1.5 font-bold border-gray-200 text-gray-600 hover:border-[#FF5800] hover:text-[#FF5800]"
          >
            <MessageCircle size={15} /> แชท
          </Button>

          {role === "owner" && ex.status === "PENDING" && (
            <>
              <Button
                size="sm"
                onClick={onAccept}
                disabled={actionLoading}
                className="rounded-xl gap-1.5 font-bold bg-[#FF5800] hover:bg-[#e04f00] text-white"
              >
                {actionLoading ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  <CheckCircle2 size={14} />
                )}{" "}
                ยอมรับ
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={onReject}
                disabled={actionLoading}
                className="rounded-xl gap-1.5 font-bold border-red-200 text-red-500 hover:bg-red-50"
              >
                <XCircle size={14} /> ปฏิเสธ
              </Button>
            </>
          )}

          {(showOwnerConfirm || showRequesterConfirm) && (
            <Button
              size="sm"
              onClick={onConfirm}
              disabled={actionLoading}
              className="rounded-xl gap-1.5 font-bold bg-green-600 hover:bg-green-700 text-white"
            >
              {actionLoading ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                <CheckCircle2 size={14} />
              )}
              ฉันได้รับของแล้ว
            </Button>
          )}

          {waitingOtherConfirm && (
            <span className="text-xs text-gray-400 font-bold flex items-center gap-1">
              <Clock size={13} /> รอคู่สนทนายืนยัน...
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

const StepDot = ({ label, done }: { label: string; done: boolean }) => (
  <div className="flex flex-col items-center gap-1">
    <div
      className={`w-6 h-6 rounded-full flex items-center justify-center text-white text-[10px] font-black ${done ? "bg-green-500" : "bg-gray-200 text-gray-400"}`}
    >
      {done ? "✓" : "○"}
    </div>
    <span
      className={`text-[10px] font-bold ${done ? "text-green-600" : "text-gray-400"}`}
    >
      {label}
    </span>
  </div>
);

const EmptyState = ({ text }: { text: string }) => (
  <div className="text-center py-20 bg-white rounded-[32px] border border-gray-100">
    <ArrowRightLeft size={36} className="mx-auto text-gray-200 mb-3" />
    <p className="text-gray-400 font-bold">{text}</p>
  </div>
);

export default ExchangePage;
