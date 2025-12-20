
import React, { useRef, useEffect, useState } from 'react';
import { BiometricType, BiometricResult } from '../types';
import { analyzeFacialLiveness } from '../services/gemini';
import { Camera, RefreshCw, ShieldCheck, AlertTriangle, Loader2 } from 'lucide-react';

interface FacialScannerProps {
  onComplete: (result: BiometricResult) => void;
}

const FacialScanner: React.FC<FacialScannerProps> = ({ onComplete }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [feedback, setFeedback] = useState("Position your face in the center...");

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
        setFeedback("Camera access blocked.");
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
    setFeedback("Processing signature...");

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

      onComplete({
        id: Math.random().toString(36).substr(2, 9),
        type: BiometricType.FACIAL,
        timestamp: Date.now(),
        score: score,
        details: analysis,
        status: score > 70 ? 'Pass' : 'Fail'
      });
      setFeedback("Identity Verified.");
    } catch (err) {
      setFeedback("Verification error.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl md:rounded-3xl p-4 md:p-8 max-w-2xl mx-auto shadow-2xl">
      <div className="flex items-center justify-between mb-4 md:mb-8">
        <h2 className="text-xl md:text-2xl font-bold flex items-center gap-2">
          <ShieldCheck className="text-cyan-400" size={20} /> Face Scan
        </h2>
        <div className={`px-2 py-0.5 rounded-full text-[8px] font-bold uppercase ${isCameraActive ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
          {isCameraActive ? 'Camera Online' : 'Offline'}
        </div>
      </div>

      <div className="relative rounded-2xl md:rounded-3xl overflow-hidden border border-slate-800 aspect-[3/4] md:aspect-video bg-slate-950">
        {!isCameraActive && !isAnalyzing && (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-700">
            <Camera size={48} className="opacity-20 mb-2" />
            <p className="text-xs">Initializing...</p>
          </div>
        )}
        <video ref={videoRef} autoPlay muted playsInline className={`w-full h-full object-cover grayscale brightness-110 ${isAnalyzing ? 'opacity-40' : 'opacity-100'}`} />
        
        <div className="absolute inset-0 pointer-events-none border-[12px] md:border-[20px] border-slate-950/20">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-64 md:w-64 md:h-48 border-2 border-cyan-400/40 rounded-full"></div>
          {isAnalyzing && <div className="absolute top-0 w-full h-1 bg-cyan-400/50 shadow-[0_0_20px_cyan] animate-scan"></div>}
        </div>

        {isAnalyzing && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950/20 backdrop-blur-sm">
            <Loader2 className="animate-spin text-cyan-400 mb-2" size={32} />
            <span className="text-[10px] font-mono text-cyan-400">ANALYZING_MESH</span>
          </div>
        )}
      </div>

      <canvas ref={canvasRef} className="hidden" />

      <div className="mt-6 md:mt-8 flex flex-col items-center gap-4">
        <p className="text-xs md:text-sm font-medium text-slate-400">{feedback}</p>
        <div className="flex gap-4 w-full">
          <button
            onClick={captureAndAnalyze}
            disabled={!isCameraActive || isAnalyzing}
            className="flex-1 py-4 bg-cyan-500 hover:bg-cyan-400 disabled:bg-slate-800 disabled:text-slate-600 text-slate-950 font-bold rounded-2xl transition-all shadow-lg active:scale-95 flex items-center justify-center gap-2"
          >
            <ShieldCheck size={18} /> AUTHENTICATE
          </button>
          <button onClick={() => window.location.reload()} className="p-4 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-2xl">
            <RefreshCw size={18} />
          </button>
        </div>
      </div>

      <style>{`
        @keyframes scan { from { top: 0%; } to { top: 100%; } }
        .animate-scan { animation: scan 2s linear infinite; }
      `}</style>
    </div>
  );
};

export default FacialScanner;
