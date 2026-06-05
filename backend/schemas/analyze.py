from pydantic import BaseModel


class AnalyzeRequest(BaseModel):

    message: str

    patient_id: int | None = None