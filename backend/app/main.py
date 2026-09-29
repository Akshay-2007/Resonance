import logging
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .models.database import init_db
from .api.incidents import router as incidents_router
from .api.outcomes import router as outcomes_router
from .services.hindsight_service import hindsight_service

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("resonance.app")

app = FastAPI(
    title="RESONANCE - Experience-Aware Incident Decision Intelligence",
    description="Backend decision engine separating semantic similarity from operational applicability.",
    version="1.0.0"
)

# CORS configuration for Next.js frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize SQLite database schema on startup
@app.on_event("startup")
def on_startup():
    init_db()
    logger.info("Resonance SQLite Database schema initialized.")
    h_health = hindsight_service.check_health()
    logger.info(f"Hindsight status: {h_health}")


# Health check endpoint
@app.get("/api/health")
def health_check():
    return {
        "status": "HEALTHY",
        "service": "Resonance Backend Decision Engine",
        "version": "1.0.0",
        "hindsight": hindsight_service.check_health()
    }


# Include Routers
app.include_router(incidents_router)
app.include_router(outcomes_router)


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
