
import React from 'react';
import { BiometricType } from '../types';
import { 
  LayoutDashboard, 
  Scan, 
  Mic2, 
  Link as LinkIcon, 
  Database,
  UserCircle,
  Wallet,
  Search
} from 'lucide-react';

interface NavigationProps {
  activeView: any;
  setActiveView: (view: any) => void;
  isProfileComplete: boolean;
}

const Navigation: React.FC<NavigationProps> = ({ activeView, setActiveView, isProfileComplete }) => {
  const menuItems = [
    { id: 'DASHBOARD', label: 'HUB', icon: LayoutDashboard },
    { id: 'WALLETS', label: 'WALLETS', icon: Wallet },
    { id: 'ANALYZER', label: 'INTEL', icon: Search },
    { id: 'DATABANK', label: 'DATA', icon: Database },
    { id: 'PROFILE', label: 'NODE', icon: UserCircle },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 px-4 pb-6 md:pb-10 pointer-events-none animate-in slide-in-from-bottom-12 duration-700">
      <div className="max-w-2xl mx-auto pointer-events-auto">
        <div className="bg-slate-900/80 backdrop-blur-2xl border border-slate-800/50 rounded-[2.5rem] shadow-[0_32px_128px_rgba(0,0,0,0.8)] p-2 flex items-center justify-around md:gap-4 overflow-hidden">
          {menuItems.map((item) => {
            const isActive = activeView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveView(item.id)}
                className={`relative flex flex-col items-center justify-center p-4 rounded-[1.75rem] transition-all group ${
                  isActive 
                    ? 'bg-cyan-500 text-slate-950 shadow-2xl shadow-cyan-500/20 scale-110' 
                    : 'text-slate-500 hover:text-slate-200 hover:bg-slate-800/50'
                }`}
              >
                <item.icon size={20} className="md:w-5 md:h-5" />
                <span className={`text-[8px] font-black mt-1 uppercase tracking-widest ${isActive ? 'block' : 'hidden sm:block opacity-60'}`}>
                  {item.label}
                </span>
                
                {isActive && (
                  <div className="absolute -bottom-1 w-1.5 h-1.5 bg-slate-950 rounded-full"></div>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
