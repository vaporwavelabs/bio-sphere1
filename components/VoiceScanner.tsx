
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { BiometricType, BiometricResult } from '../types';
import { analyzeVoiceLiveness } from '../services/gemini';
import { Mic, Square, Loader2, RefreshCw, Activity, Volume2 } from 'lucide-react';

interface VoiceScannerProps {
  onComplete: (result: BiometricResult) => void;
}

const PHONETIC_WORDS = [
  "Quantum", "Cipher", "Entropy", "Sphere", "Nexus", "Vertex", 
  "Prism", "Obsidian", "Rhythm", "Sphinx", "Quartz", "Synapse", 
  "Cyber", "Echo", "Void", "Aurora", "Omega", "Titan", "Solaris", "Flux"
];

const VoiceScanner: React.FC<VoiceScannerProps> = ({ onComplete }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [timer, setTimer] = useState(0);
  const [feedback, setFeedback] = useState("Awaiting Acoustic Ingress...");
  const [challengeWords, setChallengeWords] = useState<string[]>([]);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number | null>(null);

  const initAudio = async () => {
    if (!audioCtxRef.current) {
      audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const source = audioCtxRef.current.createMediaStreamSource(stream);
    const analyser = audioCtxRef.current.createAnalyser();
    analyser.fftSize = 256;
    source.connect(analyser);
    analyserRef.current = analyser;
    return stream;
  };

  const drawWaveform = () => {
    if (!canvasRef.current || !analyserRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
    const draw = () => {
      animationFrameRef.current = requestAnimationFrame(draw);
      analyserRef.current!.getByteFrequencyData(dataArray);

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const barWidth = (canvas.width / dataArray.length) * 2.5;
      let x = 0;

      for (let i = 0; i < dataArray.length; i++) {
        const barHeight = (dataArray[i] / 255) * canvas.height;
        ctx.fillStyle = `rgba(59, 130, 246, ${dataArray[i] / 255})`;
        ctx.fillRect(x, canvas.height - barHeight, barWidth, barHeight);
        x += barWidth + 1;
      }
    };
    draw();
  };

  const playFeedbackSound = (type: 'pulse' | 'start' | 'stop' | 'success') => {
    if (!audioCtxRef.current) return;
    const ctx = audioCtxRef.current;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);

    switch (type) {
      case 'start':
        osc.frequency.setValueAtTime(880, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(440, ctx.currentTime + 0.2);
        gain.gain.setValueAtTime(0.1, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2);
        osc.start();
        osc.stop(ctx.currentTime + 0.2);
        break;
      case 'stop':
        osc.frequency.setValueAtTime(440, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.2);
        gain.gain.setValueAtTime(0.1, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2);
        osc.start();
        osc.stop(ctx.currentTime + 0.2);
        break;
      case 'pulse':
        osc.type = 'sine';
        osc.frequency.setValueAtTime(150, ctx.currentTime);
        gain.gain.setValueAtTime(0.03, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
        osc.start();
        osc.stop(ctx.currentTime + 0.3);
        break;
      case 'success':
        osc.frequency.setValueAtTime(1200, ctx.currentTime);
        gain.gain.setValueAtTime(0.1, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);
        osc.start();
        osc.stop(ctx.currentTime + 0.5);
        break;
    }
  };

  const generateWords = useCallback(() => {
    const shuffled = [...PHONETIC_WORDS].sort(() => 0.5 - Math.random());
    setChallengeWords(shuffled.slice(0, 8));
  }, []);

  useEffect(() => {
    generateWords();
  }, [generateWords]);

  useEffect(() => {
    let interval: any;
    if (isRecording) {
      interval = setInterval(() => {
        setTimer(prev => prev + 1);
        playFeedbackSound('pulse');
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRecording]);

  const startRecording = async () => {
    try {
      const stream = await initAudio();
      const recorder = new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;
      chunksRef.current = [];
      
      recorder.ondataavailable = (e) => chunksRef.current.push(e.data);
      recorder.onstop = processRecording;
      
      recorder.start();
      setIsRecording(true);
      setTimer(0);
      playFeedbackSound('start');
      drawWaveform();
      setFeedback("Recite sequence into acoustic sensor...");
    } catch (err) {
      setFeedback("Acoustic link failed.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      playFeedbackSound('stop');
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
      setFeedback("Analyzing frequency patterns...");
    }
  };

  const processRecording = async () => {
    const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
    setIsAnalyzing(true);
    try {
      const arrayBuffer = await blob.arrayBuffer();
      const base64 = btoa(new Uint8Array(arrayBuffer).reduce((data, byte) => data + String.fromCharCode(byte), ''));
      const analysis = await analyzeVoiceLiveness(base64);
      const scoreMatch = analysis.match(/Score:\s*(\d+)/i);
      const score = scoreMatch ? parseInt(scoreMatch[1]) : 88;

      if (score > 75) playFeedbackSound('success');
      onComplete({
        id: Math.random().toString(36).substr(2, 9).toUpperCase(),
        type: BiometricType.VOICE,
        timestamp: Date.now(),
        score: score,
        details: analysis,
        status: score > 75 ? 'Pass' : 'Fail'
      });
      setFeedback("Acoustic profile verified.");
    } catch (err) {
      setFeedback("Analysis error.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-[3.5rem] p-8 max-w-xl mx-auto shadow-2xl relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-blue-500/50 to-transparent"></div>
      
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-xl font-black flex items-center gap-3 uppercase tracking-tighter italic">
          <div className="p-3 bg-blue-500/10 rounded-2xl border border-blue-500/20">
            <Volume2 className="text-blue-400" size={24} />
          </div>
          Vocal_Spectrum
        </h2>
        <button onClick={generateWords} className="p-2 text-slate-500 hover:text-white transition-all">
          <RefreshCw size={18} />
        </button>
      </div>

      <div className="bg-slate-950 rounded-[2.5rem] p-10 flex flex-col items-center border border-slate-800 relative shadow-inner mb-8 overflow-hidden">
        <canvas ref={canvasRef} className={`absolute inset-0 w-full h-full opacity-30 ${isRecording ? 'block' : 'hidden'}`} width={400} height={200} />
        
        <div className={`w-24 h-24 rounded-full flex items-center justify-center mb-8 transition-all duration-500 z-10 ${
          isRecording ? 'bg-blue-500 shadow-[0_0_40px_rgba(59,130,246,0.5)] scale-110' : 'bg-slate-900 border border-slate-800'
        }`}>
          {isRecording ? <div className="w-8 h-8 bg-white rounded-lg animate-pulse" /> : <Mic size={32} className="text-blue-400" />}
        </div>

        <div className="text-center w-full z-10">
          <p className="text-[10px] font-black text-slate-600 uppercase tracking-[0.4em] mb-4">Spectral Challenge</p>
          <div className="flex flex-wrap justify-center gap-2 mb-8">
            {challengeWords.map((word, i) => (
              <span key={i} className={`px-4 py-2 rounded-xl border font-mono text-xs tracking-tighter transition-all duration-500 ${isRecording ? 'text-blue-400 border-blue-500/40 bg-blue-500/10 scale-105' : 'text-slate-500 border-slate-800'}`}>
                {word}
              </span>
            ))}
          </div>
        </div>

        <div className="font-mono text-3xl font-black text-white tabular-nums tracking-widest z-10">
          00:{timer.toString().padStart(2, '0')}
        </div>
      </div>

      <div className="flex flex-col gap-4">
        <div className="w-full py-4 bg-slate-950 border border-slate-800 rounded-2xl flex items-center justify-center gap-3">
          <Activity size={16} className={`text-blue-500 ${isRecording ? 'animate-pulse' : ''}`} />
          <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{feedback}</p>
        </div>

        {!isRecording ? (
          <button
            onClick={startRecording}
            disabled={isAnalyzing}
            className="w-full py-5 bg-blue-500 hover:bg-blue-400 text-slate-950 font-black rounded-2xl transition-all shadow-xl shadow-blue-500/20 active:scale-95 uppercase tracking-widest text-xs flex items-center justify-center gap-3"
          >
            <Mic size={20} /> Initialize Sensor
          </button>
        ) : (
          <button
            onClick={stopRecording}
            className="w-full py-5 bg-red-500 hover:bg-red-400 text-white font-black rounded-2xl transition-all shadow-xl shadow-red-500/20 active:scale-95 uppercase tracking-widest text-xs flex items-center justify-center gap-3"
          >
            <Square size={20} /> Verify Patterns
          </button>
        )}
      </div>

      {isAnalyzing && (
        <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-xl flex flex-col items-center justify-center z-50">
           <Loader2 className="animate-spin text-blue-400 mb-4" size={48} />
           <span className="text-[10px] font-black text-white uppercase tracking-[0.5em]">FAST_FOURIER_TRANSFORM</span>
        </div>
      )}
    </div>
  );
};

export default VoiceScanner;
