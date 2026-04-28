import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

const Landing = () => {
  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col font-sans selection:bg-blue-500 selection:text-white">
      {/* Navbar */}
      <nav className="container mx-auto px-6 py-6 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-blue-500 to-cyan-400 flex items-center justify-center">
             <span className="font-bold text-white tracking-widest">AI</span>
          </div>
          <span className="text-xl font-bold tracking-wide">X-Ray Analyzer</span>
        </div>
        <div className="flex gap-4">
           <Link to="/login" className="px-5 py-2 text-gray-300 hover:text-white transition-colors">
              Doctor Login
           </Link>
           <Link to="/register" className="px-5 py-2 bg-white/10 hover:bg-white/20 border border-white/10 rounded-xl transition-all duration-300 backdrop-blur-sm">
             Register Hospital
           </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col justify-center items-center text-center px-4 pt-10 pb-20">
        <motion.div
           initial={{ opacity: 0, y: 20 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ duration: 0.8 }}
           className="max-w-4xl cursor-default"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 mb-8 text-sm font-medium">
            <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
            Enterprise Multi-Tenant AI Platform
          </div>

          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-8 leading-tight">
            Next-Generation <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-cyan-400 to-emerald-400">
               Medical Diagnostics
            </span>
          </h1>
          
          <p className="text-xl text-gray-400 mb-12 max-w-2xl mx-auto leading-relaxed">
            Secure, scalable, and instant AI-powered X-Ray analysis. Deployed safely with 
            dedicated database segmentation for every hospital, ensuring strict HIPAA compliance and zero data overlap.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link to="/register">
              <button className="px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white rounded-xl font-semibold text-lg transition-all transform hover:scale-105 hover:shadow-[0_0_40px_rgba(59,130,246,0.5)]">
                Onboard Your Hospital
              </button>
            </Link>
          </div>
        </motion.div>

        {/* Feature Grid */}
        <motion.div 
           initial={{ opacity: 0, y: 40 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ duration: 0.8, delay: 0.2 }}
           className="grid md:grid-cols-3 gap-8 mt-24 max-w-5xl mx-auto"
        >
          {/* Card 1 */}
          <div className="p-8 rounded-2xl bg-white/[0.03] border border-white/[0.05] hover:bg-white/[0.05] hover:border-white/10 transition-all text-left">
            <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center mb-6 text-2xl">
               🏥
            </div>
            <h3 className="text-xl font-bold mb-3">Multi-Tenant Isolation</h3>
            <p className="text-gray-400 leading-relaxed">
               Every hospital receives its own dedicated database instantly upon registration. We guarantee zero data leakage between medical institutions.
            </p>
          </div>

          {/* Card 2 */}
          <div className="p-8 rounded-2xl bg-white/[0.03] border border-white/[0.05] hover:bg-white/[0.05] hover:border-white/10 transition-all text-left">
            <div className="w-12 h-12 rounded-xl bg-cyan-500/20 flex items-center justify-center mb-6 text-2xl">
               🔐
            </div>
            <h3 className="text-xl font-bold mb-3">Passkey Security</h3>
            <p className="text-gray-400 leading-relaxed">
               Doctor accounts are hardware-locked via biometric Passkeys (FaceID/TouchID). Passwords are scrambled and permanently disabled.
            </p>
          </div>

          {/* Card 3 */}
          <div className="p-8 rounded-2xl bg-white/[0.03] border border-white/[0.05] hover:bg-white/[0.05] hover:border-white/10 transition-all text-left">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/20 flex items-center justify-center mb-6 text-2xl">
               ⚡
            </div>
            <h3 className="text-xl font-bold mb-3">Instant Scalability</h3>
            <p className="text-gray-400 leading-relaxed">
               Hospital admins can generate secure invite codes to instantly onboard hundreds of doctors into their private tenant environment.
            </p>
          </div>
        </motion.div>
      </main>
    </div>
  );
};

export default Landing;
