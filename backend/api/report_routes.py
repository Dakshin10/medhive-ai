from fastapi import (
    APIRouter,
    UploadFile,
    File
)

import shutil

from workflows.healthcare_coordinator import (
    HealthcareCoordinator
)

from services.lab_report_service import (
    analyze_report
)

router = APIRouter()

coordinator = HealthcareCoordinator()


@router.post(
    "/analyze-report"
)
async def analyze_lab_report(
    file: UploadFile = File(...)
):

    file_path = (
        f"uploads/{file.filename}"
    )

    with open(
        file_path,
        "wb"
    ) as buffer:

        shutil.copyfileobj(
            file.file,
            buffer
        )

    analysis = await analyze_report(
        coordinator.lab_report_agent,
        file_path
    )

    return {
        "message": "Report uploaded and analyzed successfully.",
        "analysis": analysis
    }