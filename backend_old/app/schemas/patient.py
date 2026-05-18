from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class PatientBase(BaseModel):
    cpf: str
    cns: Optional[str] = None
    full_name: str
    birth_date: Optional[datetime] = None
    gender: Optional[str] = None

class PatientCreate(PatientBase):
    pass

class Patient(PatientBase):
    id: int

    class Config:
        from_attributes = True

class HealthUnitBase(BaseModel):
    cnes: str
    name: str
    municipality: Optional[str] = None

class HealthUnit(HealthUnitBase):
    id: int

    class Config:
        from_attributes = True
