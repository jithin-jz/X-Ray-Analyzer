import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { getDashboardData, getPlatformStats } from "../../api/admin";
import { getUsage } from "../../api/billing";
import { Building2, Users, ScanLine, Activity, CreditCard, ShieldCheck, TrendingUp, BarChart3 } from "lucide-react";
import StatsCard from "../../components/ui/StatsCard";
import LoadingSpinner from "../../components/ui/LoadingSpinner";
import Badge from "../../components/ui/Badge";

export default function Overview() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [stats, setStats] = useState(null);
  const [usage, setUsage] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const d = await getDashboardData();
        setData(d);
        if (user?.role === "superadmin") {
          const s = await getPlatformStats();
          setStats(s);
        }
        if (user?.role === "admin") {
          const u = await getUsage();
          setUsage(u);
        }
      } catch (err) {
        console.error("Dashboard load error:", err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [user?.role]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <LoadingSpinner size="lg" text="Loading dashboard..." />
      </div>
    );
  }

  // ── Super Admin ─────────────────────────────────────────────────────────
  if (user?.role === "superadmin") {
    const s = stats || data;
    const inactiveHospitals = (s?.total_hospitals || 0) - (s?.active_hospitals || 0);
    const unverifiedUsers = (s?.total_users || 0) - (s?.verified_users || 0);
    const verifiedPct = s?.total_users ? Math.round((s.verified_users / s.total_users) * 100) : 0;

    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Platform Command Center</h1>
          <p className="text-gray-400 mt-1">Global overview of all hospitals and users.</p>
        </div>

        {/* Primary stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatsCard label="Total Hospitals" value={s?.total_hospitals || 0} icon={Building2} color="blue" />
          <StatsCard label="Active Hospitals" value={s?.active_hospitals || 0} icon={Activity} color="green" />
          <StatsCard label="Total Users" value={s?.total_users || 0} icon={Users} color="purple" />
          <StatsCard label="Verified Users" value={s?.verified_users || 0} icon={ShieldCheck} color="orange" />
        </div>

        {/* Platform health bar */}
        <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-6">
          <div className="flex items-center gap-3 mb-4">
            <BarChart3 className="w-5 h-5 text-gray-400" strokeWidth={1.5} />
            <h2 className="text-sm font-bold text-gray-500 uppercase tracking-widest">Platform Health</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div>
              <div className="flex items-center justify-between text-sm mb-2">
                <span className="text-gray-500">Hospital Uptime</span>
                <span className="font-bold text-gray-900">{s?.active_hospitals || 0}/{s?.total_hospitals || 0}</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-2.5">
                <div className="bg-emerald-500 h-2.5 rounded-full transition-all" style={{ width: `${s?.total_hospitals ? (s.active_hospitals / s.total_hospitals) * 100 : 0}%` }} />
              </div>
              <p className="text-xs text-gray-400 mt-1">{inactiveHospitals} inactive</p>
            </div>
            <div>
              <div className="flex items-center justify-between text-sm mb-2">
                <span className="text-gray-500">User Verification</span>
                <span className="font-bold text-gray-900">{verifiedPct}%</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-2.5">
                <div className="bg-blue-500 h-2.5 rounded-full transition-all" style={{ width: `${verifiedPct}%` }} />
              </div>
              <p className="text-xs text-gray-400 mt-1">{unverifiedUsers} unverified</p>
            </div>
            <div>
              <div className="flex items-center justify-between text-sm mb-2">
                <span className="text-gray-500">Growth</span>
                <span className="font-bold text-gray-900">{s?.total_users || 0} users</span>
              </div>
              <div className="flex items-center gap-2 mt-2">
                <TrendingUp className="w-4 h-4 text-emerald-500" />
                <span className="text-sm text-emerald-600 font-semibold">{s?.total_hospitals || 0} hospitals onboarded</span>
              </div>
            </div>
          </div>
        </div>

        {/* Hospital list */}
        <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
            <h2 className="text-sm font-bold text-gray-500 uppercase tracking-widest">Registered Hospitals</h2>
          </div>
          <div className="divide-y divide-gray-100">
            {data?.hospitals?.map((h) => (
              <div key={h.id} className="px-6 py-5 flex items-center justify-between hover:bg-gray-50/50 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                    <Building2 className="w-5 h-5" strokeWidth={1.5} />
                  </div>
                  <div>
                    <p className="font-bold text-gray-900">{h.name}</p>
                    <p className="text-xs text-gray-400 font-mono">ID: {h.id?.slice(0, 12)}...</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant={h.is_active ? "success" : "danger"}>
                    {h.is_active ? "Active" : "Inactive"}
                  </Badge>
                  <Badge variant="info">{h.plan || "free"}</Badge>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ── Hospital Admin ──────────────────────────────────────────────────────
  if (user?.role === "admin") {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
            {user?.hospital_name || "Hospital"} Dashboard
          </h1>
          <p className="text-gray-400 mt-1">Manage your clinical operations and staff.</p>
        </div>

        {usage && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatsCard label="Doctors" value={`${usage.current_users}/${usage.max_users}`} icon={Users} color="blue" />
            <StatsCard label="Scans This Month" value={`${usage.current_month_scans}/${usage.max_scans_per_month}`} icon={ScanLine} color="green" />
            <StatsCard label="Plan" value={usage.plan?.toUpperCase()} icon={CreditCard} color="purple" />
            <StatsCard label="Status" value="Active" icon={Activity} color="orange" />
          </div>
        )}

        <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50">
            <h2 className="text-sm font-bold text-gray-500 uppercase tracking-widest">Doctor Roster</h2>
          </div>
          <div className="divide-y divide-gray-100">
            {data?.roster?.map((d, i) => (
              <div key={i} className="px-6 py-5 flex items-center justify-between hover:bg-gray-50/50 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-sm">
                    {d.email?.charAt(0).toUpperCase()}
                  </div>
                  <p className="font-semibold text-gray-900">{d.email}</p>
                </div>
                <div className="flex gap-2">
                  <Badge variant={d.is_verified ? "success" : "warning"}>
                    {d.is_verified ? "Verified" : "Pending"}
                  </Badge>
                  <Badge variant={d.has_passkey ? "info" : "default"}>
                    {d.has_passkey ? "Passkey" : "Password"}
                  </Badge>
                </div>
              </div>
            ))}
            {(!data?.roster || data.roster.length === 0) && (
              <div className="p-8 text-center text-gray-400">No doctors have joined yet. Share your invite code.</div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ── Doctor ──────────────────────────────────────────────────────────────
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
          {user?.hospital_name || "Clinical"} Workspace
        </h1>
        <p className="text-gray-400 mt-1">Welcome back, {user?.email}. Your workspace is ready.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <a href="/dashboard/patients" className="group bg-white border border-gray-100 rounded-2xl p-8 shadow-sm hover:shadow-md hover:border-blue-200 transition-all">
          <Users className="w-8 h-8 text-blue-600 mb-4" strokeWidth={1.5} />
          <h3 className="font-bold text-gray-900 mb-1 group-hover:text-blue-600 transition-colors">Patients</h3>
          <p className="text-sm text-gray-400">View and manage patient records.</p>
        </a>
        <a href="/dashboard/scans" className="group bg-white border border-gray-100 rounded-2xl p-8 shadow-sm hover:shadow-md hover:border-blue-200 transition-all">
          <ScanLine className="w-8 h-8 text-emerald-600 mb-4" strokeWidth={1.5} />
          <h3 className="font-bold text-gray-900 mb-1 group-hover:text-emerald-600 transition-colors">X-Ray Scans</h3>
          <p className="text-sm text-gray-400">Upload and analyze X-ray images.</p>
        </a>
        <a href="/dashboard/settings" className="group bg-white border border-gray-100 rounded-2xl p-8 shadow-sm hover:shadow-md hover:border-blue-200 transition-all">
          <Activity className="w-8 h-8 text-purple-600 mb-4" strokeWidth={1.5} />
          <h3 className="font-bold text-gray-900 mb-1 group-hover:text-purple-600 transition-colors">Security</h3>
          <p className="text-sm text-gray-400">Manage passkeys and account.</p>
        </a>
      </div>
    </div>
  );
}
