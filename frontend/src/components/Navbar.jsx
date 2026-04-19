import React from 'react';
import { Activity, LogOut, User, Settings as SettingsIcon } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

const Navbar = ({ userEmail, onLogout }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const isSettings = location.pathname === '/settings';

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-[#0b1326] border-b border-white/5 shadow-2xl">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo Section */}
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/dashboard')}>
          <div className="flex items-center justify-center text-blue-500">
            <Activity className="w-7 h-7" strokeWidth={2.5} />
          </div>
          <span className="text-xl font-bold text-white tracking-tighter hidden sm:block">AI X-Ray <span className="text-blue-500">Analyzer</span></span>
        </div>

        {/* Actions Section */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/settings')}
            className={`p-2 rounded-lg transition-all ${isSettings ? 'text-blue-500 bg-white/5' : 'text-[#8a919d] hover:text-white hover:bg-white/5'}`}
            title="Protocol Settings"
          >
            <SettingsIcon className="w-5 h-5" strokeWidth={1.5} />
          </button>

          <div className="h-4 w-px bg-white/10 mx-1"></div>

          <div className="flex items-center gap-3 pl-2">
            <div className="hidden sm:block text-right">
              <span className="text-[10px] uppercase font-bold text-[#8a919d] tracking-[0.2em] block leading-none">Identity Node</span>
              <span className="text-xs font-bold text-white tracking-tight">
                {userEmail?.toUpperCase() || 'ANONYMOUS'}
              </span>
            </div>
            <div className="w-9 h-9 bg-blue-500/10 border border-blue-500/20 rounded-full flex items-center justify-center text-blue-500">
              <User className="w-5 h-5" strokeWidth={1.5} />
            </div>
            <button
              onClick={onLogout}
              className="p-2 text-[#8a919d] hover:text-red-400 hover:bg-red-400/5 rounded-full transition-all"
              title="Terminate Session"
            >
              <LogOut className="w-5 h-5" strokeWidth={1.5} />
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
