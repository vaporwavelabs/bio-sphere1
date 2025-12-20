
import React from 'react';
import { BiometricResult, BiometricType, SecurityLog } from '../types';
import { 
  TrendingUp, ShieldCheck, Clock, Activity, ArrowRight, Fingerprint, Mic2, Scan, Wallet, Search 
} from 'lucide-react';

interface DashboardProps {
  results: BiometricResult[];
  onNavigate: (view: any) => void;
  progress: number;
  logs: SecurityLog[];
}

const Dashboard: React.FC<DashboardProps> = ({ results, onNavigate, progress, logs }) => {
  const stats = [
    { label: 'Security Score', value: `${progress}%`, icon: ShieldCheck, color: 'text-cyan-400' },
    { label: 'Verified Auth', value: results.filter(r => r.status === 'Pass').length, icon: Activity, color: 'text-emerald-400' },
    { label: 'Threats', value: logs.filter(l => l.severity === 'HIGH').length, icon: Clock, color: 'text-red-400' },
    { label: 'Uptime', value: '99.9%', icon: TrendingUp, color: 'text-purple-400' },
  ];

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-slate-900 border border-slate-800 p-4 md:p-6 rounded-2xl md:rounded-3xl">
            <stat.icon size={16} className={`${stat.color} mb-2 md:mb-4`} />
            <div className="text-[8px] md:text-[10px] font-bold text-slate-500 uppercase mb-0.5 md:mb-1 tracking-widest">{stat.label}</div>
            <div className="text-xl md:text-3xl font-bold">{stat.value}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
         <div className="lg:col-span-2 space-y-4 md:space-y-6">
            <div className="bg-slate-900 border border-slate-800 p-5 md:p-8 rounded-2xl md:rounded-3xl">
               <h3 className="text-lg md:text-xl font-bold mb-4 md:mb-6 flex items-center gap-2">
                 <ShieldCheck className="text-cyan-400" size={18} /> Operational Readiness
               </h3>
               <div className="space-y-3 md:space-y-4">
                  {[
                    { type: BiometricType.FACIAL, label: 'Facial Identification', icon: Scan },
                    { type: BiometricType.VOICE, label: 'Acoustic Print', icon: Mic2 },
                    { type: BiometricType.BEHAVIORAL, label: 'Behavioral Rhythm', icon: Fingerprint }
                  ].map(item => {
                    const passed = results.some(r => r.type === item.type && r.status === 'Pass');
                    return (
                      <div key={item.type} className="flex items-center justify-between p-3 md:p-4 bg-slate-950 rounded-xl md:rounded-2xl border border-slate-800">
                        <div className="flex items-center gap-3">
                          <item.icon size={16} className={passed ? 'text-cyan-400' : 'text-slate-600'} />
                          <span className="text-xs md:text-sm font-bold">{item.label}</span>
                        </div>
                        <div className={`text-[8px] md:text-[10px] font-bold uppercase px-2 py-0.5 rounded-lg ${passed ? 'bg-emerald-500/10 text-emerald-400' : 'bg-slate-800 text-slate-500'}`}>
                           {passed ? 'VERIFIED' : 'PENDING'}
                        </div>
                      </div>
                    );
                  })}
               </div>
            </div>
         </div>

         <div className="space-y-4">
            <div className="bg-slate-900 border border-slate-800 p-5 md:p-6 rounded-2xl md:rounded-3xl">
               <h3 className="font-bold mb-4 flex items-center gap-2 text-xs md:text-sm">
                 <Wallet size={16} className="text-amber-400" /> Security Tools
               </h3>
               <div className="grid grid-cols-2 lg:grid-cols-1 gap-2">
                  <button onClick={() => onNavigate('WALLETS')} className="flex flex-col md:flex-row items-center justify-between p-3 md:p-4 bg-slate-950 rounded-xl md:rounded-2xl border border-slate-800 hover:border-amber-400/30 transition-all group">
                    <span className="text-[10px] md:text-xs font-bold">Wallet Auditor</span>
                    <ArrowRight size={14} className="group-hover:translate-x-1 transition-all mt-1 md:mt-0" />
                  </button>
                  <button onClick={() => onNavigate('ANALYZER')} className="flex flex-col md:flex-row items-center justify-between p-3 md:p-4 bg-slate-950 rounded-xl md:rounded-2xl border border-slate-800 hover:border-cyan-400/30 transition-all group">
                    <span className="text-[10px] md:text-xs font-bold">Intel Analyzer</span>
                    <ArrowRight size={14} className="group-hover:translate-x-1 transition-all mt-1 md:mt-0" />
                  </button>
               </div>
            </div>
            
            <div className="bg-slate-900 border border-slate-800 p-5 md:p-6 rounded-2xl md:rounded-3xl">
               <h3 className="font-bold mb-3 md:mb-4 flex items-center gap-2 text-xs md:text-sm text-slate-500 uppercase tracking-widest">Decoy Status</h3>
               <div className="flex flex-wrap gap-1 md:gap-2">
                  {[1,2,3,4,5,6,7,8].map(i => (
                    <div key={i} className="w-6 md:w-8 h-1 rounded-full bg-emerald-500/10">
                      <div className="h-full bg-emerald-500 animate-pulse" style={{ animationDelay: `${i * 0.3}s` }}></div>
                    </div>
                  ))}
               </div>
            </div>
         </div>
      </div>
    </div>
  );
};

export default Dashboard;
