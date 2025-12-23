
import React, { useRef, useEffect, useState } from 'react';
import { BiometricType, BiometricResult } from '../types';
import { analyzeFacialLiveness } from '../services/gemini';
import { Camera, RefreshCw, ShieldCheck, AlertTriangle, Loader2, CheckCircle2, Target, Scan, Activity, Shield } from 'lucide-react';

interface FacialScannerProps {
  onComplete: (result: BiometricResult) => void;
}

const MeshOverlay = () => {
  const [nodes, setNodes] = useState<{ x: number, y: number, id: number }[]>([]);
  
  useEffect(() => {
    const initialNodes = Array.from({ length: 15 }).map((_, i) => ({
      x: 250 + (Math.random() - 0.5) * 150,
      y: 250 + (Math.random() - 0.5) * 200,
      id: i
    }));
    setNodes(initialNodes);

    const interval = setInterval(() => {
      setNodes(prev => prev.map(node => ({
        ...node,
        x: node.x + (Math.random() - 0.5) * 4,
        y: node.y + (Math.random() - 0.5) * 4
      })));
    }, 100);
    return () => clearInterval(interval);
  }, []);

  return (
    <svg className="absolute inset-0 w-full h-full pointer-events-none z-20" viewBox="0 0 500 500">
      <defs>
        <filter id="glow">
          <feGaussianBlur stdDeviation="2" result="coloredBlur" />
          <feMerge>
            <feMergeNode in="coloredBlur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      
      {/* Dynamic Mesh Connections */}
      <g className="text-cyan-500/20" strokeWidth="0.5">
        {nodes.map((node, i) => (
          nodes.slice(i + 1, i + 4).map((target, j) => (
            <line key={`${i}-${j}`} x1={node.x} y1={node.y} x2={target.x} y2={target.y} stroke="currentColor" />
          ))
        ))}
      </g>

      {/* Tracking Nodes */}
      <g className="text-cyan-400" filter="url(#glow)">
        {nodes.map(node => (
          <circle key={node.id} cx={node.x} cy={node.y} r="1.5" className="animate-pulse" />
        ))}
      </g>

      {/* Feature Brackets (Eyes/Mouth) */}
      <g className="text-cyan-500" strokeWidth="1" fill="none">
        {/* Left Eye Tracking */}
        <path d="M180,210 L200,210 M190,200 L190,220" className="animate-bounce" />
        {/* Right Eye Tracking */}
        <path d="M300,210 L320,210 M310,200 L310,220" className="animate-bounce" style={{ animationDelay: '0.2s' }} />
        {/* Mouth Tracking */}
        <path d="M220,320 Q250,340 280,320" className="animate-pulse" strokeWidth="2" />
      </g>

      {/* Scan Frame */}
      <rect x="150" y="100" width="200" height="280" rx="100" stroke="currentColor" strokeWidth="1" strokeDasharray="10 5" className="text-cyan-500/30" />
    </svg>
  );
};

const FacialScanner: React.FC<FacialScannerProps> = ({ onComplete }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [feedback, setFeedback] = useState("Align facial node for feature mapping...");
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
    setFeedback("Mapping biometric geometry...");

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const size = Math.min(videoRef.current.videoWidth, videoRef.current.videoHeight);
    canvas.width = size;
    canvas.height = size;
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
      setFeedback("Node mapping complete.");
    } catch (err) {
      setFeedback("Interference detected during mapping.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-[3.5rem] p-6 md:p-10 max-w-xl mx-auto shadow-2xl relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent"></div>
      
      <div className="flex items-center justify-between mb-8 relative z-10">
        <h2 className="text-xl md:text-2xl font-black flex items-center gap-3 tracking-tighter uppercase italic">
          <div className="p-3 bg-cyan-500/10 rounded-2xl border border-cyan-500/20">
            <Scan className="text-cyan-400" size={24} />
          </div>
          Face_Mesh_Scan
        </h2>
        <div className="flex items-center gap-2 px-3 py-1 bg-slate-950 border border-slate-800 rounded-full">
           <div className={`w-1.5 h-1.5 rounded-full ${isCameraActive ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`}></div>
           <span className="text-[8px] font-black uppercase tracking-widest text-slate-500">TRACKING_ON</span>
        </div>
      </div>

      <div className={`relative rounded-[3rem] overflow-hidden border-4 transition-all duration-700 aspect-square bg-black shadow-2xl ${showSuccess ? 'border-emerald-500/50' : 'border-slate-800'}`}>
        {!showSuccess && <MeshOverlay />}
        
        <video 
          ref={videoRef} 
          autoPlay 
          muted 
          playsInline 
          className={`w-full h-full object-cover transition-all duration-1000 ${isAnalyzing ? 'scale-110 blur-xl opacity-20' : 'opacity-80 contrast-125 brightness-90 grayscale-[0.2]'}`} 
        />
        
        {!showSuccess && isCameraActive && (
           <div className="absolute left-0 w-full h-1 bg-cyan-400/50 shadow-[0_0_20px_rgba(34,211,238,0.8)] z-40 animate-scan-line"></div>
        )}

        {isAnalyzing && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950/60 backdrop-blur-xl z-50">
            <Loader2 className="animate-spin text-cyan-400 mb-4" size={64} />
            <span className="text-[10px] font-black text-cyan-400 uppercase tracking-[0.5em]">PARSING_FACIAL_NODES</span>
          </div>
        )}

        {showSuccess && lastAnalysis && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950/90 backdrop-blur-md z-50 animate-in fade-in zoom-in duration-500 px-8 text-center">
            <div className="bg-emerald-500/20 text-emerald-400 rounded-3xl p-6 border-2 border-emerald-500/40 mb-8 shadow-2xl shadow-emerald-500/10">
              <CheckCircle2 size={48} className="animate-bounce" />
            </div>
            <div className="space-y-6">
              <span className="block text-4xl font-black text-white tracking-tighter mb-2 italic">PASS: {lastAnalysis.score}%</span>
              <div className="p-5 bg-slate-900 border border-slate-800 rounded-2xl">
                <p className="text-[9px] font-bold text-slate-400 leading-relaxed uppercase tracking-widest font-mono">{lastAnalysis.text}</p>
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
            <Target size={20} /> MAP_FEATURES
          </button>
          <button onClick={() => window.location.reload()} className="p-5 bg-slate-950 hover:bg-slate-800 text-slate-500 rounded-2xl border border-slate-800 transition-all active:rotate-90">
            <RefreshCw size={20} />
          </button>
        </div>
      </div>

      <style>{`
        @keyframes scan-line { 
          0% { top: 10%; opacity: 0; } 
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { top: 90%; opacity: 0; } 
        }
        .animate-scan-line { animation: scan-line 3s cubic-bezier(0.4, 0, 0.2, 1) infinite; }
      `}</style>
    </div>
  );
};

export default FacialScanner;
