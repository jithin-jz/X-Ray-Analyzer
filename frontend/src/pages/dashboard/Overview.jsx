import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { getDashboardData, getPlatformStats } from "../../api/admin";
import { getUsage } from "../../api/billing";
import { Building2, Users, ScanLine, Activity, CreditCard, ShieldCheck } from "lucide-react";
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
        if (user?.role === "superadmin") setStats(await getPlatformStats());
        if (user?.role === "admin") setUsage(await getUsage());
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    };
    load();
  }, [user?.role]);

  if (loading) return <div className="flex items-center justify-center py-32"><LoadingSpinner text="Loading dashboard..." /></div>;

  // ── Super Admin ──
  if (user?.role === "superadmin") {
    const s = stats || data;
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-[22px] sm:text-[28px] font-bold text-[var(--ink)] tracking-tight" style={{ letterSpacing: "-1.2px" }}>Platform Overview</h1>
          <p className="text-[13px] sm:text-sm text-[var(--mute)] mt-0.5 sm:mt-1">All hospitals and users at a glance.</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatsCard label="Hospitals" value={s?.total_hospitals || 0} icon={Building2} />
          <StatsCard label="Active" value={s?.active_hospitals || 0} icon={Activity} />
          <StatsCard label="Users" value={s?.total_users || 0} icon={Users} />
          <StatsCard label="Verified" value={s?.verified_users || 0} icon={ShieldCheck} />
        </div>
        {data?.hospitals?.length > 0 && (
          <div className="bg-[var(--canvas)] border border-[var(--hairline)] rounded-[16px] overflow-hidden">
            <div className="px-6 py-4 border-b border-[var(--hairline)]">
              <h2 className="text-sm font-bold text-[var(--ash)] uppercase tracking-wider">Hospitals</h2>
            </div>
            <div className="divide-y divide-[var(--hairline)]">
              {data.hospitals.map((h) => (
                <div key={h.id} className="px-6 py-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-[var(--surface-card)] rounded-[16px] flex items-center justify-center text-[var(--mute)]">
                      <Building2 className="w-4 h-4" strokeWidth={1.8} />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-[var(--ink)]">{h.name}</p>
                      <p className="text-xs text-[var(--ash)] font-mono">{h.id?.slice(0, 12)}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Badge variant={h.is_active ? "success" : "danger"}>{h.is_active ? "Active" : "Inactive"}</Badge>
                    <Badge variant="info">{h.plan || "free"}</Badge>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  // ── Admin ──
  if (user?.role === "admin") {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-[22px] sm:text-[28px] font-bold text-[var(--ink)] tracking-tight" style={{ letterSpacing: "-1.2px" }}>{user?.hospital_name || "Hospital"}</h1>
          <p className="text-[13px] sm:text-sm text-[var(--mute)] mt-0.5 sm:mt-1">Manage your team and operations.</p>
        </div>
        {usage && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatsCard label="Doctors" value={`${usage.current_users}/${usage.max_users}`} icon={Users} />
            <StatsCard label="Scans/Month" value={`${usage.current_month_scans}/${usage.max_scans_per_month}`} icon={ScanLine} />
            <StatsCard label="Plan" value={usage.plan?.toUpperCase()} icon={CreditCard} />
            <StatsCard label="Status" value="Active" icon={Activity} />
          </div>
        )}
        {data?.roster?.length > 0 && (
          <div className="bg-[var(--canvas)] border border-[var(--hairline)] rounded-[16px] overflow-hidden">
            <div className="px-6 py-4 border-b border-[var(--hairline)]">
              <h2 className="text-sm font-bold text-[var(--ash)] uppercase tracking-wider">Doctor Roster</h2>
            </div>
            <div className="divide-y divide-[var(--hairline)]">
              {data.roster.map((d, i) => (
                <div key={i} className="px-6 py-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-[var(--surface-card)] rounded-full flex items-center justify-center text-[var(--ink)] text-xs font-bold">
                      {d.email?.charAt(0).toUpperCase()}
                    </div>
                    <span className="text-sm font-medium text-[var(--ink)]">{d.email}</span>
                  </div>
                  <div className="flex gap-2">
                    <Badge variant={d.is_verified ? "success" : "warning"}>{d.is_verified ? "Verified" : "Pending"}</Badge>
                    <Badge variant={d.has_passkey ? "info" : "default"}>{d.has_passkey ? "Passkey" : "Password"}</Badge>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  // ── Doctor ──
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-[22px] sm:text-[28px] font-bold text-[var(--ink)] tracking-tight" style={{ letterSpacing: "-1.2px" }}>Workspace</h1>
        <p className="text-[13px] sm:text-sm text-[var(--mute)] mt-0.5 sm:mt-1">Welcome back, {user?.email}.</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <a href="/dashboard/patients" className="bg-[var(--canvas)] border border-[var(--hairline)] rounded-[16px] p-6 hover:bg-[var(--surface-card)] transition-colors">
          <Users className="w-6 h-6 text-[var(--ink)] mb-3" strokeWidth={1.8} />
          <h3 className="text-base font-semibold text-[var(--ink)] mb-1">Patients</h3>
          <p className="text-sm text-[var(--mute)]">View and manage records.</p>
        </a>
        <a href="/dashboard/scans" className="bg-[var(--canvas)] border border-[var(--hairline)] rounded-[16px] p-6 hover:bg-[var(--surface-card)] transition-colors">
          <ScanLine className="w-6 h-6 text-[var(--ink)] mb-3" strokeWidth={1.8} />
          <h3 className="text-base font-semibold text-[var(--ink)] mb-1">X-Ray Scans</h3>
          <p className="text-sm text-[var(--mute)]">Upload and analyze images.</p>
        </a>
        <a href="/dashboard/settings" className="bg-[var(--canvas)] border border-[var(--hairline)] rounded-[16px] p-6 hover:bg-[var(--surface-card)] transition-colors">
          <ShieldCheck className="w-6 h-6 text-[var(--ink)] mb-3" strokeWidth={1.8} />
          <h3 className="text-base font-semibold text-[var(--ink)] mb-1">Security</h3>
          <p className="text-sm text-[var(--mute)]">Manage passkeys and account.</p>
        </a>
      </div>
    </div>
  );
}
