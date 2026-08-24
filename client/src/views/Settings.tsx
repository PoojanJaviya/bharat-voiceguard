import React from 'react';
import { useDemo, Language } from '../context/DemoContext';
import { Settings as SettingsIcon, Sliders, ShieldCheck, HelpCircle, EyeOff, Radio, Cpu } from 'lucide-react';

const Settings: React.FC = () => {
  const { 
    languageMode, 
    setLanguageMode, 
    privacyMode, 
    togglePrivacyMode, 
    systemStatus, 
    setSystemStatus 
  } = useDemo();

  return (
    <div className="glass-card rounded-2xl p-5 md:p-6 border border-navy-800 space-y-6">
      {/* Header */}
      <div className="border-b border-navy-800 pb-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-xxs uppercase tracking-widest text-slate-500 font-bold block mb-1">PROTOTYPE CONFIGURATION</span>
          <h2 className="font-display font-extrabold text-lg md:text-xl text-white tracking-tight">System Configuration Settings</h2>
          <p className="text-xs text-slate-400 font-sans mt-0.5 leading-relaxed">
            Customize engine thresholds, warning preferences, and simulate system states for SIH presentations.
          </p>
        </div>
        <SettingsIcon className="h-6 w-6 text-cyan-400 hidden md:block shrink-0" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 font-sans text-xs">
        {/* Left Column: UI Preferences & AI Modes */}
        <div className="space-y-4">
          <span className="text-xxs uppercase tracking-widest text-slate-500 font-bold block">Engine Preferences</span>
          <div className="p-5 bg-navy-950/65 border border-navy-805 rounded-xl space-y-4">
            
            {/* Primary Language Mode */}
            <div className="space-y-1.5" id="settings-lang-preference">
              <label className="text-slate-400 font-semibold block">Primary Speech Analyzer Dialect</label>
              <select
                id="settings-lang-dropdown"
                value={languageMode}
                onChange={(e) => setLanguageMode(e.target.value as Language)}
                className="w-full bg-navy-900 border border-navy-800 rounded-lg px-3 py-2 text-slate-200 cursor-pointer outline-none font-medium"
              >
                <option value="auto">Auto-Detect Multi-Dialect (Code-Switching)</option>
                <option value="en">English (India Accents)</option>
                <option value="hi">Hindi (हिन्दी)</option>
                <option value="guj">Gujarati (ગુજરાતી)</option>
              </select>
              <span className="text-[10px] text-slate-500 font-medium block">
                Instructs the ASR transcription models to adapt to local regional accents and syntax.
              </span>
            </div>

            {/* Privacy Mode Toggle */}
            <div className="flex items-center justify-between py-2 border-t border-navy-850" id="settings-privacy-mode">
              <div>
                <span className="font-semibold text-slate-300 block mb-0.5">Strict Edge Execution</span>
                <span className="text-[10px] text-slate-500 leading-none">Process audio metrics exclusively on local CPU threads</span>
              </div>
              <button 
                id="settings-btn-privacy-toggle"
                onClick={togglePrivacyMode}
                className={`w-12 h-6.5 rounded-full p-1 cursor-pointer transition-colors duration-200 ${
                  privacyMode ? 'bg-cyan-500' : 'bg-slate-700'
                }`}
              >
                <div className={`h-4.5 w-4.5 rounded-full bg-navy-950 transition-transform duration-200 transform ${
                  privacyMode ? 'translate-x-5.5' : 'translate-x-0'
                }`} />
              </button>
            </div>

            {/* System Health / Connectivity simulation */}
            <div className="space-y-1.5 border-t border-navy-850 pt-3" id="settings-health-sim">
              <label className="text-slate-400 font-semibold block">Simulate Engine Connection State</label>
              <select
                id="settings-connection-dropdown"
                value={systemStatus}
                onChange={(e) => setSystemStatus(e.target.value as any)}
                className="w-full bg-navy-900 border border-navy-800 rounded-lg px-3 py-2 text-slate-200 cursor-pointer outline-none font-medium"
              >
                <option value="ready">● Connected (Ready)</option>
                <option value="reconnecting">○ Reconnecting...</option>
                <option value="offline">○ Disconnected (Offline)</option>
                <option value="error">● Error / Failure</option>
              </select>
              <span className="text-[10px] text-slate-500 font-medium block">
                Forces connection state changes to demo UI tolerance during network fluctuations.
              </span>
            </div>
          </div>
        </div>

        {/* Right Column: Model Info & Specifications */}
        <div className="space-y-4">
          <span className="text-xxs uppercase tracking-widest text-slate-500 font-bold block">Prototype Specifications</span>
          <div className="p-5 bg-navy-950/65 border border-navy-805 rounded-xl space-y-4 leading-relaxed text-slate-400">
            <div className="flex justify-between items-center py-2 border-b border-navy-850">
              <span className="flex items-center gap-1.5"><Sliders className="h-3.5 w-3.5 text-slate-500" /> Platform Version</span>
              <span className="font-semibold text-slate-200 font-mono">v0.1.0 (SIH 2026)</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-navy-850">
              <span className="flex items-center gap-1.5"><Cpu className="h-3.5 w-3.5 text-slate-500" /> Speech-to-Text Model</span>
              <span className="font-semibold text-slate-200">Whisper-Lite Multi-Ind</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-navy-850">
              <span className="flex items-center gap-1.5"><ShieldCheck className="h-3.5 w-3.5 text-slate-500" /> Synthetic Voice Accuracy</span>
              <span className="font-semibold text-cyan-400 font-mono">~94.2% Calibrated</span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="flex items-center gap-1.5"><Radio className="h-3.5 w-3.5 text-slate-500" /> Processing Latency</span>
              <span className="font-semibold text-slate-300 font-mono">~350ms Sliding Window</span>
            </div>

            <div className="p-3 bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 rounded-lg text-xxs flex gap-2 font-sans mt-2">
              <HelpCircle className="h-4.5 w-4.5 text-cyan-400 shrink-0" />
              <div>
                BharatVoiceGuard is designed for low digital literacy inclusivity. Visual indicators and voice guidance outputs operate in Hindi, Gujarati and English.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
