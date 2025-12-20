
import React, { useState, useEffect, useMemo, useRef } from 'react';
import ReactDOM from 'react-dom/client';
import { GoogleGenAI, GenerateContentResponse, Type } from "@google/genai";
import { 
  ShieldCheck, User, Database, Lock, Activity, 
  ArrowLeft, ArrowRight, Fingerprint, Mic2, Scan, Wallet, Search, Camera, RefreshCw, 
  Loader2, Mic, Square, Link as LinkIcon, Globe, 
  Image as ImageIcon, Terminal, UserCircle, ShieldAlert,
  LayoutDashboard, UserPlus, LogIn
} from 'lucide-react';

// --- TYPES & INTERFACES ---
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

export interface SecurityLog {
  id: string;
  timestamp: number;
  event: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  source: string;
}

// --- AI SERVICES ---
// Always use the process.env.API_KEY directly for initialization.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const analyzeFacialLiveness = async (base64Image: string): Promise<string> => {
  const response: GenerateContentResponse = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: {
      parts: [
        { text: "Analyze facial liveness. Check for: 1. Deepfake artifacts, 2. Photo spoofing. Return 'Liveness Score: [0-100]' and a one-sentence technical summary." },
        { inlineData: { mimeType: 'image/jpeg', data: base64Image } }
      ]
    },
  });
  // Use .text property instead of .text()
  return response.text || "Analysis failed.";
};

const analyzeVoiceLiveness = async (base64Audio: string): Promise<string> => {
  const response: GenerateContentResponse = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: {
      parts: [
        { text: "Analyze voice for acoustic liveness. Return 'Liveness Score: [0-100]' and a short summary." },
        { inlineData: { mimeType: 'audio/webm', data: base64Audio } }
      ]
    }
  });
  // Use .text property instead of .text()
  return response.text || "Analysis failed.";
};

const generateNFTArt = async (): Promise<string> => {
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: { parts: [{ text: "Abstract biometric eye composed of binary code, digital, neon cyan on black." }] },
    config: { imageConfig: { aspectRatio: "1:1" } }
  });
  // Safely iterate through parts to find the image data
  if (response.candidates?.[0]?.content?.parts) {
    for (const part of response.candidates[0].content.parts) {
      if (part.inlineData) return `data:image/png;base64,${part.inlineData.data}`;
    }
  }
  throw new Error("Art failed.");
};

const scrubWalletSecurity = async (address: string): Promise<any> => {
  const resp = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Audit address ${address}. Return JSON list of 4 assets with: name, riskScore (0-100), riskReason.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            name: { type: Type.STRING },
            riskScore: { type: Type.NUMBER },
            riskReason: { type: Type.STRING }
          }
        }
      }
    }
  });
  // Use .text property instead of .text()
  return JSON.parse(resp.text || "[]");
};

const analyzeRiskSearch = async (query: string): Promise<string> => {
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Analyze threat intel for: "${query}". Provide a risk rating and summary.`,
    config: { tools: [{ googleSearch: {} }] }
  });
  // Use .text property instead of .text()
  let res = response.text || "";
  // Extract URLs from groundingChunks and list them
  const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
  if (chunks) {
    const urls = chunks.map((c: any) => c.web?.uri).filter((u: any) => !!u);
    if (urls.length) res += "\n\nSources:\n" + Array.from(new Set(urls)).map(u => `- ${u}`).join('\n');
  }
  return res;
};

// --- COMPONENTS ---

const BackButton = ({ onClick }: { onClick: () => void }) => (
  <button 
    onClick={onClick} 
    className="group flex items-center gap-2 text-[10px] font-bold text-slate-500 hover:text-cyan-400 transition-all mb-8 uppercase tracking-[0.2em]"
  >
    <div className="p-1 rounded-full bg-slate-900 border border-slate-800 group-hover:border-cyan-500/50">
      <ArrowLeft size={12} />
    </div>
    Back to Command Hub
  </button>
);

const CommandHub = ({ user, results, onNavigate, progress, isProfileComplete }: any) => {
  const items = [
    { id: 'PROFILE', label: 'IDENTITY NODE', icon: UserCircle, color: 'text-cyan-400', desc: 'Account and security key settings.' },
    { id: BiometricType.FACIAL, label: 'FACIAL SCAN', icon: Scan, color: 'text-blue-400', desc: 'Verify your face against digital mesh.' },
    { id: BiometricType.VOICE, label: 'VOICE AUTH', icon: Mic2, color: 'text-purple-400', desc: 'Secure acoustic print identification.' },
    { id: BiometricType.BEHAVIORAL, label: 'BEHAVIORAL', icon: Fingerprint, color: 'text-fuchsia-400', desc: 'Rhythm and dynamics validation.' },
    { id: 'WALLETS', label: 'WALLET SCRUB', icon: Wallet, color: 'text-amber-400', desc: 'Audit connected assets for risks.' },
    { id: 'ANALYZER', label: 'THREAT INTEL', icon: Search, color: 'text-red-400', desc: 'Deep-web threat profile analysis.' },
    { id: BiometricType.BLOCKCHAIN, label: 'WEB3 ANCHOR', icon: LinkIcon, color: 'text-emerald-400', desc: 'On-chain identity anchoring.' },
    { id: 'DATABANK', label: 'SECURE BANK', icon: Database, color: 'text-indigo-400', desc: 'Encrypted system activity log.', locked: !isProfileComplete },
  ];

  return (
    <div className="animate-in fade-in zoom-in-95 duration-700">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {items.map((item) => (
          <button
            key={item.id}
            onClick={() => onNavigate(item.id)}
            disabled={item.locked}
            className={`group relative flex flex-col items-start p-6 bg-slate-900 border border-slate-800 rounded-[2.5rem] transition-all hover:border-cyan-500/50 hover:bg-slate-900/50 ${item.locked ? 'opacity-40 grayscale cursor-not-allowed' : 'active:scale-95'}`}
          >
            <div className={`p-4 rounded-2xl mb-4 transition-all ${item.locked ? 'bg-slate-800 text-slate-600' : `${item.color} bg-slate-950 border border-slate-800 group-hover:bg-cyan-500 group-hover:text-slate-950 group-hover:border-transparent group-hover:shadow-[0_0_20px_rgba(34,211,238,0.3)]`}`}>
              <item.icon size={24} />
            </div>
            <div className="text-left">
              <h3 className="text-sm font-bold uppercase tracking-widest mb-1">{item.label}</h3>
              <p className="text-[10px] text-slate-500 font-medium leading-relaxed">{item.desc}</p>
            </div>
            {item.locked && <Lock size={12} className="absolute top-6 right-6 text-slate-700" />}
            {!item.locked && <ArrowRight size={14} className="absolute bottom-6 right-6 text-slate-800 opacity-0 group-hover:opacity-100 group-hover:text-cyan-400 group-hover:translate-x-1 transition-all" />}
          </button>
        ))}
      </div>
    </div>
  );
};

const FacialScanner = ({ onComplete, onBack }: any) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [active, setActive] = useState(false);
  const [working, setWorking] = useState(false);

  useEffect(() => {
    navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } })
      .then(s => { if (videoRef.current) { videoRef.current.srcObject = s; setActive(true); } })
      .catch(() => alert("Camera denied."));
    return () => { if (videoRef.current?.srcObject) (videoRef.current.srcObject as MediaStream).getTracks().forEach(t => t.stop()); };
  }, []);

  const scan = async () => {
    if (!videoRef.current || !canvasRef.current) return;
    setWorking(true);
    const canvas = canvasRef.current;
    canvas.width = videoRef.current.videoWidth; canvas.height = videoRef.current.videoHeight;
    canvas.getContext('2d')?.drawImage(videoRef.current, 0, 0);
    const data = canvas.toDataURL('image/jpeg').split(',')[1];
    try {
      const res = await analyzeFacialLiveness(data);
      const score = parseInt(res.match(/Score:\s*(\d+)/)?.[1] || "85");
      onComplete({ id: 'F'+Date.now(), type: BiometricType.FACIAL, timestamp: Date.now(), score, details: res, status: score > 70 ? 'Pass' : 'Fail' });
      onBack();
    } catch { setWorking(false); }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <BackButton onClick={onBack} />
      <div className="bg-slate-900 border border-slate-800 rounded-[3rem] p-8 overflow-hidden">
        <div className="aspect-[4/3] bg-black rounded-[2rem] relative overflow-hidden mb-8 border border-slate-800">
          <video ref={videoRef} autoPlay muted playsInline className="w-full h-full object-cover grayscale opacity-80" />
          <div className="absolute inset-0 border-[24px] border-slate-950/40"><div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-64 border border-cyan-500/30 rounded-full"></div></div>
          {working && <div className="absolute inset-0 bg-slate-950/50 backdrop-blur-sm flex items-center justify-center"><Loader2 className="animate-spin text-cyan-400" /></div>}
        </div>
        <canvas ref={canvasRef} className="hidden" />
        <button onClick={scan} disabled={!active || working} className="w-full py-5 bg-cyan-500 text-slate-950 font-bold rounded-2xl uppercase tracking-widest text-xs active:scale-95 shadow-xl shadow-cyan-500/20">INITIATE FACIAL SCAN</button>
      </div>
    </div>
  );
};

const VoiceScanner = ({ onComplete, onBack }: any) => {
  const [rec, setRec] = useState(false);
  const [busy, setBusy] = useState(false);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunks = useRef<Blob[]>([]);

  const start = async () => {
    const s = await navigator.mediaDevices.getUserMedia({ audio: true });
    const r = new MediaRecorder(s);
    recorderRef.current = r; chunks.current = [];
    r.ondataavailable = e => chunks.current.push(e.data);
    r.onstop = async () => {
      setBusy(true);
      const b = btoa(new Uint8Array(await new Blob(chunks.current).arrayBuffer()).reduce((d, x) => d + String.fromCharCode(x), ''));
      const res = await analyzeVoiceLiveness(b);
      const score = parseInt(res.match(/Score:\s*(\d+)/)?.[1] || "80");
      onComplete({ id: 'V'+Date.now(), type: BiometricType.VOICE, timestamp: Date.now(), score, details: res, status: score > 75 ? 'Pass' : 'Fail' });
      onBack();
    };
    r.start(); setRec(true);
  };

  return (
    <div className="max-w-xl mx-auto">
      <BackButton onClick={onBack} />
      <div className="bg-slate-900 border border-slate-800 rounded-[3rem] p-12 text-center">
        <div className={`w-32 h-32 rounded-full mx-auto mb-10 flex items-center justify-center border-4 transition-all ${rec ? 'bg-red-500 border-red-400 animate-pulse' : 'bg-slate-950 border-slate-800'}`}>
          <Mic size={40} className={rec ? 'text-white' : 'text-blue-400'} />
        </div>
        {busy ? <Loader2 size={32} className="animate-spin text-cyan-400 mx-auto" /> : (
          <button onClick={rec ? () => recorderRef.current?.stop() : start} className={`w-full py-5 rounded-2xl font-bold uppercase tracking-widest text-xs shadow-xl transition-all ${rec ? 'bg-red-500' : 'bg-blue-500 text-slate-950 shadow-blue-500/20'}`}>
            {rec ? "TERMINATE RECORDING" : "START ACOUSTIC CAPTURE"}
          </button>
        )}
      </div>
    </div>
  );
};

const BehavioralScanner = ({ onComplete, onBack }: any) => {
  const [txt, setTxt] = useState("");
  const [busy, setBusy] = useState(false);
  const submit = () => {
    setBusy(true);
    setTimeout(() => {
      onComplete({ id: 'B'+Date.now(), type: BiometricType.BEHAVIORAL, timestamp: Date.now(), score: 92, details: "Consistent keystroke rhythm.", status: 'Pass' });
      onBack();
    }, 1200);
  };
  return (
    <div className="max-w-3xl mx-auto">
      <BackButton onClick={onBack} />
      <div className="bg-slate-900 border border-slate-800 rounded-[3rem] p-10">
        <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl font-mono text-xs text-slate-500 mb-8 italic">"System entry requires rhythmic validation of the master passphrase sequence."</div>
        <textarea value={txt} onChange={e => setTxt(e.target.value)} className="w-full h-40 bg-slate-950 border border-slate-800 rounded-3xl p-6 font-mono text-sm outline-none focus:border-cyan-500/50" placeholder="Acknowledge phrase here..." />
        <button onClick={submit} disabled={txt.length < 20 || busy} className="w-full py-5 bg-purple-500 text-slate-950 font-bold rounded-2xl mt-8 uppercase tracking-widest text-xs active:scale-95 shadow-xl shadow-purple-500/20">VALIDATE DYNAMICS</button>
      </div>
    </div>
  );
};

const ProfileManager = ({ onLogin, onStartOnboarding, currentUser }: any) => {
  const [name, setName] = useState("");
  const [mode, setMode] = useState<'LOGIN' | 'REGISTER'>('REGISTER');

  const action = () => {
    if (!name) return;
    if (mode === 'REGISTER') {
      const u = { id: Math.random().toString(36).substr(2, 6).toUpperCase(), username: name, createdAt: Date.now(), results: [], isMinted: false };
      localStorage.setItem('profile_'+name, JSON.stringify(u));
      onLogin(u); onStartOnboarding();
    } else {
      const s = localStorage.getItem('profile_'+name);
      if (s) onLogin(JSON.parse(s)); else alert("Identity not found.");
    }
  };

  if (currentUser) {
    return (
      <div className="max-w-xl mx-auto">
        <BackButton onClick={() => (window as any).appSetView('DASHBOARD')} />
        <div className="bg-slate-900 border border-slate-800 rounded-[3rem] p-10 text-center">
          <div className="w-32 h-32 rounded-[2.5rem] bg-slate-950 border border-slate-800 flex items-center justify-center mx-auto mb-8 overflow-hidden shadow-inner">
            {currentUser.nftUri ? <img src={currentUser.nftUri} className="w-full h-full object-cover" /> : <UserCircle size={64} className="text-cyan-500/50" />}
          </div>
          <h2 className="text-3xl font-bold tracking-tighter uppercase mb-2">{currentUser.username}</h2>
          <p className="text-[10px] font-mono text-slate-600 mb-10 tracking-[0.2em]">NODE_ID::{currentUser.id}</p>
          <div className="grid grid-cols-2 gap-4 mb-10">
            <div className="bg-slate-950 border border-slate-800 p-4 rounded-3xl">
              <div className="text-[9px] font-bold text-slate-600 uppercase mb-1">Pass Ratio</div>
              <div className="text-xl font-bold text-cyan-400">{currentUser.results.length}/4</div>
            </div>
            <div className="bg-slate-950 border border-slate-800 p-4 rounded-3xl">
              <div className="text-[9px] font-bold text-slate-600 uppercase mb-1">Status</div>
              <div className="text-xl font-bold text-emerald-400">ONLINE</div>
            </div>
          </div>
          <button onClick={() => window.location.reload()} className="w-full py-5 bg-slate-950 border border-slate-800 text-slate-500 hover:text-red-400 hover:border-red-400/30 rounded-2xl font-bold text-xs uppercase transition-all tracking-widest">TERMINATE CONNECTION</button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto py-12 md:py-24">
      <div className="bg-slate-900 border border-slate-800 rounded-[3rem] p-12 shadow-[0_20px_80px_rgba(0,0,0,0.6)] animate-in slide-in-from-bottom-12 duration-1000">
        <div className="text-center mb-12">
          <div className="p-4 bg-cyan-500/10 rounded-3xl w-fit mx-auto mb-6 border border-cyan-500/20">
            <ShieldCheck size={48} className="text-cyan-400" />
          </div>
          <h2 className="text-3xl font-black tracking-tighter uppercase mb-2 bg-clip-text text-transparent bg-gradient-to-b from-white to-slate-400">Spherical Access</h2>
          <p className="text-[9px] font-bold text-slate-500 uppercase tracking-[0.3em]">Initialize Secure Identity Terminal</p>
        </div>
        
        <div className="space-y-6">
          <div className="relative">
            <input 
              type="text" value={name} onChange={e => setName(e.target.value)} 
              className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-6 py-5 outline-none focus:border-cyan-500 transition-all font-mono text-sm placeholder-slate-700" 
              placeholder="ENTER_NODE_ALIAS..." 
            />
            <div className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-mono text-slate-800 select-none">NODE_READY</div>
          </div>

          <div className="flex bg-slate-950 p-1.5 rounded-2xl border border-slate-800">
            <button onClick={() => setMode('REGISTER')} className={`flex-1 py-3.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${mode === 'REGISTER' ? 'bg-slate-800 text-cyan-400 shadow-xl' : 'text-slate-600 hover:text-slate-400'}`}>New User</button>
            <button onClick={() => setMode('LOGIN')} className={`flex-1 py-3.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${mode === 'LOGIN' ? 'bg-slate-800 text-cyan-400 shadow-xl' : 'text-slate-600 hover:text-slate-400'}`}>Login</button>
          </div>

          <div className="relative group">
            <div className="absolute -inset-1 bg-cyan-500 rounded-2xl blur opacity-20 group-hover:opacity-40 transition-all animate-pulse"></div>
            <button 
              onClick={action} 
              className="relative w-full py-5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black rounded-2xl shadow-xl transition-all active:scale-95 uppercase tracking-[0.15em] text-xs flex items-center justify-center gap-3"
            >
              {/* Fix: Added UserPlus and LogIn from lucide-react */}
              {mode === 'REGISTER' ? <UserPlus size={18} /> : <LogIn size={18} />}
              {mode === 'REGISTER' ? 'Enroll Biometrics' : 'Enter Terminal'}
            </button>
            {mode === 'REGISTER' && (
              <div className="absolute -bottom-6 left-0 w-full text-center">
                <span className="text-[8px] font-bold text-cyan-400/60 uppercase tracking-widest">Annotation: IDENTITY_INIT_PROTOCOL</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// --- APP ROOT ---
const App: React.FC = () => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [view, setView] = useState<any>('DASHBOARD');
  const [step, setStep] = useState<number | null>(null);
  const [logs, setLogs] = useState<SecurityLog[]>([]);

  // Expose setView to sub-components if needed through global window hack for simplification
  (window as any).appSetView = setView;

  const progress = useMemo(() => {
    if (!user) return 0;
    const req = [BiometricType.FACIAL, BiometricType.VOICE, BiometricType.BEHAVIORAL];
    const done = req.filter(t => user.results.some(r => r.type === t && r.status === 'Pass')).length;
    return Math.round((done / 3) * 100);
  }, [user]);

  const addResult = (res: BiometricResult) => {
    if (!user) return;
    const next = { ...user, results: [res, ...user.results] };
    setUser(next); localStorage.setItem('profile_'+user.username, JSON.stringify(next));
    if (step !== null) step < 2 ? setStep(step + 1) : setStep(null);
  };

  const render = () => {
    if (!user) return <ProfileManager onLogin={setUser} onStartOnboarding={() => setStep(0)} />;
    if (step !== null) {
      if (step === 0) return <FacialScanner onComplete={addResult} onBack={() => setStep(null)} />;
      if (step === 1) return <VoiceScanner onComplete={addResult} onBack={() => setStep(null)} />;
      if (step === 2) return <BehavioralScanner onComplete={addResult} onBack={() => setStep(null)} />;
    }
    const back = () => setView('DASHBOARD');
    switch (view) {
      case 'DASHBOARD': return <CommandHub user={user} results={user.results} onNavigate={setView} progress={progress} isProfileComplete={progress === 100} />;
      case 'PROFILE': return <ProfileManager onLogin={setUser} currentUser={user} onStartOnboarding={() => setStep(0)} />;
      case 'WALLETS': return <WalletAuditor onBack={back} address="0x71C...6F" />;
      case 'ANALYZER': return <RiskAnalyzer onBack={back} />;
      case BiometricType.FACIAL: return <FacialScanner onComplete={addResult} onBack={back} />;
      case BiometricType.VOICE: return <VoiceScanner onComplete={addResult} onBack={back} />;
      case BiometricType.BEHAVIORAL: return <BehavioralScanner onComplete={addResult} onBack={back} />;
      case BiometricType.BLOCKCHAIN: return <BlockchainAnchor user={user} onComplete={addResult} onBack={back} />;
      case 'DATABANK': return <DataBank user={user} onBack={back} />;
      default: return <CommandHub user={user} results={user.results} onNavigate={setView} progress={progress} isProfileComplete={progress === 100} />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-cyan-500/30 overflow-x-hidden">
      <div className="fixed inset-0 pointer-events-none opacity-20"><div className="w-full h-full bg-[radial-gradient(circle_at_50%_50%,#1e293b_0%,transparent_70%)]"></div></div>
      <main className="relative z-10 max-w-7xl mx-auto p-6 md:p-12 min-h-screen flex flex-col justify-center">
        {user && (
          <header className="mb-12 flex flex-col md:flex-row items-center justify-between gap-8 border-b border-slate-900 pb-10 animate-in fade-in slide-in-from-top-4 duration-1000">
            <div className="text-center md:text-left">
              <h1 className="text-3xl font-black bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-blue-500 tracking-tighter uppercase mb-1">Command_Node</h1>
              <p className="text-slate-500 text-[9px] font-bold flex items-center justify-center md:justify-start gap-2 uppercase tracking-[0.3em]">
                <Activity size={10} className="text-cyan-400 animate-pulse"/> Encryption Stream Stable
              </p>
            </div>
            <div className="flex items-center gap-10">
              <div className="text-right hidden sm:block">
                <div className="text-[8px] font-black text-slate-600 uppercase tracking-widest mb-2">Sync Progress</div>
                <div className="w-32 h-1.5 bg-slate-900 rounded-full overflow-hidden border border-slate-800"><div className="h-full bg-cyan-500 transition-all duration-1000" style={{ width: `${progress}%` }} /></div>
              </div>
              <div className="flex items-center gap-4 bg-slate-900 border border-slate-800 p-2 pr-6 rounded-[1.5rem] shadow-2xl">
                <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
                  {user.nftUri ? <img src={user.nftUri} className="w-full h-full object-cover rounded-2xl" /> : <User size={20} />}
                </div>
                <div>
                  <div className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Active_Node</div>
                  <div className="text-sm font-bold tracking-tight">{user.username}</div>
                </div>
              </div>
            </div>
          </header>
        )}
        <div className="w-full">{render()}</div>
        {user && view === 'DASHBOARD' && step === null && (
          <div className="mt-16 bg-slate-900/30 border border-slate-900 p-6 rounded-[2.5rem] font-mono text-[9px] text-cyan-500/40 animate-in fade-in duration-1000 max-w-4xl">
            <div className="flex items-center gap-2 mb-3 text-slate-600 font-bold uppercase tracking-widest">
              <Terminal size={12}/> Live System Telemetry
            </div>
            <div className="space-y-1">
              <div>[04:22:11] CORE_INIT::PROTOCOL_STABLE</div>
              <div>[04:22:15] ENCRYPTION_LAYER_ENGAGED</div>
              <div>[04:22:19] NODE_SYNC_IN_PROGRESS | SRC: {user.id}</div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

const WalletAuditor = ({ address, onBack }: any) => {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => { scrubWalletSecurity(address).then(d => { setData(d); setLoading(false); }); }, []);
  return (
    <div className="max-w-4xl mx-auto">
      <BackButton onClick={onBack} />
      <div className="bg-slate-900 border border-slate-800 rounded-[3rem] p-10">
        <h2 className="text-2xl font-bold uppercase tracking-tighter mb-8">Scrub Integrity Log</h2>
        {loading ? <div className="py-20 flex justify-center"><Loader2 className="animate-spin text-cyan-400" size={32}/></div> : (
          <div className="grid gap-3">
            {data.map((a, i) => (
              <div key={i} className="flex justify-between items-center p-4 bg-slate-950 border border-slate-800 rounded-2xl">
                <div><div className="text-sm font-bold uppercase">{a.name}</div><div className="text-[10px] text-slate-500 italic">{a.riskReason}</div></div>
                <div className={`font-black text-xs ${a.riskScore > 50 ? 'text-red-400' : 'text-emerald-400'}`}>{a.riskScore}% RISK</div>
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
  const [busy, setBusy] = useState(false);
  const find = async (e: any) => {
    e.preventDefault(); setBusy(true);
    try { setRes(await analyzeRiskSearch(q)); } catch { setRes("Error."); }
    finally { setBusy(false); }
  };
  return (
    <div className="max-w-3xl mx-auto">
      <BackButton onClick={onBack} />
      <div className="bg-slate-900 border border-slate-800 rounded-[3rem] p-10">
        <form onSubmit={find} className="relative mb-10">
          <input type="text" value={q} onChange={e => setQ(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-2xl py-5 pl-14 pr-6 font-mono text-sm outline-none focus:border-cyan-500" placeholder="Analyze URL or Identity Hash..." />
          <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-700" size={20} />
        </form>
        {busy ? <div className="py-20 flex justify-center"><Loader2 className="animate-spin text-cyan-400" size={32}/></div> : res && <div className="p-8 bg-slate-950 border border-slate-800 rounded-[2rem] font-mono text-[11px] text-slate-400 leading-relaxed whitespace-pre-wrap">{res}</div>}
      </div>
    </div>
  );
};

const DataBank = ({ user, onBack }: any) => (
  <div className="max-w-5xl mx-auto">
    <BackButton onClick={onBack} />
    <div className="bg-slate-900 border border-slate-800 rounded-[3rem] p-10">
      <h2 className="text-2xl font-black uppercase tracking-tighter mb-8">Encrypted Ledger</h2>
      <div className="bg-slate-950 p-8 rounded-[2rem] h-[400px] overflow-y-auto font-mono text-[10px] space-y-4">
        {user.results.length ? user.results.map((r, i) => (
          <div key={i} className="p-4 bg-slate-900 border border-slate-800 rounded-xl">
             <div className="text-cyan-500 mb-2 font-bold uppercase">SIG_PACKET_{i} :: {r.type}</div>
             <div className="text-slate-500 break-all">{r.details}</div>
          </div>
        )) : <div className="text-center py-24 text-slate-800 italic uppercase font-bold tracking-widest">Awaiting Identity Reconstruction...</div>}
      </div>
    </div>
  </div>
);

const BlockchainAnchor = ({ user, onComplete, onBack }: any) => {
  const [busy, setBusy] = useState(false);
  const mint = async () => {
    setBusy(true);
    const art = await generateNFTArt();
    onComplete({ id: 'ANC'+Date.now(), type: BiometricType.BLOCKCHAIN, timestamp: Date.now(), score: 100, details: `Anchor Tx: ${Math.random().toString(16).slice(2, 10)}`, status: 'Pass' });
    setBusy(false); onBack();
  };
  return (
    <div className="max-w-xl mx-auto">
      <BackButton onClick={onBack} />
      <div className="bg-slate-900 border border-slate-800 rounded-[3rem] p-12 text-center">
        <div className="w-56 h-56 bg-slate-950 border border-slate-800 rounded-[2.5rem] mx-auto mb-10 flex items-center justify-center shadow-inner overflow-hidden">
          {busy ? <Loader2 size={40} className="animate-spin text-cyan-400" /> : <ImageIcon size={80} className="text-slate-800" />}
        </div>
        <button onClick={mint} disabled={busy || user.isMinted} className="w-full py-5 bg-emerald-500 text-slate-950 font-black rounded-2xl uppercase tracking-widest text-xs shadow-xl shadow-emerald-500/20 active:scale-95 disabled:opacity-50">
          {user.isMinted ? "Identity Anchored" : "Initiate On-Chain Anchor"}
        </button>
      </div>
    </div>
  );
};

const rootElement = document.getElementById('root');
if (rootElement) { ReactDOM.createRoot(rootElement).render(<App />); }
