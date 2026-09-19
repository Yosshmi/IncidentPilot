# IncidentPilot

Evidence-driven AI production incident investigation platform.

IncidentPilot demonstrates how an AI-assisted investigator can inspect controlled synthetic logs, metrics, deployments and commit metadata, then produce traceable root-cause hypotheses instead of free-form guesses.

## What the demo does

- Displays three reproducible production-style incidents.
- Investigates incidents through bounded, read-only tool-style steps.
- Captures evidence with stable IDs.
- Separates observed evidence from inferred root-cause hypotheses.
- Uses Gemini on the server when `GEMINI_API_KEY` is available.
- Automatically falls back to a deterministic investigator when Gemini is unavailable.
- Keeps the demo free of real production credentials and infrastructure.

## Repository layout

```
frontend/   React + Vite UI and AI Studio-compatible Node runtime
backend/    FastAPI reference backend, simulator and investigation engine
docs/       Architecture and deployment notes
```

The **AI Studio published version uses the Node server runtime** because Google AI Studio web apps support a React client with a Node.js server-side environment. The FastAPI implementation remains in the repository as a backend/system-design reference and can be run locally.

## AI Studio / bootcamp path

1. Open Google AI Studio Build mode.
2. Choose **Add files (+) → Import from GitHub**.
3. Import `Yosshmi/IncidentPilot`.
4. Use `frontend/` as the web application.
5. Add `GEMINI_API_KEY` through AI Studio Secrets if you want live Gemini analysis.
6. Preview the app and run all three incidents.
7. Click **Publish**.
8. Choose an available custom subdomain such as `incidentpilot.ai.studio`.

The deterministic fallback means the project remains demonstrable even without Gemini quota.

## Local frontend

```bash
cd frontend
npm install
npm run build
npm start
```

Open http://localhost:8080.

## Local FastAPI reference backend

```bash
cd backend
python -m venv .venv
# activate the environment
pip install -r requirements.txt
uvicorn app.main:app --reload
```

## Safety boundaries

- No arbitrary SQL.
- No shell or filesystem tools for the investigator.
- Retrieved evidence is treated as data, not instructions.
- Evidence IDs must exist before they can support a hypothesis.
- No destructive remediation is executed.
- Synthetic hidden ground truth is reserved for evaluation, not investigation.

## Deployment goal

The bootcamp version intentionally avoids Cloud SQL, hosted Redis, Kafka, Kubernetes, GPUs and always-on workers. It is designed for AI Studio's small demo deployment path and scales the underlying Cloud Run service to zero when idle where supported.
