import React from 'react';
import { useDemo } from '../context/DemoContext';
import LiveCallCard from '../components/LiveCallCard';
import LiveTranscript from '../components/LiveTranscript';
import StopAndVerifyPanel from '../components/StopAndVerifyPanel';
import { 
  Activity, 
  Cpu, 
  UserCheck, 
  ShieldAlert, 
  Languages, 
  HelpCircle,
  AlertTriangle
} from 'lucide-react';

const LiveCall: React.FC = () => {
  const { 
    callState, 
    riskLevel, 
    voiceAuthenticity, 
    speakerConsistency, 
    replayScore, 
    scamIntent, 
    contextRisk,
    currentScenario
  } = useDemo();

  // Helper to determine risk bar width and color
  const getProgressStyles = (valStr: string) => {
    // Extract number from string e.g. "82% likely synthetic" -> 82
    const num = parseInt(valStr.replace(/\D/g, '')) || 0;
    let bg = 'bg-cyan-500';
    if (num > 70) bg = 'bg-rose-500';
    else if (num > 40) bg = 'bg-amber-500';
    else bg = 'bg-emerald-500';
    return { width: `${num}%`, bg };
  };

  return (
    <div className="space-y-6">
      {/* Top Section: Active Call Card */}
      <div id="livecall-status-deck">
        <LiveCallCard />
      </div>

      {/* Main Grid: Transcript & Signal Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Live Transcript Column */}
        <div className="lg:col-span-2">
          <LiveTranscript />

          {/* Multilingual / Code-Switching Demonstration Component */}
          {callState === 'active' && (
            <div className="glass-card rounded-2xl p-5 border border-navy-800 mt-6" id="language-detection-demo">
              <span className="text-xxs uppercase tracking-widest text-slate-500 font-bold block mb-1">PROTOTYPE ENGINE</span>
              <h4 className="font-display font-bold text-sm text-white flex items-center gap-1.5 mb-3">
                <Languages className="h-4.5 w-4.5 text-cyan-400" /> Live Dialect &amp; Code-Switching Detection
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-sans">
                {/* Detected Dialect */}
                <div className="p-3.5 rounded-xl bg-navy-950/80 border border-navy-800/80">
                  <span className="text-slate-500 font-semibold text-[10px] uppercase block mb-1">Active Dialect Profile</span>
                  <div className="font-bold text-slate-200" id="detected-dialect-badge">
                    {currentScenario.language === 'English' && '🇬🇧 English (IN Accents)'}
                    {currentScenario.language === 'Hindi' && '🇮🇳 Hindi (Standard Dialect)'}
                    {currentScenario.language === 'Gujarati' && '🇮🇳 Gujarati (Standard Dialect)'}
                    {currentScenario.language === 'Hindi + English' && '🇮🇳 Hindi-English (Hinglish)'}
                  </div>
                </div>

                {/* Simulated Translation Stream */}
                <div className="p-3.5 rounded-xl bg-navy-950/80 border border-navy-800/80 md:col-span-2 flex flex-col justify-between">
                  <span className="text-slate-500 font-semibold text-[10px] uppercase block mb-1">Live Translation / Guidance Stream</span>
                  <div className="font-mono text-cyan-400 font-semibold" id="detected-code-switch-text">
                    {currentScenario.id === 1 && (
                      <div className="space-y-1">
                        <div>Detected: <span className="text-slate-200">Hindi → English code-switch</span></div>
                        <div className="text-slate-400 text-xxs font-sans font-normal leading-normal">
                          &quot;Aap OTP share mat kariye.&quot; ➡️ <span className="italic text-slate-300">Switch detected. Guidance: Do not disclose authentication key tokens.</span>
                        </div>
                      </div>
                    )}
                    {currentScenario.id === 2 && (
                      <div className="space-y-1">
                        <div>Detected: <span className="text-slate-200">Hindi Standard</span></div>
                        <div className="text-slate-400 text-xxs font-sans font-normal leading-normal">
                          &quot;Validation code batayein.&quot; ➡️ <span className="italic text-slate-300">Official impersonation detected. Block callback.</span>
                        </div>
                      </div>
                    )}
                    {currentScenario.id === 3 && (
                      <div className="space-y-1">
                        <div>Detected: <span className="text-slate-200">English Standard (IN)</span></div>
                        <div className="text-slate-400 text-xxs font-sans font-normal leading-normal">
                          &quot;Transfer 2,000 to milkman.&quot; ➡️ <span className="italic text-slate-300">Urgent request context active. Contact verified.</span>
                        </div>
                      </div>
                    )}
                    {currentScenario.id === 4 && (
                      <div className="space-y-1">
                        <div>Detected: <span className="text-slate-200">Gujarati Dialect</span></div>
                        <div className="text-slate-400 text-xxs font-sans font-normal leading-normal">
                          &quot;Aadhar number aapo.&quot; ➡️ <span className="italic text-slate-300">Identity request in regional dialect. Alert active.</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Signals Column */}
        <div className="space-y-6">
          {/* STOP & VERIFY checklist */}
          <StopAndVerifyPanel />

          {/* AI Signals Card */}
          <div className="glass-card rounded-2xl p-5 border border-navy-800" id="live-signals-deck">
            <span className="text-xxs uppercase tracking-widest text-slate-500 font-bold block mb-1">SECURITY SIGNALS</span>
            <h4 className="font-display font-bold text-sm text-white border-b border-navy-800 pb-3 mb-4">
              AI Classifier Processing
            </h4>

            {callState === 'idle' || callState === 'ended' ? (
              <div className="text-center py-10 text-slate-500 text-xs font-sans">
                Classifiers standby. Start call to begin signal parsing.
              </div>
            ) : (
              <div className="space-y-4 text-xs">
                {/* Voice Authenticity */}
                <div id="signal-voice-authenticity">
                  <div className="flex justify-between items-center mb-1.5 font-sans">
                    <span className="text-slate-400 font-medium">Voice Authenticity</span>
                    <span className={`font-semibold ${voiceAuthenticity.includes('synthetic') ? 'text-rose-400' : 'text-emerald-400'}`}>
                      {voiceAuthenticity}
                    </span>
                  </div>
                  <div className="w-full h-1.5 bg-navy-950 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all duration-500 ${getProgressStyles(voiceAuthenticity).bg}`}
                      style={{ width: getProgressStyles(voiceAuthenticity).width }}
                    />
                  </div>
                </div>

                {/* Speaker Consistency */}
                <div id="signal-speaker-consistency">
                  <div className="flex justify-between items-center mb-1.5 font-sans">
                    <span className="text-slate-400 font-medium">Speaker Consistency</span>
                    <span className={`font-semibold ${speakerConsistency.includes('96%') ? 'text-emerald-400' : 'text-amber-400'}`}>
                      {speakerConsistency}
                    </span>
                  </div>
                  <div className="w-full h-1.5 bg-navy-950 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all duration-500 ${getProgressStyles(speakerConsistency).bg}`}
                      style={{ width: getProgressStyles(speakerConsistency).width }}
                    />
                  </div>
                </div>

                {/* Replay Integrity */}
                <div id="signal-replay-score">
                  <div className="flex justify-between items-center mb-1.5 font-sans">
                    <span className="text-slate-400 font-medium">Replay Integrity</span>
                    <span className={`font-semibold ${replayScore.includes('Critical') || replayScore.includes('91%') ? 'text-rose-400' : 'text-slate-400'}`}>
                      {replayScore}
                    </span>
                  </div>
                  <div className="w-full h-1.5 bg-navy-950 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all duration-500 ${getProgressStyles(replayScore).bg}`}
                      style={{ width: getProgressStyles(replayScore).width }}
                    />
                  </div>
                </div>

                {/* Scam Intent */}
                <div className="flex items-center justify-between py-2 border-t border-navy-850" id="signal-scam-intent">
                  <span className="text-slate-400 font-medium font-sans">Scam Intent Category</span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase border ${
                    scamIntent === 'Critical' || scamIntent === 'High' 
                      ? 'bg-rose-500/10 border-rose-500/20 text-rose-400' 
                      : scamIntent === 'Medium' 
                        ? 'bg-amber-500/10 border-amber-500/20 text-amber-400' 
                        : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                  }`}>
                    {scamIntent}
                  </span>
                </div>

                {/* Context Risk */}
                <div className="flex items-center justify-between py-2 border-b border-navy-850" id="signal-context-risk">
                  <span className="text-slate-400 font-medium font-sans">Contextual Request Risk</span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase border ${
                    contextRisk === 'High' 
                      ? 'bg-rose-500/10 border-rose-500/20 text-rose-400' 
                      : contextRisk === 'Medium' 
                        ? 'bg-amber-500/10 border-amber-500/20 text-amber-400' 
                        : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                  }`}>
                    {contextRisk}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LiveCall;
