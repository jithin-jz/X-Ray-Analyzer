import React, { useState, useEffect, useRef } from "react";

import { startPasskeyRegister, verifyPasskeyRegister, logout, fetchCurrentUser, fetchDashboardData } from "../api/auth";
import { startRegistration } from "@simplewebauthn/browser";
import { LogOut, Fingerprint, Activity, User, ShieldCheck, Database, CheckCircle, XCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

// --- Sub Components ---

const SuperAdminView = ({ dashboardData }) => (
  <div className="w-full space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
    <div className="text-center space-y-4 mb-12">
       <h1 className="text-5xl font-extrabold text-gray-900 tracking-tight">Global <span className="text-blue-600">Command Center</span></h1>
       <p className="text-xl text-gray-400">Manage all registered hospitals on the multi-tenant platform.</p>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
      <div className="bg-white border border-gray-100 p-8 rounded-2xl shadow-sm">
         <div className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-2">Total Tenants</div>
         <div className="text-4xl font-black text-blue-600">{dashboardData?.hospitals?.length || 0}</div>
      </div>
      <div className="bg-white border border-gray-100 p-8 rounded-2xl shadow-sm">
         <div className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-2">Total Users</div>
         <div className="text-4xl font-black text-emerald-600">{dashboardData?.total_users || 0}</div>
      </div>
    </div>
    
    <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50 text-sm font-bold text-gray-500 uppercase tracking-widest">Registered Hospitals</div>
      <div className="divide-y divide-gray-100">
        {dashboardData?.hospitals?.map(h => (
           <div key={h.id} className="p-6 flex items-center justify-between hover:bg-blue-50/30 transition-colors">
              <div className="flex items-center gap-4">
                 <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold">
                    <Database className="w-5 h-5"/>
                 </div>
                 <div>
                    <div className="font-bold text-gray-900 text-lg">{h.name}</div>
                    <div className="text-sm text-gray-400 font-mono">ID: {h.id}</div>
                 </div>
              </div>
              <div className="text-right">
                 <div className="text-xs text-gray-400 font-bold uppercase mb-1">Invite Code</div>
                 <div className="text-lg font-mono font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded border border-blue-100">{h.invite_code}</div>
              </div>
           </div>
        ))}
        {(!dashboardData?.hospitals || dashboardData.hospitals.length === 0) && (
           <div className="p-8 text-center text-gray-400">No hospitals registered yet.</div>
        )}
      </div>
    </div>
  </div>
);

const HospitalAdminView = ({ userData, dashboardData }) => (
  <div className="w-full space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
    <div className="text-center space-y-4 mb-12">
       <h1 className="text-5xl font-extrabold text-gray-900 tracking-tight">{userData?.hospital_name || "Hospital"} <span className="text-blue-600">Admin</span></h1>
       <p className="text-xl text-gray-400">Management dashboard for clinical operations and staff.</p>
    </div>
    <div className="w-full bg-blue-50/50 border border-blue-200 rounded-2xl p-8 shadow-sm">
      <div className="flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="text-left max-w-lg">
          <h3 className="text-2xl font-bold tracking-tight text-blue-900 mb-2">Hospital Administration</h3>
          <p className="text-gray-600 leading-relaxed">
            You are managing <strong className="text-blue-700">{userData?.hospital_name}</strong>. Invite doctors to join your secure multi-tenant environment using the code below.
          </p>
        </div>
        <div className="bg-white px-6 py-4 rounded-xl shadow-sm border border-gray-100 flex flex-col sm:flex-row items-center gap-4 w-full md:w-auto shrink-0">
          <div className="text-xs text-gray-400 font-bold uppercase tracking-widest text-center">Invite Code</div>
          <div className="text-2xl font-mono tracking-[0.2em] text-blue-600 font-bold">{userData?.invite_code}</div>
          <button 
            onClick={() => { navigator.clipboard.writeText(userData?.invite_code); alert("Code copied to clipboard!"); }} 
            className="p-2 sm:px-4 bg-blue-100 hover:bg-blue-200 text-blue-600 rounded-lg transition-colors text-sm font-bold w-full sm:w-auto"
          >
            Copy
          </button>
        </div>
      </div>
    </div>

    <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50 text-sm font-bold text-gray-500 uppercase tracking-widest">Doctor Roster</div>
      <div className="divide-y divide-gray-100">
        {dashboardData?.roster?.map((d, i) => (
           <div key={i} className="p-6 flex items-center justify-between hover:bg-gray-50 transition-colors">
              <div className="flex items-center gap-4">
                 <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                    <User className="w-5 h-5"/>
                 </div>
                 <div className="font-bold text-gray-900">{d.email}</div>
              </div>
              <div className="flex items-center gap-6">
                 <div className="flex flex-col items-end">
                    <span className="text-xs text-gray-400 font-bold uppercase mb-1">Email Verified</span>
                    {d.is_verified ? <CheckCircle className="w-5 h-5 text-emerald-500" /> : <XCircle className="w-5 h-5 text-red-300" />}
                 </div>
                 <div className="flex flex-col items-end">
                    <span className="text-xs text-gray-400 font-bold uppercase mb-1">Passkey Setup</span>
                    {d.has_passkey ? <ShieldCheck className="w-5 h-5 text-blue-600" /> : <XCircle className="w-5 h-5 text-gray-300" />}
                 </div>
              </div>
           </div>
        ))}
        {(!dashboardData?.roster || dashboardData.roster.length === 0) && (
           <div className="p-8 text-center text-gray-400">No doctors have joined this hospital yet.</div>
        )}
      </div>
    </div>
  </div>
);

const DoctorView = ({ userData, isDragging, selectedFile, handleDragOver, handleDragLeave, handleDrop, triggerFileInput, fileInputRef, handleFileSelect, handleAnalyze }) => (
  <div className="w-full space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
    <div className="text-center space-y-6 max-w-4xl mx-auto">
      <h1 className="text-6xl font-extrabold text-gray-900 tracking-tight leading-[1.1]">
        {userData?.hospital_name || "Clinical"} <span className="text-blue-600">Workspace</span>
      </h1>
      <p className="text-xl text-gray-400 leading-relaxed font-light mx-auto">
        Secure patient data inference for {userData?.hospital_name}. All records are privately isolated in your hospital's tenant database.
      </p>
    </div>

    <div className="relative group">
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={triggerFileInput}
        className={`w-full bg-white border-2 border-dashed rounded-lg p-20 flex flex-col items-center justify-center text-center transition-all duration-300 cursor-pointer min-h-[400px] ${isDragging ? 'border-blue-400 bg-blue-50/10' : 'border-gray-200 hover:border-blue-300'}`}
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileSelect}
          className="hidden"
          accept="image/*,.dicom"
        />

        {selectedFile ? (
          <div className="flex flex-col items-center animate-in fade-in zoom-in duration-300">
            <ShieldCheck className="w-16 h-16 text-blue-500 mb-6" strokeWidth={1} />
            <p className="text-blue-600 font-bold text-lg mb-1">{selectedFile.name}</p>
            <p className="text-gray-400 text-sm">Clinical asset staged for interpretation</p>
          </div>
        ) : (
          <div className="flex flex-col items-center space-y-4">
            <div className="text-blue-500">
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="17 8 12 3 7 8" />
                <line x1="12" y1="3" x2="12" y2="15" />
              </svg>
            </div>
            <div className="space-y-1">
              <p className="text-gray-600 font-medium">Click to upload or drag and drop</p>
              <p className="text-gray-400 text-sm">JPG, JPEG, PNG, or DICOM files supported</p>
            </div>
          </div>
        )}
      </div>

      <button
        onClick={(e) => {
          e.stopPropagation();
          if (selectedFile) handleAnalyze();
          else triggerFileInput();
        }}
        className={`w-full mt-4 py-3.5 rounded-lg font-bold text-white transition-all ${selectedFile
            ? 'bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-100'
            : 'bg-[#a3c4f7] hover:bg-[#8eb5ed]'
          }`}
      >
        {selectedFile ? 'Perform AI Analysis' : 'AI Read'}
      </button>
    </div>
  </div>
);

// --- Main Dashboard Component ---

export default function Dashboard() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const fileInputRef = useRef(null);
  const [showPasskeyModal, setShowPasskeyModal] = useState(false);
  const [userData, setUserData] = useState(null);
  const [dashboardData, setDashboardData] = useState(null);


  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      setEmail(payload.sub || "user@example.com");

      // Passkey Promotion Logic (Only for Doctors)
      const hasPasskey = localStorage.getItem("has_passkey") === "true";
      const isSkipPrompt = localStorage.getItem("skipPasskeyPrompt") === "true";

      if (!hasPasskey && !isSkipPrompt && payload.role === 'doctor') {
        const timer = setTimeout(() => setShowPasskeyModal(true), 1500);
      }

      const fetchData = async () => {
        try {
          const user_data = await fetchCurrentUser();
          if (!user_data.detail) setUserData(user_data);

          const dash_data = await fetchDashboardData();
          if (!dash_data.detail) setDashboardData(dash_data);
        } catch (err) {
          console.error("Failed to fetch dashboard data", err);
        }
      };
      
      fetchData();
    } catch (e) {
      console.error("Failed to decode token", e);
    }
  }, [navigate]);

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error("Server-side logout failed, clearing local session anyway", error);
    }
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
      setShowPasskeyModal(false);
      alert("Passkey created successfully! Your account is now secured.");
    } catch (e) {
      console.error(e);
      alert("Passkey setup was not completed.");
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };
  const handleDragLeave = () => {
    setIsDragging(false);
  };
  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files.length > 0) setSelectedFile(e.dataTransfer.files[0]);
  };
  const handleFileSelect = (e) => {
    if (e.target.files.length > 0) setSelectedFile(e.target.files[0]);
  };
  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };
  const handleAnalyze = () => {
    if (!selectedFile) return;
    console.log(`File staged for processing: ${selectedFile.name}`);
  };

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar userEmail={email} onLogout={handleLogout} hospitalName={userData?.hospital_name} />

      {/* --- Passkey Promotion Modal --- */}
      {showPasskeyModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
          <div className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm animate-in fade-in duration-300"></div>
          <div className="relative w-full max-w-lg bg-white rounded-[2.5rem] p-8 sm:p-12 shadow-2xl shadow-blue-900/10 border border-gray-100 animate-in zoom-in slide-in-from-bottom-8 duration-500">
            <div className="flex flex-col items-center text-center space-y-8">
              <div className="relative">
                <div className="absolute inset-0 bg-blue-100/50 blur-3xl rounded-full"></div>
                <div className="relative w-20 h-20 bg-blue-600 rounded-3xl flex items-center justify-center text-white shadow-xl shadow-blue-200 rotate-3 transform transition-transform hover:rotate-0 duration-300">
                  <Fingerprint className="w-10 h-10" strokeWidth={1.5} />
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-3xl font-extrabold text-gray-900 tracking-tight leading-tight">
                  Secure Your Access <br />
                  with <span className="text-blue-600">Pure Cryptography</span>
                </h3>
                <p className="text-gray-500 text-lg leading-relaxed font-light">
                  Enhance your clinical security protocol. Replace vulnerable passwords with hardware-backed biometric authentication.
                </p>
              </div>

              <div className="w-full space-y-4 pt-4">
                <button
                  onClick={handleCreatePasskey}
                  className="w-full py-4.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl shadow-lg shadow-blue-100 flex items-center justify-center gap-3 transition-all active:scale-[0.98]"
                >
                  <ShieldCheck className="w-5 h-5" />
                  Register Secure Passkey
                </button>

                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={() => setShowPasskeyModal(false)}
                    className="flex-1 py-4 bg-gray-50 hover:bg-gray-100 text-gray-700 font-bold rounded-2xl transition-all"
                  >
                    Remind Later
                  </button>
                  <button
                    onClick={() => { localStorage.setItem("skipPasskeyPrompt", "true"); setShowPasskeyModal(false); }}
                    className="flex-1 py-4 bg-transparent hover:bg-gray-50 text-gray-400 font-bold rounded-2xl border border-gray-100 transition-all text-xs uppercase tracking-widest"
                  >
                    Never show again
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Content Area router */}
      <main className="flex-1 w-full max-w-5xl mx-auto px-6 pt-32 pb-20">
        {!userData ? (
            <div className="w-full flex items-center justify-center p-20 animate-pulse text-blue-300">Loading Clinical Interface...</div>
        ) : (
            <>
               {userData.role === 'superadmin' && <SuperAdminView dashboardData={dashboardData} />}
               {userData.role === 'admin' && <HospitalAdminView userData={userData} dashboardData={dashboardData} />}
               {userData.role === 'doctor' && (
                 <DoctorView 
                    userData={userData}
                    isDragging={isDragging} 
                    selectedFile={selectedFile}
                    handleDragOver={handleDragOver}
                    handleDragLeave={handleDragLeave}
                    handleDrop={handleDrop}
                    triggerFileInput={triggerFileInput}
                    fileInputRef={fileInputRef}
                    handleFileSelect={handleFileSelect}
                    handleAnalyze={handleAnalyze} 
                 />
               )}
            </>
        )}
      </main>

      <Footer />
    </div>
  );
}
