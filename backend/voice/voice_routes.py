import os
import shutil

from fastapi import (
    APIRouter,
    UploadFile,
    File,
    HTTPException
)

from workflows.healthcare_coordinator import (
    HealthcareCoordinator
)

from voice.whisperflow_service import (
    process_voice_request
)

router = APIRouter()

coordinator = HealthcareCoordinator()

os.makedirs(
    "uploads",
    exist_ok=True
)

os.makedirs(
    "outputs",
    exist_ok=True
)


@router.post("/voice-assistant")
async def voice_assistant(
    audio: UploadFile = File(...)
):

    try:

        file_path = (
            f"uploads/{audio.filename}"
        )

        with open(
            file_path,
            "wb"
        ) as buffer:

            shutil.copyfileobj(
                audio.file,
                buffer
            )

        result = (
            await process_voice_request(
                coordinator,
                file_path
            )
        )

        return result

    except Exception as e:

        raise HTTPException(
            status_code=500,
            detail=str(e)
        )