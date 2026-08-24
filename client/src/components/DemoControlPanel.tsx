import React, { useState } from 'react';
import { useDemo } from '../context/DemoContext';
import { Play, Square, RefreshCw, Cpu, BookOpen, ChevronUp, ChevronDown } from 'lucide-react';

const DemoControlPanel: React.FC = () => {
  const { 
    scenarios, 
    currentScenario, 
    selectScenario, 
    callState, 
    startCall, 
    endCall,
    callDuration
  } = useDemo();

  const [minimized, setMinimized] = useState(false);

  return (
    <div 
      id="demo-control-panel"
      className={`fixed bottom-0 md:bottom-4 right-0 left-0 md:right-4 md:left-auto md:w-[480px] bg-navy-900 border-t md:border border-navy-700/80 md:rounded-2xl shadow-2xl transition-all duration-300 z-40 ${
        minimized ? 'h-11 overflow-hidden' : 'h-auto max-h-[380px] md:max-h-[460px] overflow-y-auto'
      }`}
    >
      {/* Header */}
      <div 
        onClick={() => setMinimized(!minimized)}
        className="h-11 px-4 bg-navy-800/80 flex items-center justify-between cursor-pointer border-b border-navy-700 select-none"
      >
        <span className="font-display font-bold text-xs uppercase tracking-wider text-cyan-400 flex items-center gap-1.5">
          <Cpu className="h-4 w-4 animate-spin-slow" /> SIH 2026 Presentation Controller
        </span>
        <div className="flex items-center gap-2">
          {callState === 'active' && (
            <span className="h-2 w-2 rounded-full bg-rose-500 animate-ping"></span>
          )}
          {minimized ? <ChevronUp className="h-4 w-4 text-slate-400" /> : <ChevronDown className="h-4 w-4 text-slate-400" />}
        </div>
      </div>

      {/* Body */}
      <div className="p-4 space-y-4">
        {/* Scenarios List */}
        <div>
          <span className="text-xxs uppercase tracking-widest text-slate-400 font-bold block mb-2">Select Presentation Scenario</span>
          <div className="grid grid-cols-2 gap-2" id="scenario-selector-grid">
            {scenarios.map((scene) => {
              const isSelected = currentScenario.id === scene.id;
              return (
                <button
                  id={`scenario-btn-${scene.id}`}
                  key={scene.id}
                  onClick={() => selectScenario(scene.id)}
                  disabled={callState === 'active' || callState === 'calling'}
                  className={`text-left p-2.5 rounded-lg border transition-all text-xs cursor-pointer ${
                    isSelected 
                      ? 'bg-cyan-500/10 border-cyan-400 text-cyan-200 shadow-md font-semibold' 
                      : 'bg-navy-950/60 border-navy-800 text-slate-400 hover:border-navy-700 hover:text-slate-200'
                  } ${(callState === 'active' || callState === 'calling') ? 'opacity-40 cursor-not-allowed' : ''}`}
                >
                  <div className="font-semibold mb-0.5 truncate">{scene.id}. {scene.name.split(' + ')[0]}</div>
                  <div className="text-[10px] text-slate-500 line-clamp-1">{scene.language}</div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Selected Scenario Briefing */}
        <div className="p-3 rounded-lg bg-navy-950/80 border border-navy-800/80 text-xs">
          <div className="flex items-center gap-1.5 mb-1.5 text-cyan-400 font-semibold">
            <BookOpen className="h-3.5 w-3.5" />
            <span>Scenario Briefing</span>
          </div>
          <p className="text-slate-400 leading-relaxed font-sans">{currentScenario.description}</p>
          <div className="mt-2 flex gap-4 text-[10px] text-slate-500">
            <span>Caller: <strong className="text-slate-300 font-semibold">{currentScenario.caller}</strong></span>
            <span>Target Risk: <strong className={`font-semibold ${
              currentScenario.riskLevel === 'HIGH RISK' ? 'text-rose-400' : 'text-amber-400'
            }`}>{currentScenario.riskLevel}</strong></span>
          </div>
        </div>

        {/* Simulator Controls */}
        <div className="flex items-center gap-3 pt-1">
          {callState === 'idle' || callState === 'ended' ? (
            <button
              id="start-demo-call"
              onClick={startCall}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-semibold text-xs cursor-pointer transition-all shadow-lg shadow-cyan-500/10 active:scale-98"
            >
              <Play className="h-3.5 w-3.5 fill-white" /> Start Simulated Call
            </button>
          ) : (
            <button
              id="stop-demo-call"
              onClick={endCall}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-semibold text-xs cursor-pointer transition-all active:scale-98"
            >
              <Square className="h-3.5 w-3.5 fill-white" /> Stop & Terminate Call
            </button>
          )}

          {callState === 'active' && (
            <div className="px-3 py-2 bg-navy-950 border border-navy-800 rounded-lg text-xs font-semibold text-cyan-400 font-mono">
              {Math.floor(callDuration / 60).toString().padStart(2, '0')}:{(callDuration % 60).toString().padStart(2, '0')}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DemoControlPanel;
