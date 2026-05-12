export default function StatsCard({ label, value, icon: Icon }) {
  return (
    <div className="bg-[var(--canvas)] border border-[var(--hairline)] rounded-[16px] p-4 sm:p-5">
      <div className="flex items-center justify-between mb-2 sm:mb-3">
        <span className="text-[10px] sm:text-xs font-bold text-[var(--ash)] uppercase tracking-wider">{label}</span>
        {Icon && <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[var(--ash)]" strokeWidth={1.8} />}
      </div>
      <p className="text-lg sm:text-2xl font-bold text-[var(--ink)]">{value}</p>
    </div>
  );
}
