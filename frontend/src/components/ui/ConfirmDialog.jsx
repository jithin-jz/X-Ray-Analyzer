export default function ConfirmDialog({ isOpen, onClose, onConfirm, title, message, confirmText = "Confirm" }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative w-full max-w-sm bg-[var(--canvas)] rounded-[24px] sm:rounded-[32px] p-6 sm:p-8 mx-4">
        <h3 className="text-lg font-semibold text-[var(--ink)] mb-2">{title}</h3>
        <p className="text-sm text-[var(--mute)] mb-6 leading-relaxed">{message}</p>
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 text-sm font-bold text-[var(--ink)] bg-[var(--secondary-bg)] rounded-[16px] hover:bg-[var(--secondary-pressed)] transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 py-2.5 text-sm font-bold text-[var(--on-primary)] bg-[var(--primary)] rounded-[16px] hover:bg-[var(--primary-pressed)] transition-colors"
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
