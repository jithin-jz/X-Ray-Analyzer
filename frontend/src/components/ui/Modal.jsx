export default function Modal({ isOpen, onClose, title, children }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Scrim */}
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      {/* Card */}
      <div className="relative w-full max-w-md bg-[var(--canvas)] rounded-[24px] sm:rounded-[32px] p-6 sm:p-8 mx-4">
        {title && (
          <h2 className="text-[22px] font-semibold text-[var(--ink)] mb-6">{title}</h2>
        )}
        {children}
      </div>
    </div>
  );
}
