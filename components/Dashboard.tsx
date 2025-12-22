
import React, { useState } from 'react';
import { BiometricResult, BiometricType, SecurityLog, WalletNode } from '../types';
import SecurityLogs from './SecurityLogs';
import { 
  ShieldCheck, Clock, Activity, ArrowRight, Mic2, Scan, Wallet, Search, Sparkles, CheckCircle2, 
  Database, UserCircle, Link as LinkIcon, Lock, AlertCircle, HardDrive, Loader2, Send, Zap, Globe
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
  isMinted: boolean;
}

const Dashboard: React.FC<DashboardProps> = ({ 
  results, onNavigate, progress, logs, isIdGenerated, onGenerateId, wallets, onWalletConnect, isMinted 
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
      {/* Dynamic CTA Banner */}
      {!wallets?.some(w => w.address) ? (
        <div className="bg-gradient-to-r from-orange-500/20 via-orange-500/10 to-transparent border border-orange-500/30 p-8 rounded-[3rem] shadow-2xl flex flex-col md:flex-row items-center justify-between gap-6 group">
          <div className="flex items-center gap-6">
            <div className="p-5 bg-orange-500/10 rounded-3xl border border-orange-500/20 group-hover:scale-110 transition-transform">
              <Wallet className="text-orange-500" size={32} />
            </div>
            <div>
              <h3 className="text-xl font-black text-white uppercase tracking-tighter mb-1">Node Synchronization Required</h3>
              <p className="text-orange-500/60 text-[10px] font-black uppercase tracking-widest">Connect provider to authorize ledger access</p>
            </div>
          </div>
          <button 
            onClick={handleWalletLink}
            disabled={isConnecting}
            className="w-full md:w-auto px-10 py-5 bg-orange-500 hover:bg-orange-400 text-slate-950 font-black rounded-2xl flex items-center justify-center gap-3 transition-all active:scale-95 uppercase tracking-widest text-xs shadow-xl shadow-orange-500/20"
          >
            {isConnecting ? <Loader2 className="animate-spin" size={20} /> : <Zap size={20} />}
            Initialize Wallet Node
          </button>
        </div>
      ) : !isMinted && (
        <div className="bg-gradient-to-r from-emerald-500/20 via-emerald-500/10 to-transparent border border-emerald-500/30 p-8 rounded-[3rem] shadow-2xl flex flex-col md:flex-row items-center justify-between gap-6 group animate-in slide-in-from-top-4">
          <div className="flex items-center gap-6">
            <div className="p-5 bg-emerald-500/10 rounded-3xl border border-emerald-500/20 group-hover:scale-110 transition-transform relative">
              <LinkIcon className="text-emerald-500" size={32} />
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-400 rounded-full animate-ping"></div>
            </div>
            <div>
              <h3 className="text-xl font-black text-white uppercase tracking-tighter mb-1">Identity Anchor Pending</h3>
              <p className="text-emerald-500/60 text-[10px] font-black uppercase tracking-widest">Mint profile NFT to anchor node on-chain</p>
            </div>
          </div>
          <button 
            onClick={() => onNavigate(BiometricType.BLOCKCHAIN)}
            className="w-full md:w-auto px-10 py-5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black rounded-2xl flex items-center justify-center gap-3 transition-all active:scale-95 uppercase tracking-widest text-xs shadow-xl shadow-emerald-500/20"
          >
            <Sparkles size={20} /> Anchor Identity NFT
          </button>
        </div>
      )}

      {/* Real-time Stats */}
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
        {/* Left Column: Wallets & Restoration Status */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-slate-900 border border-slate-800 p-8 rounded-[2.5rem] shadow-2xl relative overflow-hidden group">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-black uppercase tracking-tight flex items-center gap-3">
                <Globe className="text-cyan-400" size={20} /> Ledger Topology
              </h3>
              <button onClick={() => onNavigate('WALLETS')} className="text-slate-600 hover:text-cyan-400 text-[10px] font-black uppercase tracking-widest">Manage All Node Access</button>
            </div>

            <div className="space-y-4">
              {wallets && wallets.length > 0 ? wallets.map(wallet => (
                <div key={wallet.id} className={`p-5 rounded-2xl border transition-all ${wallet.isLocked ? 'bg-red-500/5 border-red-500/20' : 'bg-slate-950 border-slate-800 hover:border-cyan-500/30 shadow-inner'}`}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-300">{wallet.name}</span>
                    <div className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-tighter ${wallet.isLocked ? 'bg-red-500/20 text-red-400' : 'bg-emerald-500/20 text-emerald-400'}`}>
                      {wallet.isLocked ? 'QUARANTINED' : 'ACTIVE_NODE'}
                    </div>
                  </div>
                  <div className="flex items-end justify-between">
                    <div>
                      <div className="text-xs font-mono text-slate-500 truncate w-32">{wallet.address}</div>
                      <div className="text-lg font-black text-white mt-1">{wallet.totalValue}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-[8px] font-black text-slate-600 uppercase mb-0.5">SEC_RATING</div>
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
                      <Lock size={12} /> INITIATE_ID_RECOVERY
                    </button>
                  )}
                </div>
              )) : (
                <div className="text-center py-10 text-slate-700">
                  <Wallet size={40} className="mx-auto mb-4 opacity-10" />
                  <p className="text-[10px] uppercase font-black tracking-widest">No active nodes connected.</p>
                </div>
              )}
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 p-8 rounded-[2.5rem] shadow-2xl relative overflow-hidden">
             <h3 className="text-xl font-black uppercase tracking-tight mb-6 flex items-center gap-3">
              <ShieldCheck className="text-cyan-400" size={20} /> Biometric Registry
            </h3>
            <div className="space-y-3">
              {[BiometricType.FACIAL, BiometricType.VOICE].map(type => {
                const passed = results.some(r => r.type === type && r.status === 'Pass');
                return (
                  <div key={type} className={`flex items-center justify-between p-4 bg-slate-950 rounded-2xl border ${passed ? 'border-emerald-500/20' : 'border-slate-800 opacity-50'}`}>
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{type}</span>
                    {passed ? <CheckCircle2 size={14} className="text-emerald-400" /> : <Lock size={14} className="text-slate-700" />}
                  </div>
                );
              })}
              <div className="flex items-center justify-between p-4 bg-slate-950/20 rounded-2xl border border-slate-900 border-dashed opacity-30">
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-700 italic">MACHINE_SCAN_BYPASSED</span>
                <Clock size={14} className="text-slate-800" />
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Threat Log Feed */}
        <div className="lg:col-span-7 flex flex-col gap-8">
          {isIdGenerated ? (
            <div className="space-y-8 animate-in slide-in-from-right-8 duration-700">
              <SecurityLogs logs={logs} />

              <div className="bg-slate-900 border border-slate-800 p-8 rounded-[2.5rem] shadow-2xl">
                <div className="flex items-center justify-between mb-8">
                  <h3 className="text-xl font-black uppercase tracking-tight flex items-center gap-3">
                    <Database className="text-indigo-400" size={20} /> Perimeter Commands
                  </h3>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[
                    { id: 'WALLETS', label: 'Wallet Audit', icon: Wallet, desc: 'Scrub & Restore nodes' },
                    { id: 'ANALYZER', label: 'Threat Intel', icon: Search, desc: 'Scan external domains' },
                    { id: 'DATABANK', label: 'Vault Access', icon: Database, desc: 'Decrypt node history' },
                    { id: BiometricType.BLOCKCHAIN, label: 'Ledger Mint', icon: LinkIcon, desc: isMinted ? 'Identity Anchored' : 'Anchor profile NFT' },
                  ].map((item) => (
                    <button
                      key={item.id}
                      onClick={() => onNavigate(item.id)}
                      className={`group flex flex-col items-start p-6 bg-slate-950 border border-slate-800 rounded-3xl transition-all active:scale-95 text-left shadow-lg ${item.id === BiometricType.BLOCKCHAIN && isMinted ? 'border-emerald-500/30 opacity-70' : 'hover:border-cyan-500/50 hover:bg-slate-900'}`}
                    >
                      <div className={`p-3 rounded-xl mb-4 transition-colors ${item.id === BiometricType.BLOCKCHAIN && isMinted ? 'bg-emerald-500/10 text-emerald-400' : 'bg-slate-900 group-hover:bg-cyan-500 group-hover:text-slate-950'}`}>
                        <item.icon size={20} />
                      </div>
                      <div className="text-sm font-black uppercase tracking-widest mb-1">{item.label}</div>
                      <div className="text-[9px] text-slate-600 font-bold uppercase tracking-wider">{item.desc}</div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="flex-1 min-h-[400px] flex flex-col items-center justify-center p-12 text-center border-2 border-dashed border-slate-900 rounded-[3rem] bg-slate-950/20">
              <Lock size={64} className="text-slate-800 mb-6" />
              <h3 className="text-2xl font-black text-slate-800 uppercase tracking-tighter mb-2">Terminal Offline</h3>
              <p className="text-[10px] text-slate-700 font-bold uppercase tracking-[0.3em] max-w-xs">
                Complete multi-modal biometric auth to initialize node logic.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
