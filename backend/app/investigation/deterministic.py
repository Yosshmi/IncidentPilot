from uuid import uuid4
from ..domain.models import Investigation, Hypothesis
from .tools import InvestigationToolbox

class DeterministicInvestigator:
    def run(self, incident_id: str) -> Investigation:
        inv_id = f"INV-{uuid4().hex[:8]}"
        box = InvestigationToolbox(inv_id)
        incident = box.get_incident_context(incident_id)
        if not incident:
            raise ValueError("Incident not found")

        scenario = incident.scenario_key
        if scenario == "db_pool_exhaustion":
            deployments = box.inspect_deployments("payment-service")
            box.search_logs(service="payment-service")
            box.get_service_metrics("postgresql", "db_connections_active")
            box.get_service_metrics("postgresql", "db_query_latency_ms")
            box.get_service_metrics("payment-service", "api_error_rate")
            if deployments: box.inspect_commit(deployments[0].commit_id)
            hypothesis = Hypothesis(id="HYP-001", investigation_id=inv_id, title="Retry-driven database connection pool exhaustion", root_cause_description="A payment-service deployment increased retry pressure, saturating database connections and causing persistence timeouts and payment 5xx errors.", supporting_evidence_ids=[e.id for e in box.evidence], affected_services=["payment-service", "postgresql"], uncertainty_explanation="Evidence strongly aligns in time and mechanism, but this demo does not prove causality from production traces.", verification_steps=["Compare retry volume before and after deployment", "Confirm DB pool saturation by pod/version"], remediation=["Roll back retry configuration", "Add retry backoff and jitter", "Review connection-pool sizing"])
        elif scenario == "worker_backlog":
            box.search_logs(service="background-worker")
            box.get_service_metrics("background-worker", "queue_depth")
            box.get_service_metrics("background-worker", "job_duration_ms")
            deployments = box.inspect_deployments("background-worker")
            if deployments: box.inspect_commit(deployments[0].commit_id)
            hypothesis = Hypothesis(id="HYP-001", investigation_id=inv_id, title="Worker processing slowdown created queue backlog", root_cause_description="A slower per-job processing path reduced worker throughput while workers remained healthy, causing queue depth to accumulate.", supporting_evidence_ids=[e.id for e in box.evidence], affected_services=["background-worker"], uncertainty_explanation="The data supports processing slowdown over worker crash; upstream provider latency is not simulated.", verification_steps=["Profile job duration by processing stage", "Compare worker throughput before and after deployment"], remediation=["Remove synchronous work from hot path", "Batch or cache enrichment", "Temporarily increase worker concurrency"])
        else:
            box.search_logs(service="redis")
            box.search_logs(service="order-service")
            box.get_service_metrics("redis", "cache_hit_rate")
            box.get_service_metrics("postgresql", "db_reads_per_sec")
            box.get_service_metrics("order-service", "api_latency_ms")
            hypothesis = Hypothesis(id="HYP-001", investigation_id=inv_id, title="Redis degradation shifted load to PostgreSQL", root_cause_description="Redis connection failures reduced cache hit rate, increasing PostgreSQL reads and downstream API latency.", supporting_evidence_ids=[e.id for e in box.evidence], affected_services=["redis", "postgresql", "order-service"], uncertainty_explanation="The causal chain is plausible and ordered in time, but no packet-level Redis diagnostic is available.", verification_steps=["Inspect Redis connection error rate", "Compare cache misses with DB read volume"], remediation=["Restore Redis connectivity", "Use circuit breaking around cache failures", "Protect PostgreSQL with fallback rate limits"])

        report = {
            "executive_summary": hypothesis.root_cause_description,
            "observed_facts": [e.finding for e in box.evidence],
            "correlations": ["Symptoms and supporting telemetry changed within the same incident window."],
            "inferences": [hypothesis.title],
            "missing_information": ["No real production infrastructure is queried in this synthetic demo."],
            "recommended_next_steps": hypothesis.verification_steps + hypothesis.remediation,
        }
        return Investigation(id=inv_id, incident_id=incident_id, status="completed", mode="deterministic", tool_executions=box.executions, evidence=box.evidence, hypotheses=[hypothesis], report=report)
