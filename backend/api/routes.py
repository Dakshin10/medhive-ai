from fastapi import APIRouter

from schemas.request import AnalyzeRequest
from workflows.healthcare_coordinator import HealthcareCoordinator

router = APIRouter()

coordinator = HealthcareCoordinator()


@router.post("/analyze")
async def analyze_health(data: AnalyzeRequest):

    result = await coordinator.analyze(
        data.message
    )

    return result