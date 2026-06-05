from fastapi import APIRouter

from schemas.analyze import AnalyzeRequest
from workflows.healthcare_coordinator import HealthcareCoordinator

router = APIRouter()

coordinator = HealthcareCoordinator()


@router.post("/analyze")
async def analyze(request: AnalyzeRequest):

    result = await coordinator.analyze(
        user_input=request.message,
        patient_id=request.patient_id
    )

    return result