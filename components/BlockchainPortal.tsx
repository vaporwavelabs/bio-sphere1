
import React, { useState } from 'react';
import { BiometricType, BiometricResult } from '../types';
import { generateBiometricHash, generateNFTArt } from '../services/gemini';
import { Link as LinkIcon, ShieldCheck, Database, Cpu, Globe, ExternalLink, Loader2, Image as ImageIcon } from 'lucide-react';

interface BlockchainPortalProps {
  sessionSummary: string;
  onMintComplete: (nftUri: string, result: BiometricResult) => void;
  isMinted: boolean;
}

const BlockchainPortal: React.FC<BlockchainPortalProps> = ({ sessionSummary, onMintComplete, isMinted }) => {
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isStoring, setIsStoring] = useState(false);
  const [txHash, setTxHash] = useState<string | null>(null);
  const [nftPreview, setNftPreview] = useState<string | null>(null);

  const connectWallet = async () => {
    setIsConnecting(true);
    setTimeout(() => {
      setWalletAddress("0x71C7656EC7ab88b098defB751B7401B5f6d8976F");
      setIsConnecting(false);
    }, 1200);
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
            <div className="text-center py-12 border-2 border-dashed border-slate-800 rounded-2xl">
              <button
                onClick={connectWallet}
                disabled={isConnecting}
                className="px-10 py-4 bg-slate-100 hover:bg-white text-slate-950 font-bold rounded-xl transition-all flex items-center gap-2 mx-auto"
              >
                {isConnecting ? <Loader2 size={20} className="animate-spin" /> : <ShieldCheck size={20} />}
                CONNECT WALLET
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="bg-emerald-500/5 border border-emerald-500/20 p-4 rounded-xl flex items-center justify-between">
                <span className="text-xs font-mono text-emerald-400 truncate w-3/4">{walletAddress}</span>
                <span className="text-[10px] bg-emerald-500/20 px-2 py-0.5 rounded text-emerald-400">CONNECTED</span>
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
                    className="w-full py-4 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl shadow-[0_0_20px_rgba(16,185,129,0.3)] flex items-center justify-center gap-2"
                  >
                    <Database size={20} />
                    MINT IDENTITY ANCHOR
                  </button>
                </div>
              ) : (
                <div className="bg-slate-950 p-6 rounded-2xl border border-emerald-500/50 shadow-[0_0_20px_rgba(16,185,129,0.1)] flex gap-6">
                  <div className="w-32 h-32 rounded-xl overflow-hidden border border-slate-800 bg-black">
                    {nftPreview && <img src={nftPreview} alt="NFT" className="w-full h-full object-cover" />}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-emerald-400 mb-2">Anchor Minted Successfully</h3>
                    <p className="text-xs text-slate-500 mb-4 font-mono truncate">{txHash}</p>
                    <button className="flex items-center gap-2 text-[10px] text-slate-400 hover:text-white">
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

      <p className="mt-8 text-[10px] text-slate-600 text-center leading-tight">
        The minted NFT serves as a unique wallet anchor. Binary art generation is non-reversible and unique to your identity stream.
      </p>
    </div>
  );
};

export default BlockchainPortal;
