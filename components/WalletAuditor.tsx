
import React, { useState, useEffect } from 'react';
import { WalletAsset } from '../types';
import { scrubWalletSecurity } from '../services/gemini';
import { 
  ShieldCheck, ShieldAlert, Loader2, RefreshCw, 
  ChevronRight, ExternalLink, AlertOctagon,
  Search, Info, Database, Zap
} from 'lucide-react';

interface WalletAuditorProps {
  address: string;
}

const WalletAuditor: React.FC<WalletAuditorProps> = ({ address }) => {
  const [isScrubbing, setIsScrubbing] = useState(false);
  const [assets, setAssets] = useState<WalletAsset[]>([]);
  const [overallRisk, setOverallRisk] = useState(0);
  const [scrubPhase, setScrubPhase] = useState<string>("");

  const performScrub = async () => {
    setIsScrubbing(true);
    setScrubPhase("Initializing Ledger Sync...");
    
    try {
      // Simulate phases for UI flavor
      setTimeout(() => setScrubPhase("Analyzing Smart Contract Interactivity..."), 800);
      setTimeout(() => setScrubPhase("Cross-referencing Global Threat Databases..."), 1600);
      
      const data = await scrubWalletSecurity(address);
      setAssets(data);
      
      const avg = data.reduce((acc: number, curr: any) => acc + curr.riskScore, 0) / (data.length || 1);
      setOverallRisk(Math.round(avg));
      setScrubPhase("Scrub Protocol Finalized.");
    } catch (err) {
      console.error(err);
      setScrubPhase("Critical Scrub Error.");
    } finally {
      setIsScrubbing(false);
    }
  };

  useEffect(() => { performScrub(); }, [address]);

  return (
    <div className="space-y-6 animate-in fade-in duration-700 pb-24">
      {/* Header Section */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 md:p-8 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-5">
           <Database size={120} />
        </div>
        
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-8 relative z-10">
          <div>
            <h2 className="text-2xl font-bold flex items-center gap-3">
               <div className="p-2 bg-cyan-500/20 rounded-xl">
                 <ShieldCheck className="text-cyan-400" size={24} />
               </div>
               Wallet Scrub Protocol
            </h2>
            <p className="text-slate-500 text-xs mt-1 uppercase tracking-widest font-mono">
              Analyzing Node: <span className="text-slate-300">{address}</span>
            </p>
          </div>
          <button 
            onClick={performScrub} 
            disabled={isScrubbing} 
            className="w-full md:w-auto px-6 py-3 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-2xl flex items-center justify-center gap-3 transition-all active:scale-95 disabled:opacity-50"
          >
            <RefreshCw size={18} className={isScrubbing ? 'animate-spin' : ''} />
            {isScrubbing ? 'SCRUBBING...' : 'RE-SCAN LEDGER'}
          </button>
        </div>

        {/* Risk Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 relative z-10">
          <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 flex items-center justify-between col-span-1 md:col-span-1">
             <div>
                <div className="text-[10px] text-slate-500 font-bold uppercase mb-1">Cumulative Threat</div>
                <div className={`text-5xl font-black tracking-tighter ${overallRisk < 30 ? 'text-emerald-400' : overallRisk < 60 ? 'text-amber-400' : 'text-red-400'}`}>
                   {overallRisk}%
                </div>
             </div>
             <div className={`w-14 h-14 rounded-2xl border-2 flex items-center justify-center ${overallRisk < 30 ? 'border-emerald-500/30 text-emerald-400 bg-emerald-500/5' : overallRisk < 60 ? 'border-amber-500/30 text-amber-400 bg-amber-500/5' : 'border-red-500/30 text-red-400 bg-red-500/5'}`}>
                {overallRisk < 30 ? <ShieldCheck size={28} /> : overallRisk < 60 ? <ShieldAlert size={28} /> : <AlertOctagon size={28} />}
             </div>
          </div>
          
          <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 col-span-1 md:col-span-2 flex flex-col justify-center">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                <Search size={12} className="text-cyan-400" /> Current Operation
              </span>
              {isScrubbing && <div className="flex gap-1">
                {[1,2,3].map(i => <div key={i} className="w-1 h-1 bg-cyan-400 rounded-full animate-bounce" style={{animationDelay: `${i*0.2}s`}} />)}
              </div>}
            </div>
            <div className="font-mono text-sm text-cyan-400 mb-2 truncate">
              {scrubPhase || "Awaiting scan initiation..."}
            </div>
            <div className="w-full h-1.5 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
               <div className={`h-full transition-all duration-1000 ${isScrubbing ? 'bg-cyan-500 animate-pulse' : 'bg-slate-700'}`} style={{width: isScrubbing ? '85%' : '100%'}} />
            </div>
          </div>
        </div>
      </div>

      {/* Asset List */}
      <div className="space-y-3">
        <h3 className="text-xs font-black text-slate-500 uppercase tracking-[0.3em] px-2 flex items-center gap-2">
          <Zap size={14} className="text-amber-400" /> Detected Ledger Artifacts
        </h3>
        
        {isScrubbing ? (
          <div className="flex flex-col items-center justify-center py-24 bg-slate-900/50 border border-slate-800 rounded-3xl border-dashed">
            <Loader2 className="animate-spin text-cyan-400 mb-4" size={40} />
            <span className="font-mono text-xs uppercase tracking-widest text-slate-500">Unpacking Blockchain Data...</span>
          </div>
        ) : assets.length > 0 ? (
          <div className="grid grid-cols-1 gap-3">
            {assets.map((asset, i) => (
              <div 
                key={i} 
                className="group flex flex-col md:flex-row items-start md:items-center justify-between p-5 md:p-6 bg-slate-900 border border-slate-800 rounded-2xl hover:border-slate-700 transition-all shadow-lg animate-in fade-in slide-in-from-bottom-2"
                style={{animationDelay: `${i*0.1}s`}}
              >
                <div className="flex items-start gap-5 flex-1 w-full">
                  <div className={`p-3 rounded-2xl flex-shrink-0 transition-transform group-hover:scale-110 ${asset.riskScore > 60 ? 'bg-red-500/10 text-red-400' : asset.riskScore > 30 ? 'bg-amber-500/10 text-amber-400' : 'bg-emerald-500/10 text-emerald-400'}`}>
                    {asset.isUnverified ? <AlertOctagon size={24} /> : asset.riskScore > 40 ? <ShieldAlert size={24} /> : <ShieldCheck size={24} />}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-black tracking-tight truncate">{asset.name}</span>
                      <span className="px-2 py-0.5 bg-slate-800 text-slate-500 rounded text-[9px] font-mono font-bold">{asset.symbol}</span>
                      {asset.isUnverified && (
                        <span className="px-2 py-0.5 bg-red-500/20 text-red-400 rounded text-[9px] font-black uppercase flex items-center gap-1 border border-red-500/20">
                          Unverified
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 leading-relaxed font-medium line-clamp-2 md:line-clamp-1 mb-2">
                      {asset.riskReason}
                    </p>
                    {asset.verifiedLink && (
                      <a 
                        href={asset.verifiedLink} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="inline-flex items-center gap-1.5 text-[10px] font-bold text-cyan-500 hover:text-cyan-400 transition-colors uppercase tracking-widest bg-cyan-500/5 px-2 py-1 rounded-lg"
                      >
                        Source Evidence <ExternalLink size={10} />
                      </a>
                    )}
                  </div>
                </div>

                <div className="mt-4 md:mt-0 md:ml-6 flex items-center justify-between w-full md:w-auto md:flex-col md:items-end md:gap-1">
                  <div className={`text-2xl font-black tabular-nums ${asset.riskScore > 60 ? 'text-red-400' : asset.riskScore > 30 ? 'text-amber-400' : 'text-emerald-400'}`}>
                    {asset.riskScore}%
                  </div>
                  <div className="text-[9px] font-black text-slate-600 uppercase tracking-[0.2em]">
                    {asset.type} Threat
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-24 bg-slate-900/50 border border-slate-800 rounded-3xl border-dashed">
            <Info className="mx-auto text-slate-700 mb-4" size={48} />
            <h4 className="text-slate-400 font-bold uppercase tracking-widest mb-2">Empty Ledger Node</h4>
            <p className="text-xs text-slate-600 max-w-xs mx-auto">No assets detected on this perimeter. Re-verify the node address.</p>
          </div>
        )}
      </div>

      <div className="bg-blue-500/5 border border-blue-500/10 p-5 rounded-2xl flex items-start gap-4">
        <Info size={20} className="text-blue-500 flex-shrink-0 mt-0.5" />
        <div>
          <h5 className="text-[10px] font-black text-blue-500 uppercase tracking-widest mb-1">Scrubbing Logic Note</h5>
          <p className="text-[10px] text-slate-500 leading-relaxed uppercase font-mono">
            Unverified contracts and transactions are flagged based on lack of source code verification on block explorers. 
            External links are provided via Gemini real-time search grounding for live project verification.
          </p>
        </div>
      </div>
    </div>
  );
};

export default WalletAuditor;
