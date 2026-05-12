import { LogOut, User, Settings as SettingsIcon } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";

export default function Navbar({ userEmail, onLogout, hospitalName }) {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <nav className="fixed top-0 left-60 right-0 z-50 bg-[var(--canvas)] border-b border-[var(--hairline)] h-16 flex items-center px-6 justify-between">
      {/* Page context */}
      <div>
        <h1 className="text-base font-semibold text-[var(--ink)]">
          {hospitalName || "AI X-Ray Analyzer"}
        </h1>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate("/dashboard/settings")}
          className={`p-2 rounded-[16px] transition-colors ${
            location.pathname.includes("settings")
              ? "bg-[var(--surface-card)] text-[var(--ink)]"
              : "text-[var(--ash)] hover:text-[var(--ink)] hover:bg-[var(--surface-card)]"
          }`}
        >
          <SettingsIcon className="w-[18px] h-[18px]" strokeWidth={1.8} />
        </button>

        <div className="h-5 w-px bg-[var(--hairline)]" />

        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-[var(--surface-card)] rounded-full flex items-center justify-center text-[var(--ink)] text-xs font-bold">
            {userEmail?.charAt(0).toUpperCase() || "?"}
          </div>
          <span className="text-sm font-medium text-[var(--ink)] hidden sm:block">
            {userEmail}
          </span>
        </div>

        <button
          onClick={onLogout}
          className="p-2 text-[var(--ash)] hover:text-[var(--error)] hover:bg-red-50 rounded-[16px] transition-colors"
          title="Logout"
        >
          <LogOut className="w-[18px] h-[18px]" strokeWidth={1.8} />
        </button>
      </div>
    </nav>
  );
}
