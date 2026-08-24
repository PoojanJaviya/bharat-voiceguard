import React from 'react';
import { BarChart3, HelpCircle, ShieldAlert, Cpu, Award } from 'lucide-react';

const RiskAnalysis: React.FC = () => {
  const components = [
    { name: 'Voice Authenticity', weight: 30, color: 'bg-cyan-500', desc: 'Analyzes micro-prosody, spectral anomalies, and synthetic speech footprints to identify deepfakes.' },
    { name: 'Scam Intent (NLP)', weight: 25, color: 'bg-indigo-500', desc: 'Linguistic parsing of text streams to identify scam intent markers (urgency, bank impersonation, credentials).' },
    { name: 'Speaker Consistency', weight: 15, color: 'bg-purple-500', desc: 'Cross-checks call voice signature against pre-registered database template of trusted contacts.' },
    { name: 'Caller/Request Context', weight: 15, color: 'bg-pink-500', desc: 'Scans the context of payment requests, verification queries, or credentials lookup.' },
    { name: 'Replay/Audio Integrity', weight: 10, color: 'bg-amber-500', desc: 'Detects sub-audible acoustic fingerprints, click-traces, or loop background noise indicating recording replays.' },
    { name: 'Historical Metadata', weight: 5, color: 'bg-slate-500', desc: 'Checks caller frequency, spam logging records, and prior verification attempts.' },
  ];

  return (
    <div className="glass-card rounded-2xl p-5 md:p-6 border border-navy-800 space-y-6">
      {/* Header */}
      <div className="border-b border-navy-800 pb-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-xxs uppercase tracking-widest text-slate-500 font-bold block mb-1">SCORE COMPOSITION</span>
          <h2 className="font-display font-extrabold text-lg md:text-xl text-white tracking-tight">Risk Score Formula Calibration</h2>
          <p className="text-xs text-slate-400 font-sans mt-0.5 leading-relaxed">
            Explanation of weighted classifier modules driving our call protection threat analysis.
          </p>
        </div>
        <BarChart3 className="h-6 w-6 text-cyan-400 hidden md:block shrink-0" />
      </div>

      {/* Calibration Alert */}
      <div className="p-3.5 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 text-xs flex gap-2.5 font-sans leading-relaxed">
        <HelpCircle className="h-5 w-5 text-cyan-400 shrink-0" />
        <div>
          <strong>Prototype Note:</strong> The scoring indexes are prototype/illustrative calculations calibrated for presentation. Actual production thresholds utilize dynamic neural network weighting parameters.
        </div>
      </div>

      {/* Horizontal Bar Breakdown */}
      <div className="space-y-3" id="risk-composition-bars">
        <span className="text-xxs uppercase tracking-widest text-slate-500 font-bold block">Weighted Formula Breakdown</span>
        <div className="w-full h-8 bg-navy-950 rounded-xl overflow-hidden flex">
          {components.map((c) => (
            <div 
              key={c.name}
              style={{ width: `${c.weight}%` }}
              className={`h-full ${c.color} hover:opacity-90 transition-opacity cursor-help relative group`}
              title={`${c.name}: ${c.weight}%`}
            >
              {/* Group hover tooltip */}
              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 hidden group-hover:block bg-navy-900 border border-navy-700 text-white font-mono text-[9px] font-bold px-2 py-1 rounded shadow-xl whitespace-nowrap z-50">
                {c.name} ({c.weight}%)
              </div>
            </div>
          ))}
        </div>
        
        {/* Colors Legend */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 pt-2 text-[10px] text-slate-400">
          {components.map((c) => (
            <div key={c.name} className="flex items-center gap-1.5 font-semibold">
              <span className={`h-2.5 w-2.5 rounded-full shrink-0 ${c.color}`} />
              <span>{c.name} ({c.weight}%)</span>
            </div>
          ))}
        </div>
      </div>

      {/* Individual Modules Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-4 border-t border-navy-800" id="risk-modules-details">
        {components.map((c) => (
          <div key={c.name} className="p-4 rounded-xl bg-navy-950/60 border border-navy-800/80 flex flex-col justify-between space-y-3">
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <span className={`h-2 w-2 rounded-full ${c.color}`} />
                <h4 className="font-display font-bold text-xs text-white uppercase tracking-wider">{c.name}</h4>
              </div>
              <p className="text-slate-400 text-xs leading-relaxed font-sans">{c.desc}</p>
            </div>
            <div className="flex items-center justify-between text-[10px] text-slate-500 font-bold border-t border-navy-900 pt-2 font-mono">
              <span>WEIGHT VALUE</span>
              <span className="text-cyan-400 font-extrabold">{c.weight}%</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RiskAnalysis;
