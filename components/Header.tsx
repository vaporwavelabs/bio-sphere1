
import React from 'react';
import { UserProfile } from '../types';
import { ChevronLeft, User, ShieldCheck, Bell, Settings } from 'lucide-react';

interface HeaderProps {
  currentUser: UserProfile | null;
  activeView: string;
  onBack: () => void;
  showBack: boolean;
  onProfileClick: () => void;
}

const Header: React.FC<HeaderProps> = ({ currentUser, activeView, onBack, showBack, onProfileClick }) => {
  const getViewTitle = (view: string) => {
    switch (view) {
      case 'DASHBOARD': return 'Sphere Hub';
      case 'WALLETS': return 'Ledger Audit';
      case 'ANALYZER': return 'Threat Intel';
      case 'DATABANK': return 'Secure Vault';
      case 'PROFILE': return 'Identity Node';
      case 'FACIAL': return 'Facial Scan';
      case 'VOICE': return 'Acoustic Auth';
      case 'BLOCKCHAIN': return 'Web3 Anchor';
      default: return 'Terminal';
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 px-4 pt-safe pb-4 bg-slate-950/80 backdrop-blur-xl border-b border-slate-900 flex items-center justify-between">
      <div className="flex items-center gap-4">
        {showBack ? (
          <button 
            onClick={onBack}
            className="p-2.5 bg-slate-900 border border-slate-800 rounded-2xl text-slate-400 hover:text-cyan-400 active:scale-90 transition-all"
          >
            <ChevronLeft size={20} />
          </button>
        ) : (
          <div className="p-2.5 bg-cyan-500/10 border border-cyan-500/20 rounded-2xl">
            <ShieldCheck size={20} className="text-cyan-500" />
          </div>
        )}
        <div className="flex flex-col">
          <h1 className="text-sm font-black uppercase tracking-tighter text-white">
            {getViewTitle(activeView)}
          </h1>
          <div className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
            <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Node_Active</span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button className="p-2.5 text-slate-500 hover:text-white transition-colors relative">
          <Bell size={18} />
          <div className="absolute top-2.5 right-2.5 w-2 h-2 bg-red-500 rounded-full border-2 border-slate-950"></div>
        </button>
        
        {currentUser && (
          <button 
            onClick={onProfileClick}
            className={`flex items-center gap-2 bg-slate-900 border border-slate-800 p-1.5 pr-3 rounded-2xl hover:border-cyan-500/30 transition-all active:scale-95 ${currentUser.isMinted ? 'shadow-[0_0_15px_rgba(16,185,129,0.15)] border-emerald-500/30' : ''}`}
          >
            <div className="w-7 h-7 rounded-xl bg-slate-950 flex items-center justify-center overflow-hidden border border-slate-800">
              {currentUser.nftUri ? (
                <img src={currentUser.nftUri} className="w-full h-full object-cover" />
              ) : (
                <User size={14} className="text-slate-500" />
              )}
            </div>
            <span className="text-[10px] font-black uppercase tracking-tight text-slate-300 truncate max-w-[60px]">
              {currentUser.username}
            </span>
          </button>
        )}
      </div>
    </header>
  );
};

export default Header;
