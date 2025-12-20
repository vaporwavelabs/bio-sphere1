
import React, { useState, useRef, useEffect } from 'react';
import { BiometricType, BiometricResult, KeystrokeData } from '../types';
// Fixed: Added Loader2 to imports from lucide-react
import { Fingerprint, Info, CheckCircle2, Terminal, Loader2 } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts';

interface BehavioralScannerProps {
  onComplete: (result: BiometricResult) => void;
}

const BehavioralScanner: React.FC<BehavioralScannerProps> = ({ onComplete }) => {
  const [inputText, setInputText] = useState("");
  const [keystrokes, setKeystrokes] = useState<KeystrokeData[]>([]);
  const [isVerifying, setIsVerifying] = useState(false);
  const [metrics, setMetrics] = useState<any>(null);
  
  const targetText = "The quick brown fox jumps over the biometric security gate.";

  const handleKeyDown = (e: React.KeyboardEvent) => {
    setKeystrokes(prev => [...prev, {
      key: e.key,
      pressTime: performance.now(),
      releaseTime: 0
    }]);
  };

  const handleKeyUp = (e: React.KeyboardEvent) => {
    // Ideally update the last keystroke's releaseTime
  };

  const calculateBehavioralProfile = () => {
    if (keystrokes.length < 20) return;
    
    setIsVerifying(true);
    
    // Simple mock calculation of flight times (time between keys)
    const flightTimes: any[] = [];
    for (let i = 1; i < keystrokes.length; i++) {
      flightTimes.push({
        index: i,
        ms: Math.round(keystrokes[i].pressTime - keystrokes[i-1].pressTime)
      });
    }

    const avgFlight = flightTimes.reduce((acc, curr) => acc + curr.ms, 0) / flightTimes.length;
    
    setTimeout(() => {
      const score = 94 - Math.abs(avgFlight - 150) / 10; // Mock similarity score
      const finalScore = Math.min(Math.max(Math.round(score), 60), 100);

      onComplete({
        id: Math.random().toString(36).substr(2, 9),
        type: BiometricType.BEHAVIORAL,
        timestamp: Date.now(),
        score: finalScore,
        details: `Behavioral Profile: Avg Flight Time ${Math.round(avgFlight)}ms. Typo Frequency: 2%. Rhythm Consistency: High.`,
        status: finalScore > 80 ? 'Pass' : 'Fail'
      });
      
      setMetrics(flightTimes);
      setIsVerifying(false);
    }, 1500);
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 max-w-3xl mx-auto shadow-2xl animate-in fade-in duration-700">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-2xl font-bold flex items-center gap-3">
          <div className="p-2 bg-purple-500/20 rounded-xl">
            <Fingerprint className="text-purple-400" size={24} />
          </div>
          Behavioral Dynamics Node
        </h2>
        <span className="text-[10px] font-mono text-slate-500">ENGINE: DYNAMICS_v4</span>
      </div>

      <div className="mb-6">
        <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Target Authentication Phrase</label>
        <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl text-slate-400 font-mono italic select-none">
          "{targetText}"
        </div>
      </div>

      <div className="relative mb-8">
        <textarea
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Begin typing the phrase above to map your rhythm..."
          className="w-full h-32 bg-slate-950 border-2 border-slate-800 focus:border-purple-500/50 rounded-2xl p-6 text-lg font-mono outline-none transition-all resize-none"
          spellCheck={false}
        />
        <div className="absolute bottom-4 right-4 text-[10px] font-mono text-slate-600">
          PACKETS_CAPTURED: {keystrokes.length}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="p-4 bg-slate-800/30 rounded-xl border border-slate-800">
          <h3 className="text-sm font-bold flex items-center gap-2 mb-4">
            <Terminal size={16} className="text-purple-400" />
            Live Telemetry
          </h3>
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-slate-500">Sample Count</span>
              <span className="font-mono">{keystrokes.length}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-slate-500">Latency Variance</span>
              <span className="font-mono text-green-400">Low</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-slate-500">Identity Alignment</span>
              <span className="font-mono text-purple-400">Processing...</span>
            </div>
          </div>
        </div>

        <div className="p-4 bg-slate-800/30 rounded-xl border border-slate-800 flex flex-col justify-center">
          {metrics ? (
            <div className="h-24">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={metrics}>
                  <Line type="monotone" dataKey="ms" stroke="#c084fc" strokeWidth={2} dot={false} />
                  <Tooltip contentStyle={{ background: '#0f172a', border: 'none' }} />
                </LineChart>
              </ResponsiveContainer>
              <div className="text-[10px] text-center text-slate-500 mt-2">Flight Time Variance (ms)</div>
            </div>
          ) : (
            <div className="text-center">
              <Info size={24} className="text-slate-700 mx-auto mb-2" />
              <p className="text-xs text-slate-500 italic">Capture 20+ samples to generate chart</p>
            </div>
          )}
        </div>
      </div>

      <button
        onClick={calculateBehavioralProfile}
        disabled={keystrokes.length < 20 || isVerifying}
        className="w-full py-4 bg-purple-500 hover:bg-purple-400 disabled:bg-slate-800 disabled:text-slate-500 text-slate-950 font-bold rounded-xl transition-all shadow-[0_0_20px_rgba(168,85,247,0.3)] flex items-center justify-center gap-2"
      >
        {isVerifying ? <Loader2 size={20} className="animate-spin" /> : <CheckCircle2 size={20} />}
        {isVerifying ? 'CALCULATING DYNAMICS...' : 'SUBMIT BEHAVIORAL SIGNATURE'}
      </button>

      <p className="mt-4 text-[10px] text-slate-600 text-center uppercase tracking-tighter">
        Keystroke biometrics provide secondary entropy for high-security environments.
      </p>
    </div>
  );
};

export default BehavioralScanner;
