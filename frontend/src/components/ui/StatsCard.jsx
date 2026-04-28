export default function StatsCard({ label, value, icon: Icon, color = "blue" }) {
  const colors = {
    blue: "text-blue-600 bg-blue-50 border-blue-100",
    green: "text-emerald-600 bg-emerald-50 border-emerald-100",
    purple: "text-purple-600 bg-purple-50 border-purple-100",
    orange: "text-orange-600 bg-orange-50 border-orange-100",
  };

  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-4">
        <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">{label}</span>
        {Icon && (
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${colors[color]}`}>
            <Icon className="w-5 h-5" strokeWidth={1.5} />
          </div>
        )}
      </div>
      <div className={`text-3xl font-black ${colors[color].split(" ")[0]}`}>{value}</div>
    </div>
  );
}
