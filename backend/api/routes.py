from fastapi import APIRouter

from schemas.analyze import AnalyzeRequest
from schemas.medication import MedicationCheckRequest
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


@router.post("/medications/check")
async def check_medications(request: MedicationCheckRequest):

    task = f"""
NEW MEDICATION: {request.medication}
ACTIVE MEDICATIONS: {", ".join(request.active_medications)}

Analyze if there are any drug-drug interactions between the new medication and any of the active medications.
Provide the results in the following JSON format:
{{
  "risk": "High" | "Moderate" | "None",
  "alert": "Detailed explanation of any interaction and risks.",
  "recommendation": "Recommendations, including safe usage and consulting a physician."
}}

Respond ONLY with valid JSON. Do not include markdown code block formatting like ```json.
"""

    interaction_result = await coordinator.drug_interaction_agent.run(
        task=task
    )

    response_content = (
        interaction_result
        .messages[-1]
        .content
    )

    parsed = (
        coordinator
        ._parse_json_response(
            response_content
        )
    )

    if not parsed:

        parsed = {
            "risk": "None",
            "alert": "No major interactions detected or unable to parse response.",
            "recommendation": "Consult a healthcare professional for accurate guidance."
        }

    return parsed