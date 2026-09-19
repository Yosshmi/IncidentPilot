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

export default function App() {
  const [currentPath, setCurrentPath] = useState<NavigationPath>('dashboard');
  const [incidents, setIncidents] = useState<Incident[]>(INITIAL_INCIDENTS);
  const [services, setServices] = useState<CoreService[]>(INITIAL_SERVICES);
  const [logs, setLogs] = useState<TelemetryLog[]>(INITIAL_LOGS);

  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  const [currentCluster, setCurrentCluster] = useState('us-east-cluster-04');
  const [timeWindow, setTimeWindow] = useState('15m');
  const [selectedNamespace, setSelectedNamespace] = useState('prod-ingress');
  const [searchQuery, setSearchQuery] = useState('');
  const [isPolling, setIsPolling] = useState(true);
  const [secondsSinceEval, setSecondsSinceEval] = useState(4);

  useEffect(() => {
    if (!isPolling) return;
    const interval = setInterval(() => {
      setSecondsSinceEval((prev) => {
        if (prev >= 9) {
          const now = new Date();
          const timeStr = now.toTimeString().slice(0, 8) + '.' + String(now.getMilliseconds()).padStart(3, '0');
          const sampleMessages = [
            { level: 'INFO' as const, service: 'checkout-gateway', message: 'Ingress Envoy connection pool healthy. Active connections: 412' },
            { level: 'WARN' as const, service: 'orders-db', message: 'Read replica checkpoint latency: 48ms' },
            { level: 'INFO' as const, service: 'auth-service', message: 'JWT token rotation batch synchronized with HSM keystore' }
          ];
          const chosen = sampleMessages[Math.floor(Math.random() * sampleMessages.length)];
          const newLog: TelemetryLog = {
            id: `log-${Date.now()}`,
            timestamp: timeStr,
            level: chosen.level,
            service: chosen.service,
            traceId: `tr-${Math.random().toString(36).substring(2, 10)}`,
            spanId: `sp-${Math.floor(10000 + Math.random() * 90000)}`,
            message: chosen.message
          };
          setLogs((prevLogs) => [newLog, ...prevLogs.slice(0, 49)]);
          return 0;
        }
        return prev + 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [isPolling]);

  const handleReportIncident = (newIncident: Incident) => setIncidents((prev) => [newIncident, ...prev]);

  const handleStatusChange = (id: string, newStatus: IncidentStatus) => {
    setIncidents((prev) =>
      prev.map((inc) => inc.id === id ? {
        ...inc,
        status: newStatus,
        timeline: [...inc.timeline, {
          time: new Date().toTimeString().slice(0, 8),
          author: 'Alex Vance (Command Lead)',
          message: `Status updated to ${newStatus}.`,
          type: 'action'
        }]
      } : inc)
    );

    if (id === 'INC-4098' && (newStatus === 'Mitigated' || newStatus === 'Resolved')) {
      setServices((prev) =>
        prev.map((s) => s.name === 'payment-service'
          ? { ...s, status: 'HEALTHY', errorRate: 0.02, latencyMs: 22 }
          : s)
      );
    }
  };

  const handleRollbackCanary = (incidentId: string, serviceName: string) => {
    setIncidents((prev) =>
      prev.map((inc) => inc.id === incidentId ? {
        ...inc,
        status: 'Mitigated',
        canaryVersion: 'Rolled back to v3.18.1',
        timeline: [...inc.timeline, {
          time: new Date().toTimeString().slice(0, 8),
          author: 'Alex Vance (Command Lead)',
          message: `Canary deployment aborted. Reverted ${serviceName} to stable release v3.18.1. Ingress traffic shifted 100% to stable pods.`,
          type: 'action'
        }]
      } : inc)
    );

    setServices((prev) =>
      prev.map((s) => s.name === serviceName
        ? { ...s, status: 'HEALTHY', errorRate: 0.04, latencyMs: 24, canaryVersion: undefined }
        : s)
    );
  };

  const handleAddNote = (incidentId: string, noteText: string) => {
    setIncidents((prev) =>
      prev.map((inc) => inc.id === incidentId ? {
        ...inc,
        timeline: [...inc.timeline, {
          time: new Date().toTimeString().slice(0, 8),
          author: 'Alex Vance',
          message: noteText,
          type: 'note'
        }]
      } : inc)
    );
  };

  const handleSelectIncident = (incident: Incident) => {
    setSelectedIncident(incident);
    setIsDetailModalOpen(true);
  };

  const handleGoToInvestigation = (incident: Incident) => {
    setSelectedIncident(incident);
    setCurrentPath('investigation');
  };

  const handleSelectService = (service: CoreService) => {
    setSearchQuery(service.name);
    setCurrentPath('evidence-explorer');
  };

  const handleSearchSubmit = (query: string) => {
    if (!query.trim()) return;
    const lower = query.toLowerCase();
    if (lower.startsWith('inc') || lower.includes('incident') || lower.includes('p0')) {
      setCurrentPath('incidents');
    } else if (lower.startsWith('rate(') || lower.startsWith('sum(') || lower.startsWith('hist')) {
      setCurrentPath('investigation');
    } else {
      setCurrentPath('evidence-explorer');
    }
  };

  const activeP0Count = incidents.filter((i) => i.severity === 'P0' && i.status === 'Active').length;
  const activeIncidentForInvestigation = selectedIncident || incidents.find((i) => i.status === 'Active') || incidents[0];

  return (
    <div className="bg-[#0a1228] text-[#dbe1ff] min-h-screen font-sans antialiased">
      <Sidebar
        currentPath={currentPath}
        onNavigate={(path) => {
          setCurrentPath(path);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        activeP0Count={activeP0Count}
      />

      <div className="pl-64 flex flex-col min-h-screen">
        <Header
          currentCluster={currentCluster}
          onClusterChange={setCurrentCluster}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onSearchSubmit={handleSearchSubmit}
          isPolling={isPolling}
          onTogglePolling={() => setIsPolling(!isPolling)}
        />

        <main className="relative pt-16 w-full bg-[#0a1228] min-h-screen px-6 py-6 flex-1">
          {currentPath === 'dashboard' && (
            <DashboardView
              incidents={incidents}
              services={services}
              onSelectIncident={handleSelectIncident}
              onOpenReportModal={() => setIsReportModalOpen(true)}
              onOpenFilterScope={() => setIsFilterModalOpen(true)}
              onNavigateToIncidents={() => setCurrentPath('incidents')}
              onSelectService={handleSelectService}
              currentCluster={currentCluster}
              secondsSinceEval={secondsSinceEval}
            />
          )}

          {currentPath === 'incidents' && (
            <IncidentsView
              incidents={incidents}
              onSelectIncident={handleSelectIncident}
              onOpenReportModal={() => setIsReportModalOpen(true)}
              onGoToInvestigation={handleGoToInvestigation}
              onStatusChange={handleStatusChange}
            />
          )}

          {currentPath === 'investigation' && (
            <InvestigationView
              activeIncident={activeIncidentForInvestigation}
              onRollbackCanary={handleRollbackCanary}
              onNavigateToReports={() => setCurrentPath('reports')}
            />
          )}

          {currentPath === 'evidence-explorer' && (
            <EvidenceExplorerView logs={logs} searchQuery={searchQuery} onSearchChange={setSearchQuery} />
          )}

          {currentPath === 'evidence-graph' && (
            <EvidenceGraphView
              onSelectServiceFromGraph={(serviceName) => {
                setSearchQuery(serviceName);
                setCurrentPath('evidence-explorer');
              }}
            />
          )}

          {currentPath === 'reports' && (
            <ReportsView activeIncident={activeIncidentForInvestigation} />
          )}
        </main>
      </div>

      <ReportIncidentModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        onReport={handleReportIncident}
        availableServices={services.map((s) => s.name)}
      />

      <IncidentDetailModal
        incident={selectedIncident}
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        onStatusChange={handleStatusChange}
        onRollbackCanary={handleRollbackCanary}
        onAddNote={handleAddNote}
        onGoToInvestigation={handleGoToInvestigation}
      />

      <FilterScopeModal
        isOpen={isFilterModalOpen}
        onClose={() => setIsFilterModalOpen(false)}
        cluster={currentCluster}
        onClusterChange={setCurrentCluster}
        timeWindow={timeWindow}
        onTimeWindowChange={setTimeWindow}
        selectedNamespace={selectedNamespace}
        onNamespaceChange={setSelectedNamespace}
      />
    </div>
  );
}
