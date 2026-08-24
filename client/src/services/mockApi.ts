export interface CallDetailModel {
  id: string;
  caller: string;
  number: string;
  timestamp: string;
  duration: string;
  language: string;
  riskScore: number;
  riskLevel: 'LOW RISK' | 'VERIFY' | 'HIGH RISK';
  voiceAuthenticity: string; // e.g. "96% synthetic"
  speakerConsistency: string; // e.g. "12% match"
  replayScore: string; // e.g. "10% probability"
  scamIntent: 'Low' | 'Medium' | 'High' | 'Critical';
  contextRisk: 'Low' | 'Medium' | 'High';
  explanation: string;
  recommendedActions: string[];
  riskReasons: string[];
  transcript: { speaker: 'Caller' | 'User'; text: string; time: string; tags?: string[] }[];
  attackSignals: string[];
}

export interface DashboardStats {
  callsAnalyzed: number;
  requiresVerification: number;
  highRiskCount: number;
  impersonationSignals: number;
  replayAttacksDetected: number;
  otpRequestsDetected: number;
  paymentRequestsDetected: number;
  languagesBreakdown: { name: string; value: number; color: string }[];
  riskTrend: { day: string; low: number; verify: number; high: number }[];
}

export interface TrustedContact {
  id: string;
  name: string;
  relationship: string;
  phone: string;
  trustedStatus: boolean;
  verificationStatus: 'Verified' | 'Unverified' | 'In Progress';
  lastCallTime?: string;
  voiceSignatureRegistered: boolean;
}

export interface SystemAlert {
  id: string;
  severity: 'High' | 'Medium' | 'Informational';
  title: string;
  description: string;
  time: string;
}

// -------------------------------------------------------------
// Mock Database
// -------------------------------------------------------------

const initialTrustedContacts: TrustedContact[] = [
  {
    id: 'tc-1',
    name: 'Aarav Vora',
    relationship: 'Brother',
    phone: '+91 98765 43210',
    trustedStatus: true,
    verificationStatus: 'Verified',
    lastCallTime: '2 hours ago',
    voiceSignatureRegistered: true,
  },
  {
    id: 'tc-2',
    name: 'Priya Shah',
    relationship: 'Sister',
    phone: '+91 91234 56789',
    trustedStatus: true,
    verificationStatus: 'Verified',
    lastCallTime: 'Yesterday',
    voiceSignatureRegistered: true,
  },
  {
    id: 'tc-3',
    name: 'HDFC Bank Helpline',
    relationship: 'Bank Contact',
    phone: '+91 22 6160 6161',
    trustedStatus: true,
    verificationStatus: 'Verified',
    lastCallTime: '3 days ago',
    voiceSignatureRegistered: false,
  },
  {
    id: 'tc-4',
    name: 'Ketan Mehta',
    relationship: 'Father',
    phone: '+91 99887 76655',
    trustedStatus: true,
    verificationStatus: 'Verified',
    lastCallTime: '5 days ago',
    voiceSignatureRegistered: true,
  },
];

const mockCallHistory: CallDetailModel[] = [
  {
    id: 'call-1',
    caller: 'Rahul Mehta',
    number: '+91 98798 12345',
    timestamp: '2026-08-24T12:30:00Z',
    duration: '00:02:47',
    language: 'Hindi + English',
    riskScore: 68,
    riskLevel: 'VERIFY',
    voiceAuthenticity: '42% likely synthetic',
    speakerConsistency: 'Moderate match (62%)',
    replayScore: '18% probability',
    scamIntent: 'High',
    contextRisk: 'Medium',
    explanation: 'The caller requested urgent payment and OTP verification code, which trigger elevated scam intent flags, despite a moderate speaker match.',
    riskReasons: [
      'Caller requested OTP',
      'Urgency language detected',
      'Reference to banking details'
    ],
    recommendedActions: [
      'Stop sharing any details',
      'Verify caller identity using saved trusted contact',
      'Do not approve UPI notifications'
    ],
    attackSignals: ['OTP Scam', 'Urgency / Social Engineering'],
    transcript: [
      { speaker: 'Caller', text: 'Hello Shrey, SBI Customer Support se bol raha hoon.', time: '0:02' },
      { speaker: 'User', text: 'Haan ji, boliye kya kaam hai?', time: '0:08' },
      { speaker: 'Caller', text: 'Sir aapka debit card validity block hone wala hai. Aapke register number par verification pin gaya hai.', time: '0:14', tags: ['URGENCY', 'BANK IMPERSONATION'] },
      { speaker: 'User', text: 'Debit card block? Kaise ho sakta hai? Meri expiry to aage hai.', time: '0:22' },
      { speaker: 'Caller', text: 'Sir online system upgrade hai. Please share the OTP so we can extend details immediately.', time: '0:29', tags: ['OTP REQUEST', 'URGENCY'] },
    ]
  },
  {
    id: 'call-2',
    caller: 'Unknown Number',
    number: '+91 90123 45678',
    timestamp: '2026-08-24T10:15:00Z',
    duration: '00:01:12',
    language: 'Gujarati',
    riskScore: 85,
    riskLevel: 'HIGH RISK',
    voiceAuthenticity: '85% likely synthetic',
    speakerConsistency: 'No match (0%)',
    replayScore: '88% probability',
    scamIntent: 'High',
    contextRisk: 'High',
    explanation: 'Highly anomalous synthetic voice signature detected alongside high-probability audio replay artifacts. Caller requested immediate KYC verification.',
    riskReasons: [
      'Synthetic voice features identified',
      'Replay attack fingerprint detected',
      'KYC scam pattern matched'
    ],
    recommendedActions: [
      'Hang up the call immediately',
      'Report the number to cyber crime portal',
      'Do not click any SMS link sent during this call'
    ],
    attackSignals: ['AI Voice / Synthetic Speech', 'Replay Attack', 'KYC Scam'],
    transcript: [
      { speaker: 'Caller', text: 'Gas booking maate tamaro aadhar card number aapo, booking cancel thai jase.', time: '0:03', tags: ['KYC REQUEST', 'URGENCY'] },
      { speaker: 'User', text: 'Aadhar number kem aapu? Aa automatic service chhe?', time: '0:11' },
      { speaker: 'Caller', text: 'Hao, jaldi aadhar card na last 4 digits bolo, system update kare chhe.', time: '0:18', tags: ['URGENCY'] },
      { speaker: 'User', text: 'Mane thodo doubt lage chhe.', time: '0:24' }
    ]
  },
  {
    id: 'call-3',
    caller: 'Priya Shah',
    number: '+91 91234 56789',
    timestamp: '2026-08-23T18:45:00Z',
    duration: '00:04:10',
    language: 'English',
    riskScore: 12,
    riskLevel: 'LOW RISK',
    voiceAuthenticity: '3% likely synthetic',
    speakerConsistency: '96% match (Trusted)',
    replayScore: '2% probability',
    scamIntent: 'Low',
    contextRisk: 'Low',
    explanation: 'No suspicious linguistic indicators. High-confidence speaker matching and pristine audio integrity.',
    riskReasons: [
      'No major suspicious signals detected'
    ],
    recommendedActions: [
      'No action required, normal trust level'
    ],
    attackSignals: [],
    transcript: [
      { speaker: 'Caller', text: 'Hey, are you free this evening? Just wanted to plan dinner.', time: '0:03' },
      { speaker: 'User', text: 'Yeah, I should be free after 7. What are you thinking?', time: '0:08' },
      { speaker: 'Caller', text: 'Maybe that new place near the corner? Let me check reservations and text you.', time: '0:15' }
    ]
  },
  {
    id: 'call-4',
    caller: 'Unknown Number',
    number: '+91 88776 65544',
    timestamp: '2026-08-23T09:20:00Z',
    duration: '00:03:05',
    language: 'Hindi',
    riskScore: 92,
    riskLevel: 'HIGH RISK',
    voiceAuthenticity: '94% likely synthetic',
    speakerConsistency: '10% match',
    replayScore: '14% probability',
    scamIntent: 'Critical',
    contextRisk: 'High',
    explanation: 'Severe voice-cloning indicators matched to family profile (Aarav Vora) but signature similarity is extremely low. Caller requested immediate fund transfer.',
    riskReasons: [
      'High-confidence voice cloning signature',
      'Impersonation of family member (Aarav Vora)',
      'Urgent monetary transaction request'
    ],
    recommendedActions: [
      'DO NOT transfer money',
      'Verify by calling Aarav directly using the Trusted Contacts screen',
      'Report the cloned audio sample to security authorities'
    ],
    attackSignals: ['AI Voice / Synthetic Speech', 'Voice Impersonation', 'Payment Scam', 'Urgency / Social Engineering'],
    transcript: [
      { speaker: 'Caller', text: 'Papa, main Aarav bol raha hoon. Mera phone kho gaya hai aur mujhe emergency payment karni hai.', time: '0:04', tags: ['IMPERSONATION', 'URGENCY'] },
      { speaker: 'User', text: 'Aarav? Teri aawaz thodi alag lag rahi hai.', time: '0:11' },
      { speaker: 'Caller', text: 'Haan woh network issue hai. Please urgently 15,000 rupees is number pe gpay kar do, hospital bills pay karne hain.', time: '0:18', tags: ['URGENCY', 'MONEY REQUEST'] },
      { speaker: 'User', text: 'Hospital bills? Aarav call cut gaya...', time: '0:25' }
    ]
  }
];

const mockAlerts: SystemAlert[] = [
  {
    id: 'alert-1',
    severity: 'High',
    title: 'AI Voice + Payment Request Detected',
    description: 'Suspicious incoming call impersonating family member with 94% cloned voice match probability.',
    time: '2 mins ago',
  },
  {
    id: 'alert-2',
    severity: 'Medium',
    title: 'Caller Requesting Sensitive Information',
    description: 'Call from unknown number flagged for requesting OTP validation credentials.',
    time: '2 hours ago',
  },
  {
    id: 'alert-3',
    severity: 'Informational',
    title: 'Language Automatically Detected as Gujarati',
    description: 'Real-time engine successfully adapted to Gujarati language model context.',
    time: '4 hours ago',
  },
];

const mockStats: DashboardStats = {
  callsAnalyzed: 1284,
  requiresVerification: 84,
  highRiskCount: 23,
  impersonationSignals: 47,
  replayAttacksDetected: 19,
  otpRequestsDetected: 32,
  paymentRequestsDetected: 28,
  languagesBreakdown: [
    { name: 'Hindi', value: 44, color: '#3b82f6' },
    { name: 'English', value: 31, color: '#06b6d4' },
    { name: 'Gujarati', value: 18, color: '#10b981' },
    { name: 'Code-Switched', value: 7, color: '#f59e0b' },
  ],
  riskTrend: [
    { day: 'Mon', low: 120, verify: 8, high: 2 },
    { day: 'Tue', low: 142, verify: 12, high: 4 },
    { day: 'Wed', low: 115, verify: 10, high: 3 },
    { day: 'Thu', low: 130, verify: 15, high: 5 },
    { day: 'Fri', low: 155, verify: 18, high: 2 },
    { day: 'Sat', low: 98, verify: 14, high: 4 },
    { day: 'Sun', low: 102, verify: 7, high: 3 },
  ],
};

// -------------------------------------------------------------
// API Simulation Methods
// -------------------------------------------------------------

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const mockApi = {
  getDashboardStats: async (): Promise<DashboardStats> => {
    await delay(300);
    return { ...mockStats };
  },

  getCallHistory: async (): Promise<CallDetailModel[]> => {
    await delay(300);
    return [...mockCallHistory];
  },

  getCallAnalysis: async (id: string): Promise<CallDetailModel | undefined> => {
    await delay(200);
    return mockCallHistory.find((c) => c.id === id);
  },

  getTrustedContacts: async (): Promise<TrustedContact[]> => {
    await delay(200);
    return [...initialTrustedContacts];
  },

  addTrustedContact: async (contact: Omit<TrustedContact, 'id' | 'verificationStatus' | 'voiceSignatureRegistered'>): Promise<TrustedContact> => {
    await delay(500);
    const newContact: TrustedContact = {
      ...contact,
      id: `tc-${Date.now()}`,
      verificationStatus: 'Verified',
      voiceSignatureRegistered: true,
    };
    initialTrustedContacts.push(newContact);
    return newContact;
  },

  getNotifications: async (): Promise<SystemAlert[]> => {
    await delay(100);
    return [...mockAlerts];
  },

  simulateVerificationCall: async (phone: string): Promise<{ success: boolean; message: string }> => {
    await delay(2500); // simulate call ring & verification
    const contact = initialTrustedContacts.find(c => c.phone.replace(/\s+/g, '') === phone.replace(/\s+/g, ''));
    if (contact) {
      return {
        success: true,
        message: `Independent verification completed. Successfully validated identity signature of ${contact.name}.`,
      };
    }
    return {
      success: false,
      message: 'Unable to independently verify. No trusted voice signature matched the connection channel.',
    };
  },
};
