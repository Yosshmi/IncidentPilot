import React from 'react';

export function Header({currentCluster,onClusterChange,searchQuery,onSearchChange,onSearchSubmit,isPolling,onTogglePolling}:{currentCluster:string;onClusterChange:(v:string)=>void;searchQuery:string;onSearchChange:(v:string)=>void;onSearchSubmit:(v:string)=>void;isPolling:boolean;onTogglePolling:()=>void}) {
  return <header className="fixed top-0 left-64 right-0 h-16 z-40 bg-[#0a1228]/90 backdrop-blur border-b border-blue-400/10 px-6 flex items-center justify-between">
    <div className="flex items-center gap-3">
      <span className="flex items-center gap-2 text-xs text-slate-300"><span className="w-2 h-2 rounded-full bg-red-400"></span>Production demo</span>
      <select value={currentCluster} onChange={e=>onClusterChange(e.target.value)} className="bg-[#131b31] text-xs text-slate-300 border border-blue-400/10 rounded px-2 py-1.5">
        <option>us-east-cluster-04</option><option>us-west-cluster-02</option><option>eu-central-cluster-01</option>
      </select>
      <button onClick={onTogglePolling} className="text-xs text-slate-500 hover:text-sky-300">{isPolling?'Live telemetry':'Paused'}</button>
    </div>
    <div className="flex items-center gap-2">
      <div className="relative"><span className="material-symbols-outlined absolute left-2 top-1.5 text-[16px] text-slate-500">search</span><input value={searchQuery} onChange={e=>onSearchChange(e.target.value)} onKeyDown={e=>e.key==='Enter'&&onSearchSubmit(searchQuery)} placeholder="incident, service, trace..." className="w-64 bg-[#050d23] border border-blue-400/10 rounded-lg py-1.5 pl-8 pr-3 text-xs text-white outline-none focus:border-sky-400/40"/></div>
      <div className="w-8 h-8 rounded-full bg-sky-500/20 border border-sky-400/20 grid place-items-center text-xs text-sky-200">YN</div>
    </div>
  </header>
}