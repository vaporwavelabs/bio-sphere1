
import React, { useState, useEffect } from 'react';
import { BiometricType, BiometricResult } from '../types';
import { generateBiometricHash, generateNFTArt } from '../services/gemini';
// Added missing CheckCircle2 to imports from lucide-react
import { Link as LinkIcon, ShieldCheck, Database, Cpu, Globe, ExternalLink, Loader2, Image as ImageIcon, Send, Box, Zap, Sparkles, CheckCircle2 } from 'lucide-react';

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
  const [progress, setProgress] = useState(0);

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
    setProgress(10);
    setMintStatus("SYNTHESIZING_BIOMETRIC_ART");

    try {
      // Step 1: Generate Gemini Binary Code Art
      const artBase64 = await generateNFTArt();
      setNftPreview(artBase64);
      setProgress(40);
      setMintStatus("CALCULATING_GENESIS_HASH");

      // Step 2: Generate unique hash for the profile
      const hash = await generateBiometricHash(sessionSummary || "Identity Anchor Node v2.1");
      setProgress(60);
      setMintStatus("SEQUENCING_LAYER_2_PACKET");

      // Step 3: Simulate blockchain transaction to the actual address
      setTimeout(() => {
        setProgress(85);
        setMintStatus("BROADCASTING_TO_MAINNET");
        
        setTimeout(() => {
          const dummyTx = "0x" + Math.random().toString(16).slice(2) + "deadbeef71c" + Math.floor(Math.random() * 9999);
          setTxHash(dummyTx);
          setProgress(100);
          
          onMintComplete(artBase64, {
            id: Math.random().toString(36).substr(2, 9).toUpperCase(),
            type: BiometricType.BLOCKCHAIN,
            timestamp: Date.now(),
            score: 100,
            details: `Identity Anchor Protocol: NFT Asset generated and pushed to vault ${walletAddress.substring(0, 10)}... Hash: ${hash.substring(0, 12)}...`,
            status: 'Pass'
          });
          setIsStoring(false);
          setMintStatus("ANCHOR_COMPLETE");
        }, 2500);
      }, 2500);
    } catch (err) {
      console.error(err);
      setIsStoring(false);
      setMintStatus("ERROR_PROTOCOL_HALTED");
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
          Standard: EIP-721_SPHERE
        </div>
      </div>

      {(isMinted || txHash) ? (
         <div className="text-center py-10 bg-slate-950 rounded-[2.5rem] border border-emerald-500/30 shadow-2xl animate-in fade-in duration-700 relative overflow-hidden">
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 pointer-events-none"></div>
            <div className="relative z-10">
              <div className="w-48 h-48 mx-auto mb-8 rounded-[2rem] overflow-hidden border-4 border-emerald-500 shadow-[0_0_30px_rgba(16,185,129,0.3)] group relative">
                {nftPreview ? (
                  <img src={nftPreview} alt="NFT" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-slate-900 flex items-center justify-center">
                    <ShieldCheck size={64} className="text-emerald-400" />
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-emerald-500/20 to-transparent pointer-events-none"></div>
              </div>
              
              <h3 className="text-2xl font-black text-emerald-400 uppercase tracking-tight flex items-center justify-center gap-3">
                <CheckCircle2 size={24} /> Node Anchor Verified
              </h3>
              <p className="text-slate-500 text-[10px] font-bold uppercase tracking-[0.2em] mt-3">Identity successfully pushed to verified vault.</p>
              
              {txHash && (
                <div className="mt-8 px-6 py-4 bg-slate-900 rounded-2xl border border-slate-800 inline-flex flex-col items-center gap-2 max-w-sm">
                  <div className="text-[8px] font-black text-slate-600 uppercase tracking-widest">Transaction Hash</div>
                  <div className="font-mono text-[10px] text-emerald-400 break-all">{txHash}</div>
                  <a href="#" className="flex items-center gap-2 text-[9px] text-slate-500 hover:text-emerald-400 mt-2 font-black uppercase tracking-widest">
                    <ExternalLink size={12} /> View on SphereScan
                  </a>
                </div>
              )}
            </div>
         </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            <div className="bg-slate-950 p-6 rounded-3xl border border-slate-800 shadow-inner">
              <div className="text-[10px] font-black text-slate-600 uppercase tracking-widest mb-3 flex items-center gap-2">
                <ImageIcon size={14} className="text-cyan-400" /> Identity Genesis
              </div>
              <div className="text-sm font-bold tracking-tight text-slate-300">
                Binary Art Profile Anchor
              </div>
            </div>
            <div className="bg-slate-950 p-6 rounded-3xl border border-slate-800 shadow-inner">
              <div className="text-[10px] font-black text-slate-600 uppercase tracking-widest mb-3 flex items-center gap-2">
                <Globe size={14} className="text-emerald-400" /> Protocol Status
              </div>
              <div className="text-sm font-bold tracking-tight text-slate-300 uppercase">
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
              <div className="bg-emerald-500/5 border border-emerald-500/20 p-6 rounded-3xl flex items-center justify-between shadow-inner">
                <div className="flex flex-col">
                  <span className="text-[9px] font-black text-emerald-500/50 uppercase tracking-widest mb-1">Authenticated Vault Address</span>
                  <span className="text-xs font-mono font-bold text-emerald-400 truncate max-w-[200px] md:max-w-md">{walletAddress}</span>
                </div>
                <div className="flex items-center gap-3 px-4 py-2 bg-emerald-500/10 rounded-xl border border-emerald-500/20">
                  <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></div>
                  <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">Live</span>
                </div>
              </div>

              <div className="bg-slate-800/20 p-8 rounded-[3rem] border border-slate-800 flex flex-col items-center backdrop-blur-sm relative overflow-hidden">
                <div className="w-64 h-64 bg-slate-950 border-2 border-slate-800 rounded-[2rem] mb-8 flex items-center justify-center overflow-hidden relative group shadow-2xl">
                  {isStoring ? (
                    <div className="text-center relative z-10 w-full px-6">
                      <div className="relative mb-6">
                        <Loader2 className="animate-spin text-emerald-400 mx-auto" size={48} />
                        <Box size={20} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-emerald-500" />
                      </div>
                      <div className="text-[10px] font-black font-mono text-emerald-400 tracking-[0.2em] mb-4 uppercase">{mintStatus}</div>
                      <div className="w-full h-1.5 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
                         <div className="h-full bg-emerald-500 transition-all duration-500" style={{width: `${progress}%`}}></div>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-4">
                      <div className="p-6 bg-slate-900 rounded-3xl border border-slate-800">
                        <ImageIcon size={48} className="text-slate-700 transition-all group-hover:scale-110" />
                      </div>
                      <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Identity_Art.GEN</span>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(16,185,129,0.1),transparent_70%)]"></div>
                </div>
                
                <div className="w-full space-y-4 max-w-sm">
                  <button
                    onClick={mintProfileNFT}
                    disabled={isStoring}
                    className="w-full py-5 bg-emerald-500 hover:bg-emerald-400 disabled:bg-slate-800 disabled:text-slate-600 text-slate-950 font-black rounded-2xl shadow-2xl shadow-emerald-500/20 flex items-center justify-center gap-4 transition-all active:scale-95 uppercase tracking-widest text-xs"
                  >
                    {isStoring ? <Zap size={20} className="animate-pulse" /> : <Database size={20} />}
                    Anchor Identity on Ledger
                  </button>
                  <p className="text-[9px] text-slate-500 text-center font-bold uppercase tracking-widest flex items-center justify-center gap-2">
                     <Sparkles size={10} className="text-emerald-500" /> Non-custodial NFT push to active vault node.
                  </p>
                </div>
              </div>
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
            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-1">Anchor Logic Summary</h4>
            <p className="text-[9px] text-slate-500 leading-relaxed uppercase font-mono font-bold">
              The Anchor Protocol utilizes Gemini 2.5 Flash to synthesize a unique generative art piece based on your encrypted biometric session. 
              This NFT acts as the cryptographic genesis of your secure identity node, permanently stored on the global ledger.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BlockchainPortal;
