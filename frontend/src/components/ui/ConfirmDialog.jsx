import { AlertTriangle } from "lucide-react";

export default function ConfirmDialog({ isOpen, onClose, onConfirm, title, message, confirmText = "Confirm", variant = "danger" }) {
  if (!isOpen) return null;

  const variants = {
    danger: { icon: "bg-red-50 text-red-600", btn: "bg-red-600 hover:bg-red-700" },
    warning: { icon: "bg-amber-50 text-amber-600", btn: "bg-amber-600 hover:bg-amber-700" },
  };
  const v = variants[variant] || variants.danger;

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-sm bg-white rounded-2xl p-8 shadow-2xl border border-gray-100 animate-in zoom-in duration-200">
        <div className={`w-12 h-12 rounded-xl ${v.icon} flex items-center justify-center mb-5`}>
          <AlertTriangle className="w-6 h-6" strokeWidth={1.5} />
        </div>
        <h3 className="text-lg font-bold text-gray-900 mb-2">{title}</h3>
        <p className="text-sm text-gray-500 mb-6">{message}</p>
        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors">
            Cancel
          </button>
          <button onClick={onConfirm} className={`flex-1 py-2.5 ${v.btn} text-white rounded-xl text-sm font-semibold transition-colors`}>
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
