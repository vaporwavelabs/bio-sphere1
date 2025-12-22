
import React, { useState, useEffect, useMemo } from 'react';
import { BiometricType, BiometricResult, UserProfile, SecurityLog } from './types';
import Navigation from './components/Navigation';
import Dashboard from './components/Dashboard';
import FacialScanner from './components/FacialScanner';
import VoiceScanner from './components/VoiceScanner';
import BlockchainPortal from './components/BlockchainPortal';
import ProfileManager from './components/ProfileManager';
import DataBank from './components/DataBank';
import WalletAuditor from './components/WalletAuditor';
import RiskAnalyzer from './components/RiskAnalyzer';
import SecurityLogs from './components/SecurityLogs';
import { ShieldCheck, User, Sparkles, Loader2, LogOut } from 'lucide-react';

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [activeView, setActiveView] = useState<'DASHBOARD' | 'PROFILE' | 'DATABANK' | 'WALLETS' | 'ANALYZER' | BiometricType>('PROFILE');
  const [logs, setLogs] = useState<SecurityLog[]>([]);
  const [onboardingStep, setOnboardingStep] = useState<number | null>(null);
  const [isGeneratingId, setIsGeneratingId] = useState(false);

  // Expose view setter for environment or debug accessibility
  useEffect(() => {
    (window as any).appSetView = setActiveView;
  }, []);

  const progressPercent = useMemo(() => {
    if (!currentUser) return 0;
    const required = [BiometricType.FACIAL, BiometricType.VOICE];
    const completed = required.filter(type => currentUser.results.some(r => r.type === type && r.status === 'Pass')).length;
    return Math.round((completed / required.length) * 100);
  }, [currentUser]);

  useEffect(() => {
    const interval = setInterval(() => {
      const newLog: SecurityLog = {
        id: Math.random().toString(36).substr(2, 9).toUpperCase(),
        timestamp: Date.now(),
        event: Math.random() > 0.7 ? "External Breach Attempt Blocked" : "Decoy Node Synchronized",
        severity: Math.random() > 0.8 ? 'HIGH' : 'LOW',
        source: `IP_ADDR_${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`
      };
      setLogs(prev => [newLog, ...prev].slice(0, 20));
    }, 15000);
    return () => clearInterval(interval);
  }, []);

  const addResult = (result: BiometricResult) => {
    if (!currentUser) return;
    const updated = { ...currentUser, results: [result, ...currentUser.results] };
    setCurrentUser(updated);
    localStorage.setItem(`profile_${currentUser.username}`, JSON.stringify(updated));
    
    if (onboardingStep !== null) {
      if (onboardingStep < 1) setOnboardingStep(onboardingStep + 1);
      else {
        setOnboardingStep(null);
        setActiveView('DASHBOARD');
      }
    }
  };

  const handleWalletConnect = (address: string) => {
    if (!currentUser) return;
    const updated = { ...currentUser, walletAddress: address };
    setCurrentUser(updated);
    localStorage.setItem(`profile_${currentUser.username}`, JSON.stringify(updated));
  };

  const handleGenerateId = () => {
    if (!currentUser) return;
    setIsGeneratingId(true);
    setTimeout(() => {
      const updated = { ...currentUser, isIdGenerated: true };
      setCurrentUser(updated);
      localStorage.setItem(`profile_${currentUser.username}`, JSON.stringify(updated));
      setIsGeneratingId(false);
      setActiveView('DASHBOARD');
    }, 3000);
  };

  const handleMintComplete = (nftUri: string, result: BiometricResult) => {
    if (!currentUser) return;
    const updated = { ...currentUser, isMinted: true, nftUri, results: [result, ...currentUser.results] };
    setCurrentUser(updated);
    localStorage.setItem(`profile_${currentUser.username}`, JSON.stringify(updated));
  };

  const renderContent = () => {
    if (!currentUser) return <ProfileManager onLogin={(u) => { setCurrentUser(u); setOnboardingStep(null); setActiveView('DASHBOARD'); }} onStartOnboarding={() => setOnboardingStep(0)} />;

    if (onboardingStep !== null) {
      if (onboardingStep === 0) return <div className="py-12"><FacialScanner onComplete={addResult} /></div>;
      if (onboardingStep === 1) return <div className="py-12"><VoiceScanner onComplete={addResult} /></div>;
    }

    if (isGeneratingId) {
      return (
        <div className="flex flex-col items-center justify-center py-20 bg-slate-900/50 border border-slate-800 rounded-[3rem] max-w-xl mx-auto animate-in zoom-in-95 duration-700 shadow-2xl backdrop-blur-md">
          <div className="relative mb-8">
            <Loader2 size={80} className="text-cyan-400 animate-spin" />
            <Sparkles size={32} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-cyan-500 animate-pulse" />
          </div>
          <h2 className="text-3xl font-black tracking-tighter mb-2 uppercase">Synthesizing Unique ID</h2>
          <p className="text-slate-500 text-[10px] font-bold tracking-[0.4em] uppercase">Hashing biometric stream entropy...</p>
        </div>
      );
    }

    switch (activeView) {
      case 'DASHBOARD': return (
        <Dashboard 
          results={currentUser.results} 
          onNavigate={setActiveView} 
          progress={progressPercent} 
          logs={logs} 
          isIdGenerated={currentUser.isIdGenerated}
          onGenerateId={handleGenerateId}
        />
      );
      case 'PROFILE': return <ProfileManager onLogin={setCurrentUser} currentUser={currentUser} onStartOnboarding={() => setOnboardingStep(0)} />;
      case 'DATABANK': return <div className="animate-in slide-in-from-bottom-8 duration-500"><DataBank user={currentUser} /></div>;
      case 'WALLETS': return <div className="animate-in slide-in-from-bottom-8 duration-500"><WalletAuditor address={currentUser.walletAddress || "0x71C7656EC7ab88b098defB751B7401B5f6d8976F"} /></div>;
      case 'ANALYZER': return <div className="animate-in slide-in-from-bottom-8 duration-500"><RiskAnalyzer /></div>;
      case BiometricType.FACIAL: return <div className="py-12"><FacialScanner onComplete={addResult} /></div>;
      case BiometricType.VOICE: return <div className="py-12"><VoiceScanner onComplete={addResult} /></div>;
      case BiometricType.BLOCKCHAIN: return (
        <div className="animate-in slide-in-from-bottom-8 duration-500">
          <BlockchainPortal 
            sessionSummary={currentUser.results.map(r => r.details).join(' ')} 
            onMintComplete={handleMintComplete} 
            onWalletConnect={handleWalletConnect}
            initialAddress={currentUser.walletAddress}
            isMinted={currentUser.isMinted} 
          />
        </div>
      );
      default: return <Dashboard results={currentUser.results} onNavigate={setActiveView} progress={progressPercent} logs={logs} isIdGenerated={currentUser.isIdGenerated} onGenerateId={handleGenerateId} />;
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-cyan-500/30">
      {/* Background Ambience */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden opacity-30">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-cyan-500/10 blur-[120px] rounded-full"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/10 blur-[120px] rounded-full"></div>
      </div>

      <main className="flex-1 p-4 md:p-6 lg:p-8 overflow-x-hidden max-w-7xl mx-auto w-full relative z-10">
        <header className="mb-10 flex flex-col md:flex-row items-center justify-between gap-6 border-b border-slate-900 pb-8">
          <div className="text-center md:text-left">
            <h1 className="text-3xl font-black bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-blue-500 tracking-tighter uppercase mb-1">Biometric_Sphere</h1>
            <p className="text-slate-500 text-[10px] font-bold flex items-center justify-center md:justify-start gap-2 uppercase tracking-[0.4em]">
              <ShieldCheck size={12} className="text-cyan-500" /> Multi-Modal Security Protocol
            </p>
          </div>
          
          {currentUser && (
            <div className="flex items-center gap-6">
              <div className="hidden sm:flex flex-col items-end gap-1.5">
                <div className="text-[9px] font-black text-slate-600 uppercase tracking-[0.2em]">Synchronization</div>
                <div className="flex items-center gap-3">
                  <div className="w-32 h-1.5 bg-slate-900 rounded-full overflow-hidden border border-slate-800 shadow-inner">
                    <div className="h-full bg-cyan-500 transition-all duration-1000" style={{ width: `${progressPercent}%` }} />
                  </div>
                  <span className="text-[10px] font-black text-cyan-400 font-mono">{progressPercent}%</span>
                </div>
              </div>
              <div className="flex items-center gap-3 bg-slate-900 border border-slate-800 p-2 pr-5 rounded-2xl shadow-xl">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center border border-cyan-500/30 bg-cyan-500/5 overflow-hidden shadow-inner">
                  {currentUser.nftUri ? <img src={currentUser.nftUri} className="w-full h-full object-cover" /> : <User size={20} className="text-cyan-400" />}
                </div>
                <div>
                  <div className="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-0.5">Verified Node</div>
                  <div className="text-xs font-bold tracking-tight uppercase truncate max-w-[100px]">{currentUser.username}</div>
                </div>
              </div>
            </div>
          )}
        </header>

        <div className="w-full min-h-[60vh] flex flex-col">
          {renderContent()}
        </div>
      </main>

      {/* Persistent Bottom Nav - Only visible once ID is generated and not in onboarding */}
      {currentUser?.isIdGenerated && onboardingStep === null && (
        <Navigation 
          activeView={activeView} 
          setActiveView={setActiveView} 
          isProfileComplete={progressPercent === 100} 
        />
      )}
    </div>
  );
};

export default App;
