import { useState, useEffect } from "react";
import { getUsage } from "../../api/billing";
import { CreditCard, Users, ScanLine, TrendingUp } from "lucide-react";
import StatsCard from "../../components/ui/StatsCard";
import LoadingSpinner from "../../components/ui/LoadingSpinner";

export default function Billing() {
  const [usage, setUsage] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await getUsage();
        setUsage(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) return <div className="flex items-center justify-center py-32"><LoadingSpinner size="lg" text="Loading usage data..." /></div>;
  if (!usage) return <div className="text-center py-20 text-gray-400">Unable to load usage data.</div>;

  const scanPct = usage.max_scans_per_month > 0 ? Math.round((usage.current_month_scans / usage.max_scans_per_month) * 100) : 0;
  const userPct = usage.max_users > 0 ? Math.round((usage.current_users / usage.max_users) * 100) : 0;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Usage & Plan</h1>
        <p className="text-gray-400 mt-1">Monitor your hospital's resource consumption.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard label="Current Plan" value={usage.plan?.toUpperCase()} icon={CreditCard} color="purple" />
        <StatsCard label="Doctors" value={`${usage.current_users}/${usage.max_users}`} icon={Users} color="blue" />
        <StatsCard label="Scans This Month" value={`${usage.current_month_scans}/${usage.max_scans_per_month}`} icon={ScanLine} color="green" />
        <StatsCard label="Scan Usage" value={`${scanPct}%`} icon={TrendingUp} color="orange" />
      </div>

      {/* Usage bars */}
      <div className="bg-white border border-gray-100 rounded-2xl p-8 shadow-sm space-y-8">
        <div>
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-semibold text-gray-700">Scan Usage</p>
            <p className="text-sm text-gray-400">{usage.current_month_scans} / {usage.max_scans_per_month}</p>
          </div>
          <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
            <div className={`h-full rounded-full transition-all ${scanPct > 80 ? "bg-red-500" : scanPct > 50 ? "bg-amber-500" : "bg-emerald-500"}`} style={{ width: `${Math.min(scanPct, 100)}%` }} />
          </div>
        </div>
        <div>
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-semibold text-gray-700">User Seats</p>
            <p className="text-sm text-gray-400">{usage.current_users} / {usage.max_users}</p>
          </div>
          <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
            <div className={`h-full rounded-full transition-all ${userPct > 80 ? "bg-red-500" : userPct > 50 ? "bg-amber-500" : "bg-blue-500"}`} style={{ width: `${Math.min(userPct, 100)}%` }} />
          </div>
        </div>
      </div>
    </div>
  );
}
