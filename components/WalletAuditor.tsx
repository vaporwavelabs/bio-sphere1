
import React, { useState, useEffect } from 'react';
import { WalletAsset, WalletNode } from '../types';
import { scrubWalletSecurity } from '../services/gemini';
import { 
  ShieldCheck, ShieldAlert, Loader2, RefreshCw, 
  ExternalLink, AlertOctagon,
  Search, Info, Database, Zap, Activity, Globe, Lock, Unlock
} from 'lucide-react';

interface WalletAuditorProps {
  wallets: WalletNode[];
  onRestore: (id: string) => void;
}

const WalletAuditor: React.FC<WalletAuditorProps> = ({ wallets, onRestore }) => {
  const [selectedWalletId, setSelectedWalletId] = useState<string | null>(wallets[0]?.id || null);
  const [isScrubbing, setIsScrubbing] = useState(false);
  const [assets, setAssets] = useState<WalletAsset[]>([]);
  const [overallRisk, setOverallRisk] = useState(0);
  const [scrubPhase, setScrubPhase] = useState<string>("");
  const [realBalance, setRealBalance] = useState<string>("0.00");

  const activeWallet = wallets.find(w => w.id === selectedWalletId);

  const performScrub = async () => {
    if (!activeWallet || activeWallet.isLocked) return;
    setIsScrubbing(true);
    setScrubPhase("Initializing Real-Time Ledger Sync...");
    
    try {
      setScrubPhase("Querying Global Threat Intelligence...");
      const data = await scrubWalletSecurity(activeWallet.address, activeWallet.totalValue);
      setAssets(data);
      
      const avg = data.reduce((acc: number, curr: any) => acc + curr.riskScore, 0) / (data.length || 1);
      setOverallRisk(Math.round(avg));
      setScrubPhase("Scrub Protocol Finalized.");
    } catch (err) {
      console.error(err);
      setScrubPhase("Connection Error: Intelligence node offline.");
    } finally {
      setIsScrubbing(false);
    }
  };

  useEffect(() => { 
    if (activeWallet && !activeWallet.isLocked) performScrub(); 
    else {
      setAssets([]);
      setOverallRisk(0);
      setScrubPhase("");
    }
  }, [selectedWalletId]);

  if (wallets.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-32 bg-slate-900 border border-slate-800 rounded-[3rem] text-center max-w-2xl mx-auto shadow-2xl">
        <Globe className="text-slate-800 mb-6 animate-pulse" size={64} />
        <h2 className="text-2xl font-black text-slate-400 uppercase tracking-tighter mb-2">Protocol Halted</h2>
        <p className="text-[10px] text-slate-600 font-bold uppercase tracking-[0.4em]">Initialize a node on the Dashboard to access Scrub Protocol.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-700 pb-24">
      <div className="flex gap-4 overflow-x-auto pb-2 custom-scrollbar no-scrollbar">
        {wallets.map(w => (
          <button
            key={w.id}
            onClick={() => setSelectedWalletId(w.id)}
            className={`flex-shrink-0 px-6 py-4 rounded-2xl border transition-all text-left min-w-[200px] ${selectedWalletId === w.id ? 'bg-cyan-500 text-slate-950 border-cyan-400' : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'}`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-[9px] font-black uppercase tracking-widest">{w.name}</span>
              {w.isLocked && <Lock size={12} />}
            </div>
            <div className="font-mono text-xs truncate mb-1 opacity-70">{w.address}</div>
            <div className="font-black">{w.totalValue}</div>
          </button>
        ))}
      </div>

      <div className={`bg-slate-900 border border-slate-800 rounded-[2.5rem] p-6 md:p-8 shadow-2xl relative overflow-hidden ${activeWallet?.isLocked ? 'grayscale' : ''}`}>
        <div className="absolute top-0 right-0 p-8 opacity-5">
           <Database size={120} />
        </div>
        
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-8 relative z-10">
          <div>
            <h2 className="text-2xl font-black flex items-center gap-3 tracking-tighter uppercase">
               <div className="p-3 bg-orange-500/10 rounded-2xl border border-orange-500/20">
                 <Zap className="text-orange-400" size={24} />
               </div>
               {activeWallet?.isLocked ? 'NODE_LOCKED' : 'Scrub Protocol v3.1'}
            </h2>
            <div className="flex items-center gap-2 mt-2">
              <Activity size={12} className="text-emerald-500 animate-pulse" />
              <p className="text-slate-500 text-[9px] font-black uppercase tracking-[0.2em]">
                Live Feed: <span className="text-slate-300 font-mono">{activeWallet?.address}</span>
              </p>
            </div>
          </div>
          <button 
            onClick={performScrub} 
            disabled={isScrubbing || activeWallet?.isLocked} 
            className="w-full md:w-auto px-8 py-4 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-2xl flex items-center justify-center gap-3 transition-all active:scale-95 disabled:opacity-50 font-black text-xs uppercase tracking-widest border border-slate-700 shadow-xl"
          >
            <RefreshCw size={18} className={isScrubbing ? 'animate-spin' : ''} />
            {isScrubbing ? 'SCRUBBING...' : 'RE-SCAN_NODE'}
          </button>
        </div>

        {activeWallet?.isLocked ? (
          <div className="relative z-10 bg-red-500/10 border border-red-500/20 rounded-[2rem] p-10 text-center animate-pulse">
            <Lock size={64} className="text-red-400 mx-auto mb-6" />
            <h3 className="text-2xl font-black text-red-400 uppercase tracking-tighter mb-4">Integrity Breach Detected</h3>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.4em] mb-8 max-w-md mx-auto">
              This node has been placed in quarantine. ID Verification Protocol is required to restore access.
            </p>
            <button 
              onClick={() => onRestore(activeWallet.id)}
              className="px-10 py-5 bg-red-500 hover:bg-red-400 text-white font-black rounded-2xl transition-all shadow-xl shadow-red-500/20 active:scale-95 uppercase tracking-widest text-xs flex items-center justify-center gap-3 mx-auto"
            >
              <Unlock size={20} /> RESTORE VIA BIOMETRIC_ID
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10">
            <div className="bg-slate-950 p-6 rounded-[2rem] border border-slate-800 flex flex-col justify-center shadow-inner">
               <div className="text-[9px] text-slate-600 font-black uppercase tracking-[0.3em] mb-2">Native Balance</div>
               <div className="text-3xl font-black tracking-tighter text-cyan-400 font-mono">
                 {activeWallet?.totalValue || "0.00"}
               </div>
            </div>

            <div className="bg-slate-950 p-6 rounded-[2rem] border border-slate-800 flex items-center justify-between shadow-inner">
               <div>
                  <div className="text-[9px] text-slate-600 font-black uppercase tracking-[0.3em] mb-1">Threat Level</div>
                  <div className={`text-4xl font-black tracking-tighter ${overallRisk < 30 ? 'text-emerald-400' : overallRisk < 60 ? 'text-amber-400' : 'text-red-400'}`}>
                     {overallRisk}%
                  </div>
               </div>
               <div className={`w-14 h-14 rounded-2xl border-2 flex items-center justify-center ${overallRisk < 30 ? 'border-emerald-500/30 text-emerald-400 bg-emerald-500/5' : overallRisk < 60 ? 'border-amber-500/30 text-amber-400 bg-amber-500/5' : 'border-red-500/30 text-red-400 bg-red-500/5'}`}>
                  {overallRisk < 30 ? <ShieldCheck size={28} /> : overallRisk < 60 ? <ShieldAlert size={28} /> : <AlertOctagon size={28} />}
               </div>
            </div>
            
            <div className="bg-slate-950 p-6 rounded-[2rem] border border-slate-800 flex flex-col justify-center shadow-inner">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[9px] font-black text-slate-600 uppercase tracking-[0.3em] flex items-center gap-2">
                  <Search size={12} className="text-cyan-400" /> Protocol Log
                </span>
              </div>
              <div className="font-mono text-[10px] text-cyan-500/80 truncate mb-2">
                {scrubPhase || "Awaiting scan initiation..."}
              </div>
              <div className="w-full h-1 bg-slate-900 rounded-full overflow-hidden">
                 <div className={`h-full transition-all duration-700 ${isScrubbing ? 'bg-cyan-500 animate-pulse' : 'bg-slate-700'}`} style={{width: '100%'}} />
              </div>
            </div>
          </div>
        )}
      </div>

      {!activeWallet?.isLocked && (
        <div className="space-y-4">
          <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em] px-4 flex items-center gap-3">
            <div className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse"></div>
            Ledger Dependencies Found
          </h3>
          
          {isScrubbing ? (
            <div className="flex flex-col items-center justify-center py-32 bg-slate-900/50 border border-slate-800 rounded-[3rem] border-dashed">
              <Loader2 className="animate-spin text-orange-400 mb-6" size={48} />
              <span className="font-black text-[10px] uppercase tracking-[0.4em] text-slate-500">Executing Gemini Ledger Scrub...</span>
            </div>
          ) : assets.length > 0 ? (
            <div className="grid grid-cols-1 gap-4">
              {assets.map((asset, i) => (
                <div 
                  key={i} 
                  className="group flex flex-col md:flex-row items-start md:items-center justify-between p-6 bg-slate-900 border border-slate-800 rounded-3xl hover:border-orange-500/30 transition-all shadow-xl animate-in fade-in slide-in-from-bottom-2"
                  style={{animationDelay: `${i*0.1}s`}}
                >
                  <div className="flex items-start gap-6 flex-1 w-full">
                    <div className={`p-4 rounded-2xl flex-shrink-0 transition-all group-hover:scale-110 shadow-lg ${asset.riskScore > 60 ? 'bg-red-500/10 text-red-400 border border-red-500/20' : asset.riskScore > 30 ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'}`}>
                      {asset.isUnverified ? <AlertOctagon size={24} /> : asset.riskScore > 40 ? <ShieldAlert size={24} /> : <ShieldCheck size={24} />}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-1.5">
                        <span className="text-base font-black tracking-tight truncate">{asset.name}</span>
                        <span className="px-2.5 py-1 bg-slate-800 text-slate-400 rounded-lg text-[10px] font-black uppercase border border-slate-700">{asset.symbol}</span>
                      </div>
                      <p className="text-xs text-slate-500 leading-relaxed font-bold uppercase tracking-wide line-clamp-2 mb-3">
                        {asset.riskReason}
                      </p>
                      {asset.verifiedLink && (
                        <a 
                          href={asset.verifiedLink} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="inline-flex items-center gap-2 text-[9px] font-black text-cyan-500 hover:text-cyan-400 transition-colors uppercase tracking-[0.2em] bg-cyan-500/10 px-4 py-2 rounded-xl border border-cyan-500/20"
                        >
                          VIEW ON LEDGER <ExternalLink size={12} />
                        </a>
                      )}
                    </div>
                  </div>

                  <div className="mt-6 md:mt-0 md:ml-8 flex flex-col items-end gap-1">
                    <div className={`text-3xl font-black tabular-nums tracking-tighter ${asset.riskScore > 60 ? 'text-red-400' : asset.riskScore > 30 ? 'text-amber-400' : 'text-emerald-400'}`}>
                      {asset.riskScore}%
                    </div>
                    <div className="text-[8px] font-black text-slate-600 uppercase tracking-[0.3em]">RISK_SCORE</div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-32 bg-slate-900/50 border border-slate-800 rounded-[3rem] border-dashed">
              <Info className="mx-auto text-slate-800 mb-6" size={64} />
              <h4 className="text-slate-500 font-black uppercase tracking-[0.4em]">Zero Assets Found</h4>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default WalletAuditor;
