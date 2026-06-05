from pydantic import BaseModel
from typing import List


class HealthResponse(BaseModel):
    symptoms: List[str]
    duration: str
    risk_level: str
    possible_conditions: List[str]
    recommendations: List[str]