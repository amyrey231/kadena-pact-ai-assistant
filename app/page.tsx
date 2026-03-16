"use client";

import { useState } from "react";
import Editor from "@monaco-editor/react";
import { 
  ShieldCheck, Play, AlertTriangle, CheckCircle, 
  AlertOctagon, Info, ArrowRight, Sun, Moon, 
  Laptop, Copy, Code2, Smartphone, Terminal, Trash2, FileCode
} from "lucide-react";

type Finding = {
  severity: "High" | "Medium" | "Low";
  function_name: string;
  issue_title: string;
  explanation: string;
  recommendation: string;
};

const EXAMPLES = {
  vulnerable: `(module payment-module GOVERNANCE
  (defcap GOVERNANCE () (enforce-keyset "admin"))
  
  (defun payout (receiver:string amount:decimal)
    ;; VULNERABILITY: No capability check! 
    ;; Anyone can call this to drain the contract.
    (update accounts receiver { "balance": (+ amount (get-balance receiver)) })
  )
)`,
  multistep: `(defpact cross-chain-transfer (user:string amount:decimal)
  (step (withdraw user amount))
  ;; VULNERABILITY: Missing roll-back protection
  ;; or authorization on the second step.
  (step (deposit user amount))
)`,
  secure: `(module secure-vault GOVERNANCE
  (defcap GOVERNANCE () (enforce-keyset "admin"))
  (defcap INTERNAL_AUTH (user:string) (enforce-guard (at 'guard (read users user))))

  (defun safe-withdraw (user:string amount:decimal)
    (with-capability (INTERNAL_AUTH user)
      (update vaults user { "bal": (- (get-bal user) amount) })
    )
  )
)`
};

export default function Home() {
  const [pactCode, setPactCode] = useState<string>(""); 
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [findings, setFindings] = useState<Finding[] | null>(null);
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');

  const handleAudit = async () => {
    if (!pactCode.trim()) return;
    setIsAnalyzing(true);
    setFindings(null);

    try {
      const res = await fetch('/api/audit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: pactCode }),
      });
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      setFindings(data.findings);
    } catch (error) {
      console.error(error);
      alert("Analysis failed. Please check your API connection.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  
 return (
    <div className={`${theme === 'dark' ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'} min-h-screen flex flex-col transition-colors duration-500 font-sans h-screen overflow-hidden`}>
      
      {/* --- Navbar --- */}
      <header className={`flex-none flex items-center justify-between px-4 md:px-10 py-4 border-b ${theme === 'dark' ? 'border-slate-800 bg-slate-900/80' : 'border-slate-200 bg-white/80'} backdrop-blur-xl z-50`}>
        <div className="flex items-center gap-3">
          <div className="bg-emerald-500 p-2 rounded-xl shadow-lg shadow-emerald-500/30">
            <ShieldCheck className="text-white w-5 h-5 md:w-6 md:h-6" />
          </div>
          <div>
            <h1 className="text-base md:text-xl font-black tracking-tight uppercase">
              Kadena Pact <span className="text-emerald-500">AI Assistant</span>
            </h1>
            <p className="text-[8px] font-bold opacity-40 tracking-[0.3em] uppercase hidden sm:block">Professional Security Suite</p>
          </div>
        </div>

        <div className="flex items-center gap-2 md:gap-4">
          <button 
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className={`p-2 md:p-3 rounded-xl border transition-all ${theme === 'dark' ? 'border-slate-700 hover:bg-slate-800 text-yellow-400' : 'border-slate-300 hover:bg-slate-100 text-slate-600'}`}
          >
            {theme === 'dark' ? <Sun className="w-4 h-4 md:w-5 md:h-5" /> : <Moon className="w-4 h-4 md:w-5 md:h-5" />}
          </button>

          <button 
            onClick={handleAudit}
            disabled={isAnalyzing || !pactCode}
            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white px-4 md:px-8 py-2 md:py-3 rounded-xl font-bold transition-all shadow-xl shadow-emerald-500/20 disabled:opacity-20 disabled:grayscale group text-xs md:text-base"
          >
            {isAnalyzing ? "Scanning..." : "Analyze"}
            {!isAnalyzing && <Play className="w-3 h-3 fill-current group-hover:translate-x-0.5 transition-transform" />}
          </button>
        </div>
      </header>

      {/* --- Main Workspace --- */}
      <main className="flex-1 flex flex-col lg:flex-row overflow-hidden h-full">
        
        {/* Editor Side: Forced height on Mobile */}
        <div className="w-full lg:flex-1 flex flex-col h-[50vh] lg:h-full border-b lg:border-b-0 lg:border-r border-slate-800/30 relative">
          
          {/* Example Bar (Scrollable on Mobile) */}
          <div className={`flex-none px-4 py-2 border-b flex items-center justify-between overflow-x-auto ${theme === 'dark' ? 'bg-slate-900/40 border-slate-800' : 'bg-slate-100/50 border-slate-200'}`}>
             <div className="flex gap-2 shrink-0">
                <button onClick={() => setPactCode(EXAMPLES.vulnerable)} className="whitespace-nowrap text-[9px] font-bold px-2 py-1 bg-rose-500/10 text-rose-500 border border-rose-500/20 rounded-lg hover:bg-rose-500/20 transition-all">
                  Vulnerable
                </button>
                <button onClick={() => setPactCode(EXAMPLES.multistep)} className="whitespace-nowrap text-[9px] font-bold px-2 py-1 bg-amber-500/10 text-amber-500 border border-amber-500/20 rounded-lg hover:bg-amber-500/20 transition-all">
                  Defpact
                </button>
                <button onClick={() => setPactCode(EXAMPLES.secure)} className="whitespace-nowrap text-[9px] font-bold px-2 py-1 bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 rounded-lg hover:bg-emerald-500/20 transition-all">
                  Secure
                </button>
             </div>
             <button onClick={() => setPactCode("")} className="ml-4 p-2 opacity-40 hover:opacity-100 hover:text-rose-500 transition-all">
                <Trash2 className="w-4 h-4" />
             </button>
          </div>
          
          <div className="flex-1 relative overflow-hidden">
            {!pactCode && (
              <div className="absolute inset-0 z-10 pointer-events-none flex items-center justify-center opacity-10 flex-col gap-2">
                <Code2 className="w-12 h-12" />
                <p className="text-xs font-black uppercase tracking-[0.2em]">Editor Empty</p>
              </div>
            )}
            <Editor
              height="100%"
              defaultLanguage="clojure"
              theme={theme === 'dark' ? "vs-dark" : "light"}
              value={pactCode}
              onChange={(v) => setPactCode(v || "")}
              options={{
                minimap: { enabled: false },
                fontSize: 14,
                lineNumbers: "on",
                padding: { top: 10 },
                wordWrap: "on",
                automaticLayout: true, // Crucial for mobile resizing
                scrollBeyondLastLine: false,
              }}
            />
          </div>
        </div>

        {/* Results Side */}
        <div className={`w-full lg:w-[450px] xl:w-[500px] flex flex-col h-[50vh] lg:h-full ${theme === 'dark' ? 'bg-slate-900/10' : 'bg-slate-50'}`}>
          <div className="p-4 md:p-8 flex-1 overflow-y-auto custom-scrollbar">
            <div className="flex items-center justify-between mb-6 md:mb-10">
              <h2 className="text-[10px] font-black uppercase tracking-[0.3em] opacity-40">Audit Findings</h2>
              {findings && (
                <div className="text-[9px] font-bold px-3 py-1 bg-emerald-500/10 text-emerald-500 rounded-lg border border-emerald-500/20 animate-pulse">
                  SCAN COMPLETE
                </div>
              )}
            </div>

            {!findings && !isAnalyzing && (
              <div className="flex flex-col items-center justify-center py-10 text-center opacity-20 border-2 border-dashed border-slate-500/20 rounded-[2rem]">
                <Smartphone className="w-10 h-10 mb-4 lg:hidden" />
                <Laptop className="w-12 h-12 mb-4 hidden lg:block" />
                <h3 className="text-sm font-bold uppercase tracking-widest">Ready</h3>
              </div>
            )}

            {isAnalyzing && (
              <div className="space-y-4">
                {[1, 2].map((i) => (
                  <div key={i} className={`h-32 rounded-3xl animate-pulse ${theme === 'dark' ? 'bg-slate-800/40' : 'bg-slate-200/60'}`} />
                ))}
              </div>
            )}

            {findings && (
              <div className="space-y-6">
                {findings.length === 0 ? (
                  <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-[2rem] p-8 text-center">
                    <CheckCircle className="w-10 h-10 text-emerald-500 mx-auto mb-4" />
                    <p className="font-black text-emerald-500 uppercase tracking-tighter">Safe</p>
                  </div>
                ) : (
                  findings.map((f, i) => (
                    <div key={i} className={`rounded-[2rem] border p-6 transition-all ${
                      f.severity === 'High' ? 'bg-rose-500/5 border-rose-500/10 shadow-rose-500/5' : 
                      f.severity === 'Medium' ? 'bg-amber-500/5 border-amber-500/10 shadow-amber-500/5' : 
                      'bg-blue-500/5 border-blue-500/10 shadow-blue-500/5'
                    }`}>
                      <div className="flex justify-between items-center mb-4">
                        <span className={`text-[9px] font-black px-3 py-1 rounded-full ${
                          f.severity === 'High' ? 'bg-rose-500 text-white' : 
                          f.severity === 'Medium' ? 'bg-amber-500 text-white' : 
                          'bg-blue-500 text-white'
                        }`}>{f.severity}</span>
                        <span className="text-[9px] font-mono opacity-30">{f.function_name}</span>
                      </div>
                      <h3 className="font-black text-base mb-2 tracking-tight">{f.issue_title}</h3>
                      <p className="text-xs opacity-60 leading-relaxed mb-6">{f.explanation}</p>
                      <div className={`relative rounded-2xl p-4 font-mono text-[10px] border ${
                        theme === 'dark' ? 'bg-slate-950/80 border-slate-800 text-emerald-400' : 'bg-white border-slate-200 text-emerald-700'
                      }`}>
                        <button onClick={() => copyToClipboard(f.recommendation)} className="absolute top-2 right-2 p-2 bg-emerald-500/10 rounded-lg">
                          <Copy className="w-3 h-3" />
                        </button>
                        <pre className="whitespace-pre-wrap"><code>{f.recommendation}</code></pre>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}