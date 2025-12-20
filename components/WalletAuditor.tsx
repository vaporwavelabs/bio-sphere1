
import React, { useState, useEffect } from 'react';
import { WalletAsset } from '../types';
import { scrubWalletSecurity } from '../services/gemini';
import { ShieldCheck, ShieldAlert, ShieldX, Loader2, RefreshCw, ChevronRight } from 'lucide-react';

interface WalletAuditorProps {
  address: string;
}

const WalletAuditor: React.FC<WalletAuditorProps> = ({ address }) => {
  const [isScrubbing, setIsScrubbing] = useState(false);
  const [assets, setAssets] = useState<WalletAsset[]>([]);
  const [overallRisk, setOverallRisk] = useState(0);

  const performScrub = async () => {
    setIsScrubbing(true);
    try {
      const data = await scrubWalletSecurity(address);
      setAssets(data);
      const avg = data.reduce((acc: number, curr: any) => acc + curr.riskScore, 0) / data.length;
      setOverallRisk(Math.round(avg));
    } catch (err) {
      console.error(err);
    } finally {
      setIsScrubbing(false);
    }
  };

  useEffect(() => { performScrub(); }, [address]);

  return (
    <div className="space-y-4 animate-in fade-in duration-500">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl md:rounded-3xl p-5 md:p-8">
        <div className="flex items-center justify-between mb-6 md:mb-8">
          <h2 className="text-xl md:text-2xl font-bold flex items-center gap-2">
             <ShieldCheck className="text-cyan-400" size={20} /> Scrub Protocol
          </h2>
          <button onClick={performScrub} disabled={isScrubbing} className="p-2 bg-slate-800 rounded-xl hover:bg-slate-700">
            <RefreshCw size={16} className={isScrubbing ? 'animate-spin' : ''} />
          </button>
        </div>

        <div className="flex flex-col md:flex-row gap-4 mb-6 md:mb-10">
          <div className="bg-slate-950 p-6 rounded-2xl border border-slate-800 flex-1 flex items-center justify-between">
             <div>
                <div className="text-[10px] text-slate-500 font-bold uppercase mb-1">Total Risk</div>
                <div className={`text-4xl font-bold ${overallRisk < 20 ? 'text-green-400' : 'text-amber-400'}`}>
                   {overallRisk}%
                </div>
             </div>
             <div className="w-16 h-16 rounded-full border-4 border-slate-800 flex items-center justify-center">
                <ShieldCheck className={overallRisk < 50 ? 'text-green-400' : 'text-amber-400'} size={24} />
             </div>
          </div>
          <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 text-[10px] font-mono text-slate-500">
             <span className="text-cyan-400 block mb-1">NODE_AUDIT_LOG:</span>
             ADDRESS_TARGET: {address}<br/>
             INTEGRITY_CHECK: COMPLETE
          </div>
        </div>

        <div className="space-y-3">
           {isScrubbing ? (
              <div className="flex flex-col items-center py-10 text-slate-500">
                <Loader2 className="animate-spin mb-3" size={24} />
                <span className="font-mono text-[9px] uppercase tracking-widest">Scanning_Ledger...</span>
              </div>
           ) : (
             <div className="grid grid-cols-1 gap-2">
                {assets.map((asset, i) => (
                   <div key={i} className="flex items-center justify-between p-3 bg-slate-950 rounded-xl border border-slate-800 active:bg-slate-800 transition-all">
                      <div className="flex items-center gap-3">
                         <div className={`p-1.5 rounded-lg ${asset.riskScore > 50 ? 'bg-red-500/10 text-red-400' : 'bg-green-500/10 text-green-400'}`}>
                            {asset.riskScore > 50 ? <ShieldX size={16} /> : <ShieldCheck size={16} />}
                         </div>
                         <div>
                            <div className="text-xs font-bold">{asset.name}</div>
                            <div className="text-[9px] text-slate-500 leading-tight">{asset.riskReason}</div>
                         </div>
                      </div>
                      <div className="text-right flex items-center gap-3">
                         <div>
                            <div className={`text-[10px] font-bold ${asset.riskScore > 50 ? 'text-red-400' : 'text-green-400'}`}>{asset.riskScore}%</div>
                            <div className="text-[8px] text-slate-600 font-bold uppercase">{asset.type}</div>
                         </div>
                         <ChevronRight size={14} className="text-slate-700" />
                      </div>
                   </div>
                ))}
             </div>
           )}
        </div>
      </div>
    </div>
  );
};

const ShieldX = ({ size }: { size: number }) => <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"/><path d="m14.5 9-5 5"/><path d="m9.5 9 5 5"/></svg>;

export default WalletAuditor;
