from sqlalchemy import Column
from sqlalchemy import Integer
from sqlalchemy import String

from db.database import Base


class Patient(Base):

    __tablename__ = "patients"

    id = Column(Integer, primary_key=True, index=True)

    name = Column(String)

    age = Column(Integer)

    gender = Column(String)

    medical_conditions = Column(String)

    allergies = Column(String)