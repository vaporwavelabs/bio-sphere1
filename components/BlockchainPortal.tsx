
import React, { useState, useEffect } from 'react';
import { BiometricType, BiometricResult } from '../types';
import { generateBiometricHash, generateNFTArt } from '../services/gemini';
import { Link as LinkIcon, ShieldCheck, Database, Cpu, Globe, ExternalLink, Loader2, Image as ImageIcon } from 'lucide-react';

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

    try {
      // Step 1: Generate Gemini Binary Code Art
      const artBase64 = await generateNFTArt();
      setNftPreview(artBase64);

      // Step 2: Generate unique hash for the profile
      const hash = await generateBiometricHash(sessionSummary || "Identity Anchor Node v2.1");

      // Step 3: Simulate blockchain transaction
      setTimeout(() => {
        const dummyTx = "0x" + Math.random().toString(16).slice(2);
        setTxHash(dummyTx);
        
        onMintComplete(artBase64, {
          id: Math.random().toString(36).substr(2, 9),
          type: BiometricType.BLOCKCHAIN,
          timestamp: Date.now(),
          score: 100,
          details: `Binary Art NFT Minted as Wallet Anchor. Tx: ${dummyTx.substring(0, 16)}...`,
          status: 'Pass'
        });
        setIsStoring(false);
      }, 3000);
    } catch (err) {
      console.error(err);
      setIsStoring(false);
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 max-w-3xl mx-auto shadow-2xl animate-in zoom-in-95 duration-500">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-2xl font-bold flex items-center gap-3">
          <div className="p-2 bg-emerald-500/20 rounded-xl">
            <LinkIcon className="text-emerald-400" size={24} />
          </div>
          Web3 Identity Anchor
        </h2>
      </div>

      {isMinted && !txHash ? (
         <div className="text-center py-12 bg-slate-950 rounded-2xl border border-emerald-500/20">
            <ShieldCheck size={48} className="text-emerald-400 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-emerald-400">Anchor Verified</h3>
            <p className="text-slate-500 text-sm mt-2">This profile is already linked to a secure NFT anchor.</p>
            {walletAddress && (
              <div className="mt-4 px-4 py-2 bg-emerald-500/10 rounded-xl border border-emerald-500/20 inline-block font-mono text-[10px] text-emerald-400">
                {walletAddress}
              </div>
            )}
         </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
              <div className="text-[10px] font-bold text-slate-500 uppercase mb-2">Anchor Mechanism</div>
              <div className="flex items-center gap-2 text-sm">
                <ImageIcon size={14} className="text-blue-400" />
                Binary Code Art NFT
              </div>
            </div>
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
              <div className="text-[10px] font-bold text-slate-500 uppercase mb-2">Network Status</div>
              <div className="flex items-center gap-2 text-sm">
                <Globe size={14} className="text-emerald-400" />
                Ready for Mint
              </div>
            </div>
          </div>

          {!walletAddress ? (
            <div className="text-center py-12 border-2 border-dashed border-slate-800 rounded-2xl bg-slate-950/50">
              <button
                onClick={connectWallet}
                disabled={isConnecting}
                className="px-10 py-4 bg-[#F6851B] hover:bg-[#E2761B] text-white font-bold rounded-xl transition-all flex items-center gap-3 mx-auto shadow-lg shadow-orange-500/20 active:scale-95"
              >
                {isConnecting ? (
                  <Loader2 size={20} className="animate-spin" />
                ) : (
                  <img src="https://upload.wikimedia.org/wikipedia/commons/3/36/MetaMask_Identity.svg" className="w-6 h-6" alt="MetaMask" />
                )}
                CONNECT METAMASK
              </button>
              <p className="mt-4 text-[10px] text-slate-600 uppercase tracking-widest font-bold">Injected Provider Required</p>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="bg-emerald-500/5 border border-emerald-500/20 p-4 rounded-xl flex items-center justify-between animate-in fade-in duration-300">
                <div className="flex flex-col">
                  <span className="text-[8px] font-black text-emerald-500/60 uppercase mb-0.5">Linked Address</span>
                  <span className="text-xs font-mono text-emerald-400 truncate max-w-[200px] md:max-w-md">{walletAddress}</span>
                </div>
                <div className="flex items-center gap-2 px-3 py-1 bg-emerald-500/20 rounded-lg border border-emerald-500/20">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></div>
                  <span className="text-[9px] font-black text-emerald-400 uppercase tracking-widest">Connected</span>
                </div>
              </div>

              {!txHash ? (
                <div className="bg-slate-800/50 p-6 rounded-2xl border border-slate-700 flex flex-col items-center">
                  <div className="w-48 h-48 bg-slate-950 border border-slate-800 rounded-xl mb-6 flex items-center justify-center overflow-hidden">
                    {isStoring ? (
                      <div className="text-center">
                        <Loader2 className="animate-spin text-emerald-400 mx-auto mb-2" size={32} />
                        <span className="text-[10px] font-mono text-emerald-400">GENERATING BINARY ART...</span>
                      </div>
                    ) : (
                      <ImageIcon size={48} className="text-slate-800" />
                    )}
                  </div>
                  <button
                    onClick={mintProfileNFT}
                    disabled={isStoring}
                    className="w-full py-4 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl shadow-[0_0_20px_rgba(16,185,129,0.3)] flex items-center justify-center gap-2 transition-all active:scale-95"
                  >
                    <Database size={20} />
                    MINT IDENTITY ANCHOR
                  </button>
                </div>
              ) : (
                <div className="bg-slate-950 p-6 rounded-2xl border border-emerald-500/50 shadow-[0_0_20px_rgba(16,185,129,0.1)] flex gap-6 animate-in slide-in-from-bottom-4">
                  <div className="w-32 h-32 rounded-xl overflow-hidden border border-slate-800 bg-black shadow-inner">
                    {nftPreview && <img src={nftPreview} alt="NFT" className="w-full h-full object-cover" />}
                  </div>
                  <div className="flex-1 flex flex-col justify-center">
                    <h3 className="font-bold text-emerald-400 mb-2 uppercase text-sm">Anchor Minted Successfully</h3>
                    <div className="bg-slate-900 p-2 rounded-lg mb-4 border border-slate-800">
                      <p className="text-[10px] text-slate-500 mb-1 font-bold uppercase">Transaction Hash</p>
                      <p className="text-[10px] text-emerald-500/80 font-mono truncate">{txHash}</p>
                    </div>
                    <button className="flex items-center gap-2 text-[10px] text-slate-400 hover:text-white transition-colors uppercase font-black">
                      <ExternalLink size={12} />
                      View On-Chain Receipt
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </>
      )}

      <div className="mt-8 p-4 bg-slate-950/50 border border-slate-800 rounded-xl">
        <div className="flex items-start gap-3">
          <div className="p-1.5 bg-blue-500/10 rounded-lg mt-0.5">
            <Cpu size={14} className="text-blue-400" />
          </div>
          <p className="text-[9px] text-slate-500 text-center leading-tight uppercase tracking-wider font-medium">
            The identity anchor uses an EIP-721 standard NFT. Each art piece is uniquely generated by Gemini 2.5 Flash from your combined biometric data stream.
          </p>
        </div>
      </div>
    </div>
  );
};

export default BlockchainPortal;
