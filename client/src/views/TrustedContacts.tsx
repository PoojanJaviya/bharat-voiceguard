import React, { useState } from 'react';
import { useDemo } from '../context/DemoContext';
import { Users, UserPlus, ShieldCheck, CheckCircle, Volume2, Trash, Smartphone } from 'lucide-react';

const TrustedContacts: React.FC = () => {
  const { trustedContacts, addTrustedContact } = useDemo();
  
  // Add Contact Form State
  const [name, setName] = useState('');
  const [relationship, setRelationship] = useState('Family');
  const [phone, setPhone] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !phone) return;

    setIsSubmitting(true);
    await addTrustedContact({
      name,
      relationship,
      phone,
      trustedStatus: true
    });

    setName('');
    setPhone('');
    setIsSubmitting(false);
    setSuccessMessage('Contact added successfully and identity signature registered.');
    setTimeout(() => setSuccessMessage(''), 4000);
  };

  return (
    <div className="space-y-6">
      {/* Description header */}
      <div className="glass-card rounded-2xl p-5 md:p-6 border border-navy-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-xxs uppercase tracking-widest text-slate-500 font-bold block mb-1">DIRECTORY LOCK</span>
          <h2 className="font-display font-extrabold text-lg md:text-xl text-white tracking-tight">Trusted Contacts Directory</h2>
          <p className="text-xs text-slate-400 font-sans mt-0.5 leading-relaxed">
            Manage your network. Verified voice signatures provide cryptographic trust signals during active calls.
          </p>
        </div>
        <Users className="h-6 w-6 text-cyan-400 hidden md:block shrink-0" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Contacts Directory List */}
        <div className="lg:col-span-2 space-y-4">
          <span className="text-xxs uppercase tracking-widest text-slate-500 font-bold block">Active Directory ({trustedContacts.length})</span>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4" id="contacts-grid">
            {trustedContacts.map((contact) => (
              <div 
                key={contact.id}
                className="glass-card rounded-xl p-4 border border-navy-800 flex flex-col justify-between space-y-4 hover:border-cyan-500/30 transition-colors"
                id={`contact-card-${contact.id}`}
              >
                {/* Contact Header */}
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-display font-bold text-sm text-white truncate max-w-[150px]">{contact.name}</h4>
                    <span className="inline-block px-2 py-0.5 rounded text-[9px] font-extrabold uppercase bg-navy-950 text-slate-400 mt-1 border border-navy-850">
                      {contact.relationship}
                    </span>
                  </div>
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                    <CheckCircle className="h-3 w-3" /> TRUSTED
                  </span>
                </div>

                {/* Phone details */}
                <div className="text-xs font-mono text-slate-400">
                  {contact.phone}
                </div>

                {/* Voice signature registration detail */}
                <div className="flex items-center justify-between border-t border-navy-850 pt-3 text-[10px] text-slate-500 font-semibold font-sans">
                  <span className="flex items-center gap-1"><Volume2 className="h-3.5 w-3.5" /> VOICE SIGNATURE</span>
                  {contact.voiceSignatureRegistered ? (
                    <span className="text-cyan-400 font-bold">Registered</span>
                  ) : (
                    <span className="text-slate-500">Not Uploaded</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Add Contact Form */}
        <div className="space-y-4">
          <span className="text-xxs uppercase tracking-widest text-slate-500 font-bold block">Add Trusted Contact</span>
          <div className="glass-card rounded-2xl p-5 border border-navy-800" id="add-contact-card">
            <h4 className="font-display font-bold text-sm text-white flex items-center gap-1.5 border-b border-navy-800 pb-3 mb-4">
              <UserPlus className="h-4.5 w-4.5 text-cyan-400" /> New Contact Profile
            </h4>

            {successMessage && (
              <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs font-medium mb-4 animate-pulse">
                {successMessage}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4 text-xs font-sans">
              {/* Name Input */}
              <div className="space-y-1.5">
                <label className="text-slate-400 font-semibold block">Full Name</label>
                <input 
                  id="add-contact-name"
                  type="text" 
                  required
                  placeholder="e.g. Ketan Mehta" 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-navy-950 border border-navy-800 rounded-lg px-3 py-2 text-white placeholder-slate-600 outline-none focus:border-cyan-500/50"
                />
              </div>

              {/* Relationship Input */}
              <div className="space-y-1.5">
                <label className="text-slate-400 font-semibold block">Relationship type</label>
                <select 
                  id="add-contact-relationship"
                  value={relationship}
                  onChange={(e) => setRelationship(e.target.value)}
                  className="w-full bg-navy-950 border border-navy-800 rounded-lg px-3 py-2 text-slate-300 outline-none cursor-pointer focus:border-cyan-500/50"
                >
                  <option value="Family">Family Member</option>
                  <option value="Friend">Friend</option>
                  <option value="Bank Contact">Bank Officer / Corporate</option>
                  <option value="Work">Colleague / Work</option>
                  <option value="Emergency">Emergency Helpline</option>
                </select>
              </div>

              {/* Phone Input */}
              <div className="space-y-1.5">
                <label className="text-slate-400 font-semibold block">Mobile Number</label>
                <div className="relative flex items-center bg-navy-950 border border-navy-800 rounded-lg px-3 focus-within:border-cyan-500/50">
                  <Smartphone className="h-4 w-4 text-slate-600 mr-2" />
                  <input 
                    id="add-contact-phone"
                    type="tel" 
                    required
                    placeholder="+91 XXXXX XXXXX" 
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full bg-transparent py-2 text-white placeholder-slate-600 outline-none"
                  />
                </div>
              </div>

              {/* Simulated Voice Signature Registration Box */}
              <div className="p-3 bg-navy-950 rounded-xl border border-navy-800 flex justify-between items-center">
                <div>
                  <span className="font-semibold text-slate-300 block mb-0.5">Register Voice Signature</span>
                  <span className="text-[10px] text-slate-500 leading-none">Simulate voice signature upload</span>
                </div>
                <input 
                  type="checkbox" 
                  defaultChecked
                  disabled
                  className="h-4.5 w-4.5 rounded border-navy-800 text-cyan-500 focus:ring-transparent accent-cyan-500 shrink-0" 
                />
              </div>

              <button 
                id="add-contact-submit"
                type="submit"
                disabled={isSubmitting}
                className="w-full py-2.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-navy-950 font-bold cursor-pointer transition-all active:scale-98"
              >
                {isSubmitting ? 'Registering...' : 'Register Contact Profile'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TrustedContacts;
