
import React from 'react';
import { BiometricType } from '../types';
import { 
  LayoutDashboard, 
  Scan, 
  Mic2, 
  Fingerprint, 
  Link as LinkIcon, 
  ShieldCheck,
  Database,
  UserCircle,
  Wallet,
  Search
} from 'lucide-react';

interface SidebarProps {
  activeView: any;
  setActiveView: (view: any) => void;
  isProfileComplete: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({ activeView, setActiveView, isProfileComplete }) => {
  const menuItems = [
    { id: 'DASHBOARD', label: 'Overview', icon: LayoutDashboard },
    { id: 'PROFILE', label: 'Identity Node', icon: UserCircle },
    { id: BiometricType.FACIAL, label: 'Facial Liveness', icon: Scan },
    { id: BiometricType.VOICE, label: 'Acoustic Auth', icon: Mic2 },
    // Removed BEHAVIORAL entry as it is no longer supported and causes compilation errors
    { id: 'WALLETS', label: 'Wallet Scrub', icon: Wallet },
    { id: 'ANALYZER', label: 'Threat Intel', icon: Search },
    { id: BiometricType.BLOCKCHAIN, label: 'Web3 Anchor', icon: LinkIcon },
    { id: 'DATABANK', label: 'Data Bank', icon: Database, locked: !isProfileComplete },
  ];

  return (
    <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col p-4 shadow-2xl">
      <div className="flex items-center gap-2 px-2 py-4 mb-8 border-b border-slate-800">
        <ShieldCheck className="text-cyan-400" size={32} />
        <span className="text-lg font-bold tracking-tighter">SPHERE_v2</span>
      </div>

      <nav className="flex-1 space-y-1">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveView(item.id)}
            className={`w-full flex items-center justify-between px-3 py-3 rounded-xl text-xs font-bold transition-all ${
              activeView === item.id 
                ? 'bg-cyan-500 text-slate-950 shadow-[0_0_20px_rgba(34,211,238,0.3)] scale-105' 
                : 'text-slate-500 hover:text-slate-100 hover:bg-slate-800'
            }`}
          >
            <div className="flex items-center gap-3">
              <item.icon size={18} />
              {item.label}
            </div>
            {item.locked && <div className="text-[8px] bg-slate-800 px-1 rounded border border-slate-700">LOCK</div>}
          </button>
        ))}
      </nav>

      <div className="mt-auto p-4 bg-slate-800/50 rounded-2xl border border-slate-700">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
          <span className="text-[10px] font-bold text-slate-300">NODE_STATUS: LIVE</span>
        </div>
        <div className="text-[9px] text-slate-500 font-mono">LATENCY: 12ms | LOAD: 4%</div>
      </div>
    </aside>
  );
};

export default Sidebar;
