
import React, { useState, useEffect } from 'react';
import { BiometricResult, BiometricType, SecurityLog, WalletNode } from '../types';
import SecurityLogs from './SecurityLogs';
import { 
  ShieldCheck, Clock, Activity, ArrowRight, Mic2, Scan, Wallet, Search, Sparkles, CheckCircle2, 
  Database, UserCircle, Link as LinkIcon, Lock, AlertCircle, HardDrive, Loader2, Send, Zap, Globe, Cpu, ChevronRight
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
  const [connectStep, setConnectStep] = useState<'IDLE' | 'DETECTING' | 'SYNCING' | 'AUTHORIZING'>('IDLE');
  const [statusMsg, setStatusMsg] = useState("Initialize Handshake Protocol");

  const stats = [
    { label: 'Integrity', value: `${progress}%`, icon: ShieldCheck, color: 'text-cyan-400' },
    { label: 'Active Nodes', value: (wallets || []).length, icon: Activity, color: 'text-emerald-400' },
    { label: 'Total Value', value: (wallets || []).reduce((acc, w) => acc + (parseFloat(w.totalValue) || 0), 0).toFixed(2) + ' ETH', icon: Database, color: 'text-indigo-400' },
    { label: 'Threats', value: logs.filter(l => l.severity === 'HIGH').length || 0, icon: Clock, color: 'text-red-400' },
  ];

  const handleWalletLink = async () => {
    if (typeof (window as any).ethereum !== 'undefined') {
      try {
        setConnectStep('DETECTING');
        setStatusMsg("Detecting Web3 Provider...");
        
        // Brief delay for effect
        await new Promise(r => setTimeout(r, 1200));
        
        setConnectStep('SYNCING');
        setStatusMsg("Synchronizing Distributed Ledger...");
        const accounts = await (window as any).ethereum.request({ method: 'eth_requestAccounts' });
        
        await new Promise(r => setTimeout(r, 800));
        setConnectStep('AUTHORIZING');
        setStatusMsg("Authorizing Biometric Identity Node...");
        
        await new Promise(r => setTimeout(r, 1000));
        const address = accounts[0];
        onWalletConnect(address);
        onNavigate('WALLETS');
      } catch (err) {
        console.error("Wallet link failed", err);
        setConnectStep('IDLE');
        setStatusMsg("Handshake Failed. Re-initialize.");
      }
    } else {
      alert("Ethereum provider (MetaMask) required for secure ledger anchoring.");
    }
  };

  const connectedWallet = wallets?.find(w => w.address);

  return (
    <div className="space-y-8 animate-in fade-in duration-700 pb-20">
      {/* Dynamic CTA Banner / Connected Widget */}
      {!connectedWallet ? (
        <div className="bg-gradient-to-br from-orange-500/20 via-orange-500/5 to-slate-950 border border-orange-500/30 p-8 rounded-[3.5rem] shadow-2xl flex flex-col md:flex-row items-center justify-between gap-8 group relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-orange-500/5 blur-[100px] pointer-events-none"></div>
          
          <div className="flex items-center gap-8 relative z-10">
            <div className={`p-6 rounded-[2rem] border transition-all duration-700 ${connectStep !== 'IDLE' ? 'bg-orange-500 shadow-[0_0_40px_rgba(249,115,22,0.4)] rotate-12 scale-110 border-white/20' : 'bg-orange-500/10 border-orange-500/20 group-hover:scale-105'}`}>
              <Wallet className={connectStep !== 'IDLE' ? 'text-white animate-pulse' : 'text-orange-500'} size={40} />
            </div>
            <div>
              <h3 className="text-2xl font-black text-white uppercase tracking-tighter mb-2 italic">Web3_Sync_Required</h3>
              <div className="flex flex-col gap-1">
                <p className="text-orange-500/60 text-[10px] font-black uppercase tracking-[0.3em]">{statusMsg}</p>
                {connectStep !== 'IDLE' && (
                  <div className="w-48 h-1 bg-slate-900 rounded-full mt-2 overflow-hidden border border-slate-800">
                    <div className="h-full bg-orange-500 animate-pulse w-full"></div>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          <button 
            onClick={handleWalletLink}
            disabled={connectStep !== 'IDLE'}
            className="w-full md:w-auto px-12 py-6 bg-orange-500 hover:bg-orange-400 disabled:bg-slate-800 text-slate-950 font-black rounded-3xl flex items-center justify-center gap-4 transition-all active:scale-95 uppercase tracking-[0.2em] text-xs shadow-2xl shadow-orange-500/30 border-t border-white/20"
          >
            {connectStep !== 'IDLE' ? <Loader2 className="animate-spin" size={20} /> : <Zap size={20} />}
            {connectStep !== 'IDLE' ? 'Handshake Active' : 'Initialize Handshake'}
          </button>
        </div>
      ) : (
        <div className="bg-gradient-to-r from-cyan-500/10 via-slate-900 to-slate-900 border border-cyan-500/20 p-8 rounded-[3.5rem] shadow-2xl flex flex-col lg:flex-row items-center justify-between gap-8 group relative overflow-hidden">
          <div className="flex items-center gap-6">
            <div className="relative">
              <div className="p-5 bg-cyan-500/10 rounded-3xl border border-cyan-500/20 shadow-inner">
                <Cpu className="text-cyan-400" size={32} />
              </div>
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-4 border-slate-950 animate-pulse"></div>
            </div>
            <div>
              <div className="flex items-center gap-3 mb-1">
                <span className="text-[10px] font-black text-cyan-400 uppercase tracking-widest bg-cyan-500/10 px-3 py-0.5 rounded-full border border-cyan-500/20">LIVE_HANDSHAKE_ACTIVE</span>
                <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Net: Ethereum_Mainnet</span>
              </div>
              <h3 className="text-xl font-black text-white uppercase tracking-tighter truncate max-w-[200px] md:max-w-none">
                {connectedWallet.address.substring(0, 8)}...{connectedWallet.address.substring(36)}
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-4 w-full lg:w-auto">
             <div className="flex-1 lg:flex-none flex flex-col items-end px-6 border-r border-slate-800">
               <span className="text-[8px] font-black text-slate-600 uppercase tracking-widest mb-1">NODE_VALUE</span>
               <span className="text-lg font-black text-white">{connectedWallet.totalValue}</span>
             </div>
             <button 
              onClick={() => onNavigate('WALLETS')}
              className="flex-1 lg:flex-none px-8 py-5 bg-slate-800 hover:bg-cyan-500 hover:text-slate-950 text-slate-300 font-black rounded-2xl transition-all flex items-center justify-center gap-3 uppercase tracking-widest text-[10px]"
             >
                Audit Node <ChevronRight size={14} />
             </button>
          </div>
        </div>
      )}

      {/* Identity Anchor Banner (If wallet connected but not minted) */}
      {connectedWallet && !isMinted && (
        <div className="bg-gradient-to-r from-emerald-500/20 via-emerald-500/10 to-transparent border border-emerald-500/30 p-8 rounded-[3rem] shadow-2xl flex flex-col md:flex-row items-center justify-between gap-6 group animate-in slide-in-from-top-4">
          <div className="flex items-center gap-6">
            <div className="p-5 bg-emerald-500/10 rounded-3xl border border-emerald-500/20 group-hover:scale-110 transition-transform relative">
              <LinkIcon className="text-emerald-500" size={32} />
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-400 rounded-full animate-ping"></div>
            </div>
            <div>
              <h3 className="text-xl font-black text-white uppercase tracking-tighter mb-1 italic tracking-widest">Anchor_Registry_Pending</h3>
              <p className="text-emerald-500/60 text-[10px] font-black uppercase tracking-widest">Mint genesis profile NFT to finalize identity node</p>
            </div>
          </div>
          <button 
            onClick={() => onNavigate(BiometricType.BLOCKCHAIN)}
            className="w-full md:w-auto px-10 py-5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black rounded-2xl flex items-center justify-center gap-3 transition-all active:scale-95 uppercase tracking-widest text-xs shadow-xl shadow-emerald-500/20"
          >
            <Sparkles size={20} /> Finalize Genesis Mint
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
