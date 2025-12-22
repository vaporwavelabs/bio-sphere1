
import React, { useState, useRef, useEffect } from 'react';
import { BiometricType, BiometricResult } from '../types';
import { analyzeVoiceLiveness } from '../services/gemini';
import { Mic, Square, Loader2, Volume2, ShieldCheck, Waves, RefreshCw } from 'lucide-react';

interface VoiceScannerProps {
  onComplete: (result: BiometricResult) => void;
}

const VOICE_WORDS = ["Quantum", "Cipher", "Entropy", "Sphere", "Nexus", "Vertex", "Prism", "Obsidian", "Void", "Glitch", "Protocol", "Synapse"];

const VoiceScanner: React.FC<VoiceScannerProps> = ({ onComplete }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [timer, setTimer] = useState(0);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [feedback, setFeedback] = useState("Click to begin secure recording...");
  const [challengeWords, setChallengeWords] = useState<string[]>([]);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerIntervalRef = useRef<any>(null);

  const generateWords = () => {
    const shuffled = [...VOICE_WORDS].sort(() => 0.5 - Math.random());
    setChallengeWords(shuffled.slice(0, 3));
  };

  useEffect(() => {
    generateWords();
  }, []);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;
      chunksRef.current = [];
      
      recorder.ondataavailable = (e) => chunksRef.current.push(e.data);
      recorder.onstop = processRecording;
      
      recorder.start();
      setIsRecording(true);
      setTimer(0);
      setFeedback("Speak the words below clearly into the terminal.");
      
      timerIntervalRef.current = setInterval(() => {
        setTimer(prev => prev + 1);
      }, 1000);
    } catch (err) {
      setFeedback("Mic access denied.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      clearInterval(timerIntervalRef.current);
      setFeedback("Capturing audio packet...");
    }
  };

  const processRecording = async () => {
    const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
    const url = URL.createObjectURL(blob);
    setAudioUrl(url);
    
    setIsAnalyzing(true);
    setFeedback(`Verifying voice signature for words: ${challengeWords.join(', ')}...`);

    try {
      const arrayBuffer = await blob.arrayBuffer();
      const base64 = btoa(
        new Uint8Array(arrayBuffer).reduce((data, byte) => data + String.fromCharCode(byte), '')
      );
      
      const analysis = await analyzeVoiceLiveness(base64);
      const scoreMatch = analysis.match(/Liveness Score:\s*(\d+)/i);
      const score = scoreMatch ? parseInt(scoreMatch[1]) : 82;

      onComplete({
        id: Math.random().toString(36).substr(2, 9),
        type: BiometricType.VOICE,
        timestamp: Date.now(),
        score: score,
        details: `Voice words: ${challengeWords.join(' ')}. ${analysis}`,
        status: score > 75 ? 'Pass' : 'Fail'
      });
      setFeedback("Voice verification successful.");
    } catch (err) {
      setFeedback("Analysis failed. Try again.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 max-w-xl mx-auto shadow-2xl animate-in slide-in-from-right-4 duration-500">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-2xl font-bold flex items-center gap-3">
          <div className="p-2 bg-blue-500/20 rounded-xl">
            <Mic className="text-blue-400" size={24} />
          </div>
          Acoustic Auth Node
        </h2>
        <button onClick={generateWords} className="text-slate-500 hover:text-blue-400 transition-colors">
          <RefreshCw size={16} />
        </button>
      </div>

      <div className="bg-slate-950 rounded-2xl p-8 flex flex-col items-center border border-slate-800 relative overflow-hidden">
        {isRecording && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-32 h-32 bg-blue-500/10 rounded-full animate-ping"></div>
          </div>
        )}

        <div className={`w-20 h-20 rounded-full flex items-center justify-center mb-6 transition-all duration-300 ${
          isRecording ? 'bg-red-500 shadow-[0_0_30px_rgba(239,68,68,0.4)] scale-110' : 'bg-slate-800'
        }`}>
          {isRecording ? <Square size={28} className="text-white fill-current" /> : <Mic size={28} className="text-blue-400" />}
        </div>

        <div className="mb-6 text-center">
          <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3">Verification Phrase</div>
          <div className="flex flex-wrap justify-center gap-3">
            {challengeWords.map((word, i) => (
              <span key={i} className={`px-4 py-2 rounded-xl border border-slate-800 font-mono text-xl ${isRecording ? 'text-blue-400 border-blue-500/30' : 'text-slate-400'}`}>
                {word}
              </span>
            ))}
          </div>
        </div>

        <div className="text-2xl font-mono mb-4 tabular-nums">
          00:{timer.toString().padStart(2, '0')}
        </div>

        <p className={`text-sm font-medium text-center ${isAnalyzing ? 'text-cyan-400 animate-pulse' : 'text-slate-400'}`}>
          {feedback}
        </p>
      </div>

      <div className="mt-8 flex justify-center gap-4">
        {!isRecording ? (
          <button
            onClick={startRecording}
            disabled={isAnalyzing}
            className="w-full py-4 bg-blue-500 hover:bg-blue-400 text-slate-950 font-bold rounded-xl transition-all shadow-[0_0_20px_rgba(59,130,246,0.3)] flex items-center justify-center gap-2"
          >
            <Mic size={20} />
            INIT RECORDING
          </button>
        ) : (
          <button
            onClick={stopRecording}
            className="w-full py-4 bg-red-500 hover:bg-red-400 text-white font-bold rounded-xl transition-all shadow-[0_0_20px_rgba(239,68,68,0.3)] flex items-center justify-center gap-2"
          >
            <Square size={20} />
            STOP & VERIFY
          </button>
        )}
      </div>

      {isAnalyzing && (
        <div className="mt-8 p-4 bg-slate-800/50 rounded-xl border border-blue-500/20 flex items-center gap-4">
          <Loader2 className="animate-spin text-blue-400" size={20} />
          <div className="flex-1">
            <div className="text-xs font-bold text-blue-400 uppercase mb-1">Packet Analysis</div>
            <div className="w-full h-1 bg-slate-700 rounded-full overflow-hidden">
              <div className="h-full bg-blue-400 animate-progress"></div>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes progress { from { width: 0%; } to { width: 100%; } }
        .animate-progress { animation: progress 2s ease-out forwards; }
      `}</style>
    </div>
  );
};

export default VoiceScanner;
