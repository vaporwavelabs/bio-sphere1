
import React, { useState } from 'react';
import { UserProfile } from '../types';
import { UserPlus, LogIn, LogOut, ShieldCheck, User as UserIcon, ArrowRight } from 'lucide-react';

interface ProfileManagerProps {
  onLogin: (user: UserProfile) => void;
  onStartOnboarding: () => void;
  currentUser?: UserProfile | null;
}

const ProfileManager: React.FC<ProfileManagerProps> = ({ onLogin, onStartOnboarding, currentUser }) => {
  const [username, setUsername] = useState("");
  const [mode, setMode] = useState<'LOGIN' | 'REGISTER'>('REGISTER');

  const handleAction = () => {
    if (!username) return;
    if (mode === 'REGISTER') {
      const newUser: UserProfile = {
        id: Math.random().toString(36).substr(2, 9),
        username,
        createdAt: Date.now(),
        results: [],
        isMinted: false
      };
      localStorage.setItem(`profile_${username}`, JSON.stringify(newUser));
      onLogin(newUser);
      onStartOnboarding();
    } else {
      const stored = localStorage.getItem(`profile_${username}`);
      if (stored) onLogin(JSON.parse(stored));
      else alert("Node not identified.");
    }
  };

  if (currentUser) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-2xl md:rounded-3xl p-6 md:p-8 max-w-xl mx-auto shadow-2xl">
        <div className="flex flex-col items-center text-center gap-4 mb-8">
          <div className="w-24 h-24 rounded-3xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center overflow-hidden">
            {currentUser.nftUri ? <img src={currentUser.nftUri} className="w-full h-full object-cover" /> : <UserIcon size={40} className="text-cyan-500" />}
          </div>
          <div>
            <h2 className="text-2xl font-bold tracking-tight">{currentUser.username}</h2>
            <p className="text-slate-500 text-[10px] font-mono mt-1">SECURE_NODE::{currentUser.id}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-8">
          <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800">
            <div className="text-[8px] text-slate-500 font-bold uppercase tracking-widest mb-1">Pass Status</div>
            <div className="text-xl font-bold text-cyan-400">{currentUser.results.length}</div>
          </div>
          <button onClick={onStartOnboarding} className="bg-cyan-500/10 p-4 rounded-2xl border border-cyan-500/30 text-left active:scale-95 transition-all">
            <div className="text-[8px] text-cyan-400 font-bold uppercase tracking-widest mb-1">Actions</div>
            <div className="text-xs font-bold flex items-center gap-1 uppercase">Re-Auth <ArrowRight size={12} /></div>
          </button>
        </div>

        <button onClick={() => window.location.reload()} className="w-full py-4 bg-slate-800/50 hover:bg-red-500/10 hover:text-red-400 text-slate-400 rounded-2xl font-bold text-xs transition-all flex items-center justify-center gap-2">
          <LogOut size={16} /> TERMINATE CONNECTION
        </button>
      </div>
    );
  }

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 md:p-10 max-w-md mx-auto shadow-2xl mt-10 md:mt-20">
      <div className="flex flex-col items-center gap-3 mb-8">
        <div className="p-4 bg-cyan-500/10 rounded-2xl">
          <ShieldCheck size={40} className="text-cyan-400" />
        </div>
        <h2 className="text-xl md:text-2xl font-bold tracking-tight">Terminal Onboarding</h2>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5 ml-1">Handle</label>
          <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-4 py-4 outline-none focus:border-cyan-500 font-mono text-sm" placeholder="agent_node" />
        </div>

        <div className="flex bg-slate-950 p-1 rounded-2xl border border-slate-800">
          <button onClick={() => setMode('REGISTER')} className={`flex-1 py-3 rounded-xl text-[10px] font-bold transition-all ${mode === 'REGISTER' ? 'bg-slate-800 text-cyan-400' : 'text-slate-500'}`}>CREATE ID</button>
          <button onClick={() => setMode('LOGIN')} className={`flex-1 py-3 rounded-xl text-[10px] font-bold transition-all ${mode === 'LOGIN' ? 'bg-slate-800 text-cyan-400' : 'text-slate-500'}`}>RESTORE</button>
        </div>

        <button onClick={handleAction} className="w-full py-4 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded-2xl flex items-center justify-center gap-2 transition-all active:scale-95 shadow-xl shadow-cyan-500/10">
          {mode === 'REGISTER' ? <UserPlus size={18} /> : <LogIn size={18} />}
          {mode === 'REGISTER' ? 'ENROLL BIOMETRICS' : 'ENTER TERMINAL'}
        </button>
      </div>
    </div>
  );
};

export default ProfileManager;
