
import React, { useState, useEffect, useMemo } from 'react';
import { BiometricType, BiometricResult, UserProfile, SecurityLog } from './types';
import Navigation from './components/Navigation';
import Dashboard from './components/Dashboard';
import FacialScanner from './components/FacialScanner';
import VoiceScanner from './components/VoiceScanner';
import BehavioralScanner from './components/BehavioralScanner';
import BlockchainPortal from './components/BlockchainPortal';
import ProfileManager from './components/ProfileManager';
import DataBank from './components/DataBank';
import WalletAuditor from './components/WalletAuditor';
import RiskAnalyzer from './components/RiskAnalyzer';
import SecurityLogs from './components/SecurityLogs';
import { ShieldCheck, User } from 'lucide-react';

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [activeView, setActiveView] = useState<'DASHBOARD' | 'PROFILE' | 'DATABANK' | 'WALLETS' | 'ANALYZER' | BiometricType>('PROFILE');
  const [logs, setLogs] = useState<SecurityLog[]>([]);
  const [onboardingStep, setOnboardingStep] = useState<number | null>(null);

  const progressPercent = useMemo(() => {
    if (!currentUser) return 0;
    const required = [BiometricType.FACIAL, BiometricType.VOICE, BiometricType.BEHAVIORAL];
    const completed = required.filter(type => currentUser.results.some(r => r.type === type && r.status === 'Pass')).length;
    return Math.round((completed / required.length) * 100);
  }, [currentUser]);

  useEffect(() => {
    const interval = setInterval(() => {
      const newLog: SecurityLog = {
        id: Math.random().toString(36).substr(2, 9),
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
      if (onboardingStep < 2) setOnboardingStep(onboardingStep + 1);
      else setOnboardingStep(null);
    }
  };

  const handleMintComplete = (nftUri: string, result: BiometricResult) => {
    if (!currentUser) return;
    const updated = { ...currentUser, isMinted: true, nftUri, results: [result, ...currentUser.results] };
    setCurrentUser(updated);
    localStorage.setItem(`profile_${currentUser.username}`, JSON.stringify(updated));
  };

  const renderContent = () => {
    if (!currentUser) return <ProfileManager onLogin={(u) => { setCurrentUser(u); setOnboardingStep(null); }} onStartOnboarding={() => setOnboardingStep(0)} />;

    if (onboardingStep !== null) {
      if (onboardingStep === 0) return <FacialScanner onComplete={addResult} />;
      if (onboardingStep === 1) return <VoiceScanner onComplete={addResult} />;
      if (onboardingStep === 2) return <BehavioralScanner onComplete={addResult} />;
    }

    switch (activeView) {
      case 'DASHBOARD': return <Dashboard results={currentUser.results} onNavigate={setActiveView} progress={progressPercent} logs={logs} />;
      case 'PROFILE': return <ProfileManager onLogin={setCurrentUser} currentUser={currentUser} onStartOnboarding={() => setOnboardingStep(0)} />;
      case 'DATABANK': return <DataBank user={currentUser} />;
      case 'WALLETS': return <WalletAuditor address={currentUser.walletAddress || "0x71C...6F"} />;
      case 'ANALYZER': return <RiskAnalyzer />;
      case BiometricType.FACIAL: return <FacialScanner onComplete={addResult} />;
      case BiometricType.VOICE: return <VoiceScanner onComplete={addResult} />;
      case BiometricType.BEHAVIORAL: return <BehavioralScanner onComplete={addResult} />;
      case BiometricType.BLOCKCHAIN: return <BlockchainPortal sessionSummary={currentUser.results.map(r => r.details).join(' ')} onMintComplete={handleMintComplete} isMinted={currentUser.isMinted} />;
      default: return <Dashboard results={currentUser.results} onNavigate={setActiveView} progress={progressPercent} logs={logs} />;
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-slate-950 text-slate-100 font-sans pb-24 lg:pb-32 selection:bg-cyan-500/30">
      <main className="flex-1 p-4 md:p-6 lg:p-8 overflow-x-hidden max-w-7xl mx-auto w-full">
        <header className="mb-6 md:mb-10 flex flex-col md:flex-row items-center justify-between gap-4 border-b border-slate-900 pb-6">
          <div className="text-center md:text-left">
            <h1 className="text-2xl md:text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-blue-500 tracking-tighter">BIOMETRIC SPHERE</h1>
            <p className="text-slate-400 text-xs mt-1 flex items-center justify-center md:justify-start gap-2">
              <ShieldCheck size={12} className="text-cyan-500" /> Secure Multi-Modal Auth Node
            </p>
          </div>
          
          <div className="flex items-center gap-4 w-full md:w-auto">
            <div className="flex-1 md:flex-none flex flex-col items-end gap-1">
              <div className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Security Sync</div>
              <div className="flex items-center gap-2">
                <div className="w-24 md:w-40 bg-slate-900 h-1.5 rounded-full overflow-hidden border border-slate-800">
                  <div className="h-full bg-cyan-500 transition-all duration-1000" style={{ width: `${progressPercent}%` }} />
                </div>
                <span className="text-xs font-mono text-cyan-400">{progressPercent}%</span>
              </div>
            </div>
            <div className="flex items-center gap-2 bg-slate-900/50 border border-slate-800 p-1.5 pr-3 rounded-full">
              <div className="w-8 h-8 rounded-full flex items-center justify-center border border-cyan-500/50 bg-cyan-500/10">
                <User size={16} className="text-cyan-400" />
              </div>
              <div className="text-xs">
                <div className="text-[8px] font-bold text-cyan-400 uppercase tracking-widest">AUTH</div>
                <div className="font-bold truncate max-w-[80px]">{currentUser?.username || 'Guest'}</div>
              </div>
            </div>
          </div>
        </header>

        <div className="w-full">
          {renderContent()}
        </div>
        
        <div className="mt-12 hidden md:block">
           <SecurityLogs logs={logs} />
        </div>
      </main>

      <Navigation 
        activeView={activeView} 
        setActiveView={setActiveView} 
        isProfileComplete={progressPercent === 100} 
      />
    </div>
  );
};

export default App;
