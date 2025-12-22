
import React, { useState, useEffect, useMemo } from 'react';
import { BiometricType, BiometricResult, UserProfile, SecurityLog, WalletNode } from './types';
import Navigation from './components/Navigation';
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
import { ShieldCheck, User, Sparkles, Loader2, LogOut, Lock } from 'lucide-react';

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [activeView, setActiveView] = useState<'DASHBOARD' | 'PROFILE' | 'DATABANK' | 'WALLETS' | 'ANALYZER' | BiometricType>('PROFILE');
  const [logs, setLogs] = useState<SecurityLog[]>([]);
  const [onboardingStep, setOnboardingStep] = useState<number | null>(null);
  const [isGeneratingId, setIsGeneratingId] = useState(false);
  const [restoringWalletId, setRestoringWalletId] = useState<string | null>(null);

  useEffect(() => {
    (window as any).appSetView = setActiveView;
  }, []);

  // Machine Check Disabled: Now only requiring Facial and Voice
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

  const handleGenerateId = (userToUpdate?: UserProfile) => {
    const targetUser = userToUpdate || currentUser;
    if (!targetUser) return;
    
    setIsGeneratingId(true);
    setTimeout(() => {
      const wallets: WalletNode[] = targetUser.wallets.length > 0 ? targetUser.wallets : [
        {
          id: 'w1',
          name: 'Main Ethereum Node',
          address: '0x71C7656EC7ab88b098defB751B7401B5f6d8976F',
          totalValue: '1.24 ETH',
          securityScore: 88,
          isLocked: false,
          assets: []
        },
        {
          id: 'w2',
          name: 'Vault Storage',
          address: '0xDE765...F821',
          totalValue: '12.50 ETH',
          securityScore: 42,
          isLocked: true,
          assets: []
        }
      ];
      
      const updated = { ...targetUser, isIdGenerated: true, wallets };
      setCurrentUser(updated);
      localStorage.setItem(`profile_${targetUser.username}`, JSON.stringify(updated));
      setIsGeneratingId(false);
      setActiveView('DASHBOARD');
    }, 3000);
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

  const handleWalletConnect = (address: string) => {
    if (!currentUser) return;
    const newNode: WalletNode = {
      id: Math.random().toString(36).substr(2, 5),
      address,
      name: 'Connected Node',
      totalValue: 'Checking...',
      securityScore: 100,
      isLocked: false,
      assets: []
    };
    const updated = { ...currentUser, wallets: [newNode, ...currentUser.wallets], walletAddress: address };
    setCurrentUser(updated);
    localStorage.setItem(`profile_${currentUser.username}`, JSON.stringify(updated));
  };

  const handleRestoreRequest = (walletId: string) => {
    setRestoringWalletId(walletId);
    setActiveView(BiometricType.FACIAL);
  };

  const handleMintComplete = (nftUri: string, result: BiometricResult) => {
    if (!currentUser) return;
    const updated = { 
      ...currentUser, 
      nftUri, 
      isMinted: true, 
      results: [result, ...currentUser.results] 
    };
    setCurrentUser(updated);
    localStorage.setItem(`profile_${currentUser.username}`, JSON.stringify(updated));
  };

  const renderContent = () => {
    if (!currentUser) return <ProfileManager onLogin={(u) => { setCurrentUser(u); setOnboardingStep(null); if (u.isIdGenerated) setActiveView('DASHBOARD'); else setActiveView('PROFILE'); }} onStartOnboarding={() => setOnboardingStep(0)} />;

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
          <h2 className="text-3xl font-black tracking-tighter mb-2 uppercase text-center px-6 text-cyan-400">Synchronizing Identity</h2>
          <p className="text-slate-500 text-[10px] font-bold tracking-[0.4em] uppercase text-center">Reconstructing Ledger Nodes...</p>
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
          isMinted={currentUser.isMinted}
        />
      );
      case 'PROFILE': return <ProfileManager onLogin={setCurrentUser} currentUser={currentUser} onStartOnboarding={() => setOnboardingStep(0)} />;
      case 'DATABANK': return <div className="animate-in slide-in-from-bottom-8 duration-500"><DataBank user={currentUser} /></div>;
      case 'WALLETS': return (
        <div className="animate-in slide-in-from-bottom-8 duration-500">
          <WalletAuditor 
            wallets={currentUser.wallets} 
            onRestore={handleRestoreRequest}
          />
        </div>
      );
      case 'ANALYZER': return <div className="animate-in slide-in-from-bottom-8 duration-500"><RiskAnalyzer /></div>;
      case BiometricType.FACIAL: return (
        <div className="py-12">
          {restoringWalletId && (
            <div className="mb-6 bg-amber-500/10 border border-amber-500/30 p-4 rounded-2xl flex items-center gap-4 text-amber-400 uppercase font-black text-[10px] tracking-widest max-w-2xl mx-auto">
              <Lock size={16} /> RESTORATION_PROTOCOL::ACTIVE - FACE_MESH_REQUIRED
            </div>
          )}
          <FacialScanner onComplete={addResult} />
        </div>
      );
      case BiometricType.VOICE: return <div className="py-12"><VoiceScanner onComplete={addResult} /></div>;
      case BiometricType.SCAN_MACHINE: return <div className="py-12"><ScanMachine username={currentUser.username} onComplete={addResult} /></div>;
      case BiometricType.BLOCKCHAIN: return (
        <div className="animate-in slide-in-from-bottom-8 duration-500">
          <BlockchainPortal 
            sessionSummary={currentUser.results.map(r => r.details).join(' ')} 
            onMintComplete={handleMintComplete} 
            onWalletConnect={handleWalletConnect}
            initialAddress={currentUser.wallets[0]?.address}
            isMinted={currentUser.isMinted} 
          />
        </div>
      );
      default: return <Dashboard results={currentUser.results} onNavigate={setActiveView} progress={progressPercent} logs={logs} isIdGenerated={currentUser.isIdGenerated} onGenerateId={() => handleGenerateId()} onWalletConnect={handleWalletConnect} wallets={currentUser.wallets} isMinted={currentUser.isMinted} />;
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-cyan-500/30">
      <div className="fixed inset-0 pointer-events-none overflow-hidden opacity-30">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-cyan-500/10 blur-[120px] rounded-full"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/10 blur-[120px] rounded-full"></div>
      </div>

      <main className="flex-1 p-4 md:p-6 lg:p-8 overflow-x-hidden max-w-7xl mx-auto w-full relative z-10 pb-24 md:pb-32">
        <header className="mb-10 flex flex-col md:flex-row items-center justify-between gap-6 border-b border-slate-900 pb-8">
          <div className="text-center md:text-left">
            <h1 className="text-3xl font-black bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-blue-500 tracking-tighter uppercase mb-1">Biometric_Sphere</h1>
            <p className="text-slate-500 text-[10px] font-bold flex items-center justify-center md:justify-start gap-2 uppercase tracking-[0.4em]">
              <ShieldCheck size={12} className="text-cyan-500" /> Multi-Modal Security Protocol
            </p>
          </div>
          
          {currentUser && (
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-3 bg-slate-900 border border-slate-800 p-2 pr-5 rounded-2xl shadow-xl">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center border bg-cyan-500/5 overflow-hidden shadow-inner transition-all ${currentUser.isMinted ? 'border-emerald-500 shadow-emerald-500/20' : 'border-cyan-500/30'}`}>
                  {currentUser.nftUri ? <img src={currentUser.nftUri} className="w-full h-full object-cover" /> : <User size={20} className="text-cyan-400" />}
                </div>
                <div>
                  <div className={`text-[8px] font-black uppercase tracking-widest mb-0.5 ${currentUser.isMinted ? 'text-emerald-400' : 'text-slate-500'}`}>
                    {currentUser.isMinted ? 'ANCHORED_NODE' : 'VERIFIED_NODE'}
                  </div>
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
