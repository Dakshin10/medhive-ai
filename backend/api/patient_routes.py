from fastapi import APIRouter

from schemas.patient import PatientCreate
from services.memory_service import MemoryService

router = APIRouter()


@router.post("/patients")

def create_patient(data: PatientCreate):

    patient = MemoryService.create_patient(data)

    return {
        "id": patient.id,
        "name": patient.name
    }


@router.get("/patients/{patient_id}")

def get_patient(patient_id: int):

    patient = MemoryService.get_patient(patient_id)

    if not patient:
        return {
            "error": "Patient not found"
        }

    return {
        "id": patient.id,
        "name": patient.name,
        "age": patient.age,
        "gender": patient.gender,
        "medical_conditions": patient.medical_conditions,
        "allergies": patient.allergies
    }