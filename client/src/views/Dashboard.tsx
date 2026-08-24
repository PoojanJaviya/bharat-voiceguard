import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDemo } from '../context/DemoContext';
import { mockApi, DashboardStats, CallDetailModel } from '../services/mockApi';
import LiveCallCard from '../components/LiveCallCard';
import AudioWaveform from '../components/AudioWaveform';
import { 
  ShieldCheck, 
  PhoneCall, 
  AlertTriangle, 
  Search, 
  ArrowRight,
  TrendingUp,
  Fingerprint,
  Languages,
  CheckCircle
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  PieChart, 
  Pie, 
  Cell 
} from 'recharts';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { callState, riskLevel, riskScore } = useDemo();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [history, setHistory] = useState<CallDetailModel[]>([]);

  useEffect(() => {
    mockApi.getDashboardStats().then(setStats);
    mockApi.getCallHistory().then(data => setHistory(data.slice(0, 3))); // Get top 3
  }, []);

  const getRiskBadge = (level: string) => {
    switch (level) {
      case 'LOW RISK':
        return <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">LOW RISK</span>;
      case 'VERIFY':
        return <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">VERIFY</span>;
      default:
        return <span className="inline-flex items-center gap-1 text-xs font-bold text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/20">HIGH RISK</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Hero Protection Banner */}
      <div 
        id="dashboard-hero-banner"
        className="glass-card rounded-2xl p-5 md:p-6 border border-navy-800 flex flex-col md:flex-row md:items-center justify-between gap-4 relative overflow-hidden"
      >
        <div className="flex items-center gap-4 relative z-10">
          <div className="h-12 w-12 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center border border-emerald-500/20 shrink-0">
            <ShieldCheck className="h-6 w-6 animate-pulse" />
          </div>
          <div>
            <h2 className="font-display font-extrabold text-lg md:text-xl text-white tracking-tight">
              Your Communications are Protected
            </h2>
            <p className="text-xs text-slate-400 font-sans mt-0.5 leading-relaxed">
              BharatVoiceGuard real-time voice verification is running. Processing calls ephemerally on-device.
            </p>
          </div>
        </div>

        <div className="flex gap-4 shrink-0 relative z-10 text-xs text-slate-400">
          <div className="px-3.5 py-2 bg-navy-950/80 border border-navy-800/80 rounded-xl">
            <span className="text-[10px] text-slate-500 block font-bold uppercase tracking-wider mb-0.5">Language Model</span>
            <span className="font-semibold text-slate-300">ENG + HIN + GUJ</span>
          </div>
          <div className="px-3.5 py-2 bg-navy-950/80 border border-navy-800/80 rounded-xl">
            <span className="text-[10px] text-slate-500 block font-bold uppercase tracking-wider mb-0.5">Privacy Engine</span>
            <span className="font-semibold text-cyan-400">EPHEMERAL ON</span>
          </div>
        </div>
      </div>

      {/* Main Row: Live Call and Audio Waveform */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <LiveCallCard />
        </div>
        <div className="flex flex-col gap-4">
          <div className="glass-card rounded-2xl p-5 border border-navy-800 flex-1 flex flex-col justify-between">
            <div>
              <span className="text-xxs uppercase tracking-widest text-slate-500 font-bold block mb-1">LIVE AUDIO INTEGRITY</span>
              <h4 className="font-display font-bold text-sm text-white mb-2">Spectral Waveform Analyzer</h4>
              <p className="text-xs text-slate-400 font-sans leading-relaxed mb-4">
                {callState === 'active' 
                  ? `Analyzing spectral envelopes and sub-audible artifacts in real-time. Current Risk Level: ${riskLevel}`
                  : 'Engine on standby. Waveform displays resting carrier frequency signals.'}
              </p>
            </div>
            <AudioWaveform />
          </div>
        </div>
      </div>

      {/* Quick Analytics Row */}
      {stats && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4" id="dashboard-counters-grid">
          <div className="glass-card rounded-xl p-4 border border-navy-800">
            <span className="text-slate-500 text-xxs font-bold uppercase tracking-wider block">Calls Analyzed</span>
            <div className="font-display font-black text-2xl md:text-3xl text-white tracking-tight mt-1" id="counter-calls-analyzed">
              {stats.callsAnalyzed}
            </div>
            <span className="text-[10px] text-emerald-400 font-medium flex items-center gap-0.5 mt-1">
              <TrendingUp className="h-3 w-3" /> +14.2% this week
            </span>
          </div>

          <div className="glass-card rounded-xl p-4 border border-navy-800">
            <span className="text-slate-500 text-xxs font-bold uppercase tracking-wider block">Verify Recommended</span>
            <div className="font-display font-black text-2xl md:text-3xl text-amber-400 tracking-tight mt-1" id="counter-requires-verify">
              {stats.requiresVerification}
            </div>
            <span className="text-[10px] text-slate-500 mt-1 block">Uncertain voice profiles</span>
          </div>

          <div className="glass-card rounded-xl p-4 border border-navy-800">
            <span className="text-slate-500 text-xxs font-bold uppercase tracking-wider block">High-Risk Impersonations</span>
            <div className="font-display font-black text-2xl md:text-3xl text-rose-400 tracking-tight mt-1" id="counter-high-risk">
              {stats.highRiskCount}
            </div>
            <span className="text-[10px] text-rose-400/80 font-bold block mt-1">Blocked or Reported</span>
          </div>

          <div className="glass-card rounded-xl p-4 border border-navy-800">
            <span className="text-slate-500 text-xxs font-bold uppercase tracking-wider block">Replay Signatures</span>
            <div className="font-display font-black text-2xl md:text-3xl text-cyan-400 tracking-tight mt-1" id="counter-replay">
              {stats.replayAttacksDetected}
            </div>
            <span className="text-[10px] text-slate-500 mt-1 block">Looped audio artifacts</span>
          </div>
        </div>
      )}

      {/* Charts & Table Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Risk Trend Chart */}
        {stats && (
          <div className="lg:col-span-2 glass-card rounded-2xl p-5 border border-navy-800 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-4 border-b border-navy-800 pb-3">
              <div>
                <span className="text-xxs uppercase tracking-widest text-slate-500 font-bold block mb-1">PROTECTION TRENDS</span>
                <h4 className="font-display font-bold text-sm text-white">Risk Distribution Over 7 Days</h4>
              </div>
              <TrendingUp className="h-4.5 w-4.5 text-cyan-400" />
            </div>
            <div className="h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={stats.riskTrend} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                  <XAxis dataKey="day" stroke="#475569" fontSize={11} tickLine={false} />
                  <YAxis stroke="#475569" fontSize={11} tickLine={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
                  />
                  <Area type="monotone" dataKey="low" name="Low Risk" stroke="#10b981" fill="rgba(16, 185, 129, 0.05)" strokeWidth={2} />
                  <Area type="monotone" dataKey="verify" name="Verify" stroke="#f59e0b" fill="rgba(245, 158, 11, 0.05)" strokeWidth={2} />
                  <Area type="monotone" dataKey="high" name="High Risk" stroke="#ef4444" fill="rgba(239, 68, 68, 0.05)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Language Breakdown */}
        {stats && (
          <div className="glass-card rounded-2xl p-5 border border-navy-800 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-4 border-b border-navy-800 pb-3">
              <div>
                <span className="text-xxs uppercase tracking-widest text-slate-500 font-bold block mb-1">DIALECT CLASSIFICATION</span>
                <h4 className="font-display font-bold text-sm text-white">Languages Detected</h4>
              </div>
              <Languages className="h-4.5 w-4.5 text-cyan-400" />
            </div>
            <div className="flex items-center justify-center h-40">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={stats.languagesBreakdown}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={65}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {stats.languagesBreakdown.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', color: '#fff', fontSize: '11px' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="grid grid-cols-2 gap-2 text-[10px] text-slate-400 pt-3 border-t border-navy-800">
              {stats.languagesBreakdown.map((item, idx) => (
                <div key={idx} className="flex items-center gap-1.5 font-medium">
                  <span className="h-2 w-2 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                  <span>{item.name} ({item.value}%)</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Recent Calls Log */}
      <div className="glass-card rounded-2xl p-5 border border-navy-800">
        <div className="flex items-center justify-between mb-4 border-b border-navy-800 pb-3">
          <div>
            <span className="text-xxs uppercase tracking-widest text-slate-500 font-bold block mb-1">PROTECTION AUDIT</span>
            <h4 className="font-display font-bold text-sm text-white">Recent Call Verification Reports</h4>
          </div>
          <button 
            id="recent-calls-view-all"
            onClick={() => navigate('/history')}
            className="text-xs text-cyan-400 hover:text-cyan-300 font-bold flex items-center gap-1 cursor-pointer transition-colors"
          >
            View Full Logs <ArrowRight className="h-4 w-4" />
          </button>
        </div>

        <div className="overflow-x-auto w-full">
          <table className="w-full text-left text-xs text-slate-400 border-collapse" id="dashboard-recent-calls-table">
            <thead>
              <tr className="border-b border-navy-850 text-slate-500 font-bold uppercase tracking-wider">
                <th className="py-2.5 px-3">Caller Identity</th>
                <th className="py-2.5 px-3">Risk Assessment</th>
                <th className="py-2.5 px-3">Language dialect</th>
                <th className="py-2.5 px-3">Primary Alert Reason</th>
                <th className="py-2.5 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-navy-850">
              {history.map((call) => (
                <tr key={call.id} className="hover:bg-navy-900/30 transition-colors">
                  <td className="py-3.5 px-3 font-semibold text-white">
                    <div>{call.caller}</div>
                    <div className="text-[10px] text-slate-500 font-mono mt-0.5">{call.number}</div>
                  </td>
                  <td className="py-3.5 px-3">{getRiskBadge(call.riskLevel)}</td>
                  <td className="py-3.5 px-3 font-medium">{call.language}</td>
                  <td className="py-3.5 px-3 truncate max-w-[200px] leading-relaxed">{call.explanation}</td>
                  <td className="py-3.5 px-3 text-right">
                    <button 
                      id={`inspect-call-${call.id}`}
                      onClick={() => navigate(`/history/${call.id}`)}
                      className="inline-flex items-center gap-1 text-cyan-400 hover:text-cyan-300 font-bold cursor-pointer transition-colors"
                    >
                      Inspect Report <ArrowRight className="h-3.5 w-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
