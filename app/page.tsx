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
    <div className={`${theme === 'dark' ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'} min-h-screen flex flex-col transition-colors duration-500 font-sans`}>
      
      {/* --- Navbar --- */}
      <header className={`flex items-center justify-between px-4 md:px-10 py-5 border-b ${theme === 'dark' ? 'border-slate-800 bg-slate-900/80' : 'border-slate-200 bg-white/80'} backdrop-blur-xl sticky top-0 z-50`}>
        <div className="flex items-center gap-3">
          <div className="bg-emerald-500 p-2.5 rounded-2xl shadow-lg shadow-emerald-500/30">
            <ShieldCheck className="text-white w-6 h-6" />
          </div>
          <div>
            <h1 className="text-lg md:text-xl font-black tracking-tight uppercase">
              Kadena Pact <span className="text-emerald-500">AI Assistant</span>
            </h1>
            <p className="text-[9px] font-bold opacity-40 tracking-[0.3em] uppercase hidden sm:block">Professional Security Suite</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button 
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className={`p-3 rounded-2xl border transition-all ${theme === 'dark' ? 'border-slate-700 hover:bg-slate-800 text-yellow-400' : 'border-slate-300 hover:bg-slate-100 text-slate-600'}`}
          >
            {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>

          <button 
            onClick={handleAudit}
            disabled={isAnalyzing || !pactCode}
            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white px-8 py-3 rounded-2xl font-bold transition-all shadow-xl shadow-emerald-500/20 disabled:opacity-20 disabled:grayscale group"
          >
            {isAnalyzing ? "Analyzing..." : "Analyze Code"}
            {!isAnalyzing && <Play className="w-3 h-3 fill-current group-hover:translate-x-0.5 transition-transform" />}
          </button>
        </div>
      </header>

      {/* --- Main Workspace --- */}
      <main className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        
        {/* Editor Side */}
        <div className="flex-1 flex flex-col min-h-[50vh] lg:min-h-0 border-b lg:border-b-0 lg:border-r border-slate-800/30 relative">
          
          {/* Example Bar */}
          <div className={`px-4 py-2 border-b flex items-center justify-between ${theme === 'dark' ? 'bg-slate-900/40 border-slate-800' : 'bg-slate-100/50 border-slate-200'}`}>
             <div className="flex gap-2">
                <button onClick={() => setPactCode(EXAMPLES.vulnerable)} className="text-[10px] font-bold px-3 py-1 bg-rose-500/10 text-rose-500 border border-rose-500/20 rounded-lg hover:bg-rose-500/20 transition-all flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3"/> Load Vulnerable
                </button>
                <button onClick={() => setPactCode(EXAMPLES.multistep)} className="text-[10px] font-bold px-3 py-1 bg-amber-500/10 text-amber-500 border border-amber-500/20 rounded-lg hover:bg-amber-500/20 transition-all flex items-center gap-1">
                  <FileCode className="w-3 h-3"/> Load Defpact
                </button>
                <button onClick={() => setPactCode(EXAMPLES.secure)} className="text-[10px] font-bold px-3 py-1 bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 rounded-lg hover:bg-emerald-500/20 transition-all flex items-center gap-1">
                  <CheckCircle className="w-3 h-3"/> Load Secure
                </button>
             </div>
             <button onClick={() => setPactCode("")} className="p-2 opacity-40 hover:opacity-100 hover:text-rose-500 transition-all" title="Clear All">
                <Trash2 className="w-4 h-4" />
             </button>
          </div>
          
          <div className="flex-1 relative group">
            {!pactCode && (
              <div className="absolute inset-0 z-10 pointer-events-none flex items-center justify-center opacity-10 flex-col gap-4">
                <Code2 className="w-24 h-24" />
                <p className="text-xl font-black uppercase tracking-[0.3em]">Editor Empty</p>
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
                fontSize: 16,
                lineNumbers: "on",
                padding: { top: 20 },
                wordWrap: "on",
                fontFamily: "JetBrains Mono, Menlo, Monaco, Courier New, monospace",
                cursorSmoothCaretAnimation: "on",
                smoothScrolling: true,
              }}
            />
          </div>
        </div>

        {/* Results Side */}
        <div className={`w-full lg:w-[480px] xl:w-[550px] flex flex-col ${theme === 'dark' ? 'bg-slate-900/10' : 'bg-slate-50'}`}>
          <div className="p-6 md:p-8 flex-1 overflow-y-auto custom-scrollbar">
            <div className="flex items-center justify-between mb-10">
              <h2 className="text-[11px] font-black uppercase tracking-[0.3em] opacity-40">Security Intelligence</h2>
              {findings && (
                <div className="flex items-center gap-2 text-[10px] font-bold px-4 py-1.5 bg-emerald-500/10 text-emerald-500 rounded-xl border border-emerald-500/20">
                  <div className="relative flex h-2 w-2">
                    <div className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></div>
                    <div className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></div>
                  </div>
                  REPORT GENERATED
                </div>
              )}
            </div>

            {!findings && !isAnalyzing && (
              <div className="flex flex-col items-center justify-center h-[60vh] text-center opacity-20 px-10 border-2 border-dashed border-slate-500/20 rounded-[3rem]">
                <Laptop className="w-16 h-16 mb-6" />
                <h3 className="text-lg font-bold uppercase tracking-widest leading-tight">Ready for Scan</h3>
                <p className="text-[10px] mt-4 max-w-[200px] leading-relaxed font-bold uppercase tracking-tighter italic">Analyze a Pact module to view vulnerabilities.</p>
              </div>
            )}

            {isAnalyzing && (
              <div className="space-y-8">
                {[1, 2, 3].map((i) => (
                  <div key={i} className={`h-48 rounded-[2.5rem] animate-pulse ${theme === 'dark' ? 'bg-slate-800/40' : 'bg-slate-200/60'}`} />
                ))}
              </div>
            )}

            {findings && (
              <div className="space-y-8">
                {findings.length === 0 ? (
                  <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-[2.5rem] p-12 text-center shadow-2xl shadow-emerald-500/10">
                    <CheckCircle className="w-20 h-20 text-emerald-500 mx-auto mb-6" />
                    <p className="font-black text-2xl text-emerald-500 uppercase tracking-tighter">Clearance Level: Safe</p>
                    <p className="text-sm opacity-50 mt-2 font-medium">No critical flaws detected in provided logic.</p>
                  </div>
                ) : (
                  findings.map((f, i) => (
                    <div key={i} className={`group rounded-[2.5rem] border p-8 transition-all hover:shadow-2xl hover:-translate-y-1 ${
                      f.severity === 'High' ? 'bg-rose-500/5 border-rose-500/10 hover:border-rose-500/30' : 
                      f.severity === 'Medium' ? 'bg-amber-500/5 border-amber-500/10 hover:border-amber-500/30' : 
                      'bg-blue-500/5 border-blue-500/10 hover:border-blue-500/30'
                    }`}>
                      <div className="flex justify-between items-center mb-6">
                        <span className={`text-[10px] font-black px-4 py-1.5 rounded-full tracking-widest shadow-sm ${
                          f.severity === 'High' ? 'bg-rose-500 text-white' : 
                          f.severity === 'Medium' ? 'bg-amber-500 text-white' : 
                          'bg-blue-500 text-white'
                        }`}>
                          {f.severity}
                        </span>
                        <span className="text-[10px] font-mono opacity-30 font-bold bg-slate-500/10 px-3 py-1 rounded-lg">{f.function_name}</span>
                      </div>
                      
                      <h3 className="font-black text-xl mb-3 tracking-tight">{f.issue_title}</h3>
                      <p className="text-sm opacity-60 leading-relaxed mb-8 font-medium">{f.explanation}</p>
                      
                      <div className={`relative rounded-3xl p-6 font-mono text-[12px] border transition-colors ${
                        theme === 'dark' ? 'bg-slate-950/80 border-slate-800 text-emerald-400' : 'bg-white border-slate-200 text-emerald-700'
                      }`}>
                        <div className="flex items-center gap-2 mb-4 opacity-40 uppercase text-[9px] font-black tracking-widest">
                          <ArrowRight className="w-3 h-3" /> Secure Implementation
                        </div>
                        <button 
                          onClick={() => copyToClipboard(f.recommendation)}
                          className="absolute top-4 right-4 p-3 bg-emerald-500/10 hover:bg-emerald-500 text-emerald-500 hover:text-white rounded-2xl transition-all shadow-xl"
                        >
                          <Copy className="w-4 h-4" />
                        </button>
                        <pre className="whitespace-pre-wrap leading-relaxed overflow-x-auto"><code>{f.recommendation}</code></pre>
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