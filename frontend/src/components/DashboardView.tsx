import React from 'react';
import { CoreService, Incident } from '../types';

export function DashboardView({incidents,services,onSelectIncident,onOpenReportModal,onOpenFilterScope,onNavigateToIncidents,onSelectService,currentCluster,secondsSinceEval}:{incidents:Incident[];services:CoreService[];onSelectIncident:(i:Incident)=>void;onOpenReportModal:()=>void;onOpenFilterScope:()=>void;onNavigateToIncidents:()=>void;onSelectService:(s:CoreService)=>void;currentCluster:string;secondsSinceEval:number}) {
  const open=incidents.filter(i=>i.status!=='Resolved');
  return <div className="max-w-7xl mx-auto space-y-6">
    <div className="flex items-end justify-between"><div><div className="text-xs text-sky-300 uppercase tracking-widest">Command overview</div><h1 className="text-3xl font-semibold text-white mt-1">Production incidents</h1><p className="text-sm text-slate-400 mt-1">Evidence-first triage across synthetic services.</p></div><div className="flex gap-2"><button onClick={onOpenFilterScope} className="px-3 py-2 text-xs rounded-lg border border-blue-400/10 text-slate-300">Scope</button><button onClick={onOpenReportModal} className="px-3 py-2 text-xs rounded-lg bg-sky-600 text-white">Report incident</button></div></div>
    <div className="grid grid-cols-4 gap-4">{[
      ['Open incidents',open.length],['P0 active',open.filter(i=>i.severity==='P0').length],['Services',services.length],['Last refresh',secondsSinceEval+'s']
    ].map(([k,v])=><div key={String(k)} className="rounded-xl bg-[#131b31] border border-blue-400/10 p-4"><div className="text-xs text-slate-500">{k}</div><div className="text-2xl text-white font-semibold mt-2">{v}</div></div>)}</div>
    <div className="grid grid-cols-3 gap-5">
      <section className="col-span-2 rounded-xl bg-[#131b31] border border-blue-400/10 overflow-hidden"><div className="px-5 py-4 flex justify-between border-b border-blue-400/10"><div><h2 className="text-white font-medium">Recent incidents</h2><p className="text-xs text-slate-500">{currentCluster}</p></div><button onClick={onNavigateToIncidents} className="text-xs text-sky-300">View all</button></div>
        <div>{incidents.slice(0,4).map(i=><button onClick={()=>onSelectIncident(i)} key={i.id} className="w-full px-5 py-3 grid grid-cols-[90px_1fr_130px_90px] items-center text-left border-b border-blue-400/5 hover:bg-white/[.02]"><span className={`text-xs font-mono ${i.severity==='P0'?'text-red-300':'text-amber-300'}`}>{i.id} · {i.severity}</span><span className="text-sm text-slate-200">{i.title}</span><span className="text-xs text-slate-500">{i.affectedService}</span><span className="text-xs text-slate-400">{i.status}</span></button>)}</div>
      </section>
      <section className="rounded-xl bg-[#131b31] border border-blue-400/10 p-5"><h2 className="text-white font-medium">Service health</h2><div className="mt-4 space-y-3">{services.slice(0,5).map(s=><button key={s.id} onClick={()=>onSelectService(s)} className="w-full flex justify-between items-center text-left"><span className="text-sm text-slate-300">{s.name}</span><span className={`text-[10px] ${s.status==='HEALTHY'?'text-emerald-300':'text-amber-300'}`}>{s.status}</span></button>)}</div></section>
    </div>
  </div>
}