
import React, { useState, useRef } from 'react';
import { BiometricType, BiometricResult } from '../types';
import { generateSecureIdToken } from '../services/gemini';
import { HardDrive, Download, Search, ShieldCheck, Loader2, FileCode, AlertCircle } from 'lucide-react';

interface ScanMachineProps {
  username: string;
  onComplete: (result: BiometricResult) => void;
}

const ScanMachine: React.FC<ScanMachineProps> = ({ username, onComplete }) => {
  const [phase, setPhase] = useState<'IDLE' | 'PROVISIONING' | 'READY_TO_SCAN' | 'SCANNING'>('IDLE');
  const [status, setStatus] = useState("Awaiting protocol initialization...");
  const [token, setToken] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const initProvisioning = async () => {
    setPhase('PROVISIONING');
    setStatus("Synthesizing Encrypted Node ID...");
    try {
      const secureToken = await generateSecureIdToken(username);
      setToken(secureToken);
      
      // Save locally to check against later
      localStorage.setItem(`sphere_id_token_${username}`, secureToken);

      // Create blob and download
      const blob = new Blob([secureToken], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `SPHERE_NODE_ID_${username.toUpperCase()}.txt`;
      a.click();
      URL.revokeObjectURL(url);

      setStatus("ID Provisioned. File downloaded to device storage.");
      setPhase('READY_TO_SCAN');
    } catch (err) {
      setStatus("Provisioning failed. Terminal error.");
      setPhase('IDLE');
    }
  };

  const triggerScan = () => {
    fileInputRef.current?.click();
  };

  const handleFileScan = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setPhase('SCANNING');
    setStatus("Accessing device storage... Searching for Node ID...");

    const reader = new FileReader();
    reader.onload = async (event) => {
      const content = event.target?.result as string;
      const storedToken = localStorage.getItem(`sphere_id_token_${username}`);

      // Artificial delay for high-tech "scanning" feel
      setTimeout(() => {
        if (content.trim() === storedToken) {
          setStatus("Match Found. Identity Authenticated.");
          onComplete({
            id: Math.random().toString(36).substr(2, 9),
            type: BiometricType.SCAN_MACHINE,
            timestamp: Date.now(),
            score: 100,
            details: `Secure ID Text verified via file-system deep scan. Content Hash: ${content.substring(0, 8)}...`,
            status: 'Pass'
          });
        } else {
          setStatus("Integrity Failure. ID Mismatch detected.");
          setPhase('READY_TO_SCAN');
        }
      }, 3000);
    };
    reader.readAsText(file);
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-[2.5rem] p-8 max-w-xl mx-auto shadow-2xl animate-in zoom-in-95 duration-500">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-2xl font-black flex items-center gap-3 tracking-tighter uppercase">
          <div className="p-3 bg-amber-500/20 rounded-2xl">
            <HardDrive className="text-amber-400" size={24} />
          </div>
          Scan Machine v4.0
        </h2>
        <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest border border-slate-800 px-3 py-1 rounded-full">
          Protocol: FS_LOCK
        </div>
      </div>

      <div className="bg-slate-950 rounded-[2rem] p-8 border border-slate-800 relative overflow-hidden mb-8">
        {/* Decorative Grid */}
        <div className="absolute inset-0 opacity-5 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#fff 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>

        <div className="relative z-10 flex flex-col items-center text-center">
          <div className={`w-24 h-24 rounded-3xl mb-6 flex items-center justify-center transition-all duration-500 ${
            phase === 'SCANNING' ? 'bg-amber-500 animate-pulse shadow-[0_0_50px_rgba(245,158,11,0.4)]' : 'bg-slate-900 border border-slate-800'
          }`}>
            {phase === 'SCANNING' ? <Search size={40} className="text-slate-950" /> : <FileCode size={40} className="text-slate-700" />}
          </div>

          <div className="mb-4">
            <div className="text-[10px] font-black text-slate-600 uppercase tracking-[0.3em] mb-2">Internal Diagnostics</div>
            <div className="font-mono text-xs text-amber-400/80 leading-relaxed bg-slate-900/50 p-4 rounded-xl border border-slate-800">
              {status}
            </div>
          </div>

          {phase === 'SCANNING' && (
            <div className="w-full h-1 bg-slate-900 rounded-full overflow-hidden mt-4">
              <div className="h-full bg-amber-500 animate-scanning-progress"></div>
            </div>
          )}
        </div>
      </div>

      <div className="space-y-4">
        {phase === 'IDLE' && (
          <button
            onClick={initProvisioning}
            className="w-full py-5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-2xl transition-all shadow-xl shadow-amber-500/10 active:scale-95 uppercase tracking-widest text-xs flex items-center justify-center gap-3"
          >
            <Download size={18} /> Provision Encrypted ID
          </button>
        )}

        {phase === 'READY_TO_SCAN' && (
          <button
            onClick={triggerScan}
            className="w-full py-5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black rounded-2xl transition-all shadow-xl shadow-cyan-500/10 active:scale-95 uppercase tracking-widest text-xs flex items-center justify-center gap-3"
          >
            <Search size={18} /> Initiate Deep Scan
          </button>
        )}

        {phase === 'SCANNING' && (
          <div className="w-full py-5 bg-slate-800 text-slate-400 font-black rounded-2xl flex items-center justify-center gap-3 uppercase tracking-widest text-xs cursor-wait">
            <Loader2 size={18} className="animate-spin" /> Verification in Progress
          </div>
        )}

        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileScan}
          className="hidden"
          accept=".txt"
        />

        <div className="flex items-start gap-4 p-5 bg-slate-950/50 rounded-2xl border border-slate-800">
          <AlertCircle size={20} className="text-slate-600 flex-shrink-0 mt-0.5" />
          <p className="text-[9px] text-slate-500 leading-relaxed uppercase font-bold tracking-wider">
            NOTICE: If user opts in, the ID file must be kept on the device. Losing the file will result in total verification failure and permanent node lockout.
          </p>
        </div>
      </div>

      <style>{`
        @keyframes scanning-progress {
          0% { width: 0%; }
          50% { width: 70%; }
          100% { width: 100%; }
        }
        .animate-scanning-progress {
          animation: scanning-progress 3s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default ScanMachine;
