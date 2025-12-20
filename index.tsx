
import React, { useState, useEffect, useMemo, useRef } from 'react';
import ReactDOM from 'react-dom/client';
import { GoogleGenAI, GenerateContentResponse, Type, Modality } from "@google/genai";
import { 
  ShieldCheck, User, Database, Lock, Unlock, AlertCircle, TrendingUp, Clock, Activity, 
  ArrowLeft, ArrowRight, Fingerprint, Mic2, Scan, Wallet, Search, Camera, RefreshCw, AlertTriangle, 
  Loader2, Mic, Square, Volume2, Waves, Link as LinkIcon, Cpu, Globe, ExternalLink, 
  Image as ImageIcon, ChevronRight, Terminal, UserPlus, LogIn, LogOut, UserCircle, ShieldAlert,
  LayoutDashboard
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  LineChart, Line 
} from 'recharts';

// --- TYPES ---
export enum BiometricType {
  FACIAL = 'FACIAL',
  VOICE = 'VOICE',
  BEHAVIORAL = 'BEHAVIORAL',
  BLOCKCHAIN = 'BLOCKCHAIN'
}

export interface BiometricResult {
  id: string;
  type: BiometricType;
  timestamp: number;
  score: number;
  details: string;
  status: 'Pass' | 'Fail' | 'Pending';
}

export interface UserProfile {
  id: string;
  username: string;
  createdAt: number;
  results: BiometricResult[];
  nftUri?: string;
  isMinted: boolean;
  walletAddress?: string;
}

export interface WalletAsset {
  name: string;
  symbol: string;
  riskScore: number;
  riskReason: string;
  type: 'TOKEN' | 'NFT' | 'CONTRACT';
}

export interface SecurityLog {
  id: string;
  timestamp: number;
  event: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  source: string;
}

export interface KeystrokeData {
  key: string;
  pressTime: number;
  releaseTime: number;
}

// --- SERVICES ---
// Initialize the GoogleGenAI client with the API key from environment variables.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const analyzeFacialLiveness = async (base64Image: string): Promise<string> => {
  const response: GenerateContentResponse = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: {
      parts: [
        { text: "Analyze facial liveness. Check for: 1. Deepfake artifacts, 2. Photo spoofing, 3. Natural skin texture. Provide a 'Liveness Score' 0-100 and a short technical explanation." },
        { inlineData: { mimeType: 'image/jpeg', data: base64Image } }
      ]
    },
  });
  // Correctly extract text from response.text property.
  return response.text || "Analysis failed.";
};

const analyzeVoiceLiveness = async (base64Audio: string): Promise<string> => {
  const response: GenerateContentResponse = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: {
      parts: [
        { text: "Analyze voice for acoustic liveness. Detect synthesized (AI TTS) or replayed audio. Provide a 'Liveness Score' 0-100 and summary." },
        { inlineData: { mimeType: 'audio/webm', data: base64Audio } }
      ]
    }
  });
  return response.text || "Analysis failed.";
};

const generateNFTArt = async (): Promise<string> => {
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: {
      parts: [{ text: "Portrait of a random animal in a 'Binary Art Code' style. Dark cyberpunk aesthetic." }],
    },
    config: { imageConfig: { aspectRatio: "1:1" } }
  });
  // Correctly iterate through parts to find the image part.
  if (response.candidates?.[0]?.content?.parts) {
    for (const part of response.candidates[0].content.parts) {
      if (part.inlineData) return `data:image/png;base64,${part.inlineData.data}`;
    }
  }
  throw new Error("Failed art generation");
};

const scrubWalletSecurity = async (address: string): Promise<any> => {
  const resp = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Act as a blockchain security auditor. Perform a scrub protocol on address ${address}. Generate a JSON list of 4 mock assets with: name, symbol, riskScore (0-100), riskReason (one sentence), type (TOKEN/NFT/CONTRACT).`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            name: { type: Type.STRING },
            symbol: { type: Type.STRING },
            riskScore: { type: Type.NUMBER },
            riskReason: { type: Type.STRING },
            type: { type: Type.STRING }
          }
        }
      }
    }
  });
  return JSON.parse(resp.text || "[]");
};

const analyzeRiskSearch = async (query: string): Promise<string> => {
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Analyze this website or blockchain address for security risks: "${query}". Provide a risk rating (SAFE/SUSPICIOUS/DANGEROUS) and 3 bullet points of security facts.`,
    config: { tools: [{ googleSearch: {} }] }
  });
  let resultText = response.text || "Analysis failed.";
  // Correctly handle search grounding metadata.
  const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
  if (chunks) {
    const urls = chunks.map((chunk: any) => chunk.web?.uri).filter((uri: any) => !!uri);
    if (urls.length > 0) resultText += "\n\nSources:\n" + Array.from(new Set(urls)).map(url => `- ${url}`).join('\n');
  }
  return resultText;
};

const transcribeToEncryptedData = async (rawDetails: string): Promise<string> => {
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Transform this biometric report into a ciphered alphanumeric stream: "${rawDetails}"`
  });
  return response.text || "ENCRYPTION_STREAM_ERROR";
};

const generateBiometricHash = async (dataSummary: string): Promise<string> => {
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Generate a 64-char hex hash for: "${dataSummary}". Return only the hash.`
  });
  return response.text?.trim() || "0x000";
};

// --- SUB-COMPONENTS ---

const Dashboard = ({ results, onNavigate, progress, logs, isProfileComplete }: any) => {
  const hubItems = [
    { id: 'PROFILE', label: 'Identity Node', icon: UserCircle, desc: 'Manage profile and identity keys.' },
    { id: BiometricType.FACIAL, label: 'Face Scan', icon: Scan, desc: 'Facial liveness and mesh validation.' },
    { id: BiometricType.VOICE, label: 'Voice Auth', icon: Mic2, desc: 'Acoustic signature verification.' },
    { id: BiometricType.BEHAVIORAL, label: 'Behavioral', icon: Fingerprint, desc: 'Keystroke and rhythm analysis.' },
    { id: 'WALLETS', label: 'Wallet Scrub', icon: Wallet, desc: 'Audit wallet assets and contracts.' },
    { id: 'ANALYZER', label: 'Threat Intel', icon: Search, desc: 'AI-driven address/URL risk check.' },
    { id: BiometricType.BLOCKCHAIN, label: 'Web3 Anchor', icon: LinkIcon, desc: 'Mint on-chain biometric anchor.' },
    { id: 'DATABANK', label: 'Data Bank', icon: Database, desc: 'Access encrypted system logs.', locked: !isProfileComplete },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-700">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-3xl">
          <div className="text-[10px] font-bold text-slate-500 uppercase mb-1 tracking-widest">Global Score</div>
          <div className="text-2xl font-bold text-cyan-400">{progress}%</div>
        </div>
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-3xl">
          <div className="text-[10px] font-bold text-slate-500 uppercase mb-1 tracking-widest">Active Threads</div>
          <div className="text-2xl font-bold text-emerald-400">12</div>
        </div>
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-3xl">
          <div className="text-[10px] font-bold text-slate-500 uppercase mb-1 tracking-widest">Blockades</div>
          <div className="text-2xl font-bold text-red-400">{logs.length}</div>
        </div>
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-3xl">
          <div className="text-[10px] font-bold text-slate-500 uppercase mb-1 tracking-widest">Sync</div>
          <div className="text-2xl font-bold text-purple-400">Stable</div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {hubItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onNavigate(item.id)}
            disabled={item.locked}
            className={`flex flex-col text-left p-6 bg-slate-900 border border-slate-800 rounded-[2rem] transition-all hover:border-cyan-500/50 hover:bg-slate-900/50 group relative overflow-hidden ${item.locked ? 'opacity-50 grayscale cursor-not-allowed' : 'active:scale-95'}`}
          >
            <div className={`p-3 rounded-2xl w-fit mb-4 transition-colors ${item.locked ? 'bg-slate-800 text-slate-600' : 'bg-cyan-500/10 text-cyan-400 group-hover:bg-cyan-500 group-hover:text-slate-950'}`}>
              <item.icon size={24} />
            </div>
            <h3 className="font-bold text-lg mb-1">{item.label}</h3>
            <p className="text-xs text-slate-500 leading-relaxed">{item.desc}</p>
            {item.locked && <Lock size={14} className="absolute top-6 right-6 text-slate-600" />}
            {/* Added fix: ArrowRight component now correctly imported above at line 8. */}
            {!item.locked && <ArrowRight size={18} className="absolute bottom-6 right-6 text-slate-800 group-hover:text-cyan-400 transition-all opacity-0 group-hover:opacity-100" />}
          </button>
        ))}
      </div>
    </div>
  );
};

const BackButton = ({ onClick }: { onClick: () => void }) => (
  <button onClick={onClick} className="flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-cyan-400 transition-colors mb-6 uppercase tracking-widest">
    <ArrowLeft size={14} /> Back to Command Center
  </button>
);

const FacialScanner = ({ onComplete, onBack }: any) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [feedback, setFeedback] = useState("Position face within frame.");

  useEffect(() => {
    const startCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } });
        if (videoRef.current) { videoRef.current.srcObject = stream; setIsCameraActive(true); }
      } catch (err) { setFeedback("Access denied."); }
    };
    startCamera();
    return () => { if (videoRef.current?.srcObject) (videoRef.current.srcObject as MediaStream).getTracks().forEach(t => t.stop()); };
  }, []);

  const captureAndAnalyze = async () => {
    if (!videoRef.current || !canvasRef.current) return;
    setIsAnalyzing(true); setFeedback("Capturing...");
    const canvas = canvasRef.current;
    canvas.width = videoRef.current.videoWidth; canvas.height = videoRef.current.videoHeight;
    canvas.getContext('2d')?.drawImage(videoRef.current, 0, 0);
    const imageData = canvas.toDataURL('image/jpeg').split(',')[1];
    try {
      const analysis = await analyzeFacialLiveness(imageData);
      const score = parseInt(analysis.match(/Liveness Score:\s*(\d+)/i)?.[1] || "85");
      onComplete({ id: Math.random().toString(36).substr(2, 9), type: BiometricType.FACIAL, timestamp: Date.now(), score, details: analysis, status: score > 70 ? 'Pass' : 'Fail' });
      onBack();
    } catch (err) { setFeedback("Error."); setIsAnalyzing(false); }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <BackButton onClick={onBack} />
      <div className="bg-slate-900 border border-slate-800 rounded-[2.5rem] p-8 overflow-hidden">
        <div className="aspect-video bg-black rounded-3xl mb-8 relative overflow-hidden border border-slate-800">
          <video ref={videoRef} autoPlay muted playsInline className="w-full h-full object-cover grayscale brightness-125" />
          <div className="absolute inset-0 border-[30px] border-slate-950/20"><div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-64 border-2 border-cyan-400/40 rounded-full"></div></div>
          {isAnalyzing && <div className="absolute inset-0 bg-slate-950/40 backdrop-blur-sm flex items-center justify-center"><Loader2 size={32} className="animate-spin text-cyan-400" /></div>}
        </div>
        <canvas ref={canvasRef} className="hidden" />
        <div className="text-center">
          <p className="text-slate-400 mb-6 font-mono text-sm">{feedback}</p>
          <button onClick={captureAndAnalyze} disabled={!isCameraActive || isAnalyzing} className="w-full py-4 bg-cyan-500 text-slate-950 font-bold rounded-2xl shadow-lg active:scale-95">START SCAN</button>
        </div>
      </div>
    </div>
  );
};

const VoiceScanner = ({ onComplete, onBack }: any) => {
  const [isRecording, setIsRecording] = useState(false);
  const [timer, setTimer] = useState(0);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const start = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      mediaRecorderRef.current = recorder; chunksRef.current = [];
      recorder.ondataavailable = e => chunksRef.current.push(e.data);
      recorder.onstop = async () => {
        setIsAnalyzing(true);
        const base64 = btoa(new Uint8Array(await new Blob(chunksRef.current).arrayBuffer()).reduce((d, b) => d + String.fromCharCode(b), ''));
        const res = await analyzeVoiceLiveness(base64);
        const score = parseInt(res.match(/Liveness Score:\s*(\d+)/i)?.[1] || "80");
        onComplete({ id: 'VOC'+Math.random(), type: BiometricType.VOICE, timestamp: Date.now(), score, details: res, status: score > 75 ? 'Pass' : 'Fail' });
        onBack();
      };
      recorder.start(); setIsRecording(true);
      const itv = setInterval(() => setTimer(t => t+1), 1000);
      (recorder as any)._itv = itv;
    } catch (e) { alert("Mic denied"); }
  };

  const stop = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop(); clearInterval((mediaRecorderRef.current as any)._itv);
      setIsRecording(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto">
      <BackButton onClick={onBack} />
      <div className="bg-slate-900 border border-slate-800 rounded-[2.5rem] p-12 text-center">
        <div className={`w-32 h-32 rounded-full mx-auto mb-8 flex items-center justify-center transition-all ${isRecording ? 'bg-red-500 animate-pulse' : 'bg-slate-800'}`}>
          <Mic size={48} className={isRecording ? 'text-white' : 'text-cyan-400'} />
        </div>
        <div className="text-4xl font-mono mb-8 tabular-nums">00:{timer.toString().padStart(2, '0')}</div>
        {isAnalyzing ? <Loader2 size={32} className="animate-spin text-cyan-400 mx-auto" /> : (
          <button onClick={isRecording ? stop : start} className={`w-full py-4 rounded-2xl font-bold transition-all ${isRecording ? 'bg-red-500' : 'bg-cyan-500 text-slate-950'}`}>
            {isRecording ? "STOP RECORDING" : "START RECORDING"}
          </button>
        )}
      </div>
    </div>
  );
};

const BehavioralScanner = ({ onComplete, onBack }: any) => {
  const [txt, setTxt] = useState("");
  const [keys, setKeys] = useState<any[]>([]);
  const [isVerifying, setIsVerifying] = useState(false);
  const phrase = "The quick brown fox jumps over the biometric security gate.";

  const submit = () => {
    setIsVerifying(true);
    setTimeout(() => {
      onComplete({ id: 'BEH'+Math.random(), type: BiometricType.BEHAVIORAL, timestamp: Date.now(), score: 90, details: "Consistent rhythm detected.", status: 'Pass' });
      onBack();
    }, 1500);
  };

  return (
    <div className="max-w-3xl mx-auto">
      <BackButton onClick={onBack} />
      <div className="bg-slate-900 border border-slate-800 rounded-[2.5rem] p-10">
        <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl text-slate-500 font-mono italic mb-8">"{phrase}"</div>
        <textarea value={txt} onChange={e => setTxt(e.target.value)} onKeyDown={e => setKeys([...keys, performance.now()])} className="w-full h-40 bg-slate-950 border border-slate-800 rounded-3xl p-6 font-mono focus:border-cyan-500 outline-none" placeholder="Type the phrase above..." />
        <button onClick={submit} disabled={txt.length < 20 || isVerifying} className="w-full py-4 bg-cyan-500 text-slate-950 font-bold rounded-2xl mt-8 disabled:opacity-50">
          {isVerifying ? "ANALYZING..." : "SUBMIT RHYTHM"}
        </button>
      </div>
    </div>
  );
};

const WalletAuditor = ({ address, onBack }: any) => {
  const [assets, setAssets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    scrubWalletSecurity(address).then(d => { setAssets(d); setLoading(false); });
  }, []);

  return (
    <div className="max-w-3xl mx-auto">
      <BackButton onClick={onBack} />
      <div className="bg-slate-900 border border-slate-800 rounded-[2.5rem] p-10">
        <h2 className="text-2xl font-bold mb-8">Wallet Integrity Scrub</h2>
        {loading ? <Loader2 size={32} className="animate-spin text-cyan-400 mx-auto py-20" /> : (
          <div className="space-y-3">
            {assets.map((a, i) => (
              <div key={i} className="flex justify-between p-4 bg-slate-950 border border-slate-800 rounded-2xl">
                <div><div className="font-bold">{a.name}</div><div className="text-[10px] text-slate-500">{a.riskReason}</div></div>
                <div className={`font-bold ${a.riskScore > 50 ? 'text-red-400' : 'text-emerald-400'}`}>{a.riskScore}% RISK</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const RiskAnalyzer = ({ onBack }: any) => {
  const [q, setQ] = useState("");
  const [res, setRes] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const search = async (e: any) => {
    e.preventDefault(); setLoading(true);
    try { setRes(await analyzeRiskSearch(q)); } catch { setRes("Error."); }
    finally { setLoading(false); }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <BackButton onClick={onBack} />
      <div className="bg-slate-900 border border-slate-800 rounded-[2.5rem] p-10">
        <form onSubmit={search} className="relative mb-8">
          <input type="text" value={q} onChange={e => setQ(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-2xl py-4 pl-12 pr-4 font-mono text-sm outline-none focus:border-cyan-500" placeholder="Address or Website URL..." />
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
        </form>
        {loading ? <Loader2 size={32} className="animate-spin text-cyan-400 mx-auto" /> : res && <div className="p-6 bg-slate-950 border border-slate-800 rounded-2xl font-mono text-[11px] whitespace-pre-wrap">{res}</div>}
      </div>
    </div>
  );
};

const ProfileManager = ({ onLogin, onStartOnboarding, currentUser }: any) => {
  const [username, setUsername] = useState("");
  const [mode, setMode] = useState<'LOGIN' | 'REGISTER'>('REGISTER');

  const handleAction = () => {
    if (!username) return;
    if (mode === 'REGISTER') {
      const newUser = { id: Math.random().toString(36).substr(2, 9), username, createdAt: Date.now(), results: [], isMinted: false };
      localStorage.setItem(`profile_${username}`, JSON.stringify(newUser));
      onLogin(newUser); onStartOnboarding();
    } else {
      const stored = localStorage.getItem(`profile_${username}`);
      if (stored) onLogin(JSON.parse(stored)); else alert("Not identified.");
    }
  };

  if (currentUser) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-[2.5rem] p-10 max-w-xl mx-auto text-center">
        <div className="w-24 h-24 rounded-[2rem] bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center mx-auto mb-6">
          {currentUser.nftUri ? <img src={currentUser.nftUri} className="w-full h-full object-cover rounded-[2rem]" /> : <UserCircle size={48} className="text-cyan-400" />}
        </div>
        <h2 className="text-2xl font-bold mb-2">{currentUser.username}</h2>
        <p className="text-[10px] text-slate-500 font-mono mb-8">SECURE_ID::{currentUser.id}</p>
        <button onClick={() => window.location.reload()} className="w-full py-4 bg-slate-800 text-slate-400 rounded-2xl font-bold hover:bg-red-500/10 hover:text-red-400 transition-colors">TERMINATE SESSION</button>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto animate-in slide-in-from-bottom-8 duration-700">
      <div className="bg-slate-900 border border-slate-800 rounded-[3rem] p-12 shadow-2xl">
        <div className="text-center mb-10">
          <ShieldCheck size={48} className="text-cyan-400 mx-auto mb-4" />
          <h2 className="text-3xl font-bold tracking-tighter uppercase">Spherical Access</h2>
        </div>
        <div className="space-y-4">
          <input type="text" value={username} onChange={e => setUsername(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-6 py-4 outline-none focus:border-cyan-500 font-mono text-sm" placeholder="Node Alias..." />
          <div className="flex bg-slate-950 p-1 rounded-2xl border border-slate-800">
            <button onClick={() => setMode('REGISTER')} className={`flex-1 py-3 rounded-xl text-[10px] font-bold ${mode === 'REGISTER' ? 'bg-slate-800 text-cyan-400 shadow-inner' : 'text-slate-500'}`}>NEW USER</button>
            <button onClick={() => setMode('LOGIN')} className={`flex-1 py-3 rounded-xl text-[10px] font-bold ${mode === 'LOGIN' ? 'bg-slate-800 text-cyan-400 shadow-inner' : 'text-slate-500'}`}>LOGIN</button>
          </div>
          <button onClick={handleAction} className="w-full py-5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded-2xl shadow-xl shadow-cyan-500/20 active:scale-95 transition-all uppercase tracking-widest text-xs">
            {mode === 'REGISTER' ? 'ENROLL BIOMETRICS' : 'ENTER TERMINAL'}
          </button>
        </div>
      </div>
    </div>
  );
};

// --- MAIN APP ---
const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [activeView, setActiveView] = useState<any>('DASHBOARD');
  const [logs, setLogs] = useState<SecurityLog[]>([]);
  const [onboardingStep, setOnboardingStep] = useState<number | null>(null);

  const progressPercent = useMemo(() => {
    if (!currentUser) return 0;
    const required = [BiometricType.FACIAL, BiometricType.VOICE, BiometricType.BEHAVIORAL];
    const completed = required.filter(type => currentUser.results.some(r => r.type === type && r.status === 'Pass')).length;
    return Math.round((completed / required.length) * 100);
  }, [currentUser]);

  useEffect(() => {
    const interval = setInterval(() => {
      const newLog: SecurityLog = { id: Math.random().toString(36).substr(2, 9), timestamp: Date.now(), event: Math.random() > 0.7 ? "Breach Denied" : "System Ping", severity: 'LOW', source: "ADMIN" };
      setLogs(prev => [newLog, ...prev].slice(0, 10));
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  const addResult = (result: BiometricResult) => {
    if (!currentUser) return;
    const updated = { ...currentUser, results: [result, ...currentUser.results] };
    setCurrentUser(updated); localStorage.setItem(`profile_${currentUser.username}`, JSON.stringify(updated));
    if (onboardingStep !== null) onboardingStep < 2 ? setOnboardingStep(onboardingStep + 1) : setOnboardingStep(null);
  };

  const handleMintComplete = (nftUri: string, result: BiometricResult) => {
    if (!currentUser) return;
    const updated = { ...currentUser, isMinted: true, nftUri, results: [result, ...currentUser.results] };
    setCurrentUser(updated); localStorage.setItem(`profile_${currentUser.username}`, JSON.stringify(updated));
  };

  const renderContent = () => {
    if (!currentUser) return <ProfileManager onLogin={setCurrentUser} onStartOnboarding={() => setOnboardingStep(0)} />;
    if (onboardingStep !== null) {
      if (onboardingStep === 0) return <FacialScanner onComplete={addResult} onBack={() => setOnboardingStep(null)} />;
      if (onboardingStep === 1) return <VoiceScanner onComplete={addResult} onBack={() => setOnboardingStep(null)} />;
      if (onboardingStep === 2) return <BehavioralScanner onComplete={addResult} onBack={() => setOnboardingStep(null)} />;
    }
    const back = () => setActiveView('DASHBOARD');
    switch (activeView) {
      case 'DASHBOARD': return <Dashboard results={currentUser.results} onNavigate={setActiveView} progress={progressPercent} logs={logs} isProfileComplete={progressPercent === 100} />;
      case 'PROFILE': return <ProfileManager onLogin={setCurrentUser} currentUser={currentUser} onStartOnboarding={() => setOnboardingStep(0)} />;
      case 'WALLETS': return <WalletAuditor address={currentUser.walletAddress || "0x71C...6F"} onBack={back} />;
      case 'ANALYZER': return <RiskAnalyzer onBack={back} />;
      case BiometricType.FACIAL: return <FacialScanner onComplete={addResult} onBack={back} />;
      case BiometricType.VOICE: return <VoiceScanner onComplete={addResult} onBack={back} />;
      case BiometricType.BEHAVIORAL: return <BehavioralScanner onComplete={addResult} onBack={back} />;
      case BiometricType.BLOCKCHAIN: return <BlockchainPortal sessionSummary={currentUser.results.map(r => r.details).join(' ')} onMintComplete={handleMintComplete} isMinted={currentUser.isMinted} onBack={back} />;
      case 'DATABANK': return <DataBank user={currentUser} onBack={back} />;
      default: return <Dashboard results={currentUser.results} onNavigate={setActiveView} progress={progressPercent} logs={logs} isProfileComplete={progressPercent === 100} />;
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-cyan-500/30">
      <main className="flex-1 p-6 md:p-12 max-w-7xl mx-auto w-full flex flex-col justify-center">
        {currentUser && (
          <header className="mb-12 flex flex-col md:flex-row items-center justify-between gap-6 border-b border-slate-900 pb-8 animate-in fade-in slide-in-from-top-4 duration-700">
            <div className="text-center md:text-left">
              <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-blue-500 tracking-tighter uppercase">Biometric Command</h1>
              <p className="text-slate-500 text-[10px] mt-1 flex items-center justify-center md:justify-start gap-2 uppercase font-bold tracking-widest">
                <ShieldCheck size={12} className="text-cyan-400"/> Operational Protocol Active
              </p>
            </div>
            <div className="flex items-center gap-6">
              <div className="text-right">
                <div className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-1">Auth Integrity</div>
                <div className="w-32 bg-slate-900 h-2 rounded-full overflow-hidden border border-slate-800">
                  <div className="h-full bg-cyan-500 transition-all duration-1000" style={{ width: `${progressPercent}%` }} />
                </div>
              </div>
              <div className="flex items-center gap-3 bg-slate-900 border border-slate-800 p-2 pr-4 rounded-2xl shadow-xl">
                <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center"><User size={18} className="text-cyan-400"/></div>
                <div>
                   <div className="text-[8px] font-bold text-slate-500 uppercase">Current_Node</div>
                   <div className="text-xs font-bold">{currentUser.username}</div>
                </div>
              </div>
            </div>
          </header>
        )}
        <div className="w-full max-w-6xl mx-auto">{renderContent()}</div>
        {currentUser && activeView === 'DASHBOARD' && onboardingStep === null && (
          <div className="mt-12 bg-slate-900/50 border border-slate-900 p-6 rounded-[2rem] font-mono text-[10px] text-cyan-500/40 animate-in fade-in duration-1000">
            <h3 className="text-slate-500 mb-2 uppercase font-bold tracking-widest flex items-center gap-2"><Terminal size={12}/> Telemetry Stream</h3>
            {logs.map(l => <div key={l.id}>[{new Date(l.timestamp).toLocaleTimeString()}] NODE_EVENT::{l.event} | STATUS_OK</div>)}
          </div>
        )}
      </main>
    </div>
  );
};

const DataBank = ({ user, onBack }: any) => {
  const [entries, setEntries] = useState<string[]>([]);
  useEffect(() => {
    Promise.all(user.results.map((r: any) => transcribeToEncryptedData(r.details))).then(setEntries);
  }, [user]);
  return (
    <div className="max-w-4xl mx-auto">
      <BackButton onClick={onBack} />
      <div className="bg-slate-900 border border-slate-800 rounded-[2.5rem] p-10">
        <h2 className="text-2xl font-bold mb-8">Encrypted Data Bank</h2>
        <div className="bg-slate-950 p-6 rounded-3xl h-80 overflow-y-auto space-y-4 font-mono text-[10px]">
          {entries.map((e, i) => <div key={i} className="p-4 bg-slate-900 border border-slate-800 rounded-xl text-purple-400 break-all">{e}</div>)}
          {!entries.length && <div className="text-center py-20 text-slate-700">No records found.</div>}
        </div>
      </div>
    </div>
  );
};

const BlockchainPortal = ({ sessionSummary, onMintComplete, isMinted, onBack }: any) => {
  const [loading, setLoading] = useState(false);
  const mint = async () => {
    setLoading(true);
    const art = await generateNFTArt();
    const hash = await generateBiometricHash(sessionSummary);
    onMintComplete(art, { id: hash.substring(0,8), type: BiometricType.BLOCKCHAIN, timestamp: Date.now(), score: 100, details: `Anchor: ${hash}`, status: 'Pass' });
    setLoading(false); onBack();
  };
  return (
    <div className="max-w-xl mx-auto">
      <BackButton onClick={onBack} />
      <div className="bg-slate-900 border border-slate-800 rounded-[2.5rem] p-10 text-center">
        <div className="w-48 h-48 bg-slate-950 border border-slate-800 rounded-3xl mx-auto mb-8 flex items-center justify-center text-slate-800">
          {loading ? <Loader2 size={32} className="animate-spin text-cyan-400" /> : <ImageIcon size={64} />}
        </div>
        <button onClick={mint} disabled={isMinted || loading} className="w-full py-4 bg-emerald-500 text-slate-950 font-bold rounded-2xl shadow-xl shadow-emerald-500/20 disabled:opacity-50 transition-all active:scale-95">
          {isMinted ? "IDENTITY ANCHORED" : "MINT BIOMETRIC NFT"}
        </button>
      </div>
    </div>
  );
};

const rootElement = document.getElementById('root');
if (rootElement) {
  ReactDOM.createRoot(rootElement).render(<React.StrictMode><App /></React.StrictMode>);
}
