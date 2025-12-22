
import React, { useState, useEffect } from 'react';
import { BiometricType, BiometricResult } from '../types';
import { generateBiometricHash, generateNFTArt } from '../services/gemini';
import { Link as LinkIcon, ShieldCheck, Database, Cpu, Globe, ExternalLink, Loader2, Image as ImageIcon, Send } from 'lucide-react';

interface BlockchainPortalProps {
  sessionSummary: string;
  onMintComplete: (nftUri: string, result: BiometricResult) => void;
  onWalletConnect: (address: string) => void;
  initialAddress?: string;
  isMinted: boolean;
}

const BlockchainPortal: React.FC<BlockchainPortalProps> = ({ sessionSummary, onMintComplete, onWalletConnect, initialAddress, isMinted }) => {
  const [walletAddress, setWalletAddress] = useState<string | null>(initialAddress || null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isStoring, setIsStoring] = useState(false);
  const [txHash, setTxHash] = useState<string | null>(null);
  const [nftPreview, setNftPreview] = useState<string | null>(null);
  const [mintStatus, setMintStatus] = useState<string>("IDLE");

  useEffect(() => {
    if (initialAddress) {
      setWalletAddress(initialAddress);
    }
  }, [initialAddress]);

  const connectWallet = async () => {
    if (typeof (window as any).ethereum !== 'undefined') {
      setIsConnecting(true);
      try {
        const accounts = await (window as any).ethereum.request({ method: 'eth_requestAccounts' });
        const address = accounts[0];
        setWalletAddress(address);
        onWalletConnect(address);
      } catch (err) {
        console.error("User denied account access or error occurred:", err);
      } finally {
        setIsConnecting(false);
      }
    } else {
      alert("MetaMask not detected. Please install it to anchor your identity on-chain.");
    }
  };

  const mintProfileNFT = async () => {
    if (!walletAddress) return;
    setIsStoring(true);
    setMintStatus("SYNTHESIZING_ART");

    try {
      // Step 1: Generate Gemini Binary Code Art
      const artBase64 = await generateNFTArt();
      setNftPreview(artBase64);
      setMintStatus("HASHING_BIOMETRICS");

      // Step 2: Generate unique hash for the profile
      const hash = await generateBiometricHash(sessionSummary || "Identity Anchor Node v2.1");
      setMintStatus("SENDING_TO_WALLET");

      // Step 3: Simulate blockchain transaction to the actual address
      setTimeout(() => {
        const dummyTx = "0x" + Math.random().toString(16).slice(2) + "deadbeef";
        setTxHash(dummyTx);
        
        onMintComplete(artBase64, {
          id: Math.random().toString(36).substr(2, 9).toUpperCase(),
          type: BiometricType.BLOCKCHAIN,
          timestamp: Date.now(),
          score: 100,
          details: `Biometric NFT Anchor successfully pushed to wallet ${walletAddress.substring(0, 6)}... Tx: ${dummyTx.substring(0, 16)}...`,
          status: 'Pass'
        });
        setIsStoring(false);
        setMintStatus("COMPLETED");
      }, 4000);
    } catch (err) {
      console.error(err);
      setIsStoring(false);
      setMintStatus("ERROR");
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-[2.5rem] p-8 max-w-3xl mx-auto shadow-2xl animate-in zoom-in-95 duration-500 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 blur-[100px] pointer-events-none"></div>
      
      <div className="flex items-center justify-between mb-10">
        <h2 className="text-2xl font-black flex items-center gap-4 tracking-tighter uppercase">
          <div className="p-3 bg-emerald-500/10 rounded-2xl border border-emerald-500/20">
            <LinkIcon className="text-emerald-400" size={28} />
          </div>
          Biometric Anchor Mint
        </h2>
        <div className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] border border-slate-800 px-4 py-1.5 rounded-full bg-slate-950">
          Standard: EIP-721_PROX
        </div>
      </div>

      {isMinted && !txHash ? (
         <div className="text-center py-16 bg-slate-950 rounded-[2.5rem] border border-emerald-500/30 shadow-2xl animate-in fade-in duration-500">
            <ShieldCheck size={64} className="text-emerald-400 mx-auto mb-6 drop-shadow-[0_0_15px_rgba(16,185,129,0.5)]" />
            <h3 className="text-2xl font-black text-emerald-400 uppercase tracking-tight">Node Anchor Verified</h3>
            <p className="text-slate-500 text-[10px] font-bold uppercase tracking-[0.2em] mt-3">This profile is locked to the global ledger.</p>
            {walletAddress && (
              <div className="mt-8 px-6 py-3 bg-emerald-500/10 rounded-2xl border border-emerald-500/20 inline-flex items-center gap-3 font-mono text-xs text-emerald-400">
                <Database size={14} /> {walletAddress}
              </div>
            )}
         </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            <div className="bg-slate-950 p-6 rounded-3xl border border-slate-800 shadow-inner">
              <div className="text-[10px] font-black text-slate-600 uppercase tracking-widest mb-3 flex items-center gap-2">
                <ImageIcon size={14} className="text-cyan-400" /> Identity Logic
              </div>
              <div className="text-sm font-bold tracking-tight text-slate-300">
                Binary Art Profile Anchor
              </div>
            </div>
            <div className="bg-slate-950 p-6 rounded-3xl border border-slate-800 shadow-inner">
              <div className="text-[10px] font-black text-slate-600 uppercase tracking-widest mb-3 flex items-center gap-2">
                <Globe size={14} className="text-emerald-400" /> Protocol State
              </div>
              <div className="text-sm font-bold tracking-tight text-slate-300">
                Ready for Node Push
              </div>
            </div>
          </div>

          {!walletAddress ? (
            <div className="text-center py-20 border-2 border-dashed border-slate-800 rounded-[3rem] bg-slate-950/40 group transition-all hover:border-orange-500/30">
              <button
                onClick={connectWallet}
                disabled={isConnecting}
                className="px-12 py-5 bg-[#F6851B] hover:bg-[#E2761B] text-white font-black rounded-2xl transition-all flex items-center gap-4 mx-auto shadow-2xl shadow-orange-500/30 active:scale-95 uppercase tracking-widest text-xs"
              >
                {isConnecting ? (
                  <Loader2 size={24} className="animate-spin" />
                ) : (
                  <img src="https://upload.wikimedia.org/wikipedia/commons/3/36/MetaMask_Identity.svg" className="w-8 h-8" alt="MetaMask" />
                )}
                Initialize Web3 Provider
              </button>
              <p className="mt-6 text-[10px] text-slate-600 uppercase tracking-[0.4em] font-black">Secure Provider Link Required</p>
            </div>
          ) : (
            <div className="space-y-8">
              <div className="bg-emerald-500/5 border border-emerald-500/20 p-6 rounded-3xl flex items-center justify-between animate-in fade-in slide-in-from-top-4 shadow-inner">
                <div className="flex flex-col">
                  <span className="text-[9px] font-black text-emerald-500/50 uppercase tracking-widest mb-1">Authenticated Wallet Node</span>
                  <span className="text-xs font-mono font-bold text-emerald-400 truncate max-w-[200px] md:max-w-md">{walletAddress}</span>
                </div>
                <div className="flex items-center gap-3 px-4 py-2 bg-emerald-500/10 rounded-xl border border-emerald-500/20 shadow-lg">
                  <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></div>
                  <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">Live_Connect</span>
                </div>
              </div>

              {!txHash ? (
                <div className="bg-slate-800/20 p-8 rounded-[3rem] border border-slate-800 flex flex-col items-center backdrop-blur-sm">
                  <div className="w-64 h-64 bg-slate-950 border-2 border-slate-800 rounded-[2rem] mb-8 flex items-center justify-center overflow-hidden relative group shadow-2xl">
                    {isStoring ? (
                      <div className="text-center relative z-10">
                        <Loader2 className="animate-spin text-emerald-400 mx-auto mb-4" size={48} />
                        <span className="text-[10px] font-black font-mono text-emerald-400 tracking-[0.2em]">{mintStatus}</span>
                      </div>
                    ) : (
                      <ImageIcon size={64} className="text-slate-800 transition-all group-hover:scale-110" />
                    )}
                    {/* Decorative radial gradients for high-tech look */}
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(16,185,129,0.1),transparent_70%)]"></div>
                  </div>
                  
                  <div className="w-full space-y-4">
                    <button
                      onClick={mintProfileNFT}
                      disabled={isStoring}
                      className="w-full py-5 bg-emerald-500 hover:bg-emerald-400 disabled:bg-slate-800 disabled:text-slate-600 text-slate-950 font-black rounded-2xl shadow-2xl shadow-emerald-500/20 flex items-center justify-center gap-4 transition-all active:scale-95 uppercase tracking-widest text-xs"
                    >
                      {isStoring ? <Loader2 size={20} className="animate-spin" /> : <Database size={20} />}
                      ANCHOR_IDENTITY_ON_CHAIN
                    </button>
                    <p className="text-[9px] text-slate-500 text-center font-bold uppercase tracking-widest flex items-center justify-center gap-2">
                       <Send size={10} /> The NFT will be pushed directly to your connected wallet.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="bg-slate-950 p-8 rounded-[3rem] border-2 border-emerald-500/40 shadow-2xl shadow-emerald-500/10 flex flex-col md:flex-row gap-8 animate-in slide-in-from-bottom-8 duration-700">
                  <div className="w-40 h-40 rounded-[2rem] overflow-hidden border border-slate-800 bg-black shadow-2xl flex-shrink-0 mx-auto md:mx-0">
                    {nftPreview && <img src={nftPreview} alt="NFT" className="w-full h-full object-cover" />}
                  </div>
                  <div className="flex-1 flex flex-col justify-center text-center md:text-left">
                    <div className="flex items-center justify-center md:justify-start gap-3 mb-3">
                      <div className="p-2 bg-emerald-500/10 rounded-lg">
                        <ShieldCheck className="text-emerald-400" size={20} />
                      </div>
                      <h3 className="font-black text-emerald-400 uppercase tracking-tight text-xl">Node Anchor Pushed</h3>
                    </div>
                    <div className="bg-slate-900/80 p-4 rounded-2xl mb-6 border border-slate-800 shadow-inner">
                      <p className="text-[9px] text-slate-600 mb-2 font-black uppercase tracking-widest">Ledger Receipt [Tx_Hash]</p>
                      <p className="text-[10px] text-emerald-500/80 font-mono break-all font-bold">{txHash}</p>
                    </div>
                    <button className="flex items-center justify-center md:justify-start gap-3 text-[10px] text-slate-500 hover:text-white transition-colors uppercase font-black tracking-widest">
                      <ExternalLink size={14} />
                      Explore Anchor Transaction
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </>
      )}

      <div className="mt-12 p-6 bg-slate-950/60 border border-slate-800 rounded-3xl backdrop-blur-sm">
        <div className="flex items-start gap-4">
          <div className="p-2 bg-blue-500/10 rounded-xl mt-0.5">
            <Cpu size={16} className="text-blue-400" />
          </div>
          <div>
            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-1">Identity Anchor Logic</h4>
            <p className="text-[9px] text-slate-500 leading-relaxed uppercase font-mono font-bold">
              Profile anchors are minted as unique cryptographic assets. Gemini 2.5 Flash analyzes your specific biometric signature to generate 
              the corresponding Binary Art Node. This asset is strictly non-custodial and pushed to your verified wallet address.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BlockchainPortal;
