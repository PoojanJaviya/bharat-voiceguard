import React from 'react';
import { Lock, ShieldAlert, Cpu, EyeOff, Key, Radio, Database } from 'lucide-react';

const Privacy: React.FC = () => {
  const policies = [
    {
      title: 'Ephemeral Processing',
      badge: 'RAM Transient',
      icon: Cpu,
      desc: 'Raw audio packages are fed into sliding-window mathematical analyzers in RAM. As soon as the signal packet window slides past, the audio frame is wiped completely from memory.',
    },
    {
      title: 'Zero Permanent Storage',
      badge: 'Not Retained',
      icon: Database,
      desc: 'BharatVoiceGuard does not construct, cache, or write voice recording WAV/MP3 files to permanent disk storage. No raw call conversations are saved.',
    },
    {
      title: 'Auditing Feature Logs Only',
      badge: 'Risk Logs Only',
      icon: ShieldAlert,
      desc: 'Only numeric risk indexes, detected languages, threat codes (e.g. OTP_REQUEST), and timestamps are archived in your Call Protection Logs.',
    },
    {
      title: 'On-Device Signature Extraction',
      badge: 'Edge Processing',
      icon: Radio,
      desc: 'Voice authenticity mathematical descriptors are computed directly on the local phone or telecom interface CPU, keeping raw audio transmission off cloud channels.',
    },
    {
      title: 'Advanced Data Encryption',
      badge: 'Protected in Transit',
      icon: Key,
      desc: 'Call forensic metrics, configurations, and your Trusted Contacts directory data are encrypted in transit and at rest using AES-256 standards.',
    },
    {
      title: 'Strict Zero-Share Policy',
      badge: 'No Third-Party Access',
      icon: EyeOff,
      desc: 'Audit logs and contact directories reside within the user local sandbox. No data features are shared with corporate analytics or model trainers.',
    },
  ];

  return (
    <div className="glass-card rounded-2xl p-5 md:p-6 border border-navy-800 space-y-6">
      {/* Header */}
      <div className="border-b border-navy-800 pb-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-xxs uppercase tracking-widest text-slate-500 font-bold block mb-1">DATA CUSTODY POLICIES</span>
          <h2 className="font-display font-extrabold text-lg md:text-xl text-white tracking-tight">Privacy Center &amp; Auditing</h2>
          <p className="text-xs text-slate-400 font-sans mt-0.5 leading-relaxed">
            Privacy-first design. Ephemeral processing guarantees zero retention of communication speech records.
          </p>
        </div>
        <Lock className="h-6 w-6 text-cyan-400 hidden md:block shrink-0" />
      </div>

      {/* Ephemeral Warning banner */}
      <div className="p-4 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 text-xs flex gap-3 font-sans leading-relaxed">
        <Lock className="h-5 w-5 text-cyan-400 shrink-0 mt-0.5" />
        <div>
          <h5 className="font-bold text-white mb-0.5">Privacy-First Ephemeral Execution Guarantee</h5>
          <p>
            Your conversations are not stored as a permanent recording by this prototype. Raw audio segments are converted to numeric feature descriptors locally in memory and immediately discarded.
          </p>
        </div>
      </div>

      {/* Grid Policies Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" id="privacy-policies-grid">
        {policies.map((p, idx) => {
          const Icon = p.icon;
          return (
            <div 
              key={idx}
              className="p-4 rounded-xl bg-navy-950/65 border border-navy-800/80 flex flex-col justify-between space-y-4 hover:border-cyan-500/25 transition-colors"
              id={`privacy-card-${idx}`}
            >
              <div>
                <div className="flex items-center justify-between gap-3 mb-2.5">
                  <span className="inline-block p-1.5 rounded-lg bg-navy-900 border border-navy-800 text-cyan-400 shrink-0">
                    <Icon className="h-4.5 w-4.5" />
                  </span>
                  <span className="text-[9px] font-extrabold px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 uppercase tracking-widest">
                    {p.badge}
                  </span>
                </div>
                <h4 className="font-display font-bold text-xs text-white uppercase tracking-wider">{p.title}</h4>
              </div>
              <p className="text-slate-400 text-xs leading-relaxed font-sans">{p.desc}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Privacy;
