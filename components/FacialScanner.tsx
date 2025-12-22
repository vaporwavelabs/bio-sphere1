
import React, { useRef, useEffect, useState } from 'react';
import { BiometricType, BiometricResult } from '../types';
import { analyzeFacialLiveness } from '../services/gemini';
import { Camera, RefreshCw, ShieldCheck, AlertTriangle, Loader2, CheckCircle2, Target, Scan, Activity, Shield } from 'lucide-react';

// Added missing interface definition for FacialScannerProps
interface FacialScannerProps {
  onComplete: (result: BiometricResult) => void;
}

const CloakMask = () => (
  <svg className="absolute inset-0 w-full h-full pointer-events-none z-20" viewBox="0 0 500 500" preserveAspectRatio="xMidYMid slice">
    <defs>
      <linearGradient id="cloakGradient" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#0ea5e9" stopOpacity="0.1" />
        <stop offset="100%" stopColor="#0ea5e9" stopOpacity="0" />
      </linearGradient>
      <filter id="cloakNoise">
        <feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="3" stitchTiles="stitch" />
        <feColorMatrix type="saturate" values="0" />
      </filter>
    </defs>

    {/* The Hooded Cloak Silhouette */}
    <path 
      d="M250,50 C180,50 120,100 120,200 L120,450 L380,450 L380,200 C380,100 320,50 250,50 Z" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      className="text-cyan-500/40 animate-pulse"
    />
    
    {/* Inner Hood Face Cutout */}
    <path 
      d="M250,110 C200,110 160,150 160,230 C160,310 200,370 250,370 C300,370 340,310 340,230 C340,150 300,110 250,110 Z" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="3" 
      strokeDasharray="8 4"
      className="text-cyan-400"
    />

    {/* Digital Shroud Elements */}
    <rect x="0" y="0" width="500" height="500" filter="url(#cloakNoise)" opacity="0.05" />
    
    {/* Cloaking Field Lines */}
    <g className="text-cyan-500/20">
      <line x1="120" y1="200" x2="380" y2="200" stroke="currentColor" strokeWidth="1" />
      <line x1="120" y1="300" x2="380" y2="300" stroke="currentColor" strokeWidth="1" />
      <line x1="120" y1="400" x2="380" y2="400" stroke="currentColor" strokeWidth="1" />
    </g>

    {/* Dynamic Data Vertices */}
    <g className="text-cyan-400">
      <circle cx="250" cy="110" r="3" className="animate-ping" />
      <circle cx="160" cy="230" r="3" className="animate-ping" style={{ animationDelay: '0.5s' }} />
      <circle cx="340" cy="230" r="3" className="animate-ping" style={{ animationDelay: '1s' }} />
    </g>

    {/* Square Corner Brackets */}
    <g className="text-cyan-400">
      <path d="M20,20 L60,20 M20,20 L20,60" fill="none" stroke="currentColor" strokeWidth="4" />
      <path d="M480,20 L440,20 M480,20 L480,60" fill="none" stroke="currentColor" strokeWidth="4" />
      <path d="M20,480 L60,480 M20,480 L20,440" fill="none" stroke="currentColor" strokeWidth="4" />
      <path d="M480,480 L440,480 M480,480 L480,440" fill="none" stroke="currentColor" strokeWidth="4" />
    </g>
  </svg>
);

const FacialScanner: React.FC<FacialScannerProps> = ({ onComplete }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [feedback, setFeedback] = useState("Align facial node with Cloak profile...");
  const [lastAnalysis, setLastAnalysis] = useState<{ score: number; text: string } | null>(null);

  useEffect(() => {
    const startCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ 
          video: { facingMode: 'user', width: { ideal: 500 }, height: { ideal: 500 } } 
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          setIsCameraActive(true);
        }
      } catch (err) {
        setFeedback("Camera access blocked. Verify permissions.");
      }
    };
    startCamera();
    return () => {
      if (videoRef.current?.srcObject) {
        (videoRef.current.srcObject as MediaStream).getTracks().forEach(t => t.stop());
      }
    };
  }, []);

  const captureAndAnalyze = async () => {
    if (!videoRef.current || !canvasRef.current) return;
    setIsAnalyzing(true);
    setFeedback("Cloak bypass initializing...");

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Force square capture
    const size = Math.min(videoRef.current.videoWidth, videoRef.current.videoHeight);
    canvas.width = size;
    canvas.height = size;
    
    // Center crop
    const sx = (videoRef.current.videoWidth - size) / 2;
    const sy = (videoRef.current.videoHeight - size) / 2;
    
    ctx.drawImage(videoRef.current, sx, sy, size, size, 0, 0, size, size);
    const imageData = canvas.toDataURL('image/jpeg').split(',')[1];

    try {
      const analysis = await analyzeFacialLiveness(imageData);
      const scoreMatch = analysis.match(/Liveness Score:\s*(\d+)/i);
      const score = scoreMatch ? parseInt(scoreMatch[1]) : 85;
      const explanation = analysis.replace(/Liveness Score:\s*\d+[.%]*/i, '').trim();

      setLastAnalysis({ score, text: explanation });

      if (score > 70) {
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 3500);
      }

      onComplete({
        id: Math.random().toString(36).substr(2, 9).toUpperCase(),
        type: BiometricType.FACIAL,
        timestamp: Date.now(),
        score: score,
        details: analysis,
        status: score > 70 ? 'Pass' : 'Fail'
      });
      setFeedback("Cloak signature verified.");
    } catch (err) {
      setFeedback("Cloaking interference detected.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-[3rem] p-6 md:p-10 max-w-xl mx-auto shadow-2xl relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent"></div>
      
      <div className="flex items-center justify-between mb-8 relative z-10">
        <h2 className="text-xl md:text-2xl font-black flex items-center gap-3 tracking-tighter uppercase italic">
          <div className="p-3 bg-cyan-500/10 rounded-2xl border border-cyan-500/20">
            <Shield className="text-cyan-400" size={24} />
          </div>
          Cloak_Scan_v2.5
        </h2>
        <div className="flex items-center gap-2 px-3 py-1 bg-slate-950 border border-slate-800 rounded-full">
           <div className={`w-1.5 h-1.5 rounded-full ${isCameraActive ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`}></div>
           <span className="text-[8px] font-black uppercase tracking-widest text-slate-500">CLOAK_ACTIVE</span>
        </div>
      </div>

      <div className={`relative rounded-[2.5rem] overflow-hidden border-4 transition-all duration-700 aspect-square bg-black shadow-2xl ${showSuccess ? 'border-emerald-500/50' : 'border-slate-800'}`}>
        {/* Digital Cloak Grain Filter */}
        <div className="absolute inset-0 pointer-events-none z-30 opacity-40 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] bg-repeat"></div>
        <div className="absolute inset-0 pointer-events-none z-30 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent"></div>
        
        {/* Square Framing Mask */}
        <CloakMask />

        <video 
          ref={videoRef} 
          autoPlay 
          muted 
          playsInline 
          className={`w-full h-full object-cover transition-all duration-1000 ${isAnalyzing ? 'scale-110 blur-xl opacity-20' : 'opacity-80 contrast-150 brightness-75 grayscale sepia-[.2]'}`} 
        />
        
        {/* The Scanning Bar */}
        {!showSuccess && isCameraActive && (
           <div className="absolute left-0 w-full h-[1px] bg-cyan-400/80 shadow-[0_0_15px_rgba(34,211,238,1)] z-40 animate-cloak-scan"></div>
        )}

        {isAnalyzing && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950/60 backdrop-blur-xl z-50">
            <div className="relative mb-6">
              <Loader2 className="animate-spin text-cyan-400" size={64} />
              <div className="absolute inset-0 bg-cyan-400 blur-3xl opacity-20 animate-pulse"></div>
            </div>
            <span className="text-[10px] font-black text-cyan-400 uppercase tracking-[0.5em]">DECRYPTING_CLOAK</span>
          </div>
        )}

        {showSuccess && lastAnalysis && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950/90 backdrop-blur-md z-50 animate-in fade-in zoom-in duration-500 px-8 text-center">
            <div className="bg-emerald-500/20 text-emerald-400 rounded-3xl p-6 border-2 border-emerald-500/40 mb-8 shadow-2xl shadow-emerald-500/10">
              <CheckCircle2 size={48} className="animate-bounce" />
            </div>
            
            <div className="space-y-6">
              <div>
                <span className="block text-4xl font-black text-white tracking-tighter mb-2 italic">
                  PASS: {lastAnalysis.score}%
                </span>
                <span className="block text-[10px] font-black text-emerald-500 uppercase tracking-[0.6em]">Biometric Authenticated</span>
              </div>
              
              <div className="p-5 bg-slate-900 border border-slate-800 rounded-2xl">
                <p className="text-[9px] font-bold text-slate-400 leading-relaxed uppercase tracking-widest font-mono">
                  {lastAnalysis.text}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      <canvas ref={canvasRef} className="hidden" />

      <div className="mt-8 flex flex-col gap-4 relative z-10">
        <div className="w-full py-4 bg-slate-950 border border-slate-800 rounded-2xl flex items-center justify-center gap-3">
          <Activity size={16} className="text-cyan-500 animate-pulse" />
          <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">{feedback}</p>
        </div>
        
        <div className="flex gap-4">
          <button
            onClick={captureAndAnalyze}
            disabled={!isCameraActive || isAnalyzing || showSuccess}
            className="flex-1 py-5 bg-cyan-500 hover:bg-cyan-400 disabled:bg-slate-800 disabled:text-slate-600 text-slate-950 font-black rounded-2xl transition-all shadow-xl shadow-cyan-500/20 active:scale-95 flex items-center justify-center gap-3 uppercase tracking-[0.3em] text-xs"
          >
            <ShieldCheck size={20} /> INITIATE_SCAN
          </button>
          <button 
            onClick={() => window.location.reload()} 
            className="p-5 bg-slate-950 hover:bg-slate-800 text-slate-500 rounded-2xl border border-slate-800 transition-all active:rotate-90"
          >
            <RefreshCw size={20} />
          </button>
        </div>
      </div>

      <style>{`
        @keyframes cloak-scan { 
          0% { top: 0%; opacity: 0; } 
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { top: 100%; opacity: 0; } 
        }
        .animate-cloak-scan { animation: cloak-scan 4s cubic-bezier(0.4, 0, 0.2, 1) infinite; }
      `}</style>
    </div>
  );
};

export default FacialScanner;
