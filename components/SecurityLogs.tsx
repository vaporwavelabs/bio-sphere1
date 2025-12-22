
import React from 'react';
import { SecurityLog } from '../types';
import { Terminal, Activity, ShieldCheck } from 'lucide-react';

interface SecurityLogsProps {
  logs: SecurityLog[];
}

const SecurityLogs: React.FC<SecurityLogsProps> = ({ logs }) => {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-[2.5rem] p-8 shadow-2xl backdrop-blur-md relative overflow-hidden">
      <div className="absolute top-0 right-0 p-6 opacity-5 pointer-events-none">
        <Activity size={100} />
      </div>

      <div className="flex items-center justify-between mb-8">
        <h3 className="font-black flex items-center gap-3 text-xs text-slate-400 uppercase tracking-[0.3em]">
          <Terminal size={18} className="text-cyan-500" /> Global System Activity
        </h3>
        <div className="flex items-center gap-4">
           <div className="flex items-center gap-2 text-[9px] font-black text-emerald-500 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20 uppercase tracking-widest">
             <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div> DECOY_SYST_UP
           </div>
           <div className="hidden sm:flex items-center gap-2 text-[9px] font-black text-slate-500 uppercase tracking-widest">
             <ShieldCheck size={12} /> ENCRYPTED
           </div>
        </div>
      </div>

      <div className="space-y-2 max-h-64 overflow-y-auto font-mono text-[9px] custom-scrollbar pr-2">
        {logs.length > 0 ? logs.map((log) => (
          <div key={log.id} className="group flex gap-3 p-3 bg-slate-950/60 border border-slate-800/50 rounded-xl hover:border-slate-700 transition-colors">
            <span className="text-slate-700 font-bold">[{new Date(log.timestamp).toLocaleTimeString()}]</span>
            <div className="flex-1">
              <span className={log.severity === 'HIGH' ? 'text-red-400 font-black' : 'text-cyan-400 font-bold'}>
                {log.event}
              </span>
              <div className="text-[7px] text-slate-700 mt-0.5 font-bold uppercase tracking-widest">
                SOURCE: {log.source} | PKT_ID: {log.id}
              </div>
            </div>
            <div className={`text-[7px] font-black px-1.5 py-0.5 rounded border self-center ${log.severity === 'HIGH' ? 'text-red-500 border-red-500/20 bg-red-500/5' : 'text-slate-600 border-slate-800'}`}>
              {log.severity}
            </div>
          </div>
        )) : (
          <div className="py-12 text-center text-slate-700 font-black uppercase tracking-[0.4em]">
            Awaiting packet ingress...
          </div>
        )}
      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #1e293b; border-radius: 10px; }
      `}</style>
    </div>
  );
};

export default SecurityLogs;
