from datetime import datetime
from typing import Literal
from pydantic import BaseModel, Field

Severity = Literal["P0", "P1", "P2", "P3"]
IncidentStatus = Literal["Active", "Mitigated", "Resolved"]

class Incident(BaseModel):
    id: str
    title: str
    severity: Severity
    status: IncidentStatus
    affected_services: list[str]
    detected_at: datetime
    summary: str
    symptoms: list[str]
    scenario_key: str

class Service(BaseModel):
    id: str
    name: str
    kind: Literal["api", "worker", "database", "cache"]
    status: Literal["HEALTHY", "DEGRADED", "LATENCY_HIGH", "OFFLINE"]

class LogRecord(BaseModel):
    id: str
    timestamp: datetime
    service: str
    severity: Literal["FATAL", "ERROR", "WARN", "INFO"]
    message: str
    trace_id: str | None = None

class MetricSample(BaseModel):
    id: str
    timestamp: datetime
    service: str
    metric: str
    value: float
    unit: str

class Deployment(BaseModel):
    id: str
    service: str
    version: str
    deployed_at: datetime
    commit_id: str
    status: Literal["success", "failed", "rolled_back"] = "success"

class CommitRecord(BaseModel):
    id: str
    service: str
    committed_at: datetime
    author: str
    message: str
    change_summary: str

class ToolExecution(BaseModel):
    id: str
    investigation_id: str
    tool_name: str
    arguments: dict
    status: Literal["success", "error"]
    result_count: int = 0
    summary: str

class Evidence(BaseModel):
    id: str
    investigation_id: str
    evidence_type: Literal["log", "metric", "deployment", "commit", "database", "queue"]
    source_id: str
    service: str | None
    observed_at: datetime
    finding: str
    tool_execution_id: str

class Hypothesis(BaseModel):
    id: str
    investigation_id: str
    title: str
    root_cause_description: str
    supporting_evidence_ids: list[str] = Field(default_factory=list)
    contradicting_evidence_ids: list[str] = Field(default_factory=list)
    affected_services: list[str] = Field(default_factory=list)
    uncertainty_explanation: str
    verification_steps: list[str] = Field(default_factory=list)
    remediation: list[str] = Field(default_factory=list)

class Investigation(BaseModel):
    id: str
    incident_id: str
    status: Literal["running", "completed", "failed"]
    mode: Literal["deterministic", "gemini"]
    tool_executions: list[ToolExecution] = Field(default_factory=list)
    evidence: list[Evidence] = Field(default_factory=list)
    hypotheses: list[Hypothesis] = Field(default_factory=list)
    report: dict | None = None
