import { useState } from "react";
import toast from "react-hot-toast";
import { startPasskeyRegister, verifyPasskeyRegister } from "../../api/auth";
import { startRegistration } from "@simplewebauthn/browser";
import { useAuth } from "../../context/AuthContext";
import { Fingerprint, ShieldCheck, Mail, Lock } from "lucide-react";

export default function DashboardSettings() {
  const { user, reload } = useAuth();
  const [hasPasskey, setHasPasskey] = useState(localStorage.getItem("has_passkey") === "true");
  const [setting, setSetting] = useState(false);

  const handleCreatePasskey = async () => {
    setSetting(true);
    try {
      const options = await startPasskeyRegister(user.email);
      const credential = await startRegistration({ optionsJSON: options });
      const res = await verifyPasskeyRegister(user.email, credential);
      if (res.access_token) { localStorage.setItem("has_passkey", "true"); setHasPasskey(true); toast.success("Passkey registered!"); reload(); }
    } catch { toast.error("Passkey setup cancelled."); } finally { setSetting(false); }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-[28px] font-bold text-[var(--ink)]" style={{ letterSpacing: "-1.2px" }}>Account</h1>
        <p className="text-sm text-[var(--mute)] mt-1">Security and identity settings.</p>
      </div>

      <div className="bg-[var(--canvas)] border border-[var(--hairline)] rounded-[16px] p-6 space-y-6">
        {/* Passkey */}
        <div className="flex items-center gap-4">
          <div className={`p-3 rounded-[16px] ${hasPasskey ? "bg-[var(--success-pale)]" : "bg-[var(--surface-card)]"}`}>
            {hasPasskey ? <ShieldCheck className="w-6 h-6 text-[var(--success)]" /> : <Fingerprint className="w-6 h-6 text-[var(--ink)]" />}
          </div>
          <div className="flex-1">
            <h3 className="text-base font-semibold text-[var(--ink)]">Biometric Security</h3>
            <p className="text-sm text-[var(--mute)]">{hasPasskey ? "Passkey active — passwordless login enabled." : "Set up a passkey for faster, safer login."}</p>
          </div>
          {!hasPasskey && (
            <button onClick={handleCreatePasskey} disabled={setting} className="px-4 py-2.5 text-sm font-bold text-[var(--on-primary)] bg-[var(--primary)] rounded-[16px] hover:bg-[var(--primary-pressed)] disabled:opacity-50 transition-colors">
              {setting ? "Setting up..." : "Setup Passkey"}
            </button>
          )}
        </div>

        <div className="border-t border-[var(--hairline)]" />

        {/* Account info */}
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <Mail className="w-4 h-4 text-[var(--ash)]" />
            <div>
              <p className="text-xs font-bold text-[var(--ash)] uppercase tracking-wider">Email</p>
              <p className="text-sm font-medium text-[var(--ink)]">{user?.email}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Lock className="w-4 h-4 text-[var(--ash)]" />
            <div>
              <p className="text-xs font-bold text-[var(--ash)] uppercase tracking-wider">Auth Method</p>
              <p className="text-sm font-medium text-[var(--ink)]">{hasPasskey ? "Passkey (biometric)" : "Password"}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
