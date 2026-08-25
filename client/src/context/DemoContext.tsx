import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { mockApi, CallDetailModel, TrustedContact, SystemAlert } from '../services/mockApi';

export type Language = 'en' | 'hi' | 'guj' | 'auto';

export interface ScenarioDefinition {
  id: number;
  name: string;
  description: string;
  caller: string;
  number: string;
  initialScore: number;
  maxScore: number;
  language: string;
  riskLevel: 'LOW RISK' | 'VERIFY' | 'HIGH RISK';
  riskReasons: string[];
  explanation: string;
  attackSignals: string[];
  recommendedActions: string[];
  voiceAuthenticity: string;
  speakerConsistency: string;
  replayScore: string;
  scamIntent: 'Low' | 'Medium' | 'High' | 'Critical';
  contextRisk: 'Low' | 'Medium' | 'High';
  timeline: {
    time: number;
    speaker: 'Caller' | 'User';
    text: { en: string; hi: string; guj: string };
    tags?: string[];
    updateRiskScore?: number;
    updateRiskLevel?: 'LOW RISK' | 'VERIFY' | 'HIGH RISK';
    updateVoiceAuthenticity?: string;
    updateSpeakerConsistency?: string;
    updateReplayScore?: string;
    updateScamIntent?: 'Low' | 'Medium' | 'High' | 'Critical';
    updateContextRisk?: 'Low' | 'Medium' | 'High';
  }[];
}

const scenarios: ScenarioDefinition[] = [
  {
    id: 1,
    name: 'AI Voice Impersonation + Money Request',
    description: 'Suspicious cloned voice matching a relative requesting urgent funds transfer.',
    caller: 'Aarav Vora (Impersonator)',
    number: '+91 98765 43210',
    initialScore: 30,
    maxScore: 94,
    language: 'Hindi + English',
    riskLevel: 'HIGH RISK',
    explanation: 'Extremely high synthetic speech confidence (96%) and a low speaker match score (12%) indicate the voice is cloned. Caller is requesting an urgent fund transfer.',
    riskReasons: [
      'Voice authenticity is suspicious (96% synthetic)',
      'Speaker mismatch (Voice signature does not match Aarav Vora)',
      'Linguistic indicators show high urgency and emergency money request'
    ],
    recommendedActions: [
      'Stop the call immediately',
      'Contact Aarav directly using a trusted pre-saved number',
      'Report the number to BharatVoiceGuard Security Operations'
    ],
    attackSignals: ['AI Voice / Synthetic Speech', 'Voice Impersonation', 'Payment Scam', 'Urgency / Social Engineering'],
    voiceAuthenticity: '15% likely synthetic',
    speakerConsistency: 'Moderate match (58%)',
    replayScore: '10% probability',
    scamIntent: 'Low',
    contextRisk: 'Medium',
    timeline: [
      {
        time: 2,
        speaker: 'Caller',
        text: {
          en: 'Papa, I am Aarav speaking. My phone is lost and I need to make an emergency payment.',
          hi: 'Papa, main Aarav bol raha hoon. Mera phone kho gaya hai aur mujhe emergency payment karni hai.',
          guj: 'પપ્પા, હું આરવ બોલું છું. મારો ફોન ખોવાઈ ગયો છે અને મારે તાત્કાલિક પેમેન્ટ કરવાનું છે.'
        },
        tags: ['IMPERSONATION', 'URGENCY'],
        updateRiskScore: 65,
        updateRiskLevel: 'VERIFY',
        updateVoiceAuthenticity: '62% likely synthetic',
        updateSpeakerConsistency: 'Low match (28%)',
        updateScamIntent: 'High'
      },
      {
        time: 8,
        speaker: 'User',
        text: {
          en: 'Aarav? Your voice sounds a bit different, is everything alright?',
          hi: 'Aarav? Teri aawaz thodi alag lag rahi hai, sab theek hai na?',
          guj: 'આરવ? તારો અવાજ થોડો અલગ લાગે છે, બધું બરાબર છે ને?'
        }
      },
      {
        time: 14,
        speaker: 'Caller',
        text: {
          en: 'Yes, it is a network issue. Please urgently GPAY 15,000 rupees to this number to pay hospital bills.',
          hi: 'Haan woh network issue hai. Please urgently 15,000 rupees is number pe gpay kar do, hospital bills pay karne hain.',
          guj: 'હા એ નેટવર્ક પ્રોબ્લેમ છે. પ્લીઝ તાત્કાલિક ૧૫,૦૦૦ રૂપિયા આ નંબર પર જીપે કરી દો, હોસ્પિટલ બિલ ભરવાના છે.'
        },
        tags: ['URGENCY', 'MONEY REQUEST'],
        updateRiskScore: 94,
        updateRiskLevel: 'HIGH RISK',
        updateVoiceAuthenticity: '96% likely synthetic',
        updateSpeakerConsistency: 'Critical Mismatch (12% match)',
        updateScamIntent: 'Critical',
        updateContextRisk: 'High'
      },
      {
        time: 20,
        speaker: 'User',
        text: {
          en: 'Wait, which hospital? Let me verify first.',
          hi: 'Ruko, kaunsa hospital? Mujhe verify karne do pehle.',
          guj: 'ઊભો રહે, કઈ હોસ્પિટલ? મને પહેલા વેરિફાય કરવા દે.'
        }
      }
    ]
  },
  {
    id: 2,
    name: 'Human Scammer + OTP Request',
    description: 'Impersonator claiming to represent HDFC bank demanding a verification code.',
    caller: 'HDFC Security Officer (Unknown)',
    number: '+91 90112 23344',
    initialScore: 20,
    maxScore: 78,
    language: 'Hindi',
    riskLevel: 'HIGH RISK',
    explanation: 'Although the voice is classified as natural (human), the conversation metadata matches a bank-impersonation KYC scan. Urgent demand for OTP code detected.',
    riskReasons: [
      'Caller requested security OTP code',
      'Urgency/Account suspension threats detected',
      'Official bank impersonation profile matched'
    ],
    recommendedActions: [
      'DO NOT share the OTP or any verification codes',
      'Pause and hang up the call',
      'Call HDFC Bank directly on their official trusted helpline (+91 22 6160 6161)'
    ],
    attackSignals: ['OTP Scam', 'KYC Scam', 'Authority Impersonation', 'Urgency / Social Engineering'],
    voiceAuthenticity: '4% likely synthetic',
    speakerConsistency: 'Unknown signature',
    replayScore: '12% probability',
    scamIntent: 'Low',
    contextRisk: 'Low',
    timeline: [
      {
        time: 3,
        speaker: 'Caller',
        text: {
          en: 'Namaste, I am calling from HDFC head office. Your credit card is showing a pending KYC update.',
          hi: 'Namaste sir, main HDFC head office se baat kar raha hoon. Aapka credit card KYC update pending hai.',
          guj: 'નમસ્તે સર, હું HDFC હેડ ઓફિસથી વાત કરું છું. તમારા ક્રેડિટ કાર્ડનું કેવાયસી અપડેટ બાકી છે.'
        },
        tags: ['BANK IMPERSONATION'],
        updateRiskScore: 48,
        updateRiskLevel: 'VERIFY',
        updateScamIntent: 'Medium',
        updateContextRisk: 'Medium'
      },
      {
        time: 9,
        speaker: 'User',
        text: {
          en: 'I did my KYC online last week. Why is it pending again?',
          hi: 'Mera KYC toh online ho gaya tha pichle hafte. Phir se kyu chahiye?',
          guj: 'મારું કેવાયસી તો ગયા અઠવાડિયે ઓનલાઈન થઈ ગયું હતું. ફરીથી કેમ જોઈએ છે?'
        }
      },
      {
        time: 15,
        speaker: 'Caller',
        text: {
          en: 'Sir, it was rejected at processing. If you do not verify now, your card will be permanently blocked today.',
          hi: 'Sir processing mein reject ho gaya tha. Agar abhi verify nahi karenge toh card permanently block ho jayega.',
          guj: 'સર, પ્રોસેસિંગમાં રિજેક્ટ થઈ ગયું હતું. જો તમે અત્યારે વેરિફાય નહીં કરો તો કાર્ડ આજે જ કાયમ માટે બ્લોક થઈ જશે.'
        },
        tags: ['URGENCY', 'KYC REQUEST'],
        updateRiskScore: 68,
        updateRiskLevel: 'VERIFY',
        updateScamIntent: 'High',
        updateContextRisk: 'High'
      },
      {
        time: 21,
        speaker: 'Caller',
        text: {
          en: 'I have sent a security token OTP to your phone. Tell me the OTP to complete verification.',
          hi: 'Maine aapke phone pe security token OTP bheja hai. Verification poori karne ke liye OTP batayein.',
          guj: 'મેં તમારા ફોન પર સિક્યોરિટી ટોકન ઓટીપી મોકલ્યો છે. વેરિફિકેશન પૂરું કરવા માટે ઓટીપી જણાવો.'
        },
        tags: ['OTP REQUEST', 'URGENCY'],
        updateRiskScore: 78,
        updateRiskLevel: 'HIGH RISK',
        updateScamIntent: 'Critical'
      }
    ]
  },
  {
    id: 3,
    name: 'Genuine Urgent Call',
    description: 'Priya Shah requesting emergency payment, voice matches trusted database profile.',
    caller: 'Priya Shah',
    number: '+91 91234 56789',
    initialScore: 10,
    maxScore: 38,
    language: 'English',
    riskLevel: 'VERIFY',
    explanation: 'Linguistic content contains urgent payment requests which triggers an automatic verification alert. However, voice authentication indicates natural human speech and closely matches Priya\'s pre-registered voice signature.',
    riskReasons: [
      'Linguistic scanning detected urgent payment request',
      'Speaker identity matched trusted contact (Priya Shah, 96% confidence)'
    ],
    recommendedActions: [
      'Verify details before completing the payment',
      'Confirm directly by calling her back on her saved trusted number'
    ],
    attackSignals: ['Payment Request', 'Urgency'],
    voiceAuthenticity: '3% likely synthetic',
    speakerConsistency: '96% match (Priya Shah)',
    replayScore: '4% probability',
    scamIntent: 'Low',
    contextRisk: 'Low',
    timeline: [
      {
        time: 2,
        speaker: 'Caller',
        text: {
          en: 'Hi Shrey, sorry to bother you, but can you please transfer 2,000 rupees to the milkman? I am outside and my UPI pin is not working.',
          hi: 'Hi Shrey, sorry to bother you, par kya tum please milkman ko 2,000 rupees transfer kar sakte ho? Main bahar hoon aur mera UPI pin kaam nahi kar raha.',
          guj: 'હાય શ્રેય, તકલીફ આપવા બદલ સોરી, પણ શું તું દૂધવાળાને ૨,૦૦૦ રૂપિયા ટ્રાન્સફર કરી શકે? હું બહાર છું અને મારો યુપીઆઈ પિન કામ નથી કરતો.'
        },
        tags: ['MONEY REQUEST', 'URGENCY'],
        updateRiskScore: 38,
        updateRiskLevel: 'VERIFY',
        updateScamIntent: 'Medium',
        updateContextRisk: 'Medium'
      },
      {
        time: 8,
        speaker: 'User',
        text: {
          en: 'Wait Priya, is that really you? Let me check.',
          hi: 'Ek second Priya, tum hi bol rahi ho na? Mujhe dekhne do.',
          guj: 'એક સેકન્ડ પ્રિયા, તું જ બોલે છે ને? મને ચેક કરવા દે.'
        }
      },
      {
        time: 14,
        speaker: 'Caller',
        text: {
          en: 'Yes, I am standing at the store. Please do it quickly if you can, he is waiting.',
          hi: 'Haan, main store pe khadi hoon. Please jaldi kar do agar ho sake toh, woh wait kar raha hai.',
          guj: 'હા, હું સ્ટોર પર ઊભી છું. પ્લીઝ જો થઈ શકે તો જલ્દી કર, તે રાહ જોઈ રહ્યો છે.'
        },
        tags: ['URGENCY']
      }
    ]
  },
  {
    id: 4,
    name: 'Replay Attack Scenario',
    description: 'Unknown entity calling with looped/spliced audio demanding verification codes.',
    caller: 'Gas Agency Impersonator',
    number: '+91 88990 01122',
    initialScore: 25,
    maxScore: 85,
    language: 'Gujarati',
    riskLevel: 'HIGH RISK',
    explanation: 'Extremely high audio integrity risk. Sub-audible click traces and repetitive background noise loops indicate a replay attack configuration.',
    riskReasons: [
      'High confidence audio replay traces (91% probability)',
      'Linguistic demand for Aadhaar number details',
      'Suspicious audio splice signature'
    ],
    recommendedActions: [
      'Hang up the call',
      'Contact your gas agency office using their official public directory number',
      'Do not disclose card details or personal identity numbers'
    ],
    attackSignals: ['Replay Attack', 'KYC Scam', 'Audio Manipulation'],
    voiceAuthenticity: '28% likely synthetic',
    speakerConsistency: 'Unknown profile',
    replayScore: '91% probability (Critical)',
    scamIntent: 'Low',
    contextRisk: 'Medium',
    timeline: [
      {
        time: 3,
        speaker: 'Caller',
        text: {
          en: 'Please provide your Aadhaar card number for gas booking verification, otherwise booking will be cancelled.',
          hi: 'Gas booking verification ke liye apna Aadhaar card number batayein, varna booking cancel ho jayegi.',
          guj: 'ગેસ બુકિંગ વેરિફિકેશન માટે તમારો આધાર કાર્ડ નંબર આપો, નહીંતર બુકિંગ કેન્સલ થઈ જશે.'
        },
        tags: ['KYC REQUEST', 'URGENCY'],
        updateRiskScore: 58,
        updateRiskLevel: 'VERIFY',
        updateScamIntent: 'High',
        updateContextRisk: 'High',
        updateReplayScore: '45% probability'
      },
      {
        time: 9,
        speaker: 'User',
        text: {
          en: 'Is this an automated recording? The sound is repeating.',
          hi: 'Kya yeh automated call hai? Aawaz repeat ho rahi hai.',
          guj: 'શું આ ઓટોમેટેડ રેકોર્ડિંગ છે? અવાજ રિપીટ થાય છે.'
        }
      },
      {
        time: 15,
        speaker: 'Caller',
        text: {
          en: 'Yes... yes, speak the last 4 digits of Aadhaar card quickly, the system is closing.',
          hi: 'Haan... haan, jaldi se Aadhaar card ke aakhri 4 digit bolein, system close ho raha hai.',
          guj: 'હા... હા, જલ્દીથી આધાર કાર્ડના છેલ્લા ૪ આંકડા બોલો, સિસ્ટમ બંધ થઈ રહી છે.'
        },
        tags: ['URGENCY'],
        updateRiskScore: 85,
        updateRiskLevel: 'HIGH RISK',
        updateReplayScore: '91% probability (Critical)'
      }
    ]
  }
];

interface DemoContextType {
  activeRoute: string;
  setActiveRoute: (route: string) => void;
  scenarios: ScenarioDefinition[];
  currentScenario: ScenarioDefinition;
  selectScenario: (id: number) => void;
  callState: 'idle' | 'calling' | 'active' | 'ended';
  callDuration: number;
  riskScore: number;
  riskLevel: 'LOW RISK' | 'VERIFY' | 'HIGH RISK';
  isAnalyzing: boolean;
  transcriptLines: { speaker: 'Caller' | 'User'; text: string; time: string; tags?: string[] }[];
  voiceAuthenticity: string;
  speakerConsistency: string;
  replayScore: string;
  scamIntent: 'Low' | 'Medium' | 'High' | 'Critical';
  contextRisk: 'Low' | 'Medium' | 'High';
  startCall: () => void;
  endCall: () => void;
  continueCall: () => void;
  languageMode: Language;
  setLanguageMode: (lang: Language) => void;
  warningLanguage: 'en' | 'hi' | 'guj';
  systemStatus: 'ready' | 'offline' | 'error' | 'reconnecting';
  setSystemStatus: (status: 'ready' | 'offline' | 'error' | 'reconnecting') => void;
  privacyMode: boolean;
  togglePrivacyMode: () => void;
  trustedContacts: TrustedContact[];
  addTrustedContact: (contact: Omit<TrustedContact, 'id' | 'verificationStatus' | 'voiceSignatureRegistered'>) => Promise<void>;
  alerts: SystemAlert[];
  dismissAlert: (id: string) => void;
  notificationDrawerOpen: boolean;
  setNotificationDrawerOpen: (open: boolean) => void;
  independentVerifyProgress: 'idle' | 'calling' | 'success' | 'failed';
  triggerIndependentVerification: (phone: string) => Promise<void>;
  resetVerificationState: () => void;
  activeHistoricalCallId: string | null;
  setActiveHistoricalCallId: (id: string | null) => void;
  
  // Live connection variables
  liveMode: boolean;
  setLiveMode: (live: boolean) => void;
  clientRole: 'scammer' | 'user' | null;
  setClientRole: (role: 'scammer' | 'user' | null) => void;
  clientId: string;
  signalingClients: string[];
  connectLiveCall: (targetId: string) => void;
  endLiveCall: () => void;
}

const DemoContext = createContext<DemoContextType | undefined>(undefined);

export const DemoProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeRoute, setActiveRoute] = useState('/dashboard');
  const [currentScenarioId, setCurrentScenarioId] = useState<number>(1);
  const [callState, setCallState] = useState<'idle' | 'calling' | 'active' | 'ended'>('idle');
  const [callDuration, setCallDuration] = useState<number>(0);
  const [riskScore, setRiskScore] = useState<number>(0);
  const [riskLevel, setRiskLevel] = useState<'LOW RISK' | 'VERIFY' | 'HIGH RISK'>('LOW RISK');
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [transcriptLines, setTranscriptLines] = useState<{ speaker: 'Caller' | 'User'; text: string; time: string; tags?: string[] }[]>([]);

  // Individual risk metrics state
  const [voiceAuthenticity, setVoiceAuthenticity] = useState<string>('3% likely synthetic');
  const [speakerConsistency, setSpeakerConsistency] = useState<string>('95% match');
  const [replayScore, setReplayScore] = useState<string>('5% probability');
  const [scamIntent, setScamIntent] = useState<'Low' | 'Medium' | 'High' | 'Critical'>('Low');
  const [contextRisk, setContextRisk] = useState<'Low' | 'Medium' | 'High'>('Low');

  // Preferences
  const [languageMode, setLanguageMode] = useState<Language>('auto');
  const [warningLanguage, setWarningLanguage] = useState<'en' | 'hi' | 'guj'>('en');
  const [systemStatus, setSystemStatus] = useState<'ready' | 'offline' | 'error' | 'reconnecting'>('ready');
  const [privacyMode, setPrivacyMode] = useState<boolean>(true);
  const [notificationDrawerOpen, setNotificationDrawerOpen] = useState<boolean>(false);

  // Db states
  const [trustedContacts, setTrustedContacts] = useState<TrustedContact[]>([]);
  const [alerts, setAlerts] = useState<SystemAlert[]>([]);
  const [activeHistoricalCallId, setActiveHistoricalCallId] = useState<string | null>(null);

  // Verification flow
  const [independentVerifyProgress, setIndependentVerifyProgress] = useState<'idle' | 'calling' | 'success' | 'failed'>('idle');

  // Live connection state
  const [liveMode, setLiveMode] = useState<boolean>(false);
  const [clientRole, setClientRole] = useState<'scammer' | 'user' | null>(null);
  const [clientId] = useState<string>(() => 'Client-' + Math.floor(Math.random() * 9000 + 1000));
  const [signalingClients, setSignalingClients] = useState<string[]>([]);

  const signalingWsRef = useRef<WebSocket | null>(null);
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const streamWsRef = useRef<WebSocket | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const targetIdRef = useRef<string | null>(null);

  const currentScenario = scenarios.find(s => s.id === currentScenarioId) || scenarios[0];
  const timerRef = useRef<any>(null);
  const wobbleIntervalRef = useRef<any>(null);

  // Load initial API data
  useEffect(() => {
    mockApi.getTrustedContacts().then(setTrustedContacts);
    mockApi.getNotifications().then(setAlerts);
  }, []);

  // Update warning language based on scenario and selection
  useEffect(() => {
    if (languageMode === 'auto') {
      // Auto switches based on scenario language
      if (currentScenario.language.includes('Gujarati')) {
        setWarningLanguage('guj');
      } else if (currentScenario.language.includes('Hindi')) {
        setWarningLanguage('hi');
      } else {
        setWarningLanguage('en');
      }
    } else {
      setWarningLanguage(languageMode);
    }
  }, [languageMode, currentScenarioId]);

  // Signaling WebSocket handling
  useEffect(() => {
    if (!clientRole || !liveMode) {
      if (signalingWsRef.current) {
        signalingWsRef.current.close();
        signalingWsRef.current = null;
      }
      return;
    }

    const host = window.location.hostname;
    const wsUrl = `ws://${host}:8000/signaling/${clientRole}-${clientId}`;
    const ws = new WebSocket(wsUrl);
    signalingWsRef.current = ws;

    ws.onmessage = async (event) => {
      const data = JSON.parse(event.data);
      if (data.type === 'clients_list') {
        const otherClients = data.clients.filter((c: string) => c !== `${clientRole}-${clientId}`);
        setSignalingClients(otherClients);
      } else if (data.type === 'offer' && clientRole === 'user') {
        targetIdRef.current = data.sender;
        await acceptIncomingCall(data.offer, data.sender);
      } else if (data.type === 'answer' && clientRole === 'scammer') {
        if (peerConnectionRef.current) {
          await peerConnectionRef.current.setRemoteDescription(new RTCSessionDescription(data.answer));
          setCallState('active');
        }
      } else if (data.type === 'candidate') {
        if (peerConnectionRef.current) {
          await peerConnectionRef.current.addIceCandidate(new RTCIceCandidate(data.candidate)).catch(() => {});
        }
      } else if (data.type === 'end') {
        cleanupLiveCallState();
      }
    };

    ws.onclose = () => setSystemStatus('offline');
    ws.onerror = () => setSystemStatus('error');
    ws.onopen = () => setSystemStatus('ready');

    return () => {
      ws.close();
      signalingWsRef.current = null;
    };
  }, [clientRole, clientId, liveMode]);

  const sendSignaling = (msg: any) => {
    if (signalingWsRef.current && signalingWsRef.current.readyState === WebSocket.OPEN) {
      signalingWsRef.current.send(JSON.stringify(msg));
    }
  };

  const connectLiveCall = async (targetId: string) => {
    targetIdRef.current = targetId;
    setCallState('calling');
    setIsAnalyzing(true);
    setTranscriptLines([]);

    const pc = new RTCPeerConnection({ iceServers: [{ urls: 'stun:stun.l.google.com:19302' }] });
    peerConnectionRef.current = pc;

    pc.onicecandidate = (event) => {
      if (event.candidate) {
        sendSignaling({ type: 'candidate', candidate: event.candidate, target: targetId });
      }
    };

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
      localStreamRef.current = stream;
      stream.getTracks().forEach(track => pc.addTrack(track, stream));

      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      sendSignaling({ type: 'offer', offer, target: targetId });
    } catch (err) {
      console.error("Failed to capture mic:", err);
      setCallState('idle');
      setIsAnalyzing(false);
    }
  };

  const acceptIncomingCall = async (offer: any, senderId: string) => {
    setCallState('active');
    setIsAnalyzing(true);
    setTranscriptLines([]);

    // Dynamically override current scenario target fields to show live client info
    const senderName = senderId.replace('scammer-', '').replace('user-', '');
    currentScenario.caller = `Scammer (${senderName})`;
    currentScenario.number = senderId;

    const pc = new RTCPeerConnection({ iceServers: [{ urls: 'stun:stun.l.google.com:19302' }] });
    peerConnectionRef.current = pc;

    pc.onicecandidate = (event) => {
      if (event.candidate) {
        sendSignaling({ type: 'candidate', candidate: event.candidate, target: senderId });
      }
    };

    pc.ontrack = (event) => {
      const remoteStream = event.streams[0] || new MediaStream([event.track]);
      
      // Play scammer audio
      const audio = new Audio();
      audio.srcObject = remoteStream;
      audio.play().catch(err => console.error("Audio playback error:", err));

      // Stream audio to Python ML engine
      startLiveStreamToBackend(remoteStream);
    };

    await pc.setRemoteDescription(new RTCSessionDescription(offer));
    const answer = await pc.createAnswer();
    await pc.setLocalDescription(answer);
    sendSignaling({ type: 'answer', answer, target: senderId });
  };

  const startLiveStreamToBackend = (stream: MediaStream) => {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) {
      console.error("AudioContext not supported");
      return;
    }
    const audioContext = new AudioCtx({ sampleRate: 16000 });
    audioContextRef.current = audioContext;

    const source = audioContext.createMediaStreamSource(stream);
    const processor = audioContext.createScriptProcessor(4096, 1, 1);
    source.connect(processor);
    processor.connect(audioContext.destination);

    const host = window.location.hostname;
    const wsUrl = `ws://${host}:8000/stream`;
    const ws = new WebSocket(wsUrl);
    streamWsRef.current = ws;

    ws.onopen = () => {
      ws.send(JSON.stringify({ sample_rate: 16000, channels: 1 }));
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === 'risk_update' || data.type === 'final_result') {
        setRiskScore(data.risk_score);
        setRiskLevel(data.risk_level === 'HIGH_RISK' ? 'HIGH RISK' : data.risk_level === 'MEDIUM_RISK' ? 'VERIFY' : 'LOW RISK');
        
        // Format voice authenticity to trigger red highlights when synthetic
        const isSynthetic = data.voice_authenticity < 0.50;
        const synthPercent = ((1 - data.voice_authenticity) * 100).toFixed(0);
        const authPercent = (data.voice_authenticity * 100).toFixed(0);
        setVoiceAuthenticity(isSynthetic ? `${synthPercent}% likely synthetic` : `${authPercent}% authentic`);
        
        setSpeakerConsistency(data.speaker_match !== null ? `${(data.speaker_match * 100).toFixed(0)}% match` : 'Unknown signature');
        
        const isReplay = data.reasons.some((r: string) => r.toLowerCase().includes('replay'));
        setReplayScore(isReplay ? 'Critical replay match' : 'Low probability');
        
        if (data.intent && data.intent.length > 0) {
          setScamIntent(data.intent.includes('OTP_REQUEST') ? 'Critical' : 'High');
        } else {
          setScamIntent('Low');
        }

        // Set explanation dynamically based on ML model outcomes
        if (data.reasons && data.reasons.length > 0) {
          currentScenario.explanation = `Signals Flagged: ${data.reasons.join(', ')}. Recommendation: ${data.recommendation || 'Verify caller.'}`;
        } else {
          currentScenario.explanation = 'Scanning live audio stream... No anomalous signals identified yet.';
        }
        
        if (data.transcript) {
          setTranscriptLines([
            {
              speaker: 'Caller',
              text: data.transcript,
              time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
              tags: data.intent
            }
          ]);
        }
      }
    };

    processor.onaudioprocess = (e) => {
      if (ws.readyState !== WebSocket.OPEN) return;
      const inputBuffer = e.inputBuffer.getChannelData(0);
      const pcm16 = new Int16Array(inputBuffer.length);
      for (let i = 0; i < inputBuffer.length; i++) {
        const s = Math.max(-1, Math.min(1, inputBuffer[i]));
        pcm16[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
      }
      ws.send(pcm16.buffer);
    };
  };

  const endLiveCall = () => {
    if (targetIdRef.current) {
      sendSignaling({ type: 'end', target: targetIdRef.current });
    }
    cleanupLiveCallState();
  };

  const cleanupLiveCallState = () => {
    setCallState('ended');
    setIsAnalyzing(false);

    if (streamWsRef.current) {
      try { streamWsRef.current.send(JSON.stringify({ type: 'end' })); } catch (e) {}
      streamWsRef.current.close();
      streamWsRef.current = null;
    }
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
      peerConnectionRef.current = null;
    }
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => track.stop());
      localStreamRef.current = null;
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
    targetIdRef.current = null;
  };

  // Scenario selection logic
  const selectScenario = (id: number) => {
    setCurrentScenarioId(id);
    endCall();
  };

  const startCall = () => {
    endCall();
    setCallState('calling');
    setIsAnalyzing(true);
    setCallDuration(0);
    setTranscriptLines([]);

    // Initialize metrics based on scenario starting state
    const target = scenarios.find(s => s.id === currentScenarioId) || scenarios[0];
    setRiskScore(target.initialScore);
    setRiskLevel('LOW RISK');
    setVoiceAuthenticity(target.voiceAuthenticity);
    setSpeakerConsistency(target.speakerConsistency);
    setReplayScore(target.replayScore);
    setScamIntent('Low');
    setContextRisk('Low');

    // After 2 seconds, transition calling -> active
    setTimeout(() => {
      setCallState('active');
    }, 2000);
  };

  const endCall = () => {
    if (liveMode) {
      endLiveCall();
      return;
    }
    setCallState('ended');
    setIsAnalyzing(false);
    if (timerRef.current) clearInterval(timerRef.current);
    if (wobbleIntervalRef.current) clearInterval(wobbleIntervalRef.current);
  };

  const continueCall = () => {
    setRiskScore(prev => Math.max(10, prev - 15));
  };

  // Live Simulation Core Loop (Only runs in mock mode)
  useEffect(() => {
    if (callState !== 'active' || liveMode) return;

    timerRef.current = setInterval(() => {
      setCallDuration(prev => {
        const nextTime = prev + 1;
        const event = currentScenario.timeline.find(e => e.time === nextTime);
        if (event) {
          const m = Math.floor(nextTime / 60).toString().padStart(2, '0');
          const s = (nextTime % 60).toString().padStart(2, '0');
          const timestamp = `${m}:${s}`;

          let spokenText = event.text.en;
          if (warningLanguage === 'hi') spokenText = event.text.hi;
          if (warningLanguage === 'guj') spokenText = event.text.guj;

          setTranscriptLines(prevLines => [
            ...prevLines,
            { speaker: event.speaker, text: spokenText, time: timestamp, tags: event.tags }
          ]);

          if (event.updateRiskScore !== undefined) setRiskScore(event.updateRiskScore);
          if (event.updateRiskLevel !== undefined) setRiskLevel(event.updateRiskLevel);
          if (event.updateVoiceAuthenticity !== undefined) setVoiceAuthenticity(event.updateVoiceAuthenticity);
          if (event.updateSpeakerConsistency !== undefined) setSpeakerConsistency(event.updateSpeakerConsistency);
          if (event.updateReplayScore !== undefined) setReplayScore(event.updateReplayScore);
          if (event.updateScamIntent !== undefined) setScamIntent(event.updateScamIntent);
          if (event.updateContextRisk !== undefined) setContextRisk(event.updateContextRisk);
        }

        const maxTime = Math.max(...currentScenario.timeline.map(t => t.time), 0);
        if (nextTime > maxTime + 6) {
          endCall();
        }

        return nextTime;
      });
    }, 1000);

    wobbleIntervalRef.current = setInterval(() => {
      setRiskScore(prev => {
        if (prev <= 10) return prev;
        const wobble = Math.floor(Math.random() * 5) - 2;
        const finalScore = prev + wobble;
        return Math.min(Math.max(10, finalScore), 100);
      });
    }, 1500);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (wobbleIntervalRef.current) clearInterval(wobbleIntervalRef.current);
    };
  }, [callState, currentScenarioId, warningLanguage, liveMode]);

  // Trusted contacts helpers
  const addTrustedContact = async (contact: Omit<TrustedContact, 'id' | 'verificationStatus' | 'voiceSignatureRegistered'>) => {
    const fresh = await mockApi.addTrustedContact(contact);
    setTrustedContacts(prev => [...prev, fresh]);
  };

  // Alerts helpers
  const dismissAlert = (id: string) => {
    setAlerts(prev => prev.filter(a => a.id !== id));
  };

  const togglePrivacyMode = () => setPrivacyMode(!privacyMode);

  // Out-of-band Verification flow simulator
  const triggerIndependentVerification = async (phone: string) => {
    setIndependentVerifyProgress('calling');
    const result = await mockApi.simulateVerificationCall(phone);
    if (result.success) {
      setIndependentVerifyProgress('success');
      const newAlert: SystemAlert = {
        id: `alert-${Date.now()}`,
        severity: 'Informational',
        title: 'Trusted Verification Completed',
        description: result.message,
        time: 'Just now',
      };
      setAlerts(prev => [newAlert, ...prev]);
    } else {
      setIndependentVerifyProgress('failed');
      const newAlert: SystemAlert = {
        id: `alert-${Date.now()}`,
        severity: 'High',
        title: 'Verification Failed',
        description: result.message,
        time: 'Just now',
      };
      setAlerts(prev => [newAlert, ...prev]);
    }
  };

  const resetVerificationState = () => {
    setIndependentVerifyProgress('idle');
  };

  return (
    <DemoContext.Provider value={{
      activeRoute,
      setActiveRoute,
      scenarios,
      currentScenario,
      selectScenario,
      callState,
      callDuration,
      riskScore,
      riskLevel,
      isAnalyzing,
      transcriptLines,
      voiceAuthenticity,
      speakerConsistency,
      replayScore,
      scamIntent,
      contextRisk,
      startCall,
      endCall,
      continueCall,
      languageMode,
      setLanguageMode,
      warningLanguage,
      systemStatus,
      setSystemStatus,
      privacyMode,
      togglePrivacyMode,
      trustedContacts,
      addTrustedContact,
      alerts,
      dismissAlert,
      notificationDrawerOpen,
      setNotificationDrawerOpen,
      independentVerifyProgress,
      triggerIndependentVerification,
      resetVerificationState,
      activeHistoricalCallId,
      setActiveHistoricalCallId,
      
      // Live variables
      liveMode,
      setLiveMode,
      clientRole,
      setClientRole,
      clientId,
      signalingClients,
      connectLiveCall,
      endLiveCall: endCall
    }}>
      {children}
    </DemoContext.Provider>
  );
};

export const useDemo = () => {
  const context = useContext(DemoContext);
  if (!context) throw new Error('useDemo must be used within a DemoProvider');
  return context;
};
