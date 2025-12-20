
import React from 'react';
import { SecurityLog } from '../types';
import { Terminal } from 'lucide-react';

interface SecurityLogsProps {
  logs: SecurityLog[];
}

const SecurityLogs: React.FC<SecurityLogsProps> = ({ logs }) => {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 md:p-6 mb-8">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold flex items-center gap-2 text-[10px] md:text-xs text-slate-400 uppercase tracking-widest">
          <Terminal size={14} /> System Activity
        </h3>
        <div className="hidden md:flex gap-4">
           <div className="flex items-center gap-1 text-[9px] font-bold text-slate-500">
             <div className="w-1 h-1 rounded-full bg-emerald-500"></div> DECOY_UP
           </div>
        </div>
      </div>

      <div className="space-y-1.5 max-h-32 md:max-h-48 overflow-y-auto font-mono text-[8px] md:text-[9px] custom-scrollbar">
        {logs.map((log) => (
          <div key={log.id} className="flex gap-2 p-1.5 bg-slate-950/50 border border-slate-900 rounded-lg">
            <span className="text-slate-600">[{new Date(log.timestamp).toLocaleTimeString()}]</span>
            <span className={log.severity === 'HIGH' ? 'text-red-400 font-bold' : 'text-cyan-400'}>
              {log.event}
            </span>
            <span className="text-slate-700 ml-auto hidden sm:inline">ID: {log.id}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SecurityLogs;
