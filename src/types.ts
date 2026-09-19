export type NavigationPath = 
  | 'dashboard' 
  | 'incidents' 
  | 'investigation' 
  | 'evidence-explorer' 
  | 'evidence-graph' 
  | 'reports';

export type IncidentSeverity = 'P0' | 'P1' | 'P2' | 'P3';

export type IncidentStatus = 'Active' | 'Mitigated' | 'Resolved';

export interface IncidentTimelineEvent {
  time: string;
  author: string;
  message: string;
  type: 'alert' | 'action' | 'note' | 'system';
}

export interface Incident {
  id: string;
  title: string;
  severity: IncidentSeverity;
  affectedService: string;
  duration: string;
  status: IncidentStatus;
  lead: string;
  summary: string;
  detectedAt: string;
  canaryVersion?: string;
  impactScore?: number;
  timeline: IncidentTimelineEvent[];
}

export type ServiceHealthStatus = 'HEALTHY' | 'DEGRADED' | 'LATENCY HIGH' | 'OFFLINE';

export interface CoreService {
  id: string;
  name: string;
  status: ServiceHealthStatus;
  latencyMs: number;
  errorRate: number;
  throughputRps: number;
  instances: number;
  canaryVersion?: string;
}

export interface TelemetryLog {
  id: string;
  timestamp: string;
  level: 'FATAL' | 'ERROR' | 'WARN' | 'INFO';
  service: string;
  traceId: string;
  spanId: string;
  message: string;
  httpStatus?: number;
  durationMs?: number;
}

export interface ServiceNode {
  id: string;
  label: string;
  type: 'gateway' | 'service' | 'database' | 'worker';
  status: ServiceHealthStatus;
  p99: number;
  errorRate: number;
  x: number;
  y: number;
}

export interface ServiceEdge {
  from: string;
  to: string;
  label?: string;
  rps: number;
  status: 'normal' | 'degraded';
}
