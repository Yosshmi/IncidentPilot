import React from 'react';
import { NavigationPath } from '../types';

export function Sidebar({currentPath,onNavigate,activeP0Count}:{currentPath:NavigationPath;onNavigate:(p:NavigationPath)=>void;activeP0Count:number}) {
  const items:[NavigationPath,string,string][]=[
    ['dashboard','Overview','dashboard'],
    ['incidents','Incidents','warning'],
    ['investigation','Investigation','troubleshoot'],
    ['evidence-explorer','Evidence','manage_search'],
    ['evidence-graph','Graph','hub'],
    ['reports','Report','description']
  ];
  return <aside className="fixed left-0 top-0 bottom-0 w-64 bg-[#050d23] border-r border-blue-400/10 z-50 flex flex-col">
    <div className="h-16 px-5 flex items-center gap-3 border-b border-blue-400/10">
      <div className="w-9 h-9 rounded-lg bg-sky-500/15 border border-sky-400/30 grid place-items-center text-sky-300 font-bold">IP</div>
      <div><div className="text-sm font-semibold text-white">IncidentPilot</div><div className="text-[10px] uppercase tracking-widest text-slate-500">Ops Console</div></div>
    </div>
    <nav className="p-3 space-y-1">
      {items.map(([id,label,icon])=><button key={id} onClick={()=>onNavigate(id)} className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm transition ${currentPath===id?'bg-sky-500/10 text-sky-300 border border-sky-400/20':'text-slate-400 hover:text-white hover:bg-white/5'}`}>
        <span className="flex items-center gap-2"><span className="material-symbols-outlined text-[18px]">{icon}</span>{label}</span>
        {id==='incidents'&&activeP0Count>0&&<span className="text-[10px] px-1.5 py-0.5 rounded bg-red-500/20 text-red-300">{activeP0Count}</span>}
      </button>)}
    </nav>
    <div className="mt-auto p-4"><div className="rounded-lg border border-sky-400/10 bg-[#0a1228] px-3 py-2 text-xs text-slate-400 flex justify-between"><span>Demo agent</span><span className="text-emerald-300">READY</span></div></div>
  </aside>
}