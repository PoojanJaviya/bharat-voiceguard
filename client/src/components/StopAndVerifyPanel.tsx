import React, { useState } from 'react';
import { useDemo } from '../context/DemoContext';
import { ShieldAlert, AlertOctagon, HelpCircle, CheckSquare, Square } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const StopAndVerifyPanel: React.FC = () => {
  const navigate = useNavigate();
  const { callState, riskLevel } = useDemo();
  
  // Local state for checking items
  const [checkedItems, setCheckedItems] = useState<Record<number, boolean>>({
    0: false,
    1: false,
    2: false,
    3: false,
    4: false
  });

  const toggleCheck = (idx: number) => {
    setCheckedItems(prev => ({
      ...prev,
      [idx]: !prev[idx]
    }));
  };

  if (callState === 'idle' || callState === 'ended' || riskLevel === 'LOW RISK') {
    return null;
  }

  const isHigh = riskLevel === 'HIGH RISK';

  const checklist = [
    { text: 'Pause the conversation. Do not respond to threats or artificial urgency.', icon: '⏸️' },
    { text: 'Do NOT share OTP, UPI PIN, bank credentials, password, or Aadhaar details.', icon: '🔒' },
    { text: 'Contact the caller via a saved, trusted number from your directory.', icon: '📞' },
    { text: 'Independently verify their claims. Do not trust their callback numbers.', icon: '🔍' },
    { text: 'Only resume sharing details when you have confirmed caller identity.', icon: '✅' }
  ];

  return (
    <div 
      id="stop-and-verify-checklist"
      className={`rounded-2xl p-5 border relative overflow-hidden transition-all duration-300 ${
        isHigh 
          ? 'bg-rose-500/10 border-rose-500/30 text-rose-100' 
          : 'bg-amber-500/10 border-amber-500/30 text-amber-100'
      }`}
    >
      {/* Background icon glow */}
      <div className="absolute right-4 bottom-2 text-slate-500/5 select-none shrink-0 pointer-events-none">
        {isHigh ? <AlertOctagon className="h-40 w-40" /> : <ShieldAlert className="h-40 w-40" />}
      </div>

      <div className="relative z-10 space-y-4">
        {/* Header Title */}
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg ${isHigh ? 'bg-rose-500/20 text-rose-400' : 'bg-amber-500/20 text-amber-400'}`}>
            {isHigh ? <AlertOctagon className="h-6 w-6 animate-pulse" /> : <ShieldAlert className="h-6 w-6 animate-pulse" />}
          </div>
          <div>
            <h3 className="font-display font-black text-lg md:text-xl tracking-wide uppercase">
              STOP &amp; VERIFY
            </h3>
            <p className="text-xs text-slate-400 font-sans mt-0.5">
              Follow these safety steps before sharing sensitive information
            </p>
          </div>
        </div>

        {/* Informational Message */}
        <div className="p-3 rounded-lg bg-navy-950/60 border border-navy-800/80 text-xs font-sans text-slate-300 leading-relaxed">
          <strong>Critical Risk:</strong> The caller is requesting credentials or funds. AI Engine recommends out-of-band verification.
        </div>

        {/* Checklist Rows */}
        <div className="space-y-2">
          {checklist.map((item, idx) => {
            const isChecked = checkedItems[idx];
            return (
              <div 
                key={idx}
                onClick={() => toggleCheck(idx)}
                className={`flex items-start gap-3 p-3 rounded-xl cursor-pointer transition-all border ${
                  isChecked 
                    ? 'bg-navy-950/40 border-cyan-500/20 text-slate-300' 
                    : 'bg-navy-900/60 border-navy-800 text-slate-200 hover:border-navy-700'
                }`}
                id={`checklist-item-${idx}`}
              >
                <button className="shrink-0 mt-0.5 text-cyan-400 transition-colors">
                  {isChecked ? (
                    <CheckSquare className="h-4.5 w-4.5 text-cyan-400 fill-cyan-400/10" />
                  ) : (
                    <Square className="h-4.5 w-4.5 text-slate-500" />
                  )}
                </button>
                <div className="flex items-start gap-2 text-xs leading-relaxed font-medium">
                  <span className="shrink-0">{item.icon}</span>
                  <span className={isChecked ? 'line-through text-slate-500' : ''}>{item.text}</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Out of Band Action Button */}
        <div className="pt-2 flex justify-between items-center gap-4">
          <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest font-mono">
            Security Status: Action Required
          </span>
          <button 
            id="checklist-btn-directory-verify"
            onClick={() => navigate('/verification')}
            className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold cursor-pointer transition-all shadow-md active:scale-95 ${
              isHigh 
                ? 'bg-rose-500 hover:bg-rose-400 text-white' 
                : 'bg-amber-500 hover:bg-amber-400 text-navy-950'
            }`}
          >
            <HelpCircle className="h-4 w-4" /> Trigger Direct Verification
          </button>
        </div>
      </div>
    </div>
  );
};

export default StopAndVerifyPanel;
