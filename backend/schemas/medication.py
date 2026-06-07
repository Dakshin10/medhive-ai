from pydantic import BaseModel
from typing import List


class MedicationCheckRequest(BaseModel):

    medication: str

    active_medications: List[str]
