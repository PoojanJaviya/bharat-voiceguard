import React, { useState } from 'react';
import { useDemo } from '../context/DemoContext';
import { Play, Square, Cpu, BookOpen, ChevronUp, ChevronDown } from 'lucide-react';

const DemoControlPanel: React.FC = () => {
  const { 
    scenarios, 
    currentScenario, 
    selectScenario, 
    callState, 
    startCall, 
    endCall,
    callDuration,
    
    // Live properties
    liveMode,
    setLiveMode,
    clientRole,
    setClientRole,
    clientId,
    signalingClients,
    connectLiveCall
  } = useDemo();

  const [minimized, setMinimized] = useState(false);
  const [selectedTarget, setSelectedTarget] = useState<string>('');

  const targetUsers = signalingClients.filter(c => c.startsWith('user-'));

  const handleCall = () => {
    if (selectedTarget) {
      connectLiveCall(selectedTarget);
    }
  };

  return (
    <div 
      id="demo-control-panel"
      className={`fixed bottom-0 md:bottom-4 right-0 left-0 md:right-4 md:left-auto md:w-[480px] bg-navy-900 border-t md:border border-navy-700/80 md:rounded-2xl shadow-2xl transition-all duration-300 z-40 ${
        minimized ? 'h-11 overflow-hidden' : 'h-auto max-h-[420px] md:max-h-[500px] overflow-y-auto'
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
        {/* Mode Selector Tabs */}
        <div className="flex bg-navy-950 p-1 rounded-lg border border-navy-800/60 text-xs">
          <button
            onClick={() => { setLiveMode(false); endCall(); }}
            className={`flex-1 py-1.5 rounded-md font-semibold transition-all cursor-pointer ${
              !liveMode 
                ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20' 
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Simulated Presentation
          </button>
          <button
            onClick={() => { setLiveMode(true); endCall(); }}
            className={`flex-1 py-1.5 rounded-md font-semibold transition-all cursor-pointer ${
              liveMode 
                ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20' 
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Live WebRTC Call
          </button>
        </div>

        {!liveMode ? (
          /* SIMULATION MODE */
          <>
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
          </>
        ) : (
          /* LIVE WEBRTC MODE */
          <div className="space-y-4 text-xs font-sans">
            {!clientRole ? (
              <div className="p-4 rounded-xl bg-navy-950/80 border border-navy-800/80 text-center space-y-4">
                <p className="text-slate-300 font-medium">To run the live caller demo, select the role for this device:</p>
                <div className="flex gap-3 justify-center">
                  <button
                    onClick={() => setClientRole('scammer')}
                    className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-lg font-semibold shadow-md cursor-pointer transition-all"
                  >
                    Act as Scammer
                  </button>
                  <button
                    onClick={() => setClientRole('user')}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-semibold shadow-md cursor-pointer transition-all"
                  >
                    Act as Target User
                  </button>
                </div>
                <p className="text-[10px] text-slate-500">Note: One phone must be Scammer and one must be Target User. They will call each other in real-time over Wi-Fi!</p>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex justify-between items-center p-3 rounded-lg bg-navy-950 border border-navy-850">
                  <div>
                    <span className="text-xxs uppercase tracking-wider text-slate-500 block">DEVICE ROLE</span>
                    <strong className={`font-semibold uppercase ${clientRole === 'scammer' ? 'text-rose-400' : 'text-emerald-400'}`}>
                      {clientRole === 'scammer' ? 'Scammer (Audio Sender)' : 'Target User (AI Monitor)'}
                    </strong>
                  </div>
                  <button
                    onClick={() => { setClientRole(null); endCall(); }}
                    className="px-2.5 py-1 rounded bg-navy-800 hover:bg-navy-750 text-[10px] text-slate-400 border border-navy-700 cursor-pointer"
                  >
                    Change Role
                  </button>
                </div>

                {clientRole === 'scammer' ? (
                  <div className="p-4 rounded-xl bg-navy-950/60 border border-navy-850 space-y-4">
                    <span className="text-xxs uppercase tracking-wider text-slate-400 font-bold block">Call Target Device</span>
                    {callState === 'idle' || callState === 'ended' ? (
                      <>
                        <div>
                          <label className="text-[10px] text-slate-500 font-semibold block mb-1">Select Target User from Network:</label>
                          {targetUsers.length === 0 ? (
                            <div className="p-3 text-center bg-navy-900 border border-navy-800 rounded-lg text-slate-400 font-medium animate-pulse">
                              Waiting for Target User to connect...
                            </div>
                          ) : (
                            <select
                              value={selectedTarget}
                              onChange={(e) => setSelectedTarget(e.target.value)}
                              className="w-full p-2.5 rounded-lg bg-navy-900 border border-navy-750 text-slate-200 outline-none focus:border-cyan-400"
                            >
                              <option value="">-- Choose Target User --</option>
                              {targetUsers.map(u => (
                                <option key={u} value={u}>{u.replace('user-', '')}</option>
                              ))}
                            </select>
                          )}
                        </div>
                        <button
                          onClick={handleCall}
                          disabled={!selectedTarget}
                          className={`w-full py-2.5 rounded-lg font-bold text-white text-xs shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                            selectedTarget 
                              ? 'bg-cyan-500 hover:bg-cyan-400 text-navy-950 font-extrabold shadow-cyan-500/25' 
                              : 'bg-navy-800 text-slate-500 border border-navy-700 cursor-not-allowed'
                          }`}
                        >
                          <Play className="h-3.5 w-3.5 fill-current" /> Call Selected Target
                        </button>
                      </>
                    ) : (
                      <div className="space-y-3">
                        <div className="p-3 bg-rose-950/20 border border-rose-500/20 text-rose-400 rounded-lg font-semibold flex items-center justify-between">
                          <span>Calling User...</span>
                          <span className="h-2 w-2 rounded-full bg-rose-500 animate-ping"></span>
                        </div>
                        <button
                          onClick={endCall}
                          className="w-full py-2.5 bg-rose-600 hover:bg-rose-500 text-white rounded-lg font-semibold cursor-pointer transition-all shadow-md"
                        >
                          Hang Up Call
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  /* TARGET USER VIEW */
                  <div className="p-4 rounded-xl bg-navy-950/60 border border-navy-850 text-center space-y-4">
                    <span className="text-xxs uppercase tracking-wider text-slate-400 font-bold block text-left">Target Receiver Standby</span>
                    {callState === 'idle' || callState === 'ended' ? (
                      <div className="py-6 flex flex-col items-center justify-center space-y-3">
                        <div className="h-10 w-10 rounded-full border-2 border-slate-700 border-t-cyan-400 animate-spin flex items-center justify-center">
                          <Cpu className="h-4.5 w-4.5 text-cyan-400 animate-pulse" />
                        </div>
                        <div>
                          <p className="text-slate-300 font-semibold">Your ID: <span className="font-mono text-cyan-400">{clientId}</span></p>
                          <p className="text-[10px] text-slate-500 mt-1">Ready for incoming call from Scammer device. Do not lock screen.</p>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div className="p-3 bg-emerald-950/20 border border-emerald-500/20 text-emerald-400 rounded-lg font-semibold flex items-center justify-between">
                          <span>Connected to Scammer!</span>
                          <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping"></span>
                        </div>
                        <p className="text-[10px] text-slate-450">Audio received from scammer is currently being fed to ML Pipeline. Check the main screen for risk metrics!</p>
                        <button
                          onClick={endCall}
                          className="w-full py-2.5 bg-rose-600 hover:bg-rose-500 text-white rounded-lg font-semibold cursor-pointer transition-all shadow-md"
                        >
                          End & Terminate Call
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default DemoControlPanel;
