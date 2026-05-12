const variants = {
  default: "bg-[var(--surface-card)] text-[var(--mute)]",
  success: "bg-[#c7f0da] text-[#103c25]",
  warning: "bg-amber-50 text-amber-700",
  danger: "bg-red-50 text-[var(--error)]",
  info: "bg-blue-50 text-blue-700",
  purple: "bg-purple-50 text-purple-700",
};

export default function Badge({ children, variant = "default" }) {
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 text-xs font-bold rounded-[9999px] ${variants[variant] || variants.default}`}>
      {children}
    </span>
  );
}
