from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from ..investigation.deterministic import DeterministicInvestigator
from ..investigation.store import store

router = APIRouter(prefix="/api/v1")

class InvestigationRequest(BaseModel):
    mode: str = "deterministic"

@router.post("/incidents/{incident_id}/investigations")
def start_investigation(incident_id: str, request: InvestigationRequest):
    if request.mode not in {"deterministic", "gemini"}:
        raise HTTPException(400, "Unsupported investigation mode")
    try:
        item = DeterministicInvestigator().run(incident_id)
    except ValueError:
        raise HTTPException(404, "Incident not found")
    return store.save(item)

@router.get("/investigations/{investigation_id}")
def get_investigation(investigation_id: str):
    item = store.get(investigation_id)
    if not item: raise HTTPException(404, "Investigation not found")
    return item

@router.get("/investigations/{investigation_id}/tool-executions")
def tool_executions(investigation_id: str):
    item = store.get(investigation_id)
    if not item: raise HTTPException(404, "Investigation not found")
    return item.tool_executions

@router.get("/investigations/{investigation_id}/evidence")
def evidence(investigation_id: str):
    item = store.get(investigation_id)
    if not item: raise HTTPException(404, "Investigation not found")
    return item.evidence

@router.get("/investigations/{investigation_id}/hypotheses")
def hypotheses(investigation_id: str):
    item = store.get(investigation_id)
    if not item: raise HTTPException(404, "Investigation not found")
    return item.hypotheses

@router.get("/investigations/{investigation_id}/report")
def report(investigation_id: str):
    item = store.get(investigation_id)
    if not item: raise HTTPException(404, "Investigation not found")
    return item.report

@router.get("/investigations/{investigation_id}/evidence-graph")
def evidence_graph(investigation_id: str):
    item = store.get(investigation_id)
    if not item: raise HTTPException(404, "Investigation not found")
    nodes = [{"id": item.incident_id, "type": "incident", "label": item.incident_id}]
    for e in item.evidence:
        nodes.append({"id": e.id, "type": e.evidence_type, "label": e.finding})
    for h in item.hypotheses:
        nodes.append({"id": h.id, "type": "hypothesis", "label": h.title})
    edges = []
    for h in item.hypotheses:
        for eid in h.supporting_evidence_ids:
            edges.append({"from": eid, "to": h.id, "relationship": "supports", "observed": False})
        edges.append({"from": h.id, "to": item.incident_id, "relationship": "explains", "observed": False})
    return {"nodes": nodes, "edges": edges}
