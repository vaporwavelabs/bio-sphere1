
import React from 'react';
import { BiometricResult, BiometricType, SecurityLog } from '../types';
import SecurityLogs from './SecurityLogs';
import { 
  ShieldCheck, Clock, Activity, ArrowRight, Mic2, Scan, Wallet, Search, Sparkles, CheckCircle2, 
  Database, UserCircle, Link as LinkIcon, Lock, AlertCircle, HardDrive
} from 'lucide-react';

interface DashboardProps {
  results: BiometricResult[];
  onNavigate: (view: any) => void;
  progress: number;
  logs: SecurityLog[];
  isIdGenerated?: boolean;
  onGenerateId: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ results, onNavigate, progress, logs, isIdGenerated, onGenerateId }) => {
  const stats = [
    { label: 'Integrity', value: `${progress}%`, icon: ShieldCheck, color: 'text-cyan-400' },
    { label: 'Packets', value: results.filter(r => r.status === 'Pass').length, icon: Activity, color: 'text-emerald-400' },
    { label: 'Active ID', value: isIdGenerated ? 'TRUE' : 'FALSE', icon: Sparkles, color: isIdGenerated ? 'text-cyan-400' : 'text-slate-700' },
    { label: 'Threats', value: logs.filter(l => l.severity === 'HIGH').length || 0, icon: Clock, color: 'text-red-400' },
  ];

  const menuItems = [
    { id: 'WALLETS', label: 'Wallet Scrub', icon: Wallet, desc: 'Analyze ledger risk' },
    { id: 'ANALYZER', label: 'Threat Intel', icon: Search, desc: 'Global threat scan' },
    { id: BiometricType.BLOCKCHAIN, label: 'Web3 Anchor', icon: LinkIcon, desc: 'Mint identity NFT' },
    { id: 'DATABANK', label: 'Secure Bank', icon: Database, desc: 'Encrypted logs' },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-700 pb-20">
      {/* Top Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-slate-900 border border-slate-800 p-6 rounded-[2rem] shadow-xl backdrop-blur-sm bg-opacity-50">
            <stat.icon size={18} className={`${stat.color} mb-3`} />
            <div className="text-[9px] font-black text-slate-600 uppercase tracking-[0.2em] mb-1">{stat.label}</div>
            <div className="text-2xl font-black tracking-tighter">{stat.value}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Verification Status Card - Always visible */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-slate-900 border border-slate-800 p-8 rounded-[2.5rem] shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-5">
              <UserCircle size={160} />
            </div>
            
            <h3 className="text-xl font-black uppercase tracking-tight mb-8 flex items-center gap-3">
              <ShieldCheck className="text-cyan-400" size={20} /> Operational State
            </h3>

            <div className="space-y-4">
              {[
                { type: BiometricType.FACIAL, label: 'Face Mesh Capture', icon: Scan },
                { type: BiometricType.VOICE, label: 'Acoustic Signature', icon: Mic2 },
                { type: BiometricType.SCAN_MACHINE, label: 'FS_LOCK Identity', icon: HardDrive }
              ].map(item => {
                const passed = results.some(r => r.type === item.type && r.status === 'Pass');
                return (
                  <button 
                    key={item.type} 
                    onClick={() => !passed && onNavigate(item.type)}
                    className={`w-full flex items-center justify-between p-5 bg-slate-950 rounded-2xl border transition-all ${passed ? 'border-emerald-500/30' : 'border-slate-800 hover:border-cyan-500/50 hover:bg-slate-900'}`}
                  >
                    <div className="flex items-center gap-4">
                      <item.icon size={18} className={passed ? 'text-emerald-400' : 'text-slate-600'} />
                      <span className={`text-xs font-bold uppercase tracking-widest ${passed ? 'text-slate-300' : 'text-slate-500'}`}>{item.label}</span>
                    </div>
                    <div className={`text-[8px] font-black uppercase px-3 py-1 rounded-lg ${passed ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-slate-900 text-slate-600 border border-slate-800'}`}>
                      {passed ? 'VERIFIED' : 'PENDING'}
                    </div>
                  </button>
                );
              })}
            </div>

            {progress === 100 && !isIdGenerated && (
              <div className="mt-10 p-8 bg-cyan-500/5 border border-cyan-500/30 rounded-[2rem] text-center animate-in zoom-in-95 duration-500 shadow-2xl shadow-cyan-500/5">
                <Sparkles className="text-cyan-400 mx-auto mb-4" size={40} />
                <h4 className="text-xl font-black mb-2 uppercase tracking-tight">Encryption Keys Ready</h4>
                <p className="text-[10px] text-slate-500 mb-8 uppercase tracking-[0.2em] font-bold">Consolidating biometric stream entropy for final synthesis.</p>
                <button 
                  onClick={onGenerateId}
                  className="w-full py-5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black rounded-2xl transition-all shadow-xl shadow-cyan-500/20 active:scale-95 uppercase tracking-[0.2em] text-xs flex items-center justify-center gap-3"
                >
                  <Sparkles size={18} /> GENERATE UNIQUE ID
                </button>
              </div>
            )}

            {!isIdGenerated && progress < 100 && (
              <div className="mt-8 flex items-center gap-4 p-5 bg-slate-950/50 rounded-2xl border border-slate-800 border-dashed">
                <AlertCircle size={24} className="text-slate-700 flex-shrink-0" />
                <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest leading-relaxed">
                  Complete all biometric scans to initialize global command terminal access.
                </p>
              </div>
            )}

            {isIdGenerated && (
              <div className="mt-10 p-8 bg-emerald-500/5 border border-emerald-500/30 rounded-[2rem] flex items-center gap-5 shadow-inner">
                <div className="p-4 bg-emerald-500/20 rounded-2xl border border-emerald-500/20">
                  <CheckCircle2 className="text-emerald-400" size={32} />
                </div>
                <div>
                  <h4 className="text-lg font-black text-emerald-400 uppercase tracking-tight">Identity Finalized</h4>
                  <p className="text-[9px] text-slate-500 uppercase font-mono tracking-widest mt-1">HASH::A8B2...99C2 | SECURE</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Dynamic Section - Menu & Logs appear here after ID generation */}
        <div className="lg:col-span-7 flex flex-col gap-8">
          {isIdGenerated ? (
            <div className="space-y-8 animate-in slide-in-from-right-8 duration-700">
              {/* Main Menu Grid */}
              <div className="bg-slate-900 border border-slate-800 p-8 rounded-[2.5rem] shadow-2xl backdrop-blur-md">
                <h3 className="text-xl font-black uppercase tracking-tight mb-8 flex items-center gap-3">
                  <Database className="text-indigo-400" size={20} /> Command Terminal
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {menuItems.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => onNavigate(item.id)}
                      className="group flex flex-col items-start p-6 bg-slate-950 border border-slate-800 rounded-3xl hover:border-cyan-500/50 hover:bg-slate-900 transition-all active:scale-95 text-left"
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

              {/* System Activity */}
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 delay-200">
                <SecurityLogs logs={logs} />
              </div>
            </div>
          ) : (
            <div className="flex-1 min-h-[400px] flex flex-col items-center justify-center p-12 text-center border-2 border-dashed border-slate-900 rounded-[3rem] bg-slate-950/20 group">
              <Lock size={64} className="text-slate-800 mb-6 group-hover:scale-110 transition-transform duration-500" />
              <h3 className="text-2xl font-black text-slate-800 uppercase tracking-tighter mb-2">Restricted Access</h3>
              <p className="text-[10px] text-slate-700 font-bold uppercase tracking-[0.3em] max-w-xs">
                Command Terminal and Global Logs are only decrypted once a unique node ID has been verified and synthesized.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
