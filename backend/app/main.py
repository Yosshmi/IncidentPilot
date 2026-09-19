from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .config import get_settings
from .api.routes import router as data_router
from .api.investigations import router as investigation_router

settings = get_settings()
app = FastAPI(title=settings.app_name, version="0.3.0")
app.add_middleware(CORSMiddleware, allow_origins=settings.cors_origin_list, allow_credentials=False, allow_methods=["GET", "POST"], allow_headers=["*"])
app.include_router(data_router)
app.include_router(investigation_router)

@app.get("/health", tags=["system"])
def health(): return {"status": "ok"}

@app.get("/ready", tags=["system"])
def ready(): return {"status": "ready", "mode": "deterministic" if settings.demo_mode else "ai"}
