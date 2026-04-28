import React from 'react';
import { Activity, LogOut, User, Settings as SettingsIcon } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

const Navbar = ({ userEmail, onLogout, hospitalName }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const isSettings = location.pathname === '/settings';

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo Section */}
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/dashboard')}>
          <div className="flex items-center justify-center text-blue-600">
            <Activity className="w-7 h-7" strokeWidth={2.5} />
          </div>
          <span className="text-xl font-bold text-gray-900 tracking-tight hidden sm:block">
            {hospitalName ? (
              <>{hospitalName} <span className="text-blue-600 font-medium">Portal</span></>
            ) : (
              <>AI X-Ray <span className="text-blue-600">Analyzer</span></>
            )}
          </span>
        </div>

        {/* Actions Section */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/settings')}
            className={`p-2 rounded-lg transition-all ${isSettings ? 'text-blue-600 bg-blue-50' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'}`}
            title="Settings"
          >
            <SettingsIcon className="w-5 h-5" strokeWidth={1.5} />
          </button>

          <div className="h-4 w-px bg-gray-200 mx-1"></div>

          <div className="flex items-center gap-3 pl-2">
            <div className="hidden sm:block text-right">
              <span className="text-xs font-bold text-gray-900 tracking-tight">
                {userEmail?.toUpperCase() || 'ANONYMOUS'}
              </span>
            </div>
            <div className="w-9 h-9 bg-blue-50 border border-blue-100 rounded-full flex items-center justify-center text-blue-600">
              <User className="w-5 h-5" strokeWidth={1.5} />
            </div>
            <button
              onClick={onLogout}
              className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-all"
              title="Logout"
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
