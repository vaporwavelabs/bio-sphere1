
import React, { useState } from 'react';
import { BiometricResult, BiometricType, SecurityLog, WalletNode } from '../types';
import SecurityLogs from './SecurityLogs';
import { 
  ShieldCheck, Clock, Activity, ArrowRight, Mic2, Scan, Wallet, Search, Sparkles, CheckCircle2, 
  Database, UserCircle, Link as LinkIcon, Lock, AlertCircle, HardDrive, Loader2, Send, Zap
} from 'lucide-react';

interface DashboardProps {
  results: BiometricResult[];
  onNavigate: (view: any) => void;
  progress: number;
  logs: SecurityLog[];
  isIdGenerated?: boolean;
  onGenerateId: () => void;
  wallets: WalletNode[];
  onWalletConnect: (address: string) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ 
  results, onNavigate, progress, logs, isIdGenerated, onGenerateId, wallets, onWalletConnect 
}) => {
  const [isConnecting, setIsConnecting] = useState(false);

  const stats = [
    { label: 'Integrity', value: `${progress}%`, icon: ShieldCheck, color: 'text-cyan-400' },
    { label: 'Active Nodes', value: (wallets || []).length, icon: Activity, color: 'text-emerald-400' },
    { label: 'Total Value', value: (wallets || []).reduce((acc, w) => acc + (parseFloat(w.totalValue) || 0), 0).toFixed(2) + ' ETH', icon: Database, color: 'text-indigo-400' },
    { label: 'Threats', value: logs.filter(l => l.severity === 'HIGH').length || 0, icon: Clock, color: 'text-red-400' },
  ];

  const handleWalletLink = async () => {
    if (typeof (window as any).ethereum !== 'undefined') {
      setIsConnecting(true);
      try {
        const accounts = await (window as any).ethereum.request({ method: 'eth_requestAccounts' });
        const address = accounts[0];
        onWalletConnect(address);
        onNavigate('WALLETS');
      } catch (err) {
        console.error("Wallet link failed", err);
      } finally {
        setIsConnecting(false);
      }
    } else {
      alert("Ethereum provider (MetaMask) required.");
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700 pb-20">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-slate-900 border border-slate-800 p-6 rounded-[2rem] shadow-xl backdrop-blur-sm bg-opacity-50 group hover:border-cyan-500/30 transition-all">
            <stat.icon size={18} className={`${stat.color} mb-3 group-hover:scale-110 transition-transform`} />
            <div className="text-[9px] font-black text-slate-600 uppercase tracking-[0.2em] mb-1">{stat.label}</div>
            <div className="text-xl font-black tracking-tighter truncate">{stat.value}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-slate-900 border border-slate-800 p-8 rounded-[2.5rem] shadow-2xl relative overflow-hidden group">
            <h3 className="text-xl font-black uppercase tracking-tight mb-6 flex items-center gap-3">
              <Zap className="text-orange-400" size={20} /> Verified Ledger Nodes
            </h3>

            <div className="space-y-4">
              {wallets && wallets.length > 0 ? wallets.map(wallet => (
                <div key={wallet.id} className={`p-5 rounded-2xl border transition-all ${wallet.isLocked ? 'bg-red-500/5 border-red-500/20' : 'bg-slate-950 border-slate-800 hover:border-cyan-500/30'}`}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-300">{wallet.name}</span>
                    <div className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-tighter ${wallet.isLocked ? 'bg-red-500/20 text-red-400' : 'bg-emerald-500/20 text-emerald-400'}`}>
                      {wallet.isLocked ? 'LOCKED' : 'ACTIVE'}
                    </div>
                  </div>
                  <div className="flex items-end justify-between">
                    <div>
                      <div className="text-xs font-mono text-slate-500 truncate w-32">{wallet.address}</div>
                      <div className="text-lg font-black text-white mt-1">{wallet.totalValue}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-[8px] font-black text-slate-600 uppercase mb-0.5">SEC_SCORE</div>
                      <div className={`text-lg font-black ${wallet.securityScore > 70 ? 'text-emerald-400' : 'text-amber-400'}`}>
                        {wallet.securityScore}%
                      </div>
                    </div>
                  </div>
                  {wallet.isLocked && (
                    <button 
                      onClick={() => onNavigate('WALLETS')}
                      className="mt-4 w-full py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 text-[10px] font-black uppercase tracking-widest rounded-xl border border-red-500/20 flex items-center justify-center gap-2"
                    >
                      <Lock size={12} /> RESTORE ACCESS
                    </button>
                  )}
                </div>
              )) : (
                <div className="text-center py-10 text-slate-700">
                  <Wallet size={40} className="mx-auto mb-4 opacity-10" />
                  <p className="text-[10px] uppercase font-black tracking-widest">No nodes found.</p>
                </div>
              )}
            </div>

            {(!wallets || wallets.length === 0) && (
              <button 
                onClick={handleWalletLink}
                className="mt-6 w-full py-4 bg-orange-500 hover:bg-orange-400 text-slate-950 font-black rounded-2xl flex items-center justify-center gap-3 transition-all active:scale-95 uppercase tracking-widest text-xs"
              >
                <LinkIcon size={18} /> INITIALIZE NEW NODE
              </button>
            )}
          </div>

          <div className="bg-slate-900 border border-slate-800 p-8 rounded-[2.5rem] shadow-2xl relative overflow-hidden">
             <h3 className="text-xl font-black uppercase tracking-tight mb-6 flex items-center gap-3">
              <ShieldCheck className="text-cyan-400" size={20} /> Verification Registry
            </h3>
            <div className="space-y-3">
              {[BiometricType.FACIAL, BiometricType.VOICE, BiometricType.SCAN_MACHINE].map(type => {
                const passed = results.some(r => r.type === type && r.status === 'Pass');
                return (
                  <div key={type} className={`flex items-center justify-between p-4 bg-slate-950 rounded-2xl border ${passed ? 'border-emerald-500/20' : 'border-slate-800 opacity-50'}`}>
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{type}</span>
                    {passed ? <CheckCircle2 size={14} className="text-emerald-400" /> : <Lock size={14} className="text-slate-700" />}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="lg:col-span-7 flex flex-col gap-8">
          {isIdGenerated ? (
            <div className="space-y-8 animate-in slide-in-from-right-8 duration-700">
              <div className="bg-slate-900 border border-slate-800 p-8 rounded-[2.5rem] shadow-2xl">
                <div className="flex items-center justify-between mb-8">
                  <h3 className="text-xl font-black uppercase tracking-tight flex items-center gap-3">
                    <Database className="text-indigo-400" size={20} /> Operational Center
                  </h3>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[
                    { id: 'WALLETS', label: 'Scrub & Restore', icon: Wallet, desc: 'Manage ledger safety' },
                    { id: 'ANALYZER', label: 'Threat Intel', icon: Search, desc: 'External node scan' },
                    { id: 'DATABANK', label: 'Encrypted Vault', icon: Database, desc: 'Decipher archives' },
                    { id: BiometricType.BLOCKCHAIN, label: 'Mint Anchor', icon: LinkIcon, desc: 'Push ID to ledger' },
                  ].map((item) => (
                    <button
                      key={item.id}
                      onClick={() => onNavigate(item.id)}
                      className="group flex flex-col items-start p-6 bg-slate-950 border border-slate-800 rounded-3xl hover:border-cyan-500/50 hover:bg-slate-900 transition-all active:scale-95 text-left shadow-lg"
                    >
                      <div className="p-3 bg-slate-900 rounded-xl mb-4 group-hover:bg-cyan-500 group-hover:text-slate-950 transition-colors">
                        <item.icon size={20} />
                      </div>
                      <div className="text-sm font-black uppercase tracking-widest mb-1">{item.label}</div>
                      <div className="text-[9px] text-slate-600 font-bold uppercase tracking-wider">{item.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              <SecurityLogs logs={logs} />
            </div>
          ) : (
            <div className="flex-1 min-h-[400px] flex flex-col items-center justify-center p-12 text-center border-2 border-dashed border-slate-900 rounded-[3rem] bg-slate-950/20">
              <Lock size={64} className="text-slate-800 mb-6" />
              <h3 className="text-2xl font-black text-slate-800 uppercase tracking-tighter mb-2">Access Suspended</h3>
              <p className="text-[10px] text-slate-700 font-bold uppercase tracking-[0.3em] max-w-xs">
                Verification process incomplete. Synchronize all biometric modes to unlock terminal.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
