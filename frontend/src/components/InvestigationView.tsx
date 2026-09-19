import React, {useState} from 'react';
import { Incident } from '../types';

type Evidence={id:string;type:string;finding:string};
export function InvestigationView({activeIncident,onRollbackCanary,onNavigateToReports}:{activeIncident:Incident|null;onRollbackCanary:(id:string,s:string)=>void;onNavigateToReports:()=>void}) {
  const [running,setRunning]=useState(false); const [done,setDone]=useState(false);
  const evidence:Evidence[]=[
    {id:'EV-001',type:'Deployment',finding:'Canary deployment occurred shortly before errors rose.'},
    {id:'EV-002',type:'Metric',finding:'DB connections increased from 38 to 98.'},
    {id:'EV-003',type:'Log',finding:'Payment service timed out acquiring DB connections.'},
    {id:'EV-004',type:'Commit',finding:'Retry count increased and delay was reduced.'},
  ];
  const run=()=>{setRunning(true);setTimeout(()=>{setRunning(false);setDone(true)},850)};
  if(!activeIncident)return <div className="text-slate-400">Select an incident first.</div>;
  return <div className="max-w-7xl mx-auto space-y-5">
    <div className="rounded-xl bg-[#131b31] border border-red-400/20 p-5 flex justify-between items-center"><div><div className="text-xs text-red-300 font-mono">{activeIncident.id} · {activeIncident.severity}</div><h1 className="text-2xl text-white font-semibold mt-1">{activeIncident.title}</h1><p className="text-sm text-slate-400 mt-1 max-w-3xl">{activeIncident.summary}</p></div><button onClick={run} disabled={running} className="px-4 py-2 rounded-lg bg-sky-600 text-white text-sm">{running?'Investigating…':done?'Run again':'Start investigation'}</button></div>
    <div className="grid grid-cols-3 gap-5">
      <section className="rounded-xl bg-[#131b31] border border-blue-400/10 p-5"><h2 className="text-white font-medium">Activity</h2><div className="mt-4 space-y-3">{['Load incident context','Search payment logs','Inspect DB metrics','Inspect deployment','Inspect commit'].map((x,i)=><div key={x} className="flex gap-3 text-xs"><span className={done?'text-emerald-300':'text-slate-600'}>{done?'✓':'○'}</span><span className="text-slate-300">{x}</span></div>)}</div></section>
      <section className="rounded-xl bg-[#131b31] border border-blue-400/10 p-5"><h2 className="text-white font-medium">Evidence</h2><div className="mt-4 space-y-3">{evidence.map(e=><div key={e.id} className="rounded-lg bg-[#0a1228] p-3"><div className="text-[10px] text-sky-300">{e.id} · {e.type}</div><div className="text-xs text-slate-300 mt-1">{e.finding}</div></div>)}</div></section>
      <section className="rounded-xl bg-[#131b31] border border-blue-400/10 p-5"><h2 className="text-white font-medium">Top hypothesis</h2><div className="mt-4 rounded-lg border border-amber-400/20 bg-amber-400/5 p-4"><div className="text-sm text-white font-medium">Retry-driven DB pool exhaustion</div><p className="text-xs text-slate-400 mt-2">Recent retry changes likely increased concurrent DB work until the pool saturated.</p><div className="mt-3 text-[10px] text-slate-500">Supports: EV-001, EV-002, EV-003, EV-004</div></div><button onClick={onNavigateToReports} className="mt-4 text-xs text-sky-300">Open final report →</button><button onClick={()=>onRollbackCanary(activeIncident.id,activeIncident.affectedService)} className="mt-4 block text-xs text-red-300">Simulate rollback</button></section>
    </div>
  </div>
}