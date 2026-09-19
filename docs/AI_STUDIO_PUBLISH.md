# Publish in Google AI Studio

## Import

1. Open Google AI Studio → Build.
2. Click the **+** in the prompt/file area.
3. Choose **Import from GitHub**.
4. Select `Yosshmi/IncidentPilot`.
5. If asked which app folder to use, select `frontend`.
6. Let AI Studio install dependencies and render the preview.

## One validation prompt

Use one short prompt after import:

> Keep the current IncidentPilot design and code. Do not redesign it. Verify that the React UI, Node server APIs, deterministic investigation fallback, and server-side Gemini integration work. Fix only build/runtime issues you find. Never move GEMINI_API_KEY into client code.

## Secret

In AI Studio Secrets, ensure `GEMINI_API_KEY` is configured if live Gemini mode is desired. The app works without it using deterministic fallback.

## Publish

1. Click **Publish**.
2. Use Starter Tier if it is offered on your account and you want the no-billing deployment path.
3. In **Custom URL**, try `incidentpilot`.
4. If unavailable, try `incidentpilot-demo` or `incidentpilot-ops`.
5. Publish and open the final `https://<name>.ai.studio` URL.
6. Test INC-4098 from dashboard through final investigation.

Do not add Cloud SQL, Redis, Kubernetes or other managed infrastructure for this bootcamp demo.
