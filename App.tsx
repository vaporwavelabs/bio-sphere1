
import React, { useState, useEffect, useMemo } from 'react';
import { BiometricType, BiometricResult, UserProfile, SecurityLog, WalletNode, EIP6963ProviderDetail } from './types';
import Navigation from './components/Navigation';
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import FacialScanner from './components/FacialScanner';
import VoiceScanner from './components/VoiceScanner';
import ScanMachine from './components/ScanMachine';
import BlockchainPortal from './components/BlockchainPortal';
import ProfileManager from './components/ProfileManager';
import DataBank from './components/DataBank';
import WalletAuditor from './components/WalletAuditor';
import RiskAnalyzer from './components/RiskAnalyzer';
import SecurityLogs from './components/SecurityLogs';
import { Loader2 } from 'lucide-react';

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [activeView, setActiveView] = useState<'DASHBOARD' | 'PROFILE' | 'DATABANK' | 'WALLETS' | 'ANALYZER' | BiometricType>('PROFILE');
  const [logs, setLogs] = useState<SecurityLog[]>([]);
  const [onboardingStep, setOnboardingStep] = useState<number | null>(null);
  const [isGeneratingId, setIsGeneratingId] = useState(false);
  const [restoringWalletId, setRestoringWalletId] = useState<string | null>(null);
  const [detectedProviders, setDetectedProviders] = useState<EIP6963ProviderDetail[]>([]);

  useEffect(() => {
    (window as any).appSetView = setActiveView;

    const onAnnounceProvider = (event: any) => {
      setDetectedProviders(prev => {
        if (prev.find(p => p.info.uuid === event.detail.info.uuid)) return prev;
        return [...prev, event.detail];
      });
    };

    window.addEventListener("eip6963:announceProvider", onAnnounceProvider);
    window.dispatchEvent(new Event("eip6963:requestProvider"));

    return () => window.removeEventListener("eip6963:announceProvider", onAnnounceProvider);
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
        event: Math.random() > 0.7 ? "Perimeter Sweep Complete" : "External Proxy Scanned",
        severity: Math.random() > 0.9 ? 'HIGH' : 'LOW',
        source: `IP_NODE_${Math.floor(Math.random() * 255)}`
      };
      setLogs(prev => [newLog, ...prev].slice(0, 20));
    }, 15000);
    return () => clearInterval(interval);
  }, []);

  const handleGenerateId = (userToUpdate?: UserProfile) => {
    const targetUser = userToUpdate || currentUser;
    if (!targetUser) return;
    
    setIsGeneratingId(true);
    setTimeout(() => {
      const wallets: WalletNode[] = targetUser.wallets.length > 0 ? targetUser.wallets : [];
      const updated = { ...targetUser, isIdGenerated: true, wallets };
      setCurrentUser(updated);
      localStorage.setItem(`profile_${targetUser.username}`, JSON.stringify(updated));
      setIsGeneratingId(false);
      setActiveView('DASHBOARD');
    }, 2000);
  };

  const addResult = (result: BiometricResult) => {
    if (!currentUser) return;
    const updated = { ...currentUser, results: [result, ...currentUser.results] };
    
    const required = [BiometricType.FACIAL, BiometricType.VOICE];
    const completed = required.filter(type => updated.results.some(r => r.type === type && r.status === 'Pass')).length;
    const isComplete = completed === required.length;

    if (restoringWalletId) {
      const walletToRestore = updated.wallets.find(w => w.id === restoringWalletId);
      if (walletToRestore && result.status === 'Pass') {
        const restoredWallets = updated.wallets.map(w => 
          w.id === restoringWalletId ? { ...w, isLocked: false, securityScore: 95 } : w
        );
        const fullyRestored = { ...updated, wallets: restoredWallets };
        setCurrentUser(fullyRestored);
        localStorage.setItem(`profile_${currentUser.username}`, JSON.stringify(fullyRestored));
        setRestoringWalletId(null);
        setActiveView('WALLETS');
        return;
      }
    }

    setCurrentUser(updated);
    localStorage.setItem(`profile_${currentUser.username}`, JSON.stringify(updated));
    
    if (onboardingStep !== null) {
      if (onboardingStep < 1) { 
        setOnboardingStep(onboardingStep + 1);
      } else {
        setOnboardingStep(null);
        if (isComplete) {
          handleGenerateId(updated);
        } else {
          setActiveView('DASHBOARD');
        }
      }
    } else if (isComplete && !currentUser.isIdGenerated) {
       handleGenerateId(updated);
    }
  };

  const handleWalletConnect = (address: string, providerName: string) => {
    if (!currentUser) return;
    if (currentUser.wallets.some(w => w.address.toLowerCase() === address.toLowerCase())) return;

    const newNode: WalletNode = {
      id: Math.random().toString(36).substr(2, 5).toUpperCase(),
      address,
      name: `${providerName} Node`,
      totalValue: '3.42 ETH',
      securityScore: 98,
      isLocked: false,
      assets: [],
      providerName
    };
    const updated = { ...currentUser, wallets: [newNode, ...currentUser.wallets], walletAddress: address };
    setCurrentUser(updated);
    localStorage.setItem(`profile_${currentUser.username}`, JSON.stringify(updated));
  };

  const handleWalletDisconnect = () => {
    if (!currentUser) return;
    const updated = { ...currentUser, wallets: [], walletAddress: undefined };
    setCurrentUser(updated);
    localStorage.setItem(`profile_${currentUser.username}`, JSON.stringify(updated));
    setActiveView('DASHBOARD');
  };

  const handleMintComplete = (nftUri: string, result: BiometricResult) => {
    if (!currentUser) return;
    const updated = { 
      ...currentUser, 
      isMinted: true, 
      nftUri, 
      results: [result, ...currentUser.results] 
    };
    setCurrentUser(updated);
    localStorage.setItem(`profile_${currentUser.username}`, JSON.stringify(updated));
  };

  const handleLogin = (user: UserProfile) => {
    setCurrentUser(user);
    const hasFace = user.results.some(r => r.type === BiometricType.FACIAL && r.status === 'Pass');
    if (!hasFace) {
      setActiveView(BiometricType.FACIAL);
    } else if (user.isIdGenerated) {
      setActiveView('DASHBOARD');
    } else {
      setActiveView('PROFILE');
    }
  };

  const renderContent = () => {
    if (!currentUser) return <ProfileManager onLogin={handleLogin} onStartOnboarding={() => setOnboardingStep(0)} />;

    if (onboardingStep !== null) {
      if (onboardingStep === 0) return <div className="py-12"><FacialScanner onComplete={addResult} /></div>;
      if (onboardingStep === 1) return <div className="py-12"><VoiceScanner onComplete={addResult} /></div>;
    }

    if (isGeneratingId) {
      return (
        <div className="flex flex-col items-center justify-center py-20 bg-slate-900/50 border border-slate-800 rounded-[3rem] max-w-xl mx-auto animate-in zoom-in-95 duration-700 shadow-2xl backdrop-blur-md">
          <Loader2 size={80} className="text-cyan-400 animate-spin mb-8" />
          <h2 className="text-3xl font-black tracking-tighter mb-2 uppercase text-center text-cyan-400">Synchronizing Identity</h2>
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
          onGenerateId={() => handleGenerateId()}
          wallets={currentUser.wallets}
          onWalletConnect={handleWalletConnect}
          onWalletDisconnect={handleWalletDisconnect}
          isMinted={currentUser.isMinted}
          detectedProviders={detectedProviders}
        />
      );
      case 'PROFILE': return <ProfileManager onLogin={handleLogin} currentUser={currentUser} onStartOnboarding={() => setOnboardingStep(0)} />;
      case 'DATABANK': return <DataBank user={currentUser} />;
      case 'WALLETS': return <WalletAuditor wallets={currentUser.wallets} onDisconnect={handleWalletDisconnect} onRestore={(id) => { setRestoringWalletId(id); setActiveView(BiometricType.FACIAL); }} />;
      case 'ANALYZER': return <RiskAnalyzer />;
      case BiometricType.FACIAL: return <div className="py-12"><FacialScanner onComplete={addResult} /></div>;
      case BiometricType.VOICE: return <div className="py-12"><VoiceScanner onComplete={addResult} /></div>;
      case BiometricType.BLOCKCHAIN: return <BlockchainPortal sessionSummary={currentUser.results.map(r => r.details).join(' ')} onMintComplete={handleMintComplete} onWalletConnect={(addr) => handleWalletConnect(addr, "Injected")} initialAddress={currentUser.wallets[0]?.address} isMinted={currentUser.isMinted} />;
      default: return <Dashboard results={currentUser.results} onNavigate={setActiveView} progress={progressPercent} logs={logs} isIdGenerated={currentUser.isIdGenerated} onGenerateId={() => handleGenerateId()} onWalletConnect={handleWalletConnect} onWalletDisconnect={handleWalletDisconnect} wallets={currentUser.wallets} isMinted={currentUser.isMinted} detectedProviders={detectedProviders} />;
    }
  };

  const isHome = (activeView as string) === 'DASHBOARD' || (activeView as string) === 'PROFILE';

  return (
    <div className="flex flex-col min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-cyan-500/30">
      <div className="fixed inset-0 pointer-events-none overflow-hidden opacity-30">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-cyan-500/10 blur-[120px] rounded-full"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/10 blur-[120px] rounded-full"></div>
      </div>

      {currentUser && (
        <Header 
          currentUser={currentUser} 
          activeView={activeView} 
          showBack={!isHome && activeView !== 'PROFILE'} 
          onBack={() => setActiveView('DASHBOARD')}
          onProfileClick={() => setActiveView('PROFILE')}
        />
      )}

      <main className={`flex-1 p-4 md:p-6 lg:p-8 overflow-x-hidden max-w-7xl mx-auto w-full relative z-10 ${currentUser ? 'pt-24 pb-32' : ''}`}>
        {renderContent()}
      </main>

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
