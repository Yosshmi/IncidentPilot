from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .config import get_settings

settings = get_settings()
app = FastAPI(title=settings.app_name, version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origin_list,
    allow_credentials=False,
    allow_methods=["GET", "POST"],
    allow_headers=["*"],
)

@app.get("/health", tags=["system"])
def health() -> dict[str, str]:
    return {"status": "ok"}

@app.get("/ready", tags=["system"])
def ready() -> dict[str, str]:
    return {"status": "ready", "mode": "deterministic" if settings.demo_mode else "ai"}
