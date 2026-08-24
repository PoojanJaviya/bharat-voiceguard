import React, { useState } from 'react';
import { useDemo, Language } from '../context/DemoContext';
import { 
  Bell, 
  ChevronDown, 
  ShieldCheck, 
  Languages, 
  AlertTriangle,
  Info,
  CheckCircle,
  X
} from 'lucide-react';

const TopBar: React.FC = () => {
  const { 
    activeRoute, 
    languageMode, 
    setLanguageMode, 
    alerts, 
    dismissAlert,
    notificationDrawerOpen,
    setNotificationDrawerOpen
  } = useDemo();

  // Get Page Title
  const getPageTitle = () => {
    switch (activeRoute) {
      case '/dashboard': return 'Dashboard';
      case '/live-call': return 'Live Call Protection';
      case '/history': return 'Call Protection Logs';
      case '/risk-analysis': return 'Risk Composition Analysis';
      case '/trusted-contacts': return 'Trusted Contacts Directory';
      case '/verification': return 'Independent Verification Center';
      case '/privacy': return 'Privacy Center & Auditing';
      case '/settings': return 'System Settings';
      default: return 'BharatVoiceGuard';
    }
  };

  const handleLangChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setLanguageMode(e.target.value as Language);
  };

  return (
    <header className="h-16 border-b border-navy-800 bg-navy-900/60 backdrop-blur-md px-4 md:px-6 flex items-center justify-between z-20 relative">
      {/* Page Title & Status */}
      <div className="flex items-center gap-3">
        <h1 className="font-display font-bold text-lg md:text-xl text-white tracking-tight" id="topbar-title">
          {getPageTitle()}
        </h1>

        {/* Desktop Active Protection Status */}
        <div 
          id="topbar-protection-status"
          className="hidden lg:flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium animate-pulse"
        >
          <ShieldCheck className="h-4 w-4" />
          <span>Real-time voice risk monitoring is active</span>
        </div>
      </div>

      {/* Global Actions */}
      <div className="flex items-center gap-3 md:gap-4">
        {/* Language Selector */}
        <div className="flex items-center gap-1 bg-navy-800/80 border border-navy-700/80 rounded-lg px-2.5 py-1.5" id="topbar-lang-selector">
          <Languages className="h-4 w-4 text-cyan-400" />
          <select 
            id="language-dropdown"
            value={languageMode}
            onChange={handleLangChange}
            className="bg-transparent text-xs text-slate-200 border-none outline-none pr-4 cursor-pointer font-medium font-sans"
          >
            <option value="auto" className="bg-navy-900 text-slate-200">🇮🇳 Auto-Detect</option>
            <option value="en" className="bg-navy-900 text-slate-200">🇬🇧 English</option>
            <option value="hi" className="bg-navy-900 text-slate-200">🇮🇳 Hindi (हिन्दी)</option>
            <option value="guj" className="bg-navy-900 text-slate-200">🇮🇳 Gujarati (ગુજરાતી)</option>
          </select>
        </div>

        {/* Notifications Icon with active badge */}
        <div className="relative">
          <button 
            id="notification-bell"
            onClick={() => setNotificationDrawerOpen(!notificationDrawerOpen)}
            className="h-9 w-9 rounded-lg bg-navy-800/80 border border-navy-700/80 text-slate-300 hover:text-white flex items-center justify-center cursor-pointer transition-colors relative"
          >
            <Bell className="h-4.5 w-4.5" />
            {alerts.length > 0 && (
              <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-rose-500 text-[10px] font-extrabold text-white flex items-center justify-center animate-bounce">
                {alerts.length}
              </span>
            )}
          </button>

          {/* Notifications Dropdown Drawer */}
          {notificationDrawerOpen && (
            <div 
              id="notification-drawer"
              className="absolute right-0 mt-3 w-80 md:w-96 rounded-xl border border-navy-700 bg-navy-900 shadow-2xl p-4 z-50 animate-in fade-in slide-in-from-top-2 duration-200"
            >
              <div className="flex items-center justify-between border-b border-navy-800 pb-3 mb-3">
                <span className="font-semibold text-sm text-white flex items-center gap-1.5">
                  <Bell className="h-4.5 w-4.5 text-cyan-400" /> System Alerts
                </span>
                <button 
                  onClick={() => setNotificationDrawerOpen(false)}
                  className="text-slate-400 hover:text-white cursor-pointer"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
                {alerts.length === 0 ? (
                  <div className="text-center py-6 text-slate-500 text-xs">
                    No active notifications. System secure.
                  </div>
                ) : (
                  alerts.map((alert) => {
                    const isHigh = alert.severity === 'High';
                    const isMedium = alert.severity === 'Medium';
                    return (
                      <div 
                        key={alert.id}
                        className={`p-3 rounded-lg border text-xs relative flex gap-2.5 transition-all ${
                          isHigh 
                            ? 'bg-rose-500/10 border-rose-500/20 text-rose-300' 
                            : isMedium 
                              ? 'bg-amber-500/10 border-amber-500/20 text-amber-300' 
                              : 'bg-cyan-500/10 border-cyan-500/20 text-cyan-300'
                        }`}
                      >
                        <div className="shrink-0 mt-0.5">
                          {isHigh && <AlertTriangle className="h-4 w-4 text-rose-400" />}
                          {isMedium && <Info className="h-4 w-4 text-amber-400" />}
                          {!isHigh && !isMedium && <CheckCircle className="h-4 w-4 text-cyan-400" />}
                        </div>
                        <div className="flex-1 pr-4">
                          <h4 className="font-semibold mb-1 text-white">{alert.title}</h4>
                          <p className="text-slate-400 leading-normal">{alert.description}</p>
                          <span className="text-[10px] text-slate-500 font-medium block mt-1.5">{alert.time}</span>
                        </div>
                        <button 
                          onClick={() => dismissAlert(alert.id)}
                          className="absolute top-2 right-2 text-slate-500 hover:text-white cursor-pointer"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Profile */}
        <div className="flex items-center gap-2 pl-2 border-l border-navy-800" id="topbar-user-profile">
          <div className="h-9 w-9 rounded-lg bg-gradient-to-br from-cyan-500 to-indigo-600 text-white flex items-center justify-center font-bold text-sm border border-cyan-400/20 shadow-md">
            S
          </div>
          <div className="hidden sm:block text-left">
            <div className="text-xs font-semibold text-white leading-tight">Shrey</div>
            <div className="text-[10px] text-emerald-400 flex items-center gap-1 font-semibold">
              <span className="h-1 w-1 rounded-full bg-emerald-400"></span> Shield Active
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default TopBar;
