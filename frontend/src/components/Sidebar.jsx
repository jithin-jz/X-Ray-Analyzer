import { NavLink } from "react-router-dom";
import {
  LayoutDashboard, Users, UserSearch, ScanLine,
  Settings, CreditCard, Building2, Shield, LogOut, Menu, X
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useState } from "react";

const navItems = {
  doctor: [
    { to: "/dashboard", icon: LayoutDashboard, label: "Overview" },
    { to: "/dashboard/patients", icon: Users, label: "Patients" },
    { to: "/dashboard/scans", icon: ScanLine, label: "Scans" },
    { to: "/dashboard/settings", icon: Settings, label: "Settings" },
  ],
  admin: [
    { to: "/dashboard", icon: LayoutDashboard, label: "Overview" },
    { to: "/dashboard/patients", icon: Users, label: "Patients" },
    { to: "/dashboard/scans", icon: ScanLine, label: "Scans" },
    { to: "/dashboard/roster", icon: UserSearch, label: "Staff" },
    { to: "/dashboard/billing", icon: CreditCard, label: "Usage" },
    { to: "/dashboard/tenant", icon: Building2, label: "Hospital" },
    { to: "/dashboard/settings", icon: Settings, label: "Account" },
  ],
  superadmin: [
    { to: "/dashboard", icon: LayoutDashboard, label: "Overview" },
    { to: "/dashboard/tenants", icon: Building2, label: "Hospitals" },
    { to: "/dashboard/all-users", icon: Users, label: "Users" },
    { to: "/dashboard/settings", icon: Settings, label: "Account" },
  ],
};

export default function Sidebar() {
  const { user, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const role = user?.role || "doctor";
  const items = navItems[role] || navItems.doctor;

  // Mobile: show only first 4 items in bottom tab bar
  const mobileItems = items.slice(0, 4);

  return (
    <>
      {/* ── Desktop Sidebar (hidden on mobile) ── */}
      <aside className="hidden md:flex fixed left-0 top-0 bottom-0 w-60 bg-[var(--canvas)] border-r border-[var(--hairline)] flex-col z-40">
        {/* Brand */}
        <div className="h-16 flex items-center px-5 border-b border-[var(--hairline)]">
          <span className="text-base font-bold text-[var(--ink)] tracking-tight">
            AI X-Ray Analyzer
          </span>
        </div>

        {/* Role badge */}
        <div className="px-4 py-3">
          <div className="flex items-center gap-2 px-3 py-2 bg-[var(--surface-card)] rounded-[9999px]">
            <Shield className="w-3.5 h-3.5 text-[var(--mute)]" strokeWidth={2} />
            <span className="text-xs font-bold text-[var(--mute)] uppercase tracking-wider">
              {role === "superadmin" ? "Super Admin" : role === "admin" ? "Admin" : "Doctor"}
            </span>
          </div>
        </div>

        {/* Nav links */}
        <nav className="flex-1 px-3 space-y-0.5 overflow-y-auto">
          {items.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === "/dashboard"}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-[16px] text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-[var(--surface-card)] text-[var(--ink)] font-semibold"
                    : "text-[var(--mute)] hover:bg-[var(--surface-card)] hover:text-[var(--ink)]"
                }`
              }
            >
              <item.icon className="w-[18px] h-[18px]" strokeWidth={1.8} />
              {item.label}
            </NavLink>
          ))}
        </nav>

        {/* User footer */}
        <div className="p-4 border-t border-[var(--hairline)]">
          <div className="flex items-center gap-3 mb-3 px-1">
            <div className="w-8 h-8 bg-[var(--surface-card)] rounded-full flex items-center justify-center text-[var(--ink)] text-xs font-bold">
              {user?.email?.charAt(0).toUpperCase() || "?"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-[var(--ink)] truncate">{user?.email}</p>
              <p className="text-xs text-[var(--ash)] truncate">{user?.hospital_name || "Platform"}</p>
            </div>
          </div>
          <button
            onClick={logout}
            className="w-full flex items-center gap-2 px-3 py-2 text-sm font-medium text-[var(--mute)] hover:text-[var(--error)] hover:bg-red-50 rounded-[16px] transition-colors"
          >
            <LogOut className="w-4 h-4" strokeWidth={1.8} />
            Sign out
          </button>
        </div>
      </aside>

      {/* ── Mobile Top Bar (visible on mobile only) ── */}
      <header className="md:hidden fixed top-0 left-0 right-0 z-50 bg-[var(--canvas)] border-b border-[var(--hairline)] h-14 flex items-center justify-between px-4">
        <span className="text-sm font-bold text-[var(--ink)]">AI X-Ray</span>
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-[var(--surface-card)] rounded-full flex items-center justify-center text-[var(--ink)] text-[10px] font-bold">
            {user?.email?.charAt(0).toUpperCase() || "?"}
          </div>
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="p-2 text-[var(--ink)] rounded-[16px]"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </header>

      {/* ── Mobile Drawer (full nav when hamburger is open) ── */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-40">
          <div className="absolute inset-0 bg-black/40" onClick={() => setMobileOpen(false)} />
          <div className="absolute top-14 right-0 w-64 bottom-0 bg-[var(--canvas)] border-l border-[var(--hairline)] p-4 overflow-y-auto">
            <div className="flex items-center gap-2 px-3 py-2 mb-3 bg-[var(--surface-card)] rounded-[9999px]">
              <Shield className="w-3 h-3 text-[var(--mute)]" />
              <span className="text-[10px] font-bold text-[var(--mute)] uppercase tracking-wider">
                {role === "superadmin" ? "Super Admin" : role === "admin" ? "Admin" : "Doctor"}
              </span>
            </div>
            <nav className="space-y-1">
              {items.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.to === "/dashboard"}
                  onClick={() => setMobileOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-3 rounded-[16px] text-sm font-medium transition-colors ${
                      isActive
                        ? "bg-[var(--surface-card)] text-[var(--ink)] font-semibold"
                        : "text-[var(--mute)]"
                    }`
                  }
                >
                  <item.icon className="w-[18px] h-[18px]" strokeWidth={1.8} />
                  {item.label}
                </NavLink>
              ))}
            </nav>
            <div className="mt-6 pt-4 border-t border-[var(--hairline)]">
              <p className="text-xs text-[var(--ash)] truncate px-3 mb-2">{user?.email}</p>
              <button
                onClick={() => { logout(); setMobileOpen(false); }}
                className="w-full flex items-center gap-2 px-3 py-2.5 text-sm font-medium text-[var(--mute)] hover:text-[var(--error)] rounded-[16px] transition-colors"
              >
                <LogOut className="w-4 h-4" /> Sign out
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Mobile Bottom Tab Bar ── */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-[var(--canvas)] border-t border-[var(--hairline)] safe-area-bottom flex items-center justify-around px-1" style={{ height: "calc(64px + env(safe-area-inset-bottom, 0px))", paddingBottom: "env(safe-area-inset-bottom, 0px)" }}>
        {mobileItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === "/dashboard"}
            className={({ isActive }) =>
              `flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-[16px] transition-colors ${
                isActive ? "text-[var(--primary)]" : "text-[var(--ash)]"
              }`
            }
          >
            <item.icon className="w-5 h-5" strokeWidth={1.8} />
            <span className="text-[10px] font-semibold">{item.label}</span>
          </NavLink>
        ))}
      </nav>
    </>
  );
}
