
import React, { useState, useEffect } from 'react';
import { UserProfile, BiometricType } from '../types';
import { transcribeToEncryptedData } from '../services/gemini';
import { Database, Lock, Unlock, Loader2, ShieldAlert, Cpu } from 'lucide-react';

interface DataBankProps {
  user: UserProfile;
}

const DataBank: React.FC<DataBankProps> = ({ user }) => {
  const [encryptedEntries, setEncryptedEntries] = useState<string[]>([]);
  const [isDeciphering, setIsDeciphering] = useState(false);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // Removed BEHAVIORAL from required types as it is no longer supported
    const requiredTypes = [BiometricType.FACIAL, BiometricType.VOICE];
    const completed = requiredTypes.filter(type => 
      user.results.some(r => r.type === type && r.status === 'Pass')
    ).length;
    // Updated requirement to 2 types to match the rest of the application
    setIsReady(completed === 2);

    const generateEntries = async () => {
      if (user.results.length === 0) return;
      
      const newEntries = await Promise.all(
        user.results.map(r => transcribeToEncryptedData(r.details))
      );
      setEncryptedEntries(newEntries);
    };

    generateEntries();
  }, [user]);

  const decipherBank = () => {
    if (!isReady) return;
    setIsDeciphering(true);
    setTimeout(() => {
      setIsDeciphering(false);
    }, 2500);
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 animate-in fade-in duration-500">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-2xl font-bold flex items-center gap-3">
          <div className="p-2 bg-purple-500/20 rounded-xl">
            <Database className="text-purple-400" size={24} />
          </div>
          Encrypted Data Bank
        </h2>
        <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${isReady ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' : 'bg-red-500/10 text-red-400 border border-red-500/30'}`}>
          {isReady ? '2-AUTH_READY' : '2-AUTH_REQUIRED'}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-slate-950 rounded-2xl border border-slate-800 h-[400px] flex flex-col overflow-hidden shadow-inner">
            <div className="bg-slate-900/50 p-3 border-b border-slate-800 flex items-center justify-between">
              <div className="flex gap-1">
                <div className="w-2 h-2 rounded-full bg-red-500/40"></div>
                <div className="w-2 h-2 rounded-full bg-amber-500/40"></div>
                <div className="w-2 h-2 rounded-full bg-emerald-500/40"></div>
              </div>
              <span className="text-[10px] font-mono text-slate-500">SECURE_RECORDS_STREAM.BIN</span>
            </div>
            
            <div className="flex-1 p-6 font-mono text-xs overflow-y-auto custom-scrollbar">
              {encryptedEntries.length > 0 ? (
                encryptedEntries.map((entry, idx) => (
                  <div key={idx} className="mb-6 last:mb-0 opacity-60 hover:opacity-100 transition-opacity">
                    <div className="text-purple-400 mb-1">ENTRY_{idx.toString().padStart(3, '0')} (TYPE_{user.results[idx]?.type})</div>
                    <div className="break-all leading-relaxed bg-slate-900/40 p-3 rounded-lg border border-slate-800/50">
                      {entry}
                    </div>
                  </div>
                ))
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-slate-600 italic">
                  <Lock size={32} className="mb-4 opacity-10" />
                  No biometric signatures transcribed yet.
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800">
            <h3 className="font-bold mb-4 flex items-center gap-2">
              <Cpu size={18} className="text-purple-400" />
              Decipher Engine
            </h3>
            <p className="text-xs text-slate-500 mb-6 leading-relaxed">
              Records are transcribed into raw packet streams. Deciphering requires valid signatures from both primary authenticators.
            </p>
            
            <div className="space-y-3 mb-8">
              {[BiometricType.FACIAL, BiometricType.VOICE].map(type => {
                const isPassed = user.results.some(r => r.type === type && r.status === 'Pass');
                return (
                  <div key={type} className="flex items-center justify-between p-3 bg-slate-900 rounded-xl border border-slate-800">
                    <span className="text-[10px] font-bold text-slate-400">{type}</span>
                    {isPassed ? (
                      <Unlock size={14} className="text-emerald-400" />
                    ) : (
                      <Lock size={14} className="text-red-400 opacity-50" />
                    )}
                  </div>
                );
              })}
            </div>

            <button 
              onClick={decipherBank}
              disabled={!isReady || isDeciphering}
              className="w-full py-4 bg-purple-500 hover:bg-purple-400 disabled:bg-slate-800 disabled:text-slate-600 text-slate-950 font-bold rounded-xl shadow-[0_0_20px_rgba(168,85,247,0.2)] flex items-center justify-center gap-2 transition-all"
            >
              {isDeciphering ? <Loader2 size={20} className="animate-spin" /> : <Unlock size={20} />}
              {isDeciphering ? 'RECONSTRUCTING...' : 'DECIPHER BANK'}
            </button>
          </div>

          <div className="bg-amber-500/5 border border-amber-500/20 p-4 rounded-xl">
             <div className="flex items-start gap-3">
               <ShieldAlert size={18} className="text-amber-500 flex-shrink-0 mt-0.5" />
               <p className="text-[10px] text-amber-500/80 leading-relaxed uppercase font-mono">
                 Strict Protocol: Data bank accessibility resets after session timeout. All records are non-human readable without cryptographic reconstruction.
               </p>
             </div>
          </div>
        </div>
      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #1e293b; border-radius: 10px; }
      `}</style>
    </div>
  );
};

export default DataBank;
