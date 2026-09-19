from fastapi.testclient import TestClient
from app.main import app
client = TestClient(app)

def test_deterministic_investigation_has_traceable_evidence():
    res = client.post("/api/v1/incidents/INC-4098/investigations", json={"mode":"deterministic"})
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "completed"
    assert data["tool_executions"]
    assert data["evidence"]
    ids = {e["id"] for e in data["evidence"]}
    assert set(data["hypotheses"][0]["supporting_evidence_ids"]).issubset(ids)

def test_all_three_scenarios_complete():
    for incident in ["INC-4098","INC-4095","INC-4091"]:
        data = client.post(f"/api/v1/incidents/{incident}/investigations", json={"mode":"deterministic"}).json()
        assert data["status"] == "completed"
        assert data["report"]["executive_summary"]

def test_unknown_incident_is_404():
    assert client.post("/api/v1/incidents/NOPE/investigations", json={"mode":"deterministic"}).status_code == 404
