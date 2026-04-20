import { useState, useEffect } from "react";
import { startPasskeyRegister, verifyPasskeyRegister } from "../api/auth";
import { startRegistration } from "@simplewebauthn/browser";
import { Fingerprint, ShieldCheck, User, Mail, Bell, Lock } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

export default function Settings() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [hasPasskey, setHasPasskey] = useState(localStorage.getItem("has_passkey") === "true");

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      setEmail(payload.sub || "user@example.com");
      // Double check localStorage in case it changed
      setHasPasskey(localStorage.getItem("has_passkey") === "true");
    } catch (e) {
      console.error("Failed to decode token", e);
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("has_passkey");
    navigate("/login");
  };

  const handleCreatePasskey = async () => {
    try {
      const options = await startPasskeyRegister(email);
      const credential = await startRegistration({ optionsJSON: options });
      const res = await verifyPasskeyRegister(email, credential);

      if (res.error || res.detail) {
        throw new Error(res.error || res.detail);
      }

      localStorage.setItem("has_passkey", "true");
      setHasPasskey(true);
      alert("Passkey created successfully 🔥");
    } catch (e) {
      console.error(e);
      alert("Error creating passkey: " + e.message);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50/50">
      <Navbar userEmail={email} onLogout={handleLogout} />

      <main className="flex-1 max-w-3xl mx-auto w-full px-4 pt-28 pb-20">
        <div className="mb-12 text-center">
          <h2 className="text-4xl font-bold text-gray-900 tracking-tight">Account Identity</h2>
          <p className="text-gray-500 mt-2">Manage your cryptographic access and security protocols.</p>
        </div>

        <div className="space-y-8">
          {/* Main Content Area - Now Full Width */}
          <div className="space-y-8">
            {/* Security Section */}
            <div className="bg-white border border-gray-100 rounded-[2rem] p-10 shadow-xl shadow-gray-200/50">
              <div className="flex items-center gap-4 mb-10">
                <div className={`p-4 rounded-2xl ${hasPasskey ? 'bg-green-50 text-green-600' : 'bg-blue-50 text-blue-600'}`}>
                  {hasPasskey ? <ShieldCheck className="w-8 h-8" strokeWidth={1.5} /> : <Fingerprint className="w-8 h-8" strokeWidth={1.5} />}
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 tracking-tight">Biometric Gateway</h3>
                  <p className="text-sm text-gray-500">
                    {hasPasskey 
                      ? "Hardware-backed authentication is currently active." 
                      : "Secure, hardware-backed authentication via WebAuthn."}
                  </p>
                </div>
              </div>

              {!hasPasskey ? (
                <div className="p-8 bg-blue-50/30 rounded-2xl border border-blue-100 mb-10 animate-in fade-in slide-in-from-top-4 duration-500">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                    <div className="space-y-1">
                      <p className="font-bold text-gray-900">Passkey Integration</p>
                      <p className="text-sm text-gray-600">Eliminate password risks with biometric challenge-response.</p>
                    </div>
                    <button onClick={handleCreatePasskey} className="bg-blue-600 text-white font-bold px-8 py-3 rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 whitespace-nowrap">
                      Register Passkey
                    </button>
                  </div>
                </div>
              ) : (
                <div className="p-8 bg-green-50/30 rounded-2xl border border-green-100 mb-10 animate-in fade-in zoom-in duration-500">
                  <div className="flex items-center gap-6">
                    <div className="flex-1 space-y-1">
                      <p className="font-bold text-green-900">Security Active</p>
                      <p className="text-sm text-green-700">Your account is protected by industry-standard biometric passkeys.</p>
                    </div>
                    <div className="text-green-600">
                      <ShieldCheck className="w-8 h-8" />
                    </div>
                  </div>
                </div>
              )}

              <div className="space-y-6">
                <div className="flex items-center justify-between py-5 border-b border-gray-50">
                  <div className="flex items-center gap-4">
                    <div className="p-2 bg-gray-50 rounded-lg text-gray-400">
                      <Mail className="w-5 h-5" strokeWidth={1.5} />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Clinical Identity</p>
                      <p className="text-sm font-semibold text-gray-900">{email}</p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between py-5">
                  <div className="flex items-center gap-4">
                    <div className="p-2 bg-gray-50 rounded-lg text-gray-400">
                      <Lock className="w-5 h-5" strokeWidth={1.5} />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Protocol Type</p>
                      <p className="text-sm font-semibold text-gray-900 uppercase tracking-tighter">
                        {hasPasskey ? "Cryptographic Passkey Node" : "Standard Multi-Factor Node"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
