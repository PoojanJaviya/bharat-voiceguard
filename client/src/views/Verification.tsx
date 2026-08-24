import React, { useState } from 'react';
import { useDemo } from '../context/DemoContext';
import { CheckCircle2, UserCheck, ShieldAlert, Smartphone, PhoneCall, RefreshCw, ArrowRight } from 'lucide-react';

const Verification: React.FC = () => {
  const { 
    trustedContacts, 
    independentVerifyProgress, 
    triggerIndependentVerification, 
    resetVerificationState 
  } = useDemo();

  const [selectedContactId, setSelectedContactId] = useState('');
  const [customPhone, setCustomPhone] = useState('');
  const [step, setStep] = useState(1); // 1: Input, 2: Loading/Result

  const getSelectedPhone = () => {
    if (selectedContactId === 'custom') return customPhone;
    const contact = trustedContacts.find(c => c.id === selectedContactId);
    return contact ? contact.phone : '';
  };

  const getSelectedName = () => {
    if (selectedContactId === 'custom') return customPhone;
    const contact = trustedContacts.find(c => c.id === selectedContactId);
    return contact ? contact.name : 'Unknown Contact';
  };

  const handleInitiate = async () => {
    const phone = getSelectedPhone();
    if (!phone) return;

    setStep(2);
    await triggerIndependentVerification(phone);
  };

  const handleReset = () => {
    setSelectedContactId('');
    setCustomPhone('');
    resetVerificationState();
    setStep(1);
  };

  return (
    <div className="glass-card rounded-2xl p-5 md:p-6 border border-navy-800 space-y-6">
      {/* Header */}
      <div className="border-b border-navy-800 pb-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-xxs uppercase tracking-widest text-slate-500 font-bold block mb-1">OUT-OF-BAND VALIDATION</span>
          <h2 className="font-display font-extrabold text-lg md:text-xl text-white tracking-tight">Independent Verification Center</h2>
          <p className="text-xs text-slate-400 font-sans mt-0.5 leading-relaxed">
            Verify caller identity out-of-band using saved, trusted communication channels to resolve audio uncertainty.
          </p>
        </div>
        <UserCheck className="h-6 w-6 text-cyan-400 hidden md:block shrink-0" />
      </div>

      {step === 1 ? (
        // Step 1 Form View
        <div className="space-y-4 max-w-xl font-sans text-xs" id="verify-form-step-1">
          <span className="text-xxs uppercase tracking-widest text-slate-500 font-bold block">Step 1: Choose Contact to Verify</span>
          
          {/* Contact Select Dropdown */}
          <div className="space-y-1.5">
            <label className="text-slate-400 font-semibold block">Select Contact Profile</label>
            <select
              id="verify-contact-select"
              value={selectedContactId}
              onChange={(e) => setSelectedContactId(e.target.value)}
              className="w-full bg-navy-950 border border-navy-800 rounded-lg px-3 py-2.5 text-slate-200 outline-none cursor-pointer focus:border-cyan-500/50 font-sans font-medium"
            >
              <option value="">-- Choose contact from directory --</option>
              {trustedContacts.map((c) => (
                <option key={c.id} value={c.id} className="bg-navy-900">
                  {c.name} ({c.relationship})
                </option>
              ))}
              <option value="custom" className="bg-navy-900">Enter Number Manually</option>
            </select>
          </div>

          {/* Custom Phone Number Input */}
          {selectedContactId === 'custom' && (
            <div className="space-y-1.5 animate-in fade-in slide-in-from-top-1 duration-200">
              <label className="text-slate-400 font-semibold block">Manual Phone Number</label>
              <div className="relative flex items-center bg-navy-950 border border-navy-800 rounded-lg px-3 focus-within:border-cyan-500/50">
                <Smartphone className="h-4 w-4 text-slate-600 mr-2 shrink-0" />
                <input
                  id="verify-custom-phone-input"
                  type="tel"
                  placeholder="+91 XXXXX XXXXX"
                  value={customPhone}
                  onChange={(e) => setCustomPhone(e.target.value)}
                  className="w-full bg-transparent py-2.5 text-white placeholder-slate-600 outline-none"
                />
              </div>
            </div>
          )}

          {/* Action Trigger Button */}
          <button
            id="verify-btn-initiate"
            disabled={!selectedContactId || (selectedContactId === 'custom' && !customPhone)}
            onClick={handleInitiate}
            className={`w-full py-3 rounded-lg font-bold text-xs flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-98 mt-2 ${
              (!selectedContactId || (selectedContactId === 'custom' && !customPhone))
                ? 'bg-navy-800 text-slate-500 cursor-not-allowed border border-navy-750'
                : 'bg-cyan-500 hover:bg-cyan-400 text-navy-950 shadow-lg shadow-cyan-500/10'
            }`}
          >
            Initiate Verification Call <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      ) : (
        // Step 2 & 3: Ringing & Verdict Outcome
        <div className="space-y-6 max-w-xl mx-auto py-6 flex flex-col items-center justify-center text-center font-sans text-xs">
          {independentVerifyProgress === 'calling' && (
            <div className="space-y-4" id="verify-ringing-state">
              <div className="relative flex h-16 w-16 items-center justify-center rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 mx-auto">
                <PhoneCall className="h-7 w-7 animate-bounce" />
                <span className="absolute -inset-1 rounded-full border border-cyan-400/40 animate-ping opacity-75"></span>
              </div>
              <div>
                <h4 className="font-display font-bold text-base text-white">Ringing Trusted Communication Channel</h4>
                <p className="text-slate-400 text-xs mt-1">Calling {getSelectedName()} using saved trusted number...</p>
                <div className="flex items-center justify-center gap-1.5 text-slate-500 text-xxs font-mono uppercase font-bold tracking-widest mt-4">
                  <RefreshCw className="h-3 w-3 animate-spin text-cyan-500" /> verification in progress...
                </div>
              </div>
            </div>
          )}

          {independentVerifyProgress === 'success' && (
            <div className="space-y-4 animate-in zoom-in-95 duration-300" id="verify-success-state">
              <div className="h-16 w-16 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
                <CheckCircle2 className="h-8 w-8" />
              </div>
              <div className="space-y-2">
                <h4 className="font-display font-bold text-lg text-emerald-400">Independent Verification Completed</h4>
                <p className="text-slate-300 text-xs max-w-md mx-auto leading-relaxed">
                  Cryptographic voice template matches pre-registered signature for <strong className="text-white">{getSelectedName()}</strong>. 
                  Caller identity confirmed via out-of-band communication channel.
                </p>
              </div>
              <button
                id="verify-success-done"
                onClick={handleReset}
                className="px-6 py-2.5 bg-navy-800 text-slate-200 hover:text-white rounded-lg border border-navy-700 font-semibold cursor-pointer transition-colors active:scale-95"
              >
                Perform Another Verification
              </button>
            </div>
          )}

          {independentVerifyProgress === 'failed' && (
            <div className="space-y-4 animate-in zoom-in-95 duration-300" id="verify-failed-state">
              <div className="h-16 w-16 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center mx-auto">
                <ShieldAlert className="h-8 w-8" />
              </div>
              <div className="space-y-2">
                <h4 className="font-display font-bold text-lg text-rose-400">Unable to Independently Verify</h4>
                <p className="text-slate-300 text-xs max-w-md mx-auto leading-relaxed">
                  No registered trusted voice signature was matched over this connection. 
                  The identity of the caller could not be certified. Maintain precaution.
                </p>
              </div>
              <button
                id="verify-failed-done"
                onClick={handleReset}
                className="px-6 py-2.5 bg-rose-600 hover:bg-rose-500 text-white rounded-lg font-semibold cursor-pointer transition-colors active:scale-95 shadow-md"
              >
                Reset &amp; Retry Verification
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Verification;
