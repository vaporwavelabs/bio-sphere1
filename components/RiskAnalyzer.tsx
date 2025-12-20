
import React, { useState } from 'react';
import { analyzeRiskSearch } from '../services/gemini';
import { Search, ShieldAlert, Loader2, Globe, ArrowRight } from 'lucide-react';

const RiskAnalyzer: React.FC = () => {
  const [query, setQuery] = useState("");
  const [result, setResult] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query) return;
    setIsLoading(true);
    setResult(null);
    try {
      const data = await analyzeRiskSearch(query);
      setResult(data);
    } catch (err) {
      setResult("Node processing error.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl md:rounded-3xl p-5 md:p-8 max-w-3xl mx-auto shadow-2xl mb-24">
      <h2 className="text-xl md:text-2xl font-bold mb-6 md:mb-8 flex items-center gap-3">
        <Globe className="text-cyan-400" size={20} /> Threat Intelligence
      </h2>
      
      <form onSubmit={handleSearch} className="relative mb-6 md:mb-8">
        <input 
          type="text" 
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Website or Wallet Address..." 
          className="w-full bg-slate-950 border border-slate-800 rounded-xl md:rounded-2xl px-5 py-4 pl-12 outline-none focus:border-cyan-500 transition-all font-mono text-xs md:text-sm"
        />
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={20} />
        <button type="submit" disabled={isLoading} className="absolute right-3 top-1/2 -translate-y-1/2 p-2 bg-cyan-500 text-slate-950 rounded-lg md:rounded-xl hover:bg-cyan-400 active:scale-90 transition-all">
          {isLoading ? <Loader2 size={16} className="animate-spin" /> : <ArrowRight size={16} />}
        </button>
      </form>

      {result ? (
        <div className="bg-slate-950 border border-slate-800 rounded-xl md:rounded-2xl p-5 overflow-x-hidden">
           <div className="flex items-center gap-2 mb-3">
              <ShieldAlert className="text-amber-500" size={16} />
              <h3 className="m-0 text-amber-500 uppercase tracking-widest text-[10px] font-bold">Analysis</h3>
           </div>
           <div className="text-slate-300 font-mono text-[10px] md:text-xs whitespace-pre-wrap leading-relaxed">
              {result}
           </div>
        </div>
      ) : (
        <div className="text-center py-10 md:py-16 text-slate-700 flex flex-col items-center">
          <Globe size={32} className="opacity-10 mb-2" />
          <p className="text-[10px] uppercase tracking-widest font-bold">Scanning Global Perimeters...</p>
        </div>
      )}
    </div>
  );
};

export default RiskAnalyzer;
