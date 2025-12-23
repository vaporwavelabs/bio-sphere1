
import React from 'react';
import { BiometricType } from '../types';
import { 
  LayoutDashboard, 
  Search, 
  Database,
  UserCircle,
  Wallet,
  Shield,
  Zap
} from 'lucide-react';

interface NavigationProps {
  activeView: any;
  setActiveView: (view: any) => void;
  isProfileComplete: boolean;
}

const Navigation: React.FC<NavigationProps> = ({ activeView, setActiveView, isProfileComplete }) => {
  const menuItems = [
    { id: 'DASHBOARD', label: 'Hub', icon: LayoutDashboard },
    { id: 'WALLETS', label: 'Wallets', icon: Wallet },
    { id: 'QUICK_AUTH', label: 'Auth', icon: Shield, special: true },
    { id: 'ANALYZER', label: 'Intel', icon: Search },
    { id: 'PROFILE', label: 'Node', icon: UserCircle },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-[60] px-4 pb-8 pointer-events-none animate-in slide-in-from-bottom-12 duration-700">
      <div className="max-w-md mx-auto pointer-events-auto">
        <div className="relative bg-slate-950/80 backdrop-blur-2xl border border-slate-800/50 rounded-[2.5rem] shadow-[0_32px_128px_rgba(0,0,0,0.8)] p-2 flex items-center justify-between">
          
          {menuItems.map((item) => {
            const isActive = activeView === item.id;
            
            if (item.special) {
              return (
                <div key={item.id} className="relative -mt-10 px-2">
                  <button
                    onClick={() => setActiveView(BiometricType.FACIAL)}
                    className="w-16 h-16 bg-gradient-to-br from-cyan-400 to-blue-600 rounded-3xl shadow-[0_10px_30px_rgba(34,211,238,0.4)] flex items-center justify-center text-slate-950 active:scale-90 transition-all group"
                  >
                    <item.icon size={28} className="group-hover:rotate-12 transition-transform" />
                    <div className="absolute inset-0 bg-white/20 rounded-3xl opacity-0 group-active:opacity-100 transition-opacity"></div>
                  </button>
                  <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 text-[8px] font-black uppercase tracking-widest text-cyan-400 opacity-80">
                    SCAN
                  </div>
                </div>
              );
            }

            return (
              <button
                key={item.id}
                onClick={() => setActiveView(item.id)}
                className={`relative flex-1 flex flex-col items-center justify-center py-3 rounded-2xl transition-all ${
                  isActive 
                    ? 'text-cyan-400' 
                    : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                <item.icon size={20} className={`transition-transform duration-300 ${isActive ? 'scale-110' : ''}`} />
                <span className={`text-[8px] font-black mt-1 uppercase tracking-tighter ${isActive ? 'opacity-100' : 'opacity-40'}`}>
                  {item.label}
                </span>
                
                {isActive && (
                  <div className="absolute -bottom-1 w-6 h-0.5 bg-cyan-400 rounded-full shadow-[0_0_10px_rgba(34,211,238,0.8)]"></div>
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
