import React, { useState, useEffect, useRef } from "react";

import { startPasskeyRegister, verifyPasskeyRegister, logout } from "../api/auth";
import { startRegistration } from "@simplewebauthn/browser";
import { LogOut, Fingerprint, Activity, User, ShieldCheck } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";


export default function Dashboard() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const fileInputRef = useRef(null);
  const [showPasskeyModal, setShowPasskeyModal] = useState(false);


  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      setEmail(payload.sub || "user@example.com");

      // Passkey Promotion Logic
      const hasPasskey = localStorage.getItem("has_passkey") === "true";
      const isSkipPrompt = localStorage.getItem("skipPasskeyPrompt") === "true";

      if (!hasPasskey && !isSkipPrompt) {
        // Show after a short delay for better UX
        const timer = setTimeout(() => setShowPasskeyModal(true), 1500);
        return () => clearTimeout(timer);
      }
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

  const handleDismissPrompt = () => {
    setShowPasskeyModal(false);
  };

  const handlePermanentSkip = () => {
    localStorage.setItem("skipPasskeyPrompt", "true");
    setShowPasskeyModal(false);
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
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      setSelectedFile(files[0]);
    }
  };

  const handleFileSelect = (e) => {
    if (e.target.files.length > 0) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const handleAnalyze = () => {
    if (!selectedFile) return;
    // Analysis logic will be connected to the backend inference engine in the next phase.
    console.log(`File staged for processing: ${selectedFile.name}`);
  };

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar userEmail={email} onLogout={handleLogout} />

      {/* --- Passkey Promotion Modal --- */}
      {showPasskeyModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
          {/* Backdrop */}
          <div className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm animate-in fade-in duration-300"></div>

          {/* Modal Card */}
          <div className="relative w-full max-w-lg bg-white rounded-[2.5rem] p-8 sm:p-12 shadow-2xl shadow-blue-900/10 border border-gray-100 animate-in zoom-in slide-in-from-bottom-8 duration-500">
            <div className="flex flex-col items-center text-center space-y-8">
              {/* Icon Cluster */}
              <div className="relative">
                <div className="absolute inset-0 bg-blue-100/50 blur-3xl rounded-full"></div>
                <div className="relative w-20 h-20 bg-blue-600 rounded-3xl flex items-center justify-center text-white shadow-xl shadow-blue-200 rotate-3 transform transition-transform hover:rotate-0 duration-300">
                  <Fingerprint className="w-10 h-10" strokeWidth={1.5} />
                </div>
              </div>

              {/* Text Content */}
              <div className="space-y-4">
                <h3 className="text-3xl font-extrabold text-gray-900 tracking-tight leading-tight">
                  Secure Your Access <br />
                  with <span className="text-blue-600">Pure Cryptography</span>
                </h3>
                <p className="text-gray-500 text-lg leading-relaxed font-light">
                  Enhance your clinical security protocol. Replace vulnerable passwords with hardware-backed biometric authentication.
                </p>
              </div>

              {/* Action Stack */}
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
                    onClick={handleDismissPrompt}
                    className="flex-1 py-4 bg-gray-50 hover:bg-gray-100 text-gray-700 font-bold rounded-2xl transition-all"
                  >
                    Remind Later
                  </button>
                  <button
                    onClick={handlePermanentSkip}
                    className="flex-1 py-4 bg-transparent hover:bg-gray-50 text-gray-400 font-bold rounded-2xl border border-gray-100 transition-all text-xs uppercase tracking-widest"
                  >
                    Never show again
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-2 text-gray-300">
                <Activity className="w-4 h-4" />
                <span className="text-[10px] uppercase font-bold tracking-tighter">WebAuthn Security Standard</span>
              </div>
            </div>
          </div>
        </div>
      )}

      <main className="flex-1 max-w-4xl mx-auto w-full px-6 pt-32 pb-20">
        <div className="flex flex-col items-center space-y-20">
          
          {/* Header & Detailed Briefing */}
          <div className="text-center space-y-12 max-w-4xl">
            <div className="space-y-6">
              <h1 className="text-6xl font-extrabold text-gray-900 tracking-tight leading-[1.1]">
                X-Ray <span className="text-blue-600">AI Analyzer</span> Platform
              </h1>
              <p className="text-xl text-gray-400 leading-relaxed font-light max-w-2xl mx-auto">
                Pioneering autonomous radiological intelligence through state-of-the-art neural architectures. Empowering clinicians with high-precision diagnostic support.
              </p>
            </div>

            {/* Analysis Protocol (Steps) */}
            <div className="relative pt-16">
              <div className="absolute top-[108px] left-[10%] right-[10%] h-px bg-gray-100 -z-10 hidden lg:block"></div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12">
                {[
                  { step: "01", title: "Upload X-ray Image", desc: "Ingest high-resolution imagery in DICOM, JPG, or PNG formats." },
                  { step: "02", title: "AI-powered Analysis", desc: "Advanced neural algorithms process and interpret radiological features." },
                  { step: "03", title: "Clear Report Generation", desc: "Receive a structured analysis report highlighting key clinical findings." },
                  { step: "04", title: "Human-Centric Results", desc: "Review intuitive findings explained in professional yet accessible language." }
                ].map((item, idx) => (
                  <div key={idx} className="flex flex-col items-center space-y-6 px-4 group">
                    <div className="w-12 h-12 bg-blue-50 text-blue-600 font-bold rounded-full flex items-center justify-center border border-blue-100 group-hover:bg-blue-600 group-hover:text-white transition-all duration-300">
                      {item.step}
                    </div>
                    <div className="space-y-2">
                      <h4 className="font-bold text-gray-900 text-sm tracking-tight">{item.title}</h4>
                      <p className="text-xs text-gray-400 leading-relaxed min-h-[40px]">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Ingestion Engine (Matching Requested UI) */}
          <div className="w-full">
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

              {/* Action Bar (Full Width Soft Blue) */}
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
        </div>
      </main>

      <Footer />
    </div>
  );
}




