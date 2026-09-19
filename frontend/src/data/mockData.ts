import { CoreService, Incident, TelemetryLog, ServiceNode, ServiceEdge } from '../types';

export const INITIAL_INCIDENTS: Incident[] = [
  {
    id: 'INC-4098',
    title: 'Payment failures after canary deploy',
    severity: 'P0',
    affectedService: 'payment-service',
    duration: '14m 22s',
    status: 'Active',
    lead: 'Alex Vance (SRE Principal)',
    detectedAt: '2026-09-19T01:34:20Z',
    canaryVersion: 'v3.18.2-rc4 (10% traffic)',
    impactScore: 92,
    summary: 'Elevated 502/504 Bad Gateway responses from payment-service pods running canary release v3.18.2-rc4 following database connection pool exhaustion.',
    timeline: [
      { time: '01:34:20', author: 'Prometheus AlertManager', message: 'FIRING: HighErrorRate (>5%) on payment-service-canary-7b89f', type: 'alert' },
      { time: '01:36:10', author: 'IncidentPilot Agent v2.14', message: 'Automated triage: Ingress P99 spiked to 1,420ms. Correlation with canary deployment identified (98.7% confidence).', type: 'system' },
      { time: '01:39:45', author: 'Alex Vance', message: 'Acknowledged incident P0. Joined Incident War Room. Pre-flighting canary traffic shift and rollback.', type: 'note' },
      { time: '01:42:00', author: 'Automated Safeguard', message: 'Canary traffic capped at 10%. Rollback manifest prepared for v3.18.1.', type: 'action' }
    ]
  },
  {
    id: 'INC-4095',
    title: 'Auth latency spike',
    severity: 'P1',
    affectedService: 'auth-service',
    duration: '22m 04s',
    status: 'Mitigated',
    lead: 'Elena Rostova',
    detectedAt: '2026-09-19T01:12:30Z',
    canaryVersion: 'v2.9.0',
    impactScore: 68,
    summary: 'OAuth token validation endpoint experienced Redis token cache eviction churn, causing fallback to PostgreSQL cluster.',
    timeline: [
      { time: '01:12:30', author: 'AlertManager', message: 'FIRING: AuthLatencyP99Exceeded (>450ms)', type: 'alert' },
      { time: '01:21:15', author: 'Elena Rostova', message: 'Expanded Redis cluster read replicas from 3 to 6. Cache hit ratio restored to 99.4%.', type: 'action' },
      { time: '01:34:34', author: 'Elena Rostova', message: 'Latency stabilized at 18ms. Incident shifted to Mitigated state.', type: 'note' }
    ]
  },
  {
    id: 'INC-4091',
    title: 'Redis replica desync',
    severity: 'P2',
    affectedService: 'checkout-gateway',
    duration: '1h 05m',
    status: 'Resolved',
    lead: 'Marcus Thorne',
    detectedAt: '2026-09-19T00:43:00Z',
    impactScore: 41,
    summary: 'Asynchronous replication lag between us-east-04 primary Redis shard and secondary AZ replica exceeded 1200ms.',
    timeline: [
      { time: '00:43:00', author: 'AlertManager', message: 'ReplicationLagExceeded: shard-03 lag 1420ms', type: 'alert' },
      { time: '01:48:05', author: 'Marcus Thorne', message: 'Forced full resynchronization. Network cross-rack buffer flushed.', type: 'action' }
    ]
  },
  {
    id: 'INC-4084',
    title: 'Ingress gateway TLS renegotiation spike',
    severity: 'P2',
    affectedService: 'checkout-gateway',
    duration: '3h 12m',
    status: 'Resolved',
    lead: 'Sarah Chen',
    detectedAt: '2026-09-18T22:30:00Z',
    impactScore: 35,
    summary: 'External bot scraper wave initiated excessive TLS 1.3 handshakes without session ticket resumption.',
    timeline: [
      { time: '22:30:00', author: 'WAF Guard', message: 'Volumetric TLS handshake anomaly detected.', type: 'alert' },
      { time: '23:15:00', author: 'Sarah Chen', message: 'Applied rate-limiting policy and Cloudflare challenge rules.', type: 'action' }
    ]
  },
  {
    id: 'INC-4079',
    title: 'Notification queue depth overflow',
    severity: 'P3',
    affectedService: 'notification-worker',
    duration: '5h 40m',
    status: 'Resolved',
    lead: 'David Kim',
    detectedAt: '2026-09-18T20:00:00Z',
    impactScore: 18,
    summary: 'Kafka partition consumer group lag accrued 45,000 delayed push events due to third-party SMS provider throttle.',
    timeline: [
      { time: '20:00:00', author: 'AlertManager', message: 'KafkaLagWarning: notification.outbound lag > 25k', type: 'alert' },
      { time: '21:40:00', author: 'David Kim', message: 'Switched secondary route to alternative cellular gateway.', type: 'action' }
    ]
  }
];

export const INITIAL_SERVICES: CoreService[] = [
  { id: 'svc-payment', name: 'payment-service', status: 'DEGRADED', latencyMs: 184, errorRate: 8.4, throughputRps: 480, instances: 8, canaryVersion: 'v3.18.2-rc4' },
  { id: 'svc-auth', name: 'auth-service', status: 'HEALTHY', latencyMs: 18, errorRate: 0.02, throughputRps: 1420, instances: 12 },
  { id: 'svc-checkout', name: 'checkout-gateway', status: 'HEALTHY', latencyMs: 24, errorRate: 0.05, throughputRps: 2150, instances: 16 },
  { id: 'svc-orders', name: 'orders-db', status: 'LATENCY HIGH', latencyMs: 342, errorRate: 0.4, throughputRps: 890, instances: 4 },
  { id: 'svc-notification', name: 'notification-worker', status: 'HEALTHY', latencyMs: 42, errorRate: 0.01, throughputRps: 650, instances: 6 }
];

export const INITIAL_LOGS: TelemetryLog[] = [
  { id: 'log-101', timestamp: '01:48:22.418', level: 'FATAL', service: 'payment-service', traceId: 'tr-e8f9a2b1c4', spanId: 'sp-99014', message: 'DBConnectionTimeoutException: Unable to acquire connection from HikariPool-1 in 30000ms', httpStatus: 504, durationMs: 30012 },
  { id: 'log-102', timestamp: '01:48:21.902', level: 'ERROR', service: 'payment-service', traceId: 'tr-e8f9a2b1c4', spanId: 'sp-99013', message: 'POST /v2/charges - upstream gateway timeout after canary route allocation (pod: payment-canary-rc4-x9)', httpStatus: 502, durationMs: 1420 },
  { id: 'log-103', timestamp: '01:48:20.114', level: 'WARN', service: 'orders-db', traceId: 'tr-c112b489a7', spanId: 'sp-88410', message: 'Slow query execution: SELECT * FROM ledger_transactions WHERE customer_id = $1 (elapsed: 324ms)', durationMs: 324 },
  { id: 'log-104', timestamp: '01:48:19.450', level: 'INFO', service: 'checkout-gateway', traceId: 'tr-7a89b022d1', spanId: 'sp-77192', message: 'Handled checkout authorization request in 24ms, routing to payment-service-stable', httpStatus: 200, durationMs: 24 },
  { id: 'log-105', timestamp: '01:48:18.012', level: 'ERROR', service: 'payment-service', traceId: 'tr-338ba499ff', spanId: 'sp-66230', message: 'StripeClientGatewayException: SocketTimeoutException reading remote TLS response payload', httpStatus: 500, durationMs: 4500 },
  { id: 'log-106', timestamp: '01:48:15.890', level: 'WARN', service: 'payment-service', traceId: 'tr-338ba499ff', spanId: 'sp-66228', message: 'Heap allocation nearing limit (88.4% used of 2048MB container cgroup memory.limit_in_bytes)', durationMs: 0 },
  { id: 'log-107', timestamp: '01:48:12.330', level: 'INFO', service: 'auth-service', traceId: 'tr-2211ba900e', spanId: 'sp-55112', message: 'OAuth2 bearer token validated from Redis L1 cache in 1.4ms', httpStatus: 200, durationMs: 1.4 }
];

export const TOPOLOGY_NODES: ServiceNode[] = [
  { id: 'ingress', label: 'Ingress LB / Envoy', type: 'gateway', status: 'HEALTHY', p99: 28, errorRate: 1.2, x: 80, y: 160 },
  { id: 'auth', label: 'auth-service', type: 'service', status: 'HEALTHY', p99: 18, errorRate: 0.02, x: 260, y: 70 },
  { id: 'checkout', label: 'checkout-gateway', type: 'service', status: 'HEALTHY', p99: 24, errorRate: 0.05, x: 260, y: 250 },
  { id: 'payment', label: 'payment-service (Canary)', type: 'service', status: 'DEGRADED', p99: 184, errorRate: 8.4, x: 480, y: 180 },
  { id: 'orders', label: 'orders-db (PostgreSQL)', type: 'database', status: 'LATENCY HIGH', p99: 342, errorRate: 0.4, x: 690, y: 110 },
  { id: 'notification', label: 'notification-worker', type: 'worker', status: 'HEALTHY', p99: 42, errorRate: 0.01, x: 480, y: 320 },
  { id: 'redis', label: 'redis-cache (Tokens)', type: 'database', status: 'HEALTHY', p99: 4, errorRate: 0.0, x: 480, y: 50 }
];

export const TOPOLOGY_EDGES: ServiceEdge[] = [
  { from: 'ingress', to: 'auth', rps: 1420, status: 'normal' },
  { from: 'ingress', to: 'checkout', rps: 2150, status: 'normal' },
  { from: 'auth', to: 'redis', rps: 1390, status: 'normal' },
  { from: 'checkout', to: 'payment', rps: 480, status: 'degraded' },
  { from: 'checkout', to: 'notification', rps: 650, status: 'normal' },
  { from: 'payment', to: 'orders', rps: 460, status: 'degraded' }
];
