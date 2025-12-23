
import React, { useState, useEffect } from 'react';
import { WalletAsset, WalletNode } from '../types';
import { scrubWalletSecurity } from '../services/gemini';
import { 
  ShieldCheck, ShieldAlert, Loader2, RefreshCw, 
  ExternalLink, AlertOctagon,
  Search, Info, Database, Zap, Activity, Globe, Lock, Unlock, LogOut
} from 'lucide-react';

interface WalletAuditorProps {
  wallets: WalletNode[];
  onRestore: (id: string) => void;
  onDisconnect: () => void;
}

const WalletAuditor: React.FC<WalletAuditorProps> = ({ wallets, onRestore, onDisconnect }) => {
  const [selectedWalletId, setSelectedWalletId] = useState<string | null>(wallets[0]?.id || null);
  const [isScrubbing, setIsScrubbing] = useState(false);
  const [assets, setAssets] = useState<WalletAsset[]>([]);
  const [overallRisk, setOverallRisk] = useState(0);
  const [scrubPhase, setScrubPhase] = useState<string>("");

  const activeWallet = wallets.find(w => w.id === selectedWalletId);

  const performScrub = async () => {
    if (!activeWallet || activeWallet.isLocked) return;
    setIsScrubbing(true);
    setScrubPhase("Initializing Ledger Sync...");
    
    try {
      const data = await scrubWalletSecurity(activeWallet.address, activeWallet.totalValue);
      setAssets(data);
      const avg = data.reduce((acc: number, curr: any) => acc + curr.riskScore, 0) / (data.length || 1);
      setOverallRisk(Math.round(avg));
      setScrubPhase("Node Purified.");
    } catch (err) {
      setScrubPhase("Sync Protocol Error.");
    } finally {
      setIsScrubbing(false);
    }
  };

  useEffect(() => { 
    if (activeWallet && !activeWallet.isLocked) performScrub(); 
    else { setAssets([]); setOverallRisk(0); setScrubPhase(""); }
  }, [selectedWalletId]);

  if (wallets.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-32 bg-slate-900 border border-slate-800 rounded-[3rem] text-center max-w-2xl mx-auto shadow-2xl">
        <Globe className="text-slate-800 mb-6 animate-pulse" size={64} />
        <h2 className="text-2xl font-black text-slate-400 uppercase tracking-tighter mb-2">Node Required</h2>
        <p className="text-[10px] text-slate-600 font-bold uppercase tracking-[0.4em]">Establish a Web3 bridge on the Dashboard.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-700 pb-24">
      <div className="flex gap-4 overflow-x-auto pb-2 no-scrollbar">
        {wallets.map(w => (
          <button
            key={w.id}
            onClick={() => setSelectedWalletId(w.id)}
            className={`flex-shrink-0 px-6 py-4 rounded-2xl border transition-all text-left min-w-[200px] ${selectedWalletId === w.id ? 'bg-cyan-500 text-slate-950 border-cyan-400' : 'bg-slate-900 border-slate-800 text-slate-400'}`}
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

      <div className="bg-slate-900 border border-slate-800 rounded-[2.5rem] p-8 shadow-2xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-8 relative z-10">
          <div>
            <h2 className="text-2xl font-black flex items-center gap-3 tracking-tighter uppercase">
               <div className="p-3 bg-cyan-500/10 rounded-2xl border border-cyan-500/20">
                 <Zap className="text-cyan-400" size={24} />
               </div>
               Audit Protocol
            </h2>
            <p className="text-slate-500 text-[9px] font-black uppercase tracking-[0.2em] mt-2">Active Node: {activeWallet?.address}</p>
          </div>
          
          <div className="flex items-center gap-4 w-full md:w-auto">
            <button 
              onClick={onDisconnect} 
              className="flex-1 md:flex-none px-6 py-4 bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white rounded-2xl font-black text-[10px] uppercase tracking-widest border border-red-500/20 flex items-center justify-center gap-2 transition-all"
            >
              <LogOut size={16} /> Disconnect
            </button>
            <button 
              onClick={performScrub} 
              disabled={isScrubbing || activeWallet?.isLocked} 
              className="flex-1 md:flex-none px-6 py-4 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-2xl font-black text-[10px] uppercase tracking-widest border border-slate-700 flex items-center justify-center gap-2"
            >
              <RefreshCw size={16} className={isScrubbing ? 'animate-spin' : ''} /> Rescan
            </button>
          </div>
        </div>

        {activeWallet?.isLocked ? (
          <div className="text-center py-10 bg-red-500/5 rounded-[2rem] border border-red-500/20">
            <Lock size={48} className="mx-auto mb-4 text-red-400" />
            <h3 className="text-xl font-black text-red-400 uppercase tracking-tighter mb-4">Node Quarantined</h3>
            <button 
              onClick={() => onRestore(activeWallet.id)}
              className="px-8 py-4 bg-red-500 text-white font-black rounded-xl uppercase tracking-widest text-[10px]"
            >
              Initiate ID Recovery
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-slate-950 p-6 rounded-[2rem] border border-slate-800 shadow-inner">
               <div className="text-[9px] text-slate-600 font-black uppercase tracking-[0.3em] mb-2">Threat Rating</div>
               <div className={`text-4xl font-black tracking-tighter ${overallRisk < 30 ? 'text-emerald-400' : 'text-red-400'}`}>
                  {overallRisk}%
               </div>
            </div>
            <div className="bg-slate-950 p-6 rounded-[2rem] border border-slate-800 shadow-inner">
               <div className="text-[9px] text-slate-600 font-black uppercase tracking-[0.3em] mb-1">Status</div>
               <div className="font-mono text-xs text-cyan-500/80 truncate">
                 {scrubPhase || "Awaiting Node Scrub..."}
               </div>
            </div>
          </div>
        )}
      </div>

      {!activeWallet?.isLocked && (
        <div className="space-y-4">
          {isScrubbing ? (
            <div className="py-20 text-center border-2 border-dashed border-slate-800 rounded-[3rem]">
              <Loader2 className="animate-spin text-cyan-400 mx-auto mb-4" size={32} />
              <p className="text-[10px] uppercase tracking-widest text-slate-500">Executing Ledger Sweep...</p>
            </div>
          ) : assets.map((asset, i) => (
            <div key={i} className="flex items-center justify-between p-6 bg-slate-900 border border-slate-800 rounded-3xl animate-in slide-in-from-bottom-2">
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-xl ${asset.riskScore > 50 ? 'bg-red-500/10 text-red-400' : 'bg-emerald-500/10 text-emerald-400'}`}>
                  {asset.riskScore > 50 ? <AlertOctagon size={20} /> : <ShieldCheck size={20} />}
                </div>
                <div>
                  <div className="text-sm font-black tracking-tight">{asset.name}</div>
                  <div className="text-[9px] text-slate-500 uppercase tracking-widest">{asset.symbol}</div>
                </div>
              </div>
              <div className="text-right">
                <div className={`text-xl font-black tracking-tighter ${asset.riskScore > 50 ? 'text-red-400' : 'text-emerald-400'}`}>{asset.riskScore}%</div>
                <div className="text-[8px] font-black text-slate-700 uppercase">Risk</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default WalletAuditor;
