import { NavLink } from "react-router-dom";
import {
  LayoutDashboard, Users, UserSearch, ScanLine, Activity,
  Settings, CreditCard, Building2, Shield, LogOut
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

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
    { to: "/dashboard/roster", icon: UserSearch, label: "Staff Roster" },
    { to: "/dashboard/billing", icon: CreditCard, label: "Usage & Plan" },
    { to: "/dashboard/tenant", icon: Building2, label: "Hospital Settings" },
    { to: "/dashboard/settings", icon: Settings, label: "Account" },
  ],
  superadmin: [
    { to: "/dashboard", icon: LayoutDashboard, label: "Platform Overview" },
    { to: "/dashboard/tenants", icon: Building2, label: "All Hospitals" },
    { to: "/dashboard/all-users", icon: Users, label: "All Users" },
    { to: "/dashboard/settings", icon: Settings, label: "Account" },
  ],
};

export default function Sidebar() {
  const { user, logout } = useAuth();
  const role = user?.role || "doctor";
  const items = navItems[role] || navItems.doctor;

  return (
    <aside className="fixed left-0 top-0 bottom-0 w-64 bg-white border-r border-gray-100 flex flex-col z-40">
      {/* Brand */}
      <div className="h-16 flex items-center gap-2.5 px-6 border-b border-gray-100">
        <div className="flex items-center justify-center text-blue-600">
          <Activity className="w-6 h-6" strokeWidth={2.5} />
        </div>
        <span className="text-lg font-bold text-gray-900 tracking-tight">
          AI X-Ray <span className="text-blue-600">Analyzer</span>
        </span>
      </div>

      {/* Role badge */}
      <div className="px-6 py-4">
        <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-xl">
          <Shield className="w-4 h-4 text-blue-600" strokeWidth={1.5} />
          <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
            {role === "superadmin" ? "Super Admin" : role === "admin" ? "Hospital Admin" : "Doctor"}
          </span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 space-y-1 overflow-y-auto">
        {items.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === "/dashboard"}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                isActive
                  ? "bg-blue-50 text-blue-700 font-semibold"
                  : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
              }`
            }
          >
            <item.icon className="w-5 h-5" strokeWidth={1.5} />
            {item.label}
          </NavLink>
        ))}
      </nav>

      {/* User footer */}
      <div className="p-4 border-t border-gray-100">
        <div className="flex items-center gap-3 mb-3 px-2">
          <div className="w-9 h-9 bg-blue-50 border border-blue-100 rounded-full flex items-center justify-center text-blue-600 text-xs font-bold">
            {user?.email?.charAt(0).toUpperCase() || "?"}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-gray-900 truncate">{user?.email}</p>
            <p className="text-xs text-gray-400 truncate">{user?.hospital_name || "Platform"}</p>
          </div>
        </div>
        <button
          onClick={logout}
          className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
        >
          <LogOut className="w-4 h-4" strokeWidth={1.5} />
          Sign Out
        </button>
      </div>
    </aside>
  );
}
