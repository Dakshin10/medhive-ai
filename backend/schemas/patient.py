from pydantic import BaseModel


class PatientCreate(BaseModel):

    name: str

    age: int

    gender: str

    medical_conditions: str

    allergies: str