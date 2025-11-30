import React from 'react';
import { Activity, RefreshCw, Moon, Sun, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function Header({ wsConnected, onRefresh, dark, toggleDark }) {
  const { logout, user } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-30 backdrop-blur bg-white/90 dark:bg-slate-900/90 border-b border-gray-200 dark:border-slate-700" role="banner">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Activity className="w-7 h-7 text-brand-600" aria-hidden="true" />
          <div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white" aria-label="StockX Dashboard">StockX</h1>
            <p className="text-xs text-gray-600 dark:text-slate-400">Real-time market data • AI insights</p>
          </div>
        </div>
        <div className="flex items-center gap-2" aria-label="Status and controls">
          <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${wsConnected ? 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300' : 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300'}`} aria-live="polite"> 
            <span className={`w-2 h-2 rounded-full ${wsConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} aria-hidden="true"></span>
            {wsConnected ? 'Live' : 'Offline'}
          </div>
          {user && (
            <span className="text-xs text-gray-600 dark:text-slate-400 px-2">
              {user.name}
            </span>
          )}
          <button aria-label="Refresh all stocks" onClick={onRefresh} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 transition" title="Refresh all">
            <RefreshCw className="w-5 h-5 text-gray-600 dark:text-slate-300" aria-hidden="true" />
          </button>
          <button aria-label="Toggle dark or light theme" onClick={toggleDark} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 transition" title="Toggle theme">
            {dark ? <Sun className="w-5 h-5 text-yellow-400" aria-hidden="true" /> : <Moon className="w-5 h-5 text-gray-600" aria-hidden="true" />}
          </button>
          <button aria-label="Logout" onClick={handleLogout} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 transition" title="Logout">
            <LogOut className="w-5 h-5 text-gray-600 dark:text-slate-300" aria-hidden="true" />
          </button>
        </div>
      </div>
    </header>
  );
}
