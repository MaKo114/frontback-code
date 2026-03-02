import { useEffect, useState } from "react";
import useTestStore from "@/store/tokStore";
import { getSentExchangesApi, getReceivedExchangesApi, updateExchangeStatusApi } from "@/api/post";
import { ArrowRightLeft, Clock, Check, X, CheckCircle, ExternalLink } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { th } from "date-fns/locale";
import { Button } from "@/components/ui/button";

const Exchanges = () => {
  const [sentRequests, setSentRequests] = useState<any[]>([]);
  const [receivedRequests, setReceivedRequests] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'sent' | 'received'>('received');
  const [loading, setLoading] = useState(true);
  const token = useTestStore((state) => state.token);

  useEffect(() => {
    if (token) {
      loadExchanges();
    }
  }, [token]);

  const loadExchanges = async () => {
    try {
      setLoading(true);
      const [sentRes, receivedRes] = await Promise.all([
        getSentExchangesApi(token!),
        getReceivedExchangesApi(token!)
      ]);
      setSentRequests(sentRes.data.data);
      setReceivedRequests(receivedRes.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (id: string, status: string) => {
    try {
      if (!confirm(`คุณแน่ใจหรือไม่ว่าต้องการ ${status === 'ACCEPTED' ? 'ยอมรับ' : status === 'REJECTED' ? 'ปฏิเสธ' : 'ทำเครื่องหมายว่าสำเร็จ'}?`)) return;
      await updateExchangeStatusApi(token!, id, status);
      alert("อัปเดตสถานะสำเร็จ");
      loadExchanges();
    } catch (err: any) {
      console.error(err);
      alert(err.response?.data?.error || "อัปเดตสถานะไม่สำเร็จ");
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING': return <span className="bg-amber-100 text-amber-600 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5"><Clock size={14} /> กำลังรอการตอบรับ</span>;
      case 'ACCEPTED': return <span className="bg-green-100 text-green-600 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5"><Check size={14} /> ยอมรับแล้ว</span>;
      case 'REJECTED': return <span className="bg-red-100 text-red-600 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5"><X size={14} /> ปฏิเสธแล้ว</span>;
      case 'COMPLETED': return <span className="bg-blue-100 text-blue-600 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5"><CheckCircle size={14} /> สำเร็จแล้ว</span>;
      default: return null;
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <div className="flex items-center gap-4 mb-8">
        <div className="bg-amber-400 p-3 rounded-2xl shadow-lg shadow-amber-200">
          <ArrowRightLeft className="text-white" size={28} />
        </div>
        <h1 className="text-3xl font-bold text-foreground">รายการแลกเปลี่ยน</h1>
      </div>

      {/* Tabs */}
      <div className="flex p-1 bg-muted rounded-xl mb-8 border border-input max-w-sm">
        <button
          onClick={() => setActiveTab('received')}
          className={`flex-1 py-2.5 text-sm font-semibold rounded-lg transition-all ${activeTab === 'received'
              ? "bg-white text-amber-500 shadow-sm ring-1 ring-black/5"
              : "text-muted-foreground hover:text-foreground"
            }`}
        >
          คนขอเรา ({receivedRequests.length})
        </button>
        <button
          onClick={() => setActiveTab('sent')}
          className={`flex-1 py-2.5 text-sm font-semibold rounded-lg transition-all ${activeTab === 'sent'
              ? "bg-white text-amber-500 shadow-sm ring-1 ring-black/5"
              : "text-muted-foreground hover:text-foreground"
            }`}
        >
          เราขอเขา ({sentRequests.length})
        </button>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-24 space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500"></div>
          <p className="text-muted-foreground font-medium">กำลังโหลดข้อมูล...</p>
        </div>
      ) : (activeTab === 'received' ? receivedRequests : sentRequests).length === 0 ? (
        <div className="text-center py-24 bg-card rounded-2xl border border-dashed border-input shadow-sm">
          <div className="bg-muted w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <ArrowRightLeft className="text-muted-foreground" size={28} />
          </div>
          <h3 className="text-xl font-bold text-foreground mb-2">ไม่มีรายการแลกเปลี่ยน</h3>
          <p className="text-muted-foreground max-w-xs mx-auto">ยังไม่มีคำขอในตอนนี้ เมื่อมีคำขอเข้ามาคุณจะเห็นข้อมูลตรงนี้</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {(activeTab === 'received' ? receivedRequests : sentRequests).map((e) => (
            <div
              key={e.exchange_id}
              className="bg-card border border-input rounded-2xl p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex justify-between items-start mb-4">
                  {getStatusBadge(e.status)}
                  <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">
                    {formatDistanceToNow(new Date(e.created_at), { addSuffix: true, locale: th })}
                  </span>
                </div>

                <div className="mb-4">
                  <p className="text-xs text-muted-foreground font-semibold mb-1 uppercase tracking-tight">ชื่อสิ่งของ</p>
                  <h3 className="text-lg font-bold text-foreground leading-tight">{e.title}</h3>
                </div>

                <div className="flex items-center gap-3 mb-6 p-3 bg-muted/30 rounded-xl">
                  <div className="h-10 w-10 rounded-full bg-amber-100 flex items-center justify-center">
                    <span className="text-amber-600 font-bold text-xs">
                      {(activeTab === 'received' ? e.requester_name : e.owner_name)[0]}
                    </span>
                  </div>
                  <div>
                    <p className="text-[10px] text-muted-foreground font-bold uppercase">{activeTab === 'received' ? 'ผู้ส่งคำขอ' : 'เจ้าของโพสต์'}</p>
                    <p className="text-sm font-bold text-foreground">
                      {activeTab === 'received'
                        ? `${e.requester_name} ${e.requester_surname}`
                        : `${e.owner_name} ${e.owner_surname}`}
                    </p>
                  </div>
                </div>
              </div>

              {activeTab === 'received' && e.status === 'PENDING' && (
                <div className="grid grid-cols-2 gap-2 mt-auto">
                  <Button
                    onClick={() => handleUpdateStatus(e.exchange_id, 'ACCEPTED')}
                    className="bg-green-500 hover:bg-green-600 text-white font-bold h-11 rounded-xl shadow-lg shadow-green-100"
                  >
                    ยอมรับ
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => handleUpdateStatus(e.exchange_id, 'REJECTED')}
                    className="border-red-200 text-red-500 hover:bg-red-50 hover:text-red-600 font-bold h-11 rounded-xl"
                  >
                    ปฏิเสธ
                  </Button>
                </div>
              )}

              {activeTab === 'received' && e.status === 'ACCEPTED' && (
                <Button
                  onClick={() => handleUpdateStatus(e.exchange_id, 'COMPLETED')}
                  className="w-full bg-amber-400 hover:bg-amber-500 text-white font-bold h-11 rounded-xl shadow-lg shadow-amber-100 mt-auto"
                >
                  แลกเปลี่ยนสำเร็จแล้ว
                </Button>
              )}

              {e.status === 'COMPLETED' && (
                <div className="flex items-center justify-center gap-2 text-green-600 font-bold py-2 bg-green-50 rounded-xl mt-auto">
                  <CheckCircle size={18} />
                  <span>การแลกเปลี่ยนนี้สิ้นสุดแล้ว</span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Exchanges;
