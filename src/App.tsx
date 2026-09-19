import { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { DashboardView } from './components/DashboardView';
import { IncidentsView } from './components/IncidentsView';
import { InvestigationView } from './components/InvestigationView';
import { EvidenceExplorerView } from './components/EvidenceExplorerView';
import { EvidenceGraphView } from './components/EvidenceGraphView';
import { ReportsView } from './components/ReportsView';
import { ReportIncidentModal } from './components/ReportIncidentModal';
import { IncidentDetailModal } from './components/IncidentDetailModal';
import { FilterScopeModal } from './components/FilterScopeModal';
import { NavigationPath, Incident, IncidentStatus, CoreService, TelemetryLog } from './types';
import { INITIAL_INCIDENTS, INITIAL_SERVICES, INITIAL_LOGS } from './data/mockData';
import { api } from './api';

export default function App() {
  const [currentPath,setCurrentPath]=useState<NavigationPath>('dashboard');
  const [incidents,setIncidents]=useState<Incident[]>(INITIAL_INCIDENTS);
  const [services,setServices]=useState<CoreService[]>(INITIAL_SERVICES);
  const [logs,setLogs]=useState<TelemetryLog[]>(INITIAL_LOGS);
  const [backendMode,setBackendMode]=useState<'live'|'fallback'>('fallback');
  const [isReportModalOpen,setIsReportModalOpen]=useState(false);
  const [isFilterModalOpen,setIsFilterModalOpen]=useState(false);
  const [selectedIncident,setSelectedIncident]=useState<Incident|null>(null);
  const [isDetailModalOpen,setIsDetailModalOpen]=useState(false);
  const [currentCluster,setCurrentCluster]=useState('us-east-cluster-04');
  const [timeWindow,setTimeWindow]=useState('15m');
  const [selectedNamespace,setSelectedNamespace]=useState('prod-ingress');
  const [searchQuery,setSearchQuery]=useState('');
  const [isPolling,setIsPolling]=useState(true);
  const [secondsSinceEval,setSecondsSinceEval]=useState(4);

  useEffect(()=>{
    Promise.all([api.incidents(),api.services(),api.logs()])
      .then(([i,s,l])=>{setIncidents(i);setServices(s);setLogs(l);setBackendMode('live')})
      .catch(()=>setBackendMode('fallback'));
  },[]);

  useEffect(()=>{
    if(!isPolling)return;
    const interval=setInterval(()=>setSecondsSinceEval(prev=>prev>=9?0:prev+1),1000);
    return()=>clearInterval(interval);
  },[isPolling]);

  const handleStatusChange=(id:string,newStatus:IncidentStatus)=>setIncidents(prev=>prev.map(i=>i.id===id?{...i,status:newStatus}:i));
  const handleRollbackCanary=(id:string,service:string)=>{
    setIncidents(prev=>prev.map(i=>i.id===id?{...i,status:'Mitigated' as const,canaryVersion:'Rolled back to stable'}:i));
    setServices(prev=>prev.map(s=>s.name===service?{...s,status:'HEALTHY' as const,errorRate:0.02,latencyMs:24}:s));
  };
  const handleAddNote=(id:string,note:string)=>setIncidents(prev=>prev.map(i=>i.id===id?{...i,timeline:[...i.timeline,{time:new Date().toTimeString().slice(0,8),author:'Demo operator',message:note,type:'note' as const}]}:i));
  const handleSelectIncident=(i:Incident)=>{setSelectedIncident(i);setIsDetailModalOpen(true)};
  const handleGoToInvestigation=(i:Incident)=>{setSelectedIncident(i);setIsDetailModalOpen(false);setCurrentPath('investigation')};
  const handleSelectService=(s:CoreService)=>{setSearchQuery(s.name);setCurrentPath('evidence-explorer')};
  const handleSearchSubmit=(q:string)=>{const x=q.toLowerCase();setCurrentPath(x.includes('inc')?'incidents':x.includes('rate(')?'investigation':'evidence-explorer')};
  const activeP0Count=incidents.filter(i=>i.severity==='P0'&&i.status==='Active').length;
  const active=selectedIncident||incidents.find(i=>i.status==='Active')||incidents[0];

  return <div className="bg-[#0a1228] text-[#dbe1ff] min-h-screen font-sans antialiased">
    <Sidebar currentPath={currentPath} onNavigate={p=>{setCurrentPath(p);window.scrollTo({top:0})}} activeP0Count={activeP0Count}/>
    <div className="pl-64 flex flex-col min-h-screen">
      <Header currentCluster={currentCluster} onClusterChange={setCurrentCluster} searchQuery={searchQuery} onSearchChange={setSearchQuery} onSearchSubmit={handleSearchSubmit} isPolling={isPolling} onTogglePolling={()=>setIsPolling(v=>!v)}/>
      <main className="relative pt-20 min-h-screen px-6 pb-8">
        <div className="max-w-7xl mx-auto mb-3 text-right text-[10px] uppercase tracking-wider text-slate-600">Data: <span className={backendMode==='live'?'text-emerald-300':'text-amber-300'}>{backendMode==='live'?'server API':'local fallback'}</span></div>
        {currentPath==='dashboard'&&<DashboardView incidents={incidents} services={services} onSelectIncident={handleSelectIncident} onOpenReportModal={()=>setIsReportModalOpen(true)} onOpenFilterScope={()=>setIsFilterModalOpen(true)} onNavigateToIncidents={()=>setCurrentPath('incidents')} onSelectService={handleSelectService} currentCluster={currentCluster} secondsSinceEval={secondsSinceEval}/>}
        {currentPath==='incidents'&&<IncidentsView incidents={incidents} onSelectIncident={handleSelectIncident} onOpenReportModal={()=>setIsReportModalOpen(true)} onGoToInvestigation={handleGoToInvestigation} onStatusChange={handleStatusChange}/>}
        {currentPath==='investigation'&&<InvestigationView activeIncident={active} onRollbackCanary={handleRollbackCanary} onNavigateToReports={()=>setCurrentPath('reports')}/>}
        {currentPath==='evidence-explorer'&&<EvidenceExplorerView logs={logs} searchQuery={searchQuery} onSearchChange={setSearchQuery}/>}
        {currentPath==='evidence-graph'&&<EvidenceGraphView onSelectServiceFromGraph={s=>{setSearchQuery(s);setCurrentPath('evidence-explorer')}}/>}
        {currentPath==='reports'&&<ReportsView activeIncident={active}/>}
      </main>
    </div>
    <ReportIncidentModal isOpen={isReportModalOpen} onClose={()=>setIsReportModalOpen(false)} onReport={i=>setIncidents(p=>[i,...p])} availableServices={services.map(s=>s.name)}/>
    <IncidentDetailModal incident={selectedIncident} isOpen={isDetailModalOpen} onClose={()=>setIsDetailModalOpen(false)} onStatusChange={handleStatusChange} onRollbackCanary={handleRollbackCanary} onAddNote={handleAddNote} onGoToInvestigation={handleGoToInvestigation}/>
    <FilterScopeModal isOpen={isFilterModalOpen} onClose={()=>setIsFilterModalOpen(false)} cluster={currentCluster} onClusterChange={setCurrentCluster} timeWindow={timeWindow} onTimeWindowChange={setTimeWindow} selectedNamespace={selectedNamespace} onNamespaceChange={setSelectedNamespace}/>
  </div>
}
