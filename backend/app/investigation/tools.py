from uuid import uuid4
from ..domain.models import ToolExecution, Evidence
from ..repositories.demo import repo

class InvestigationToolbox:
    def __init__(self, investigation_id: str):
        self.investigation_id = investigation_id
        self.executions: list[ToolExecution] = []
        self.evidence: list[Evidence] = []

    def _record(self, name: str, arguments: dict, items: list, summary: str) -> ToolExecution:
        execution = ToolExecution(id=f"tool-{uuid4().hex[:8]}", investigation_id=self.investigation_id, tool_name=name, arguments=arguments, status="success", result_count=len(items), summary=summary)
        self.executions.append(execution)
        return execution

    def get_incident_context(self, incident_id: str):
        incident = repo.get_incident(incident_id)
        items = [incident] if incident else []
        self._record("get_incident_context", {"incident_id": incident_id}, items, "Loaded incident context")
        return incident

    def search_logs(self, service: str | None = None, severity: str | None = None, query: str | None = None):
        items = repo.search_logs(service=service, severity=severity, query=query)
        ex = self._record("search_logs", {"service": service, "severity": severity, "query": query}, items, f"Found {len(items)} matching logs")
        for item in items:
            self.evidence.append(Evidence(id=f"EV-{len(self.evidence)+1:03d}", investigation_id=self.investigation_id, evidence_type="log", source_id=item.id, service=item.service, observed_at=item.timestamp, finding=item.message, tool_execution_id=ex.id))
        return items

    def get_service_metrics(self, service: str, metric: str | None = None):
        items = repo.get_metrics(service=service, metric=metric)
        ex = self._record("get_service_metrics", {"service": service, "metric": metric}, items, f"Found {len(items)} metric samples")
        if items:
            first, last = items[0], items[-1]
            self.evidence.append(Evidence(id=f"EV-{len(self.evidence)+1:03d}", investigation_id=self.investigation_id, evidence_type="metric", source_id=last.id, service=service, observed_at=last.timestamp, finding=f"{last.metric} changed from {first.value:g}{first.unit} to {last.value:g}{last.unit}", tool_execution_id=ex.id))
        return items

    def inspect_deployments(self, service: str):
        items = repo.get_deployments(service)
        ex = self._record("inspect_deployments", {"service": service}, items, f"Found {len(items)} deployments")
        for item in items:
            self.evidence.append(Evidence(id=f"EV-{len(self.evidence)+1:03d}", investigation_id=self.investigation_id, evidence_type="deployment", source_id=item.id, service=item.service, observed_at=item.deployed_at, finding=f"{item.service} {item.version} deployed", tool_execution_id=ex.id))
        return items

    def inspect_commit(self, commit_id: str):
        item = repo.get_commit(commit_id)
        items = [item] if item else []
        ex = self._record("inspect_commit", {"commit_id": commit_id}, items, "Inspected commit metadata")
        if item:
            self.evidence.append(Evidence(id=f"EV-{len(self.evidence)+1:03d}", investigation_id=self.investigation_id, evidence_type="commit", source_id=item.id, service=item.service, observed_at=item.committed_at, finding=f"{item.message}: {item.change_summary}", tool_execution_id=ex.id))
        return item
