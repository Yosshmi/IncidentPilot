from datetime import datetime, timedelta, timezone
from ..domain.models import Incident, Service, LogRecord, MetricSample, Deployment, CommitRecord

BASE = datetime(2026, 9, 19, 1, 30, tzinfo=timezone.utc)

SERVICES = [
    Service(id="svc-payment", name="payment-service", kind="api", status="DEGRADED"),
    Service(id="svc-order", name="order-service", kind="api", status="HEALTHY"),
    Service(id="svc-notification", name="notification-service", kind="api", status="HEALTHY"),
    Service(id="svc-worker", name="background-worker", kind="worker", status="DEGRADED"),
    Service(id="svc-postgres", name="postgresql", kind="database", status="LATENCY_HIGH"),
    Service(id="svc-redis", name="redis", kind="cache", status="DEGRADED"),
]

INCIDENTS = [
    Incident(id="INC-4098", title="Payment failures after canary deploy", severity="P0", status="Active", affected_services=["payment-service", "postgresql"], detected_at=BASE + timedelta(minutes=12), summary="Payment failures rose shortly after a canary deployment while database connection usage saturated.", symptoms=["5xx payment errors increased", "DB connection usage near pool limit", "DB latency increased"], scenario_key="db_pool_exhaustion"),
    Incident(id="INC-4095", title="Background jobs delayed", severity="P1", status="Active", affected_services=["background-worker"], detected_at=BASE + timedelta(hours=1, minutes=10), summary="Customer workflows are incomplete while API health remains mostly normal.", symptoms=["Queue depth rising", "Job duration increased", "API error rate stable"], scenario_key="worker_backlog"),
    Incident(id="INC-4091", title="API latency during Redis degradation", severity="P2", status="Active", affected_services=["redis", "postgresql", "order-service"], detected_at=BASE + timedelta(hours=2, minutes=5), summary="Redis connectivity degraded, cache hit rate fell, and database/API latency increased.", symptoms=["Redis connection errors", "Cache hit rate decreased", "DB reads increased", "API latency increased"], scenario_key="redis_degradation"),
]

DEPLOYMENTS = [
    Deployment(id="dep-001", service="payment-service", version="v3.18.2-rc4", deployed_at=BASE, commit_id="cmt-001"),
    Deployment(id="dep-002", service="background-worker", version="v2.7.0", deployed_at=BASE + timedelta(hours=1), commit_id="cmt-002"),
]

COMMITS = [
    CommitRecord(id="cmt-001", service="payment-service", committed_at=BASE - timedelta(minutes=20), author="dev@incidentpilot", message="Improve retry resilience for payment persistence", change_summary="max_retries 2 -> 10; retry_delay_ms 500 -> 50"),
    CommitRecord(id="cmt-002", service="background-worker", committed_at=BASE + timedelta(minutes=35), author="dev@incidentpilot", message="Add enrichment lookup before notification dispatch", change_summary="Introduced synchronous enrichment call in worker processing path"),
]

LOGS = [
    LogRecord(id="log-001", timestamp=BASE + timedelta(minutes=5), service="payment-service", severity="WARN", message="Retrying payment persistence attempt=7"),
    LogRecord(id="log-002", timestamp=BASE + timedelta(minutes=8), service="payment-service", severity="ERROR", message="Timeout acquiring database connection from pool"),
    LogRecord(id="log-003", timestamp=BASE + timedelta(minutes=9), service="payment-service", severity="ERROR", message="POST /payments returned 504 after persistence timeout"),
    LogRecord(id="log-004", timestamp=BASE + timedelta(minutes=7), service="redis", severity="WARN", message="Transient replica lag 42ms recovered"),
    LogRecord(id="log-101", timestamp=BASE + timedelta(hours=1, minutes=8), service="background-worker", severity="WARN", message="Job processing duration exceeded 1500ms"),
    LogRecord(id="log-102", timestamp=BASE + timedelta(hours=1, minutes=12), service="background-worker", severity="INFO", message="Worker process healthy; no crash detected"),
    LogRecord(id="log-201", timestamp=BASE + timedelta(hours=2), service="redis", severity="ERROR", message="Redis connection reset by peer"),
    LogRecord(id="log-202", timestamp=BASE + timedelta(hours=2, minutes=3), service="order-service", severity="WARN", message="Cache miss fallback to PostgreSQL"),
]

METRICS = []
def add_metric(prefix: str, service: str, metric: str, values: list[float], unit: str, start: datetime):
    for idx, value in enumerate(values):
        METRICS.append(MetricSample(id=f"{prefix}-{idx}", timestamp=start + timedelta(minutes=idx * 2), service=service, metric=metric, value=value, unit=unit))

add_metric("m-dbconn", "postgresql", "db_connections_active", [38, 42, 55, 74, 91, 98], "connections", BASE)
add_metric("m-dblat", "postgresql", "db_query_latency_ms", [65, 70, 92, 180, 420, 680], "ms", BASE)
add_metric("m-payerr", "payment-service", "api_error_rate", [0.8, 1.1, 2.4, 7.8, 14.2, 17.4], "%", BASE)
add_metric("m-queue", "background-worker", "queue_depth", [40, 180, 900, 2400, 5100, 8500], "jobs", BASE + timedelta(hours=1))
add_metric("m-jobdur", "background-worker", "job_duration_ms", [160, 220, 510, 980, 1450, 1800], "ms", BASE + timedelta(hours=1))
add_metric("m-redishit", "redis", "cache_hit_rate", [98, 96, 87, 72, 51, 43], "%", BASE + timedelta(hours=2))
add_metric("m-dbreads", "postgresql", "db_reads_per_sec", [420, 460, 610, 860, 1200, 1500], "rps", BASE + timedelta(hours=2))
add_metric("m-orderlat", "order-service", "api_latency_ms", [45, 48, 73, 140, 260, 390], "ms", BASE + timedelta(hours=2))

GROUND_TRUTH = {
    "db_pool_exhaustion": "Aggressive retries introduced by payment-service deployment exhausted database connection pool.",
    "worker_backlog": "Synchronous enrichment added to worker path increased job processing time and caused backlog.",
    "redis_degradation": "Redis connection degradation reduced cache hit rate, shifting load to PostgreSQL and increasing API latency.",
}
