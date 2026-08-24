import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDemo } from '../context/DemoContext';
import { 
  Shield, 
  Activity, 
  History, 
  BarChart3, 
  Users, 
  CheckCircle2, 
  Languages, 
  Lock, 
  Settings, 
  ChevronLeft, 
  ChevronRight,
  Cpu,
  Radio,
  EyeOff
} from 'lucide-react';

const Sidebar: React.FC = () => {
  const navigate = useNavigate();
  const { activeRoute, systemStatus, privacyMode } = useDemo();
  const [collapsed, setCollapsed] = useState(false);

  const menuItems = [
    { name: 'Dashboard', icon: Shield, path: '/dashboard' },
    { name: 'Live Call Protection', icon: Activity, path: '/live-call' },
    { name: 'Call History', icon: History, path: '/history' },
    { name: 'Risk Analysis', icon: BarChart3, path: '/risk-analysis' },
    { name: 'Trusted Contacts', icon: Users, path: '/trusted-contacts' },
    { name: 'Verification', icon: CheckCircle2, path: '/verification' },
    { name: 'Privacy Center', icon: Lock, path: '/privacy' },
    { name: 'Settings', icon: Settings, path: '/settings' },
  ];

  const handleNav = (path: string) => {
    navigate(path);
  };

  return (
    <>
      {/* Desktop Sidebar (visible on md and up) */}
      <aside 
        id="sidebar-desktop"
        className={`hidden md:flex flex-col h-full bg-navy-900 border-r border-navy-800 transition-all duration-300 relative z-30 ${
          collapsed ? 'w-20' : 'w-64'
        }`}
      >
        {/* Brand Logo & Name */}
        <div className="flex items-center h-16 px-4 border-b border-navy-800">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => handleNav('/dashboard')} id="sidebar-logo">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              <Shield className="h-5 w-5" />
            </div>
            {!collapsed && (
              <span className="font-display font-bold text-lg tracking-wider bg-gradient-to-r from-white via-slate-100 to-cyan-400 bg-clip-text text-transparent">
                BHARAT<span className="text-cyan-400 font-extrabold">VOICE</span>
              </span>
            )}
          </div>
        </div>

        {/* Collapsible toggle button */}
        <button 
          id="sidebar-toggle"
          onClick={() => setCollapsed(!collapsed)}
          className="absolute top-18 -right-3 flex h-6 w-6 items-center justify-center rounded-full bg-navy-800 border border-navy-700 text-gray-400 hover:text-white cursor-pointer shadow-md hover:border-cyan-500/30 transition-colors"
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </button>

        {/* Navigation Items */}
        <nav className="flex-1 px-3 py-6 space-y-1 overflow-y-auto">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeRoute === item.path;
            return (
              <button
                id={`sidebar-nav-${item.path.substring(1)}`}
                key={item.path}
                onClick={() => handleNav(item.path)}
                className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium transition-all cursor-pointer ${
                  isActive 
                    ? 'bg-cyan-500/10 text-cyan-400 border-l-2 border-cyan-400 font-semibold' 
                    : 'text-gray-400 hover:bg-navy-800/50 hover:text-gray-200'
                }`}
              >
                <Icon className={`h-5 w-5 shrink-0 ${isActive ? 'text-cyan-400' : 'text-gray-400'}`} />
                {!collapsed && <span>{item.name}</span>}
              </button>
            );
          })}
        </nav>

        {/* Status Indicators Panel */}
        {!collapsed && (
          <div className="p-4 mx-3 mb-4 rounded-xl bg-navy-950/80 border border-navy-800/80" id="sidebar-status-panel">
            <span className="text-xxs uppercase tracking-widest text-slate-500 font-bold block mb-3">System Health</span>
            <div className="space-y-2.5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-400 flex items-center gap-1.5"><Cpu className="h-3.5 w-3.5 text-slate-500" /> AI Engine</span>
                <span className="flex items-center gap-1 font-semibold text-emerald-400">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-ping"></span>
                  Ready
                </span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-400 flex items-center gap-1.5"><Radio className="h-3.5 w-3.5 text-slate-500" /> Audio Monitor</span>
                <span className="text-emerald-400 font-semibold">Active</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-400 flex items-center gap-1.5"><EyeOff className="h-3.5 w-3.5 text-slate-500" /> Privacy Mode</span>
                <span className={`font-semibold ${privacyMode ? 'text-cyan-400' : 'text-slate-400'}`}>
                  {privacyMode ? 'On-Device' : 'Cloud Hybrid'}
                </span>
              </div>
            </div>
          </div>
        )}
      </aside>

      {/* Mobile Bottom Tab Navigation (visible on screen sizes < md) */}
      <nav 
        id="sidebar-mobile"
        className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-navy-900 border-t border-navy-800 flex items-center justify-around px-2 z-30 shadow-lg"
      >
        <button
          id="mobile-nav-dashboard"
          onClick={() => handleNav('/dashboard')}
          className={`flex flex-col items-center justify-center flex-1 py-1 cursor-pointer ${
            activeRoute === '/dashboard' ? 'text-cyan-400 font-semibold' : 'text-gray-400'
          }`}
        >
          <Shield className="h-5 w-5" />
          <span className="text-xxs mt-1">Home</span>
        </button>

        <button
          id="mobile-nav-live-call"
          onClick={() => handleNav('/live-call')}
          className={`flex flex-col items-center justify-center flex-1 py-1 cursor-pointer ${
            activeRoute === '/live-call' ? 'text-cyan-400 font-semibold' : 'text-gray-400'
          }`}
        >
          <Activity className="h-5 w-5" />
          <span className="text-xxs mt-1">Live Call</span>
        </button>

        <button
          id="mobile-nav-history"
          onClick={() => handleNav('/history')}
          className={`flex flex-col items-center justify-center flex-1 py-1 cursor-pointer ${
            activeRoute === '/history' ? 'text-cyan-400 font-semibold' : 'text-gray-400'
          }`}
        >
          <History className="h-5 w-5" />
          <span className="text-xxs mt-1">Logs</span>
        </button>

        <button
          id="mobile-nav-contacts"
          onClick={() => handleNav('/trusted-contacts')}
          className={`flex flex-col items-center justify-center flex-1 py-1 cursor-pointer ${
            activeRoute === '/trusted-contacts' ? 'text-cyan-400 font-semibold' : 'text-gray-400'
          }`}
        >
          <Users className="h-5 w-5" />
          <span className="text-xxs mt-1">Contacts</span>
        </button>

        <button
          id="mobile-nav-settings"
          onClick={() => handleNav('/settings')}
          className={`flex flex-col items-center justify-center flex-1 py-1 cursor-pointer ${
            activeRoute === '/settings' ? 'text-cyan-400 font-semibold' : 'text-gray-400'
          }`}
        >
          <Settings className="h-5 w-5" />
          <span className="text-xxs mt-1">Setup</span>
        </button>
      </nav>
    </>
  );
};

export default Sidebar;
