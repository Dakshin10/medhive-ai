from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware

from api.patient_routes import (
    router as patient_router
)

from api.routes import (
    router
)

from api.report_routes import (
    router as report_router
)

from voice.voice_routes import (
    router as voice_router
)


app = FastAPI(
    title="MedHive AI",
    version="1.0.0",
    description="""
    MedHive AI Healthcare Copilot

    Features:
    - Emergency Triage
    - Symptom Analysis
    - Risk Assessment
    - Medical RAG
    - Trusted Medical Web Search
    - Verification Agent
    - Drug Interaction Analysis
    - Patient Memory
    - Voice AI
    """
)

# =====================================================
# CORS MIDDLEWARE
# =====================================================
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Static files for audio outputs
app.mount("/outputs", StaticFiles(directory="outputs"), name="outputs")

# =====================================================
# API ROUTES
# =====================================================

app.include_router(
    patient_router,
    prefix="/patients",
    tags=["Patients"]
)

app.include_router(
    router,
    tags=["Healthcare"]
)

app.include_router(
    report_router,
    tags=["Reports"]
)

app.include_router(
    voice_router,
    prefix="/voice",
    tags=["Voice AI"]
)

# =====================================================
# ROOT
# =====================================================

@app.get("/")
async def root():

    return {
        "message": "MedHive AI Running",
        "version": "1.0.0",
        "status": "healthy"
    }


# =====================================================
# HEALTH CHECK
# =====================================================

@app.get("/health")
async def health_check():

    return {
        "status": "ok",
        "service": "MedHive AI"
    }