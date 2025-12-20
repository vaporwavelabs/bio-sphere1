
import React from 'react';
import { BiometricType } from '../types';
import { 
  LayoutDashboard, 
  Scan, 
  Mic2, 
  Fingerprint, 
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
    { id: 'DASHBOARD', label: 'Home', icon: LayoutDashboard },
    { id: 'PROFILE', label: 'ID', icon: UserCircle },
    { id: BiometricType.FACIAL, label: 'Face', icon: Scan },
    { id: BiometricType.VOICE, label: 'Voice', icon: Mic2 },
    { id: BiometricType.BEHAVIORAL, label: 'Behavior', icon: Fingerprint },
    { id: 'WALLETS', label: 'Wallet', icon: Wallet },
    { id: 'ANALYZER', label: 'Intel', icon: Search },
    { id: BiometricType.BLOCKCHAIN, label: 'NFT', icon: LinkIcon },
    { id: 'DATABANK', label: 'Bank', icon: Database, locked: !isProfileComplete },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 px-2 pb-4 md:pb-6 pointer-events-none">
      <div className="max-w-4xl mx-auto pointer-events-auto">
        <div className="bg-slate-900/80 backdrop-blur-xl border border-slate-800 rounded-3xl md:rounded-[2.5rem] shadow-[0_-20px_50px_-12px_rgba(0,0,0,0.5)] p-1.5 flex items-center justify-around md:justify-center md:gap-4 lg:gap-6 overflow-hidden">
          {menuItems.map((item) => {
            const isActive = activeView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveView(item.id)}
                className={`relative flex flex-col items-center justify-center p-2.5 md:p-4 rounded-2xl md:rounded-3xl transition-all group ${
                  isActive 
                    ? 'bg-cyan-500 text-slate-950 shadow-[0_0_25px_rgba(34,211,238,0.4)] scale-110 md:scale-105' 
                    : 'text-slate-500 hover:text-slate-200 hover:bg-slate-800/50'
                }`}
              >
                <item.icon size={20} className="md:w-6 md:h-6" />
                <span className={`text-[8px] md:text-[10px] font-bold mt-1 uppercase tracking-tighter ${isActive ? 'block' : 'hidden md:block opacity-60 group-hover:opacity-100'}`}>
                  {item.label}
                </span>
                
                {item.locked && !isActive && (
                  <div className="absolute -top-1 -right-1 bg-slate-800 p-0.5 rounded-full border border-slate-700">
                    <div className="w-1.5 h-1.5 rounded-full bg-red-500"></div>
                  </div>
                )}
                
                {isActive && (
                  <div className="absolute -bottom-1 w-1 h-1 bg-slate-950 rounded-full"></div>
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
