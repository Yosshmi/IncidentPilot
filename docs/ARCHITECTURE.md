# Architecture

## User flow

Dashboard → Incident → Investigation → Tool executions → Evidence → Hypothesis → Report.

## Published web runtime

```
Browser (React)
      |
      v
Node/Express server
  |          |
  |          +--> Gemini API (optional, server-side secret)
  |
  +--> deterministic synthetic incident repository
```

The public bootcamp app is self-contained. It does not require a persistent managed database because the scenarios are reproducible and no user data needs to survive a restart.

## Reference backend

The `backend/` FastAPI implementation demonstrates the same concepts using Python/Pydantic and a repository boundary. It contains:
- simulator data
- telemetry APIs
- controlled investigation tools
- evidence and hypothesis models
- deterministic investigation flow
- API tests

## Trust boundary

The model is not trusted to create evidence. The server owns evidence records and the model only receives validated evidence. Logs and commit messages are untrusted content and cannot override system instructions.

## Incident scenarios

1. Retry-driven database connection pool exhaustion.
2. Background worker processing slowdown and queue backlog.
3. Redis degradation causing cache misses, increased PostgreSQL reads and API latency.
