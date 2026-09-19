import React,{useState} from 'react';
import { Incident } from '../types';
import { api } from '../api';

type Result={mode:string;toolExecutions:{id:string;name:string;status:string;summary:string}[];evidence:{id:string;type:string;finding:string}[];hypotheses:{id:string;title:string;description:string;supportingEvidenceIds:string[];uncertainty:string}[];report:{executiveSummary:string};aiAnalysis?:{executiveSummary:string;hypothesis:string;uncertainty:string;verificationSteps:string[]}};

export function InvestigationView({activeIncident,onRollbackCanary,onNavigateToReports}:{activeIncident:Incident|null;onRollbackCanary:(id:string,s:string)=>void;onNavigateToReports:()=>void}) {
  const [running,setRunning]=useState(false);
  const [result,setResult]=useState<Result|null>(null);
  const [error,setError]=useState('');
  const run=async()=>{if(!activeIncident)return;setRunning(true);setError('');try{setResult(await api.investigate(activeIncident.id))}catch(e){setError(e instanceof Error?e.message:'Investigation failed')}finally{setRunning(false)}};
  if(!activeIncident)return <div className="text-slate-400">Select an incident first.</div>;
  return <div className="max-w-7xl mx-auto space-y-5">
    <div className="rounded-xl bg-[#131b31] border border-red-400/20 p-5 flex justify-between items-center"><div><div className="text-xs text-red-300 font-mono">{activeIncident.id} · {activeIncident.severity}</div><h1 className="text-2xl text-white font-semibold mt-1">{activeIncident.title}</h1><p className="text-sm text-slate-400 mt-1 max-w-3xl">{activeIncident.summary}</p></div><button onClick={run} disabled={running} className="px-4 py-2 rounded-lg bg-sky-600 disabled:opacity-50 text-white text-sm">{running?'Investigating…':result?'Run again':'Start investigation'}</button></div>
    {error&&<div className="rounded-lg border border-red-400/20 bg-red-400/5 p-3 text-sm text-red-300">{error}</div>}
    {!result?<div className="rounded-xl border border-blue-400/10 bg-[#131b31] p-10 text-center text-sm text-slate-400">Start the investigation to collect real synthetic evidence through the server-side tool workflow.</div>:
    <div className="grid grid-cols-3 gap-5">
      <section className="rounded-xl bg-[#131b31] border border-blue-400/10 p-5"><div className="flex justify-between"><h2 className="text-white font-medium">Tool activity</h2><span className="text-[10px] text-emerald-300">{result.mode}</span></div><div className="mt-4 space-y-3">{result.toolExecutions.map(t=><div key={t.id} className="flex gap-3 text-xs"><span className="text-emerald-300">✓</span><div><div className="text-slate-200">{t.name}</div><div className="text-slate-500 mt-0.5">{t.summary}</div></div></div>)}</div></section>
      <section className="rounded-xl bg-[#131b31] border border-blue-400/10 p-5"><h2 className="text-white font-medium">Evidence</h2><div className="mt-4 space-y-3">{result.evidence.map(e=><div key={e.id} className="rounded-lg bg-[#0a1228] p-3"><div className="text-[10px] text-sky-300">{e.id} · {e.type}</div><div className="text-xs text-slate-300 mt-1">{e.finding}</div></div>)}</div></section>
      <section className="rounded-xl bg-[#131b31] border border-blue-400/10 p-5"><h2 className="text-white font-medium">Top hypothesis</h2>{result.hypotheses.map(h=><div key={h.id} className="mt-4 rounded-lg border border-amber-400/20 bg-amber-400/5 p-4"><div className="text-sm text-white font-medium">{result.aiAnalysis?.hypothesis||h.title}</div><p className="text-xs text-slate-400 mt-2">{result.aiAnalysis?.executiveSummary||h.description}</p><div className="mt-3 text-[10px] text-slate-500">Supports: {h.supportingEvidenceIds.join(', ')}</div><div className="mt-2 text-[10px] text-amber-300/80">{result.aiAnalysis?.uncertainty||h.uncertainty}</div></div>)}<button onClick={onNavigateToReports} className="mt-4 text-xs text-sky-300">Open final report →</button><button onClick={()=>onRollbackCanary(activeIncident.id,activeIncident.affectedService)} className="mt-4 block text-xs text-red-300">Simulate rollback</button></section>
    </div>}
  </div>
}
