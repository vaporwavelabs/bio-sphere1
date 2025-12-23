
import React, { useState } from 'react';
import { BiometricResult, BiometricType, SecurityLog, WalletNode, EIP6963ProviderDetail } from '../types';
import SecurityLogs from './SecurityLogs';
import { 
  ShieldCheck, Clock, Activity, Wallet, Search, Sparkles, CheckCircle2, 
  Database, Link as LinkIcon, Lock, AlertCircle, Loader2, Zap, Globe, Cpu, ChevronRight, Fingerprint, LogOut
} from 'lucide-react';

interface DashboardProps {
  results: BiometricResult[];
  onNavigate: (view: any) => void;
  progress: number;
  logs: SecurityLog[];
  isIdGenerated?: boolean;
  onGenerateId: () => void;
  wallets: WalletNode[];
  onWalletConnect: (address: string, providerName: string) => void;
  onWalletDisconnect: () => void;
  isMinted: boolean;
  detectedProviders: EIP6963ProviderDetail[];
}

const Dashboard: React.FC<DashboardProps> = ({ 
  results, onNavigate, progress, logs, isIdGenerated, onGenerateId, wallets, onWalletConnect, onWalletDisconnect, isMinted, detectedProviders 
}) => {
  const [connectStep, setConnectStep] = useState<'IDLE' | 'SELECTING' | 'CONNECTING'>('IDLE');
  const [selectedProvider, setSelectedProvider] = useState<EIP6963ProviderDetail | null>(null);
  const [statusMsg, setStatusMsg] = useState("Select Ingress Node");

  const stats = [
    { label: 'Integrity', value: `${progress}%`, icon: ShieldCheck, color: 'text-cyan-400' },
    { label: 'Active Nodes', value: (wallets || []).length, icon: Activity, color: 'text-emerald-400' },
    { label: 'Total Value', value: (wallets || []).reduce((acc, w) => acc + (parseFloat(w.totalValue) || 0), 0).toFixed(2) + ' ETH', icon: Database, color: 'text-indigo-400' },
    { label: 'Threats', value: logs.filter(l => l.severity === 'HIGH').length || 0, icon: Clock, color: 'text-red-400' },
  ];

  const handleConnect = async (detail: EIP6963ProviderDetail) => {
    setSelectedProvider(detail);
    setConnectStep('CONNECTING');
    setStatusMsg(`Bridging ${detail.info.name}...`);
    
    try {
      await new Promise(r => setTimeout(r, 1200));
      const accounts = await detail.provider.request({ method: 'eth_requestAccounts' });
      onWalletConnect(accounts[0], detail.info.name);
      onNavigate('WALLETS');
    } catch (err) {
      console.error("Wallet connection failed", err);
      setConnectStep('SELECTING');
      setStatusMsg("Bridge Aborted.");
    }
  };

  const connectedWallet = wallets?.find(w => w.address);
  const browserProvider: any = (window as any).ethereum;

  return (
    <div className="space-y-8 animate-in fade-in duration-700 pb-20">
      {!connectedWallet ? (
        <div className="bg-slate-900 border border-slate-800 rounded-[3.5rem] shadow-2xl relative overflow-hidden p-8 animate-in slide-in-from-top-8">
          <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/5 blur-[120px] pointer-events-none"></div>
          
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8 mb-10 relative z-10">
            <div>
              <div className="flex items-center gap-3 mb-2">
                 <div className="w-2 h-2 rounded-full bg-orange-500 animate-ping"></div>
                 <h3 className="text-xl font-black text-white uppercase tracking-tighter italic">Ledger_Ingress_Required</h3>
              </div>
              <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.4em]">{statusMsg}</p>
            </div>
            
            {connectStep === 'IDLE' && (
              <button 
                onClick={() => setConnectStep('SELECTING')}
                className="px-8 py-4 bg-orange-500 hover:bg-orange-400 text-slate-950 font-black rounded-2xl flex items-center gap-3 transition-all active:scale-95 uppercase tracking-widest text-[10px] shadow-xl shadow-orange-500/20 border border-orange-300/30"
              >
                <Fingerprint size={16} /> Open Ingress Hub
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 relative z-10">
            {connectStep === 'IDLE' ? (
              <div className="col-span-full py-16 text-center border-2 border-dashed border-slate-800 rounded-[2.5rem] bg-slate-950/20 group hover:border-slate-700 transition-colors">
                <Globe size={48} className="mx-auto text-slate-800 mb-6 group-hover:text-cyan-500/20 transition-colors" />
                <p className="text-[10px] text-slate-700 font-black uppercase tracking-[0.5em]">Manual Node Selection Required</p>
              </div>
            ) : connectStep === 'SELECTING' ? (
              <>
                {detectedProviders.map((detail) => (
                  <button
                    key={detail.info.uuid}
                    onClick={() => handleConnect(detail)}
                    className="flex items-center gap-5 p-6 bg-slate-950 border border-slate-800 rounded-3xl hover:border-orange-500/50 hover:bg-slate-900/50 transition-all text-left group"
                  >
                    <div className="w-14 h-14 p-2 bg-slate-900 rounded-2xl border border-slate-800 flex-shrink-0 flex items-center justify-center overflow-hidden">
                      <img src={detail.info.icon} alt={detail.info.name} className="w-full h-full object-contain" />
                    </div>
                    <div>
                      <div className="text-sm font-black text-white uppercase tracking-widest mb-1">{detail.info.name}</div>
                      <div className="text-[9px] text-slate-600 font-bold uppercase tracking-widest">Connect Protocol</div>
                    </div>
                  </button>
                ))}
                
                {detectedProviders.length === 0 && browserProvider && (
                   <button
                    onClick={() => handleConnect({ provider: browserProvider, info: { name: 'Browser Wallet', uuid: 'legacy', icon: '', rdns: '' } })}
                    className="flex items-center gap-5 p-6 bg-slate-950 border border-slate-800 rounded-3xl hover:border-orange-500/50 hover:bg-slate-900/50 transition-all text-left group"
                  >
                    <div className="w-14 h-14 p-3 bg-slate-900 rounded-2xl border border-slate-800 flex-shrink-0 flex items-center justify-center">
                      <Wallet className="text-orange-500" size={24} />
                    </div>
                    <div>
                      <div className="text-sm font-black text-white uppercase tracking-widest mb-1">Standard Node</div>
                      <div className="text-[9px] text-slate-600 font-bold uppercase tracking-widest">Generic Provider</div>
                    </div>
                  </button>
                )}
              </>
            ) : (
              <div className="col-span-full py-20 bg-slate-950 rounded-[2.5rem] border border-orange-500/20 flex flex-col items-center">
                 <Loader2 className="text-orange-500 animate-spin mb-8" size={64} />
                 <div className="text-xs font-black text-white uppercase tracking-[0.5em] animate-pulse">Bridging to Provider...</div>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="bg-gradient-to-r from-cyan-500/10 via-slate-900 to-slate-900 border border-cyan-500/20 p-8 rounded-[3.5rem] shadow-2xl flex flex-col lg:flex-row items-center justify-between gap-8 group relative overflow-hidden">
          <div className="flex items-center gap-6">
            <div className="p-5 bg-cyan-500/10 rounded-3xl border border-cyan-500/20 shadow-inner">
              <Cpu className="text-cyan-400" size={32} />
            </div>
            <div>
              <div className="flex items-center gap-3 mb-1">
                <span className="text-[10px] font-black text-cyan-400 uppercase tracking-widest bg-cyan-500/10 px-3 py-0.5 rounded-full border border-cyan-500/20">
                  {connectedWallet.providerName?.toUpperCase() || 'NODE'}_ACTIVE
                </span>
                <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Synced: Mainnet</span>
              </div>
              <h3 className="text-xl font-black text-white uppercase tracking-tighter truncate max-w-[200px]">
                {connectedWallet.address.substring(0, 8)}...{connectedWallet.address.substring(36)}
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-4 w-full lg:w-auto">
             <button 
              onClick={onWalletDisconnect}
              className="flex-1 lg:flex-none px-6 py-5 bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white font-black rounded-2xl transition-all flex items-center justify-center gap-3 uppercase tracking-widest text-[10px] border border-red-500/20"
             >
                Terminate Bridge <LogOut size={14} />
             </button>
             <button 
              onClick={() => onNavigate('WALLETS')}
              className="flex-1 lg:flex-none px-8 py-5 bg-slate-800 hover:bg-cyan-500 hover:text-slate-950 text-slate-300 font-black rounded-2xl transition-all flex items-center justify-center gap-3 uppercase tracking-widest text-[10px]"
             >
                Node Audit <ChevronRight size={14} />
             </button>
          </div>
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
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-slate-900 border border-slate-800 p-8 rounded-[2.5rem] shadow-2xl relative overflow-hidden">
             <h3 className="text-xl font-black uppercase tracking-tight mb-6 flex items-center gap-3">
              <ShieldCheck className="text-cyan-400" size={20} /> Identity Registry
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
            </div>
          </div>
          <SecurityLogs logs={logs} />
        </div>

        <div className="lg:col-span-7 flex flex-col gap-8">
          <div className="bg-slate-900 border border-slate-800 p-8 rounded-[2.5rem] shadow-2xl">
            <h3 className="text-xl font-black uppercase tracking-tight flex items-center gap-3 mb-8">
              <Database className="text-indigo-400" size={20} /> Perimeter Commands
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { id: 'WALLETS', label: 'Wallet Audit', icon: Wallet, desc: 'Scrub & Restore' },
                { id: 'ANALYZER', label: 'Threat Intel', icon: Search, desc: 'Perimeter Scan' },
                { id: 'DATABANK', label: 'Vault Access', icon: Database, desc: 'History Ledger' },
                { id: BiometricType.BLOCKCHAIN, label: 'Ledger Mint', icon: LinkIcon, desc: 'Anchor Identity' },
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => onNavigate(item.id)}
                  className="group flex flex-col items-start p-6 bg-slate-950 border border-slate-800 rounded-3xl transition-all active:scale-95 text-left hover:border-cyan-500/50"
                >
                  <div className="p-3 rounded-xl mb-4 bg-slate-900 group-hover:bg-cyan-500 group-hover:text-slate-950 transition-colors">
                    <item.icon size={20} />
                  </div>
                  <div className="text-sm font-black uppercase tracking-widest mb-1">{item.label}</div>
                  <div className="text-[9px] text-slate-600 font-bold uppercase tracking-wider">{item.desc}</div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
