import React from 'react';

const Footer = () => {
  return (
    <footer className="bg-[#0b1326] text-[#dae2fd] pt-20 pb-10 border-t border-white/5 relative overflow-hidden font-['Outfit']">
      <div className="max-w-7xl mx-auto px-8 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          
          {/* Brand Identity */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold tracking-tighter text-white">AI X-Ray <span className="text-blue-500">Analyzer</span></span>
            </div>
            <p className="text-[#8a919d] text-sm leading-relaxed max-w-sm font-light">
              Architecting the future of radiology through autonomous neural analysis. Delivering high-precision diagnostic support to clinical nodes globally.
            </p>
          </div>

          {/* Platform Nodes */}
          <div>
            <h4 className="text-white font-bold text-xs uppercase tracking-[0.2em] mb-6">Platform</h4>
            <ul className="space-y-4">
              <li><a href="/dashboard" className="text-[#8a919d] text-sm hover:text-white transition-colors">Intelligence Hub</a></li>
              <li><a href="#" className="text-[#8a919d] text-sm hover:text-white transition-colors">Neural Logic</a></li>
              <li><a href="#" className="text-[#8a919d] text-sm hover:text-white transition-colors">System Status</a></li>
            </ul>
          </div>

          {/* Security & Support */}
          <div>
            <h4 className="text-white font-bold text-xs uppercase tracking-[0.2em] mb-6">Resources</h4>
            <ul className="space-y-4">
              <li><a href="#" className="text-[#8a919d] text-sm hover:text-white transition-colors">Clinical Docs</a></li>
              <li><a href="/settings" className="text-[#8a919d] text-sm hover:text-white transition-colors">Security Vault</a></li>
              <li><a href="#" className="text-[#8a919d] text-sm hover:text-white transition-colors">Support Node</a></li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-[10px] font-bold text-[#8a919d] uppercase tracking-[0.3em]">
            © 2026 AI-RA RADIOLOGY SYSTEMS. ARCHITECTED FOR CLINICAL EXCELLENCE.
          </p>
          <div className="flex gap-8 text-[10px] font-bold text-[#8a919d] uppercase tracking-widest">
            <span className="hover:text-white cursor-pointer transition-colors">Privacy Protocol</span>
            <span className="hover:text-white cursor-pointer transition-colors">Legal Terms</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
