from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_incidents_are_seeded():
    data = client.get("/api/v1/incidents").json()
    assert len(data) == 3
    assert data[0]["id"] == "INC-4098"

def test_filter_logs():
    data = client.get("/api/v1/logs", params={"service":"payment-service"}).json()
    assert data and all(x["service"] == "payment-service" for x in data)

def test_missing_incident_is_404():
    assert client.get("/api/v1/incidents/NOPE").status_code == 404
