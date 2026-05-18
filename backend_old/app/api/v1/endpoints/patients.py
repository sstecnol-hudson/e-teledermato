from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.api import deps
from app.models import models
from app.schemas import patient as patient_schema

import re

router = APIRouter()

def sanitize_cpf(cpf: str) -> str:
    return re.sub(r'\D', '', cpf)

@router.get("/", response_model=List[patient_schema.Patient])
def read_patients(
    db: Session = Depends(deps.get_db),
    skip: int = 0,
    limit: int = 100,
    current_user: models.User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Retrieve patients.
    """
    patients = db.query(models.Patient).offset(skip).limit(limit).all()
    return patients

@router.post("/", response_model=patient_schema.Patient)
def create_patient(
    *,
    db: Session = Depends(deps.get_db),
    patient_in: patient_schema.PatientCreate,
    current_user: models.User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Create new patient.
    """
    sanitized_cpf = sanitize_cpf(patient_in.cpf)
    patient = db.query(models.Patient).filter(models.Patient.cpf == sanitized_cpf).first()
    if patient:
        raise HTTPException(
            status_code=400,
            detail="Patient with this CPF already exists.",
        )
    patient = models.Patient(
        cpf=sanitized_cpf,
        cns=patient_in.cns,
        full_name=patient_in.full_name,
        birth_date=patient_in.birth_date,
        gender=patient_in.gender
    )
    db.add(patient)
    db.commit()
    db.refresh(patient)
    return patient

@router.get("/{cpf}", response_model=patient_schema.Patient)
def read_patient_by_cpf(
    *,
    db: Session = Depends(deps.get_db),
    cpf: str,
    current_user: models.User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Get patient by CPF.
    """
    sanitized_cpf = sanitize_cpf(cpf)
    patient = db.query(models.Patient).filter(models.Patient.cpf == sanitized_cpf).first()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found")
    return patient
