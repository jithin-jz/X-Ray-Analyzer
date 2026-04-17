import { useState, useEffect } from "react";
import { startPasskeyRegister, verifyPasskeyRegister } from "../api/auth";
import { startRegistration } from "@simplewebauthn/browser";
import { LogOut, Fingerprint, Activity, User, ShieldCheck } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function Dashboard() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
        navigate("/login");
        return;
    }
    
    // Decode JWT payload to get the email
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      setEmail(payload.sub || "user@example.com");
    } catch (e) {
      console.error("Failed to decode token", e);
    }
  }, [navigate]);

  const handleCreatePasskey = async () => {
    try {
      const options = await startPasskeyRegister(email);
      const credential = await startRegistration({ optionsJSON: options });
      const res = await verifyPasskeyRegister(email, credential);
      
      if (res.error || res.detail) {
          throw new Error(res.error || res.detail);
      }
      
      alert("Passkey created successfully 🔥");
    } catch (e) {
      console.error(e);
      alert("Error creating passkey: " + e.message);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <div className="min-h-screen flex flex-col p-6 animate-fade-in relative overflow-hidden">
      {/* Glow orb decorators */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-600 rounded-full blur-[150px] opacity-10 pointer-events-none"></div>
      
      <header className="glass-panel p-4 mb-8 flex justify-between items-center relative z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center">
            <Activity className="text-white w-5 h-5" />
          </div>
          <h1 className="text-xl font-bold">AI X-Ray Analyzer</h1>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-sm text-gray-400 bg-white/5 px-4 py-2 rounded-full border border-white/5">
            <User className="w-4 h-4" />
            {email}
          </div>
          <button onClick={handleLogout} className="text-gray-400 hover:text-white transition-colors bg-white/5 p-2 rounded-full border border-white/5 hover:border-red-500/50 hover:bg-red-500/10">
            <LogOut className="w-5 h-5 text-red-400" />
          </button>
        </div>
      </header>

      <main className="flex-1 relative z-10 max-w-5xl mx-auto w-full">
        <h2 className="text-3xl font-bold mb-8">Welcome to your Dashboard</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="glass-panel p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="p-3 bg-indigo-500/20 rounded-lg text-indigo-400">
                <ShieldCheck className="w-6 h-6" />
              </div>
            </div>
            <h3 className="text-xl font-semibold mb-2">Security Settings</h3>
            <p className="text-gray-400 text-sm mb-6">
              Upgrade your account security by enabling passwordless authentication across your devices.
            </p>
            <button onClick={handleCreatePasskey} className="btn-secondary w-auto inline-flex">
              <Fingerprint className="w-5 h-5" />
              Enable Passkey 🔐
            </button>
          </div>
          
          <div className="glass-panel p-6 opacity-50">
            <div className="flex items-start justify-between mb-4">
              <div className="p-3 bg-purple-500/20 rounded-lg text-purple-400">
                <Activity className="w-6 h-6" />
              </div>
            </div>
            <h3 className="text-xl font-semibold mb-2">X-Ray Analysis</h3>
            <p className="text-gray-400 text-sm mb-6">
              Upload scans and let the AI detect anomalies automatically. (Coming Soon)
            </p>
            <button className="btn-primary w-auto inline-flex opacity-50 cursor-not-allowed">
              Upload Scan
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}