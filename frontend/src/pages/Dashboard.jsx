import React, { useState, useEffect, useRef } from "react";

import { startPasskeyRegister, verifyPasskeyRegister } from "../api/auth";
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


  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      setEmail(payload.sub || "user@example.com");
    } catch (e) {
      console.error("Failed to decode token", e);
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
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




