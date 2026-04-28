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
      if (res.access_token) {
        localStorage.setItem("has_passkey", "true");
        setHasPasskey(true);
        toast.success("Passkey registered successfully!");
        reload();
      }
    } catch (e) {
      console.error(e);
      toast.error("Passkey setup was not completed.");
    } finally {
      setSetting(false);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Account Settings</h1>
        <p className="text-gray-400 mt-1">Manage your security and identity.</p>
      </div>

      <div className="bg-white border border-gray-100 rounded-2xl p-8 shadow-sm space-y-8">
        {/* Passkey section */}
        <div className="flex items-center gap-4 mb-6">
          <div className={`p-4 rounded-2xl ${hasPasskey ? "bg-green-50 text-green-600" : "bg-blue-50 text-blue-600"}`}>
            {hasPasskey ? <ShieldCheck className="w-8 h-8" strokeWidth={1.5} /> : <Fingerprint className="w-8 h-8" strokeWidth={1.5} />}
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-900">Biometric Security</h3>
            <p className="text-sm text-gray-500">
              {hasPasskey ? "Hardware-backed authentication is active." : "Enable passwordless biometric login."}
            </p>
          </div>
        </div>

        {!hasPasskey ? (
          <div className="p-6 bg-blue-50/50 rounded-xl border border-blue-100">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <p className="font-bold text-gray-900">Passkey Integration</p>
                <p className="text-sm text-gray-600">Eliminate password risks with biometric challenge-response.</p>
              </div>
              <button onClick={handleCreatePasskey} disabled={setting} className="px-6 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-colors shadow-sm disabled:opacity-50 whitespace-nowrap">
                {setting ? "Setting up..." : "Register Passkey"}
              </button>
            </div>
          </div>
        ) : (
          <div className="p-6 bg-green-50/50 rounded-xl border border-green-100">
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <p className="font-bold text-green-900">Security Active</p>
                <p className="text-sm text-green-700">Your account is protected by biometric passkeys.</p>
              </div>
              <ShieldCheck className="w-8 h-8 text-green-600" />
            </div>
          </div>
        )}

        {/* Account info */}
        <div className="space-y-4 pt-4 border-t border-gray-100">
          <div className="flex items-center gap-4 py-3">
            <div className="p-2 bg-gray-50 rounded-lg text-gray-400">
              <Mail className="w-5 h-5" strokeWidth={1.5} />
            </div>
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Email</p>
              <p className="text-sm font-semibold text-gray-900">{user?.email}</p>
            </div>
          </div>
          <div className="flex items-center gap-4 py-3">
            <div className="p-2 bg-gray-50 rounded-lg text-gray-400">
              <Lock className="w-5 h-5" strokeWidth={1.5} />
            </div>
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Auth Method</p>
              <p className="text-sm font-semibold text-gray-900">
                {hasPasskey ? "Cryptographic Passkey" : "Password + MFA"}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
