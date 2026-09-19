# IncidentPilot

Evidence-driven AI production incident investigation platform.

IncidentPilot demonstrates how an AI-assisted investigator can inspect controlled synthetic logs, metrics, deployments and commit metadata, then produce traceable root-cause hypotheses instead of free-form guesses.

## Demo capabilities

- Three reproducible production-style incidents.
- React/Vite engineering dashboard.
- Node/Express server runtime compatible with Google AI Studio Build apps.
- Server-side Gemini analysis when `GEMINI_API_KEY` is available.
- Deterministic fallback when Gemini is unavailable or quota is exhausted.
- Evidence IDs, tool execution history, hypotheses and investigation reports.
- No real production credentials or destructive remediation.

## Architecture

```
Browser / React
      |
      v
Node server (server.ts)
  |             |
  |             +--> Gemini API (optional)
  |
  +--> deterministic synthetic incidents
```

The `backend/` directory contains a FastAPI reference implementation of the same investigation concepts for backend/system-design learning and testing. The published AI Studio app uses the Node runtime at repository root.

## Run locally

```bash
npm install
npm run build
npm start
```

Open http://localhost:8080.

Without a Gemini key the investigation automatically uses deterministic mode. To test Gemini:

```bash
cp .env.example .env
# add GEMINI_API_KEY
npm start
```

## Publish for the bootcamp

1. Open **Google AI Studio → Build**.
2. Click **Add files (+) → Import from GitHub**.
3. Import **Yosshmi/IncidentPilot**.
4. Let AI Studio render the preview.
5. In Secrets, keep `GEMINI_API_KEY` server-side if live Gemini analysis is desired.
6. Click **Publish**.
7. Choose an available custom subdomain such as **incidentpilot.ai.studio**.
8. Test incident **INC-4098** end-to-end before submitting the URL.

See `docs/AI_STUDIO_PUBLISH.md` for the exact final steps.

## Zero-cost design

The demo does not require Cloud SQL, hosted Redis, Kafka, Kubernetes, a GPU, a domain purchase, or an always-running worker. It is intentionally compatible with the small AI Studio publishing path. Starter Tier availability is account-dependent, so confirm the Publish screen before accepting any billing upgrade.

## Safety

- Gemini never gets arbitrary SQL, shell or filesystem tools.
- Retrieved text is treated as untrusted evidence.
- Evidence is created by trusted server logic.
- Model conclusions must reference available evidence.
- No remediation action is automatically executed.
- Synthetic ground truth is for evaluation only.
