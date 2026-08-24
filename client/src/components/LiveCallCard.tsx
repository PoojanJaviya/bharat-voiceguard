import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useDemo } from '../context/DemoContext';
import { PhoneOff, UserCheck, ShieldAlert, AlertCircle, Play } from 'lucide-react';

const LiveCallCard: React.FC = () => {
  const navigate = useNavigate();
  const { 
    callState, 
    currentScenario, 
    riskScore, 
    riskLevel, 
    callDuration,
    voiceAuthenticity,
    speakerConsistency,
    replayScore,
    scamIntent,
    contextRisk,
    endCall,
    continueCall,
    startCall
  } = useDemo();

  // Convert duration seconds to formatted MM:SS
  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60).toString().padStart(2, '0');
    const s = (secs % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  // Get Colors
  const getRiskColors = () => {
    if (callState === 'idle' || callState === 'ended') {
      return { text: 'text-slate-400', border: 'border-slate-800', bg: 'bg-slate-950/60', glow: 'bg-slate-600/20', circle: 'stroke-slate-700' };
    }
    if (riskLevel === 'LOW RISK') {
      return { text: 'text-emerald-400', border: 'border-emerald-500/20', bg: 'bg-emerald-500/5', glow: 'bg-emerald-400/20', circle: 'stroke-emerald-500' };
    }
    if (riskLevel === 'VERIFY') {
      return { text: 'text-amber-400', border: 'border-amber-500/20', bg: 'bg-amber-500/5', glow: 'bg-amber-400/20', circle: 'stroke-amber-500' };
    }
    return { text: 'text-rose-400', border: 'border-rose-500/20', bg: 'bg-rose-500/5', glow: 'bg-rose-400/20', circle: 'stroke-rose-500' };
  };

  const colors = getRiskColors();
  
  // Calculate SVG circular stroke offset
  const radius = 60;
  const circumference = 2 * Math.PI * radius;
  const strokeOffset = circumference - (riskScore / 100) * circumference;

  const handleVerifyNav = () => {
    navigate('/verification');
  };

  return (
    <div 
      id="live-call-card"
      className="glass-card rounded-2xl p-6 border border-navy-800 relative overflow-hidden flex flex-col justify-between h-full"
    >
      {/* Background radial glow */}
      {callState === 'active' && (
        <div className={`absolute -right-20 -top-20 h-52 w-52 rounded-full filter blur-3xl opacity-15 transition-all ${colors.glow}`}></div>
      )}

      {/* Header Info */}
      <div className="flex justify-between items-start mb-4 border-b border-navy-800 pb-4">
        <div>
          <span className="text-xxs uppercase tracking-widest text-slate-500 font-bold block mb-1">CALL PROTECTION MONITOR</span>
          {callState === 'idle' || callState === 'ended' ? (
            <h3 className="font-display font-bold text-lg text-slate-400">No active call monitored</h3>
          ) : (
            <div>
              <h3 className="font-display font-bold text-xl text-white tracking-tight" id="live-caller-name">
                {currentScenario.caller}
              </h3>
              <p className="text-xs text-slate-400 font-mono mt-0.5" id="live-caller-number">
                {currentScenario.number}
              </p>
            </div>
          )}
        </div>
        
        {/* Status indicator */}
        <div className="text-right">
          {callState === 'idle' || callState === 'ended' ? (
            <span className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500 bg-slate-900 px-2.5 py-1 rounded-full border border-slate-800">
              <span className="h-1.5 w-1.5 rounded-full bg-slate-500"></span> STANDBY
            </span>
          ) : (
            <div className="flex flex-col items-end">
              <span className={`inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full border ${colors.border} ${colors.bg} ${colors.text}`}>
                <span className={`h-1.5 w-1.5 rounded-full ${
                  riskLevel === 'LOW RISK' ? 'glow-green' : riskLevel === 'VERIFY' ? 'glow-amber' : 'glow-red'
                }`}></span>
                {riskLevel}
              </span>
              <span className="text-xxs font-mono text-slate-400 font-semibold mt-1">
                DURATION: {formatTime(callDuration)}
              </span>
            </div>
          )}
        </div>
      </div>

      {callState === 'idle' || callState === 'ended' ? (
        // Call Standby View
        <div className="flex flex-col items-center justify-center py-10 flex-1">
          <div className="h-16 w-16 rounded-2xl bg-navy-950 border border-navy-800 flex items-center justify-center text-slate-500 mb-4">
            <PhoneOff className="h-7 w-7" />
          </div>
          <p className="text-sm text-slate-400 text-center max-w-xs leading-relaxed mb-6 font-sans">
            Ready to secure your incoming connections. Start a simulation in the controller to begin.
          </p>
          <button 
            id="standby-start-call"
            onClick={startCall}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-navy-950 font-bold text-xs cursor-pointer shadow-md transition-all active:scale-98"
          >
            <Play className="h-4 w-4 fill-navy-950" /> Start Scenario Call
          </button>
        </div>
      ) : (
        // Call Active/Analyzing View
        <div className="flex flex-col md:flex-row gap-6 items-center flex-1 py-3">
          {/* Dial Column */}
          <div className="flex flex-col items-center shrink-0">
            <div className="relative h-32 w-32 flex items-center justify-center">
              <svg className="absolute inset-0 transform -rotate-90 w-full h-full">
                {/* Track circle */}
                <circle 
                  cx="64" 
                  cy="64" 
                  r="56" 
                  className="stroke-navy-850 fill-transparent" 
                  strokeWidth="8"
                />
                {/* Active risk circle */}
                <circle 
                  cx="64" 
                  cy="64" 
                  r="56" 
                  className={`fill-transparent transition-all duration-500 ease-out ${colors.circle}`} 
                  strokeWidth="8"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeOffset}
                  strokeLinecap="round"
                />
              </svg>
              {/* Inner score */}
              <div className="text-center z-10 select-none">
                <span className="font-display font-extrabold text-3xl text-white tracking-tight" id="live-risk-score">
                  {riskScore}
                </span>
                <span className="text-[10px] text-slate-500 font-semibold block mt-0.5">/ 100 RISK</span>
              </div>
            </div>
          </div>

          {/* Explanation Column */}
          <div className="flex-1 space-y-4">
            {/* Short briefing reason */}
            <div className="bg-navy-950/80 border border-navy-800/80 rounded-xl p-3.5" id="live-risk-briefing">
              <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider flex items-center gap-1.5 mb-1.5">
                <AlertCircle className={`h-4 w-4 ${colors.text}`} /> Analysis Rationale
              </span>
              <p className="text-xs text-slate-300 font-sans leading-relaxed">
                {riskLevel === 'LOW RISK' && 'No suspicious linguistic or audio anomalies identified so far. Continuing standard scanning.'}
                {riskLevel === 'VERIFY' && `Linguistic analysis detected emergency payment request. Verify the caller\'s true identity.`}
                {riskLevel === 'HIGH RISK' && currentScenario.explanation}
              </p>
            </div>

            {/* Actions panel */}
            <div className="flex flex-wrap gap-2.5" id="live-call-actions">
              <button 
                id="live-call-btn-verify"
                onClick={handleVerifyNav}
                className="flex-1 min-w-[120px] inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-navy-950 font-bold text-xs cursor-pointer shadow-md transition-all active:scale-95"
              >
                <UserCheck className="h-4 w-4" /> Stop & Verify
              </button>
              <button 
                id="live-call-btn-continue"
                onClick={continueCall}
                className="flex-1 min-w-[100px] inline-flex items-center justify-center gap-1 py-2 px-3 rounded-lg bg-navy-800 hover:bg-navy-750 text-slate-200 hover:text-white border border-navy-700 text-xs font-semibold cursor-pointer transition-all active:scale-95"
              >
                Continue Call
              </button>
              <button 
                id="live-call-btn-end"
                onClick={endCall}
                className="flex-1 min-w-[100px] inline-flex items-center justify-center gap-1 py-2 px-3 rounded-lg bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 border border-rose-500/25 text-xs font-semibold cursor-pointer transition-all active:scale-95"
              >
                <PhoneOff className="h-3.5 w-3.5" /> End Call
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LiveCallCard;
