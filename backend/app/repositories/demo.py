from datetime import datetime
from ..simulator.data import INCIDENTS, SERVICES, LOGS, METRICS, DEPLOYMENTS, COMMITS

class DemoRepository:
    def list_incidents(self): return INCIDENTS
    def get_incident(self, incident_id: str): return next((x for x in INCIDENTS if x.id == incident_id), None)
    def list_services(self): return SERVICES
    def search_logs(self, service: str | None = None, start: datetime | None = None, end: datetime | None = None, severity: str | None = None, query: str | None = None):
        items = LOGS
        if service: items = [x for x in items if x.service == service]
        if start: items = [x for x in items if x.timestamp >= start]
        if end: items = [x for x in items if x.timestamp <= end]
        if severity: items = [x for x in items if x.severity == severity]
        if query: items = [x for x in items if query.lower() in x.message.lower()]
        return items[:100]
    def get_metrics(self, service: str | None = None, metric: str | None = None, start: datetime | None = None, end: datetime | None = None):
        items = METRICS
        if service: items = [x for x in items if x.service == service]
        if metric: items = [x for x in items if x.metric == metric]
        if start: items = [x for x in items if x.timestamp >= start]
        if end: items = [x for x in items if x.timestamp <= end]
        return items[:500]
    def get_deployments(self, service: str | None = None): return [x for x in DEPLOYMENTS if not service or x.service == service]
    def get_commit(self, commit_id: str): return next((x for x in COMMITS if x.id == commit_id), None)
    def get_commits(self, service: str | None = None): return [x for x in COMMITS if not service or x.service == service]

repo = DemoRepository()
