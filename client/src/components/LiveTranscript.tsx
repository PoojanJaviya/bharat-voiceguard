import React, { useEffect, useRef } from 'react';
import { useDemo } from '../context/DemoContext';
import { MessageSquare, MessageCircle, Sparkles } from 'lucide-react';

const LiveTranscript: React.FC = () => {
  const { callState, transcriptLines, isAnalyzing } = useDemo();
  const transcriptEndRef = useRef<HTMLDivElement | null>(null);

  // Auto scroll to bottom when transcript updates
  useEffect(() => {
    transcriptEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [transcriptLines]);

  // Keyword highlighting engine
  const highlightSuspiciousWords = (text: string) => {
    const suspiciousKeywords = [
      /\botp\b/gi,
      /\bverification\b/gi,
      /\bverify\b/gi,
      /\bblock\b/gi,
      /\bblocked\b/gi,
      /\burgently\b/gi,
      /\burgent\b/gi,
      /\bhospital\b/gi,
      /\bgpay\b/gi,
      /\btransfer\b/gi,
      /\bmoney\b/gi,
      /\baadhar\b/gi,
      /\bkyc\b/gi,
      /\bcredit card\b/gi,
      /\bdebit card\b/gi,
      /\bvalidation\b/gi,
      /\bsecurity token\b/gi,
      /\bpan card\b/gi,
      /\baccount block\b/gi,
      /\bblocked today\b/gi,
      /rupees/gi,
      /૧૫,૦૦૦/gi,
      /તાત્કાલિક/gi,
      /ઓટીપી/gi,
      /બ્લોક/gi,
      /કેવાયસી/gi,
      /આધાર/gi,
      /રૂપિયા/gi,
      /ओटीपी/gi,
      /ब्लॉक/gi,
      /केवाईसी/gi,
      /आधार/gi,
      /रुपए/gi,
      /अस्पताल/gi,
      /इमरजेंसी/gi
    ];

    let highlightedText = text;
    
    // Sort keywords by length descending to prevent nesting overlaps
    const matches: { start: number; end: number; word: string }[] = [];
    
    suspiciousKeywords.forEach((regex) => {
      let match;
      while ((match = regex.exec(text)) !== null) {
        matches.push({
          start: match.index,
          end: match.index + match[0].length,
          word: match[0]
        });
      }
    });

    // Resolve overlaps by filtering
    const sortedMatches = matches.sort((a, b) => a.start - b.start);
    const nonOverlapping: typeof sortedMatches = [];
    let lastEnd = 0;
    
    sortedMatches.forEach((m) => {
      if (m.start >= lastEnd) {
        nonOverlapping.push(m);
        lastEnd = m.end;
      }
    });

    // Reconstruct string with span styling
    if (nonOverlapping.length === 0) return text;

    const parts: React.ReactNode[] = [];
    let currentIdx = 0;

    nonOverlapping.forEach((m, idx) => {
      // Add text before match
      if (m.start > currentIdx) {
        parts.push(text.substring(currentIdx, m.start));
      }
      // Add highlighted tag
      parts.push(
        <span 
          key={`highlight-${idx}`} 
          className="px-1 py-0.5 rounded bg-rose-500/20 text-rose-300 font-bold border border-rose-500/30 animate-pulse inline-block"
        >
          {text.substring(m.start, m.end)}
        </span>
      );
      currentIdx = m.end;
    });

    // Add trailing text
    if (currentIdx < text.length) {
      parts.push(text.substring(currentIdx));
    }

    return parts;
  };

  return (
    <div 
      id="live-transcript-panel"
      className="glass-card rounded-2xl p-5 border border-navy-800 flex flex-col h-[280px] md:h-[320px] overflow-hidden"
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-navy-800 pb-3 mb-3 shrink-0">
        <span className="font-semibold text-xs tracking-wider text-slate-400 flex items-center gap-1.5 uppercase">
          <MessageSquare className="h-4 w-4 text-cyan-400" /> Real-time Call Transcript
        </span>
        {callState === 'active' && isAnalyzing && (
          <span className="inline-flex items-center gap-1.5 text-[10px] font-bold text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded-full border border-cyan-500/20">
            <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 animate-ping"></span>
            AI ASR: Streaming...
          </span>
        )}
      </div>

      {/* Transcript Scroll Area */}
      <div className="flex-1 overflow-y-auto space-y-4 pr-1 scrollbar-thin">
        {callState === 'idle' || callState === 'ended' ? (
          <div className="h-full flex flex-col items-center justify-center text-slate-500 text-xs py-10 font-sans">
            <MessageCircle className="h-8 w-8 text-slate-600 mb-2" />
            No conversation transcript. Waiting for active call...
          </div>
        ) : transcriptLines.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-slate-500 text-xs py-10 font-sans">
            <Sparkles className="h-5 w-5 text-cyan-500 animate-pulse mb-2" />
            Call connected. Waiting for speech detection...
          </div>
        ) : (
          transcriptLines.map((line, idx) => {
            const isCaller = line.speaker === 'Caller';
            return (
              <div 
                key={idx}
                className={`flex flex-col max-w-[80%] ${isCaller ? 'self-start items-start' : 'self-end items-end ml-auto'}`}
              >
                {/* Speaker indicator & timestamp */}
                <div className="flex items-center gap-1.5 text-[10px] text-slate-500 font-bold mb-1 font-sans">
                  <span>{isCaller ? 'CALLER' : 'YOU'}</span>
                  <span>•</span>
                  <span>{line.time}</span>
                </div>

                {/* Speech bubbles */}
                <div 
                  className={`p-3.5 rounded-2xl text-xs leading-relaxed font-sans ${
                    isCaller 
                      ? 'bg-navy-950 text-slate-200 rounded-tl-none border border-navy-800' 
                      : 'bg-cyan-500/10 text-cyan-100 rounded-tr-none border border-cyan-500/20'
                  }`}
                >
                  {highlightSuspiciousWords(line.text)}
                </div>

                {/* Semantic Tags */}
                {line.tags && line.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-1.5">
                    {line.tags.map((tag) => (
                      <span 
                        key={tag}
                        className="text-[9px] font-extrabold px-1.5 py-0.5 rounded bg-rose-500/15 text-rose-400 border border-rose-500/20 uppercase tracking-widest"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            );
          })
        )}
        <div ref={transcriptEndRef} />
      </div>
    </div>
  );
};

export default LiveTranscript;
