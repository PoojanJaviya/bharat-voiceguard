import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { mockApi, CallDetailModel } from '../services/mockApi';
import { Search, Filter, ArrowRight, ShieldCheck } from 'lucide-react';

const CallHistory: React.FC = () => {
  const navigate = useNavigate();
  const [calls, setCalls] = useState<CallDetailModel[]>([]);
  const [filteredCalls, setFilteredCalls] = useState<CallDetailModel[]>([]);
  
  // Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [riskFilter, setRiskFilter] = useState('ALL');
  const [langFilter, setLangFilter] = useState('ALL');
  const [attackFilter, setAttackFilter] = useState('ALL');

  useEffect(() => {
    mockApi.getCallHistory().then((data) => {
      setCalls(data);
      setFilteredCalls(data);
    });
  }, []);

  // Filter application handler
  useEffect(() => {
    let result = [...calls];

    // Search query matching
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (c) =>
          c.caller.toLowerCase().includes(q) ||
          c.number.includes(q) ||
          c.explanation.toLowerCase().includes(q)
      );
    }

    // Risk level matching
    if (riskFilter !== 'ALL') {
      result = result.filter((c) => c.riskLevel === riskFilter);
    }

    // Language matching
    if (langFilter !== 'ALL') {
      result = result.filter((c) => c.language.includes(langFilter));
    }

    // Attack signals matching
    if (attackFilter !== 'ALL') {
      result = result.filter((c) => 
        c.attackSignals.some(s => s.toLowerCase().includes(attackFilter.toLowerCase()))
      );
    }

    setFilteredCalls(result);
  }, [searchQuery, riskFilter, langFilter, attackFilter, calls]);

  const getRiskBadge = (level: string) => {
    switch (level) {
      case 'LOW RISK':
        return <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">LOW RISK</span>;
      case 'VERIFY':
        return <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-full border border-amber-500/20">VERIFY</span>;
      default:
        return <span className="inline-flex items-center gap-1 text-xs font-bold text-rose-400 bg-rose-500/10 px-2.5 py-1 rounded-full border border-rose-500/20">HIGH RISK</span>;
    }
  };

  return (
    <div className="glass-card rounded-2xl p-5 md:p-6 border border-navy-800 space-y-6">
      {/* Description header */}
      <div className="border-b border-navy-800 pb-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-xxs uppercase tracking-widest text-slate-500 font-bold block mb-1">AUDIT DASHBOARD</span>
          <h2 className="font-display font-extrabold text-lg md:text-xl text-white tracking-tight">Call Protection Logs</h2>
          <p className="text-xs text-slate-400 font-sans mt-0.5 leading-relaxed">
            History of audited calls with metadata, voice similarity markers, and classification summaries.
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3" id="filters-grid">
        {/* Search Input */}
        <div className="sm:col-span-2 relative flex items-center bg-navy-950 border border-navy-800 rounded-lg px-3 py-1.5 focus-within:border-cyan-500/50 transition-colors">
          <Search className="h-4 w-4 text-slate-500 shrink-0 mr-2" />
          <input
            id="search-calls-input"
            type="text"
            placeholder="Search by caller, number or reason..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-transparent text-xs text-white placeholder-slate-500 outline-none w-full font-sans"
          />
        </div>

        {/* Risk Select Dropdown */}
        <div className="relative flex items-center bg-navy-950 border border-navy-800 rounded-lg px-2.5 py-1.5" id="filter-risk-wrapper">
          <Filter className="h-3.5 w-3.5 text-slate-500 shrink-0 mr-1.5" />
          <select
            id="filter-risk"
            value={riskFilter}
            onChange={(e) => setRiskFilter(e.target.value)}
            className="bg-transparent text-xs text-slate-300 outline-none w-full cursor-pointer pr-4 font-medium"
          >
            <option value="ALL" className="bg-navy-900">All Risk Categories</option>
            <option value="LOW RISK" className="bg-navy-900">Low Risk Only</option>
            <option value="VERIFY" className="bg-navy-900">Verify Only</option>
            <option value="HIGH RISK" className="bg-navy-900">High Risk Only</option>
          </select>
        </div>

        {/* Language Select Dropdown */}
        <div className="relative flex items-center bg-navy-950 border border-navy-800 rounded-lg px-2.5 py-1.5" id="filter-lang-wrapper">
          <select
            id="filter-lang"
            value={langFilter}
            onChange={(e) => setLangFilter(e.target.value)}
            className="bg-transparent text-xs text-slate-300 outline-none w-full cursor-pointer pr-4 font-medium"
          >
            <option value="ALL" className="bg-navy-900">All Language dialects</option>
            <option value="English" className="bg-navy-900">English</option>
            <option value="Hindi" className="bg-navy-900">Hindi</option>
            <option value="Gujarati" className="bg-navy-900">Gujarati</option>
          </select>
        </div>

        {/* Attack Vector Select Dropdown */}
        <div className="relative flex items-center bg-navy-950 border border-navy-800 rounded-lg px-2.5 py-1.5" id="filter-attack-wrapper">
          <select
            id="filter-attack"
            value={attackFilter}
            onChange={(e) => setAttackFilter(e.target.value)}
            className="bg-transparent text-xs text-slate-300 outline-none w-full cursor-pointer pr-4 font-medium"
          >
            <option value="ALL" className="bg-navy-900">All Attack Types</option>
            <option value="AI Voice" className="bg-navy-900">AI Voice Cloning</option>
            <option value="Replay" className="bg-navy-900">Replay Attacks</option>
            <option value="OTP" className="bg-navy-900">OTP Fraud</option>
            <option value="Impersonation" className="bg-navy-900">Impersonation</option>
          </select>
        </div>
      </div>

      {/* Logs Table */}
      <div className="overflow-x-auto w-full">
        <table className="w-full text-left text-xs text-slate-400 border-collapse" id="history-logs-table">
          <thead>
            <tr className="border-b border-navy-800 text-slate-500 font-bold uppercase tracking-wider">
              <th className="py-3 px-3">Caller Connection</th>
              <th className="py-3 px-3">Risk Assessment</th>
              <th className="py-3 px-3">Dialect Profile</th>
              <th className="py-3 px-3">Call duration &amp; Time</th>
              <th className="py-3 px-3">Trigger Rationale</th>
              <th className="py-3 px-3 text-right">Details</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-navy-850">
            {filteredCalls.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center py-12 text-slate-500 text-sm font-sans">
                  No audited call logs matched your filter configuration.
                </td>
              </tr>
            ) : (
              filteredCalls.map((call) => (
                <tr key={call.id} className="hover:bg-navy-900/30 transition-colors">
                  <td className="py-4 px-3 font-semibold text-white">
                    <div>{call.caller}</div>
                    <div className="text-[10px] text-slate-500 font-mono mt-0.5">{call.number}</div>
                  </td>
                  <td className="py-4 px-3">{getRiskBadge(call.riskLevel)}</td>
                  <td className="py-4 px-3 font-medium">{call.language}</td>
                  <td className="py-4 px-3">
                    <div className="font-semibold text-slate-300">{call.duration}</div>
                    <div className="text-[9px] text-slate-500 mt-0.5">
                      {new Date(call.timestamp).toLocaleDateString(undefined, { 
                        month: 'short', 
                        day: 'numeric', 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </div>
                  </td>
                  <td className="py-4 px-3 max-w-[220px] leading-relaxed">
                    <div className="line-clamp-2 text-slate-400">{call.explanation}</div>
                  </td>
                  <td className="py-4 px-3 text-right">
                    <button 
                      id={`inspect-history-${call.id}`}
                      onClick={() => navigate(`/history/${call.id}`)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-navy-800 hover:bg-navy-750 text-cyan-400 font-bold border border-navy-750 hover:border-cyan-500/20 cursor-pointer transition-all active:scale-95"
                    >
                      Inspect <ArrowRight className="h-3.5 w-3.5" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CallHistory;
