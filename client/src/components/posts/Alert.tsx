import { CheckCircle2, XCircle } from "lucide-react";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  type: "success" | "error";
  title: string;
  message: string;
}

const Alert = ({ isOpen, onClose, type, title, message }: Props) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-9999 flex items-center justify-center p-4">
      {/* Overlay - พื้นหลังดำเบลอ */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      
      {/* Modal Card */}
      <div className="relative bg-white rounded-[32px] p-8 w-full max-w-sm shadow-2xl animate-in fade-in zoom-in duration-300">
        <div className="flex flex-col items-center text-center">
          {/* Icon */}
          <div className={`mb-4 p-4 rounded-full ${type === 'success' ? 'bg-green-50 text-green-500' : 'bg-red-50 text-red-500'}`}>
            {type === 'success' ? <CheckCircle2 size={48} /> : <XCircle size={48} />}
          </div>

          <h2 className="text-xl font-bold text-gray-900 mb-2">{title}</h2>
          <p className="text-gray-500 text-sm mb-8 leading-relaxed">{message}</p>

          <button
            onClick={onClose}
            className={`w-full py-3 rounded-2xl font-bold text-white transition-all active:scale-95 shadow-lg ${
              type === 'success' ? 'bg-green-500 hover:bg-green-600 shadow-green-200' : 'bg-red-500 hover:bg-red-600 shadow-red-200'
            }`}
          >
            ตกลง
          </button>
        </div>
      </div>
    </div>
  );
};

export default Alert;