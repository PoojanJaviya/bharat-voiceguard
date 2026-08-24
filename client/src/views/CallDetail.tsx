import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { mockApi, CallDetailModel } from '../services/mockApi';
import { 
  ArrowLeft, 
  ShieldAlert, 
  Clock, 
  Calendar, 
  Globe, 
  AlertOctagon,
  User,
  Activity,
  CheckCircle,
  HelpCircle,
  FileText
} from 'lucide-react';

const CallDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [call, setCall] = useState<CallDetailModel | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      setLoading(true);
      mockApi.getCallAnalysis(id).then((data) => {
        setCall(data || null);
        setLoading(false);
      });
    }
  }, [id]);

  if (loading) {
    return (
      <div className="h-[400px] flex flex-col items-center justify-center text-slate-500 font-sans" id="calldetail-loading">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-500 mb-3"></div>
        <span>Retrieving Call Forensic Analysis...</span>
      </div>
    );
  }

  if (!call) {
    return (
      <div className="glass-card rounded-2xl p-8 border border-navy-800 text-center space-y-4 font-sans" id="calldetail-error">
        <AlertOctagon className="h-10 w-10 text-rose-500 mx-auto" />
        <h3 className="font-display font-bold text-lg text-white">Call Forensic Report Not Found</h3>
        <p className="text-slate-400 text-xs max-w-sm mx-auto leading-relaxed">
          The requested call session token does not match any archived auditing reports. It may have been ephemerally cleared.
        </p>
        <button 
          onClick={() => navigate('/history')}
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-navy-800 text-slate-200 hover:text-white rounded-lg border border-navy-700 text-xs font-semibold cursor-pointer"
        >
          <ArrowLeft className="h-4 w-4" /> Return to Logs
        </button>
      </div>
    );
  }

  const isHigh = call.riskLevel === 'HIGH RISK';
  const isVerify = call.riskLevel === 'VERIFY';

  // Highlight suspicious words helper for static transcripts
  const highlightWords = (text: string) => {
    const suspicious = [
      /OTP/gi, /verification/gi, /verify/gi, /block/gi, /blocked/gi, 
      /urgently/gi, /urgent/gi, /hospital/gi, /gpay/gi, /transfer/gi, 
      /money/gi, /aadhar/gi, /kyc/gi, /credit card/gi, /validation/gi,
      /૧૫,૦૦૦/gi, /તાત્કાલિક/gi, /ઓટીપી/gi, /ઓટીપી/gi, /ઓટીપી/gi,
      /ओटीपी/gi, /ब्लॉक/gi, /केवाईसी/gi, /आधार/gi
    ];
    let html = text;
    suspicious.forEach(reg => {
      html = html.replace(reg, (match) => `<span class="bg-rose-500/20 text-rose-300 font-semibold px-1 rounded border border-rose-500/20">${match}</span>`);
    });
    return <span dangerouslySetInnerHTML={{ __html: html }} />;
  };

  return (
    <div className="space-y-6">
      {/* Back button and page title */}
      <div className="flex items-center gap-3">
        <button 
          id="calldetail-back"
          onClick={() => navigate('/history')}
          className="h-9 w-9 rounded-lg bg-navy-800 border border-navy-700 text-slate-400 hover:text-white flex items-center justify-center cursor-pointer transition-colors"
        >
          <ArrowLeft className="h-4.5 w-4.5" />
        </button>
        <div>
          <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Call Forensic Worksheet</span>
          <h2 className="font-display font-extrabold text-lg text-white leading-tight">
            Report #{call.id.toUpperCase()}
          </h2>
        </div>
      </div>

      {/* Main Grid: Details Header and Signals */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Call Summary Panel */}
        <div className="lg:col-span-2 space-y-6">
          {/* Header Card */}
          <div className="glass-card rounded-2xl p-5 md:p-6 border border-navy-800 grid grid-cols-1 md:grid-cols-3 gap-6 relative overflow-hidden">
            {/* Risk dial equivalent representation */}
            <div className="flex flex-col justify-between" id="calldetail-summary-risk">
              <div>
                <span className="text-xxs uppercase tracking-widest text-slate-500 font-bold block mb-1">Assessment Outcome</span>
                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${
                  isHigh 
                    ? 'bg-rose-500/10 border-rose-500/20 text-rose-400' 
                    : isVerify 
                      ? 'bg-amber-500/10 border-amber-500/20 text-amber-400' 
                      : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                }`}>
                  <span className="h-1.5 w-1.5 rounded-full bg-current"></span>
                  {call.riskLevel}
                </span>
              </div>
              <div className="mt-6 md:mt-0">
                <div className="text-3xl font-display font-black text-white">{call.riskScore}<span className="text-slate-500 text-sm font-normal"> /100</span></div>
                <span className="text-[10px] text-slate-500 font-semibold block mt-1">CALIBRATED THREAT INDEX</span>
              </div>
            </div>

            {/* Call Metadata */}
            <div className="md:col-span-2 grid grid-cols-2 gap-4 text-xs font-sans border-t md:border-t-0 md:border-l border-navy-800 pt-6 md:pt-0 md:pl-6">
              <div className="space-y-1">
                <span className="text-slate-500 font-semibold block">Caller Entity</span>
                <span className="font-bold text-slate-200 flex items-center gap-1"><User className="h-3.5 w-3.5 text-slate-400" /> {call.caller}</span>
              </div>
              <div className="space-y-1">
                <span className="text-slate-500 font-semibold block">Phone Number</span>
                <span className="font-bold text-slate-300 font-mono">{call.number}</span>
              </div>
              <div className="space-y-1">
                <span className="text-slate-500 font-semibold block">Dialect Profile</span>
                <span className="font-bold text-slate-200 flex items-center gap-1"><Globe className="h-3.5 w-3.5 text-slate-400" /> {call.language}</span>
              </div>
              <div className="space-y-1">
                <span className="text-slate-500 font-semibold block">Call Duration</span>
                <span className="font-bold text-slate-200 flex items-center gap-1"><Clock className="h-3.5 w-3.5 text-slate-400" /> {call.duration}</span>
              </div>
              <div className="space-y-1 col-span-2">
                <span className="text-slate-500 font-semibold block">Audited Timestamp</span>
                <span className="font-bold text-slate-300 flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5 text-slate-400" />
                  {new Date(call.timestamp).toLocaleString(undefined, { 
                    dateStyle: 'medium', 
                    timeStyle: 'short' 
                  })}
                </span>
              </div>
            </div>
          </div>

          {/* Rationale explanation card */}
          <div className="glass-card rounded-2xl p-5 border border-navy-800 space-y-4" id="calldetail-analysis-rationale">
            <h4 className="font-display font-bold text-sm text-white flex items-center gap-1.5 border-b border-navy-800 pb-3">
              <FileText className="h-4.5 w-4.5 text-cyan-400" /> Forensic Analysis Narrative
            </h4>
            <p className="text-xs text-slate-300 font-sans leading-relaxed">
              {call.explanation}
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              {/* Risk Reasons */}
              <div className="p-3.5 rounded-xl bg-navy-950/80 border border-navy-800/80 text-xs">
                <span className="text-slate-500 font-semibold text-[10px] uppercase block mb-2 tracking-wide">Threat Indicators Identified</span>
                <ul className="space-y-2 text-slate-300 font-sans list-disc list-inside">
                  {call.riskReasons.map((reason, idx) => (
                    <li key={idx} className="leading-relaxed">{reason}</li>
                  ))}
                </ul>
              </div>

              {/* Recommended Actions */}
              <div className="p-3.5 rounded-xl bg-navy-950/80 border border-navy-800/80 text-xs">
                <span className="text-slate-500 font-semibold text-[10px] uppercase block mb-2 tracking-wide">Mitigation Recommendations</span>
                <ul className="space-y-2 text-slate-300 font-sans">
                  {call.recommendedActions.map((action, idx) => (
                    <li key={idx} className="flex items-start gap-1.5 leading-relaxed">
                      <CheckCircle className="h-3.5 w-3.5 text-cyan-400 shrink-0 mt-0.5" />
                      <span>{action}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Classifier Signals Sidebar */}
        <div className="space-y-6">
          {/* Attack Signal Chips */}
          <div className="glass-card rounded-2xl p-5 border border-navy-800" id="calldetail-attack-signatures">
            <span className="text-xxs uppercase tracking-widest text-slate-500 font-bold block mb-3">Attack Signatures</span>
            <div className="flex flex-wrap gap-1.5">
              {call.attackSignals.length === 0 ? (
                <span className="text-xs text-slate-500 font-sans">No signatures identified.</span>
              ) : (
                call.attackSignals.map((signal) => (
                  <span 
                    key={signal}
                    className="text-[9px] font-extrabold px-2 py-1 rounded bg-rose-500/10 text-rose-300 border border-rose-500/20 uppercase tracking-wider"
                  >
                    {signal}
                  </span>
                ))
              )}
            </div>
          </div>

          {/* AI Metrics Breakdown */}
          <div className="glass-card rounded-2xl p-5 border border-navy-800 space-y-4 font-sans text-xs" id="calldetail-ai-classifiers">
            <span className="text-xxs uppercase tracking-widest text-slate-500 font-bold block mb-1">Classifier Metrics</span>
            <h4 className="font-display font-bold text-sm text-white border-b border-navy-800 pb-3">AI Layer Audits</h4>
            
            {/* Voice Authenticity */}
            <div className="space-y-1">
              <div className="flex justify-between font-semibold">
                <span className="text-slate-400">Synthetic Speech Prob</span>
                <span className={call.voiceAuthenticity.includes('likely synthetic') ? 'text-rose-400' : 'text-emerald-400'}>{call.voiceAuthenticity}</span>
              </div>
              <div className="w-full h-1 bg-navy-950 rounded-full overflow-hidden">
                <div 
                  className={`h-full rounded-full ${call.voiceAuthenticity.includes('likely synthetic') ? 'bg-rose-500' : 'bg-emerald-500'}`}
                  style={{ width: call.voiceAuthenticity.includes('likely synthetic') ? '80%' : '15%' }}
                />
              </div>
            </div>

            {/* Speaker Consistency */}
            <div className="space-y-1">
              <div className="flex justify-between font-semibold">
                <span className="text-slate-400">Speaker Mismatch Prob</span>
                <span className="text-slate-200">{call.speakerConsistency}</span>
              </div>
              <div className="w-full h-1 bg-navy-950 rounded-full overflow-hidden">
                <div className="h-full bg-cyan-500 rounded-full" style={{ width: '45%' }} />
              </div>
            </div>

            {/* Replay Probability */}
            <div className="space-y-1">
              <div className="flex justify-between font-semibold">
                <span className="text-slate-400">Replay Characteristics</span>
                <span className="text-slate-200">{call.replayScore}</span>
              </div>
              <div className="w-full h-1 bg-navy-950 rounded-full overflow-hidden">
                <div className="h-full bg-slate-500 rounded-full" style={{ width: '20%' }} />
              </div>
            </div>

            {/* Scam Intent */}
            <div className="flex justify-between items-center py-1 border-t border-navy-850">
              <span className="text-slate-400 font-medium">Scam Intent</span>
              <span className="font-bold text-white uppercase">{call.scamIntent}</span>
            </div>

            {/* Context Risk */}
            <div className="flex justify-between items-center py-1 border-b border-navy-850">
              <span className="text-slate-400 font-medium">Context Risk</span>
              <span className="font-bold text-white uppercase">{call.contextRisk}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Transcript Log Card */}
      <div className="glass-card rounded-2xl p-5 border border-navy-800 space-y-4" id="calldetail-transcript-card">
        <h4 className="font-display font-bold text-sm text-white border-b border-navy-800 pb-3">
          Conversational Speech Transcript Log
        </h4>
        <div className="space-y-4 max-h-96 overflow-y-auto pr-1">
          {call.transcript.map((line, idx) => {
            const isCaller = line.speaker === 'Caller';
            return (
              <div 
                key={idx}
                className={`flex flex-col max-w-[85%] ${isCaller ? 'self-start items-start' : 'self-end items-end ml-auto'}`}
              >
                <div className="flex items-center gap-1.5 text-[9px] text-slate-500 font-bold mb-1">
                  <span>{isCaller ? 'CALLER' : 'YOU'}</span>
                  <span>•</span>
                  <span>{line.time}</span>
                </div>
                <div 
                  className={`p-3.5 rounded-xl text-xs leading-relaxed font-sans ${
                    isCaller 
                      ? 'bg-navy-950 text-slate-300 rounded-tl-none border border-navy-805' 
                      : 'bg-cyan-500/10 text-cyan-100 rounded-tr-none border border-cyan-500/15'
                  }`}
                >
                  {highlightWords(line.text)}
                </div>
                {line.tags && line.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-1">
                    {line.tags.map((tag) => (
                      <span 
                        key={tag}
                        className="text-[8px] font-extrabold px-1.5 py-0.5 rounded bg-rose-500/15 text-rose-400 border border-rose-500/20 uppercase tracking-widest"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default CallDetail;
