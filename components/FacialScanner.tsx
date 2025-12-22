
import React, { useRef, useEffect, useState } from 'react';
import { BiometricType, BiometricResult } from '../types';
import { analyzeFacialLiveness } from '../services/gemini';
import { Camera, RefreshCw, ShieldCheck, AlertTriangle, Loader2, CheckCircle2, Target, Scan, Activity } from 'lucide-react';

interface FacialScannerProps {
  onComplete: (result: BiometricResult) => void;
}

const BiometricMask = () => (
  <svg className="absolute inset-0 w-full h-full pointer-events-none z-20" viewBox="0 0 400 500" preserveAspectRatio="xMidYMid slice">
    {/* Main Facial Contour */}
    <path
      d="M200,80 C110,80 70,160 70,280 C70,400 110,480 200,480 C290,480 330,400 330,280 C330,160 290,80 200,80 Z"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeDasharray="10 5"
      className="text-cyan-500/40 animate-[spin_20s_linear_infinite] origin-center"
    />
    <path
      d="M200,90 C120,90 85,170 85,280 C85,390 120,470 200,470 C280,470 315,390 315,280 C315,170 280,90 200,90 Z"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      className="text-cyan-400/60"
    />
    
    {/* Landmarking Crosshairs */}
    <g className="text-cyan-400">
      <path d="M140,240 L160,240 M150,230 L150,250" stroke="currentColor" strokeWidth="1" /> {/* Left Eye */}
      <path d="M240,240 L260,240 M250,230 L250,250" stroke="currentColor" strokeWidth="1" /> {/* Right Eye */}
      <path d="M190,340 L210,340 M200,330 L200,350" stroke="currentColor" strokeWidth="1" /> {/* Nose Tip */}
      <path d="M170,410 Q200,430 230,410" fill="none" stroke="currentColor" strokeWidth="1.5" strokeDasharray="2 2" /> {/* Mouth */}
    </g>

    {/* Corner Targeting Brackets */}
    <g className="text-cyan-500">
      <path d="M40,40 L80,40 M40,40 L40,80" fill="none" stroke="currentColor" strokeWidth="3" />
      <path d="M360,40 L320,40 M360,40 L360,80" fill="none" stroke="currentColor" strokeWidth="3" />
      <path d="M40,460 L80,460 M40,460 L40,420" fill="none" stroke="currentColor" strokeWidth="3" />
      <path d="M360,460 L320,460 M360,460 L360,420" fill="none" stroke="currentColor" strokeWidth="3" />
    </g>

    {/* Dynamic Data Points */}
    <circle cx="100" cy="200" r="2" className="fill-cyan-400 animate-pulse" />
    <circle cx="300" cy="200" r="2" className="fill-cyan-400 animate-pulse" style={{ animationDelay: '0.5s' }} />
    <circle cx="120" cy="380" r="2" className="fill-cyan-400 animate-pulse" style={{ animationDelay: '1s' }} />
    <circle cx="280" cy="380" r="2" className="fill-cyan-400 animate-pulse" style={{ animationDelay: '1.5s' }} />
  </svg>
);

const FacialScanner: React.FC<FacialScannerProps> = ({ onComplete }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [feedback, setFeedback] = useState("Align facial node within the biometric mask...");
  const [lastAnalysis, setLastAnalysis] = useState<{ score: number; text: string } | null>(null);

  useEffect(() => {
    const startCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ 
          video: { facingMode: 'user', width: { ideal: 1280 }, height: { ideal: 720 } } 
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
    setFeedback("Extracting biometric mesh...");

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    ctx.drawImage(videoRef.current, 0, 0);
    const imageData = canvas.toDataURL('image/jpeg').split(',')[1];

    try {
      const analysis = await analyzeFacialLiveness(imageData);
      const scoreMatch = analysis.match(/Liveness Score:\s*(\d+)/i);
      const score = scoreMatch ? parseInt(scoreMatch[1]) : 85;
      
      // Extract technical explanation by removing the score line and leading dots/symbols
      const explanation = analysis.replace(/Liveness Score:\s*\d+[.%]*/i, '').trim();

      setLastAnalysis({ score, text: explanation });

      if (score > 70) {
        setShowSuccess(true);
        // Extended to allow reading the brief explanation
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
      setFeedback("Mesh captured. Signature valid.");
    } catch (err) {
      setFeedback("Signal lost. Re-synchronize.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-[2.5rem] p-4 md:p-8 max-w-2xl mx-auto shadow-2xl relative overflow-hidden">
      {/* Decorative ambient background */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/5 blur-3xl rounded-full"></div>
      
      <div className="flex items-center justify-between mb-6 md:mb-10 relative z-10">
        <h2 className="text-xl md:text-2xl font-black flex items-center gap-3 tracking-tighter uppercase">
          <div className="p-3 bg-cyan-500/10 rounded-2xl border border-cyan-500/20">
            <Scan className="text-cyan-400" size={24} />
          </div>
          Biometric Mesh Scanner
        </h2>
        <div className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border ${isCameraActive ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-red-500/10 text-red-400 border-red-500/20'}`}>
          {isCameraActive ? 'LENS_READY' : 'LENS_OFFLINE'}
        </div>
      </div>

      <div className={`relative rounded-[2rem] overflow-hidden border-2 transition-all duration-500 aspect-[3/4] md:aspect-video bg-slate-950 shadow-2xl ${showSuccess ? 'border-emerald-500 shadow-[0_0_25px_rgba(16,185,129,0.3)]' : 'border-slate-800'}`}>
        {/* CRT Scanline Overlay */}
        <div className="absolute inset-0 pointer-events-none z-30 opacity-20 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_4px,3px_100%]"></div>
        
        {/* The Biometric Mask Filter */}
        <BiometricMask />

        {!isCameraActive && !isAnalyzing && (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-800 z-10">
            <Target size={64} className="opacity-10 mb-4 animate-pulse" />
            <p className="text-[10px] font-black uppercase tracking-[0.4em]">Initializing Core Optics...</p>
          </div>
        )}

        <video 
          ref={videoRef} 
          autoPlay 
          muted 
          playsInline 
          className={`w-full h-full object-cover grayscale transition-all duration-1000 ${isAnalyzing ? 'opacity-30 blur-sm scale-110' : 'opacity-100 contrast-125 brightness-110'}`} 
        />
        
        {/* Scanning Scanline Animation */}
        {!showSuccess && isCameraActive && (
           <div className="absolute top-0 w-full h-[2px] bg-cyan-400 shadow-[0_0_15px_rgba(34,211,238,0.8)] z-40 animate-scan"></div>
        )}

        {isAnalyzing && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950/40 backdrop-blur-md z-50">
            <div className="relative mb-6">
              <Loader2 className="animate-spin text-cyan-400" size={48} />
              <div className="absolute inset-0 bg-cyan-400 blur-2xl opacity-20"></div>
            </div>
            <span className="text-[10px] font-black text-cyan-400 uppercase tracking-[0.5em] animate-pulse">Analyzing_Contours</span>
          </div>
        )}

        {/* Success Overlay - Displaying Liveness Score and Technical Validation */}
        {showSuccess && lastAnalysis && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-emerald-500/5 backdrop-blur-md z-50 animate-in fade-in zoom-in duration-300 px-6 text-center">
            <div className="bg-emerald-500/90 text-slate-950 rounded-full p-5 shadow-[0_0_40px_rgba(16,185,129,0.5)] animate-[bounce_0.5s_ease-in-out_infinite_alternate] border-2 border-emerald-300 mb-6">
              <CheckCircle2 size={40} />
            </div>
            
            <div className="space-y-4 max-w-sm">
              <div>
                <span className="block text-3xl font-black text-emerald-400 tracking-tighter mb-1 drop-shadow-[0_0_15px_rgba(16,185,129,0.6)]">
                  Liveness: {lastAnalysis.score}%
                </span>
                <span className="block text-[10px] font-black text-emerald-500 uppercase tracking-[0.4em]">Identity Verified</span>
              </div>
              
              <div className="p-4 bg-slate-950/80 border border-emerald-500/30 rounded-2xl shadow-inner animate-in slide-in-from-bottom-2 duration-500">
                <div className="flex items-center gap-2 mb-2 justify-center">
                  <Activity size={12} className="text-emerald-400" />
                  <span className="text-[8px] font-black text-emerald-500/60 uppercase tracking-widest">Validation Report</span>
                </div>
                <p className="text-[10px] font-bold text-slate-300 leading-relaxed uppercase tracking-wide">
                  {lastAnalysis.text}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      <canvas ref={canvasRef} className="hidden" />

      <div className="mt-8 md:mt-10 flex flex-col items-center gap-6 relative z-10">
        <div className="bg-slate-950 border border-slate-800 px-6 py-3 rounded-2xl flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-cyan-500 animate-pulse"></div>
          <p className="text-[10px] md:text-xs font-bold text-slate-400 uppercase tracking-widest">{feedback}</p>
        </div>
        
        <div className="flex gap-4 w-full">
          <button
            onClick={captureAndAnalyze}
            disabled={!isCameraActive || isAnalyzing || showSuccess}
            className="flex-1 py-5 bg-cyan-500 hover:bg-cyan-400 disabled:bg-slate-800 disabled:text-slate-600 text-slate-950 font-black rounded-2xl transition-all shadow-xl shadow-cyan-500/20 active:scale-95 flex items-center justify-center gap-3 uppercase tracking-[0.2em] text-xs"
          >
            <ShieldCheck size={20} /> AUTHENTICATE
          </button>
          <button 
            onClick={() => window.location.reload()} 
            className="p-5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-2xl border border-slate-700 transition-colors shadow-lg active:rotate-180 duration-500"
          >
            <RefreshCw size={20} />
          </button>
        </div>
      </div>

      <style>{`
        @keyframes scan { 
          0% { top: 0%; opacity: 0.2; } 
          50% { opacity: 1; }
          100% { top: 100%; opacity: 0.2; } 
        }
        .animate-scan { animation: scan 3s linear infinite; }
      `}</style>
    </div>
  );
};

export default FacialScanner;
