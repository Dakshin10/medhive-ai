from db.database import SessionLocal
from db.models import Patient


class MemoryService:

    @staticmethod
    def create_patient(data):

        db = SessionLocal()

        patient = Patient(
            name=data.name,
            age=data.age,
            gender=data.gender,
            medical_conditions=data.medical_conditions,
            allergies=data.allergies
        )

        db.add(patient)

        db.commit()

        db.refresh(patient)

        db.close()

        return patient

    @staticmethod
    def get_patient(patient_id):

        db = SessionLocal()

        patient = db.query(Patient).filter(
            Patient.id == patient_id
        ).first()

        db.close()

        return patient