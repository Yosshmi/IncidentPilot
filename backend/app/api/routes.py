from fastapi import APIRouter, HTTPException
from ..repositories.demo import repo

router = APIRouter(prefix="/api/v1")

@router.get("/incidents")
def list_incidents(): return repo.list_incidents()

@router.get("/incidents/{incident_id}")
def get_incident(incident_id: str):
    item = repo.get_incident(incident_id)
    if not item: raise HTTPException(404, "Incident not found")
    return item

@router.get("/services")
def list_services(): return repo.list_services()

@router.get("/logs")
def logs(service: str | None = None, severity: str | None = None, query: str | None = None):
    return repo.search_logs(service=service, severity=severity, query=query)

@router.get("/metrics")
def metrics(service: str | None = None, metric: str | None = None):
    return repo.get_metrics(service=service, metric=metric)

@router.get("/deployments")
def deployments(service: str | None = None): return repo.get_deployments(service)

@router.get("/commits")
def commits(service: str | None = None): return repo.get_commits(service)

@router.get("/commits/{commit_id}")
def commit(commit_id: str):
    item = repo.get_commit(commit_id)
    if not item: raise HTTPException(404, "Commit not found")
    return item
