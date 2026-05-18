from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.orm import Session
from app.api import deps
from app.core.config import settings
from app.models import models
from app.schemas import case as case_schema
from app.services.ai_service import ai_service
import os
import uuid
import re

router = APIRouter()

def sanitize_cpf(cpf: str) -> str:
    return re.sub(r'\D', '', cpf)

UPLOAD_DIR = settings.UPLOAD_DIR
if not os.path.exists(UPLOAD_DIR):
    os.makedirs(UPLOAD_DIR)

@router.get("/", response_model=List[case_schema.Case])
def read_cases(
    db: Session = Depends(deps.get_db),
    skip: int = 0,
    limit: int = 100,
    current_user: models.User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Retrieve cases.
    """
    if current_user.role == models.UserRole.ADMIN or current_user.role == models.UserRole.GESTOR:
        cases = db.query(models.Case).offset(skip).limit(limit).all()
    elif current_user.role == models.UserRole.DERMATOLOGISTA:
        cases = db.query(models.Case).filter(
            (models.Case.dermatologist_id == current_user.id) | (models.Case.status == models.CaseStatus.PENDING)
        ).offset(skip).limit(limit).all()
    else:
        cases = db.query(models.Case).filter(models.Case.solicitor_id == current_user.id).offset(skip).limit(limit).all()
    return cases


@router.get("/{case_id}", response_model=case_schema.Case)
def read_case(
    *,
    db: Session = Depends(deps.get_db),
    case_id: int,
    current_user: models.User = Depends(deps.get_current_active_user),
) -> Any:
    case = db.query(models.Case).filter(models.Case.id == case_id).first()
    if not case:
        raise HTTPException(status_code=404, detail="Case not found")

    if current_user.role in [models.UserRole.ADMIN, models.UserRole.GESTOR]:
        return case

    if current_user.role == models.UserRole.DERMATOLOGISTA:
        return case

    if case.solicitor_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not enough permissions")

    return case

@router.post("/", response_model=case_schema.Case)
def create_case(
    *,
    db: Session = Depends(deps.get_db),
    case_in: case_schema.CaseCreate,
    current_user: models.User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Create new case.
    """
    # Find patient
    sanitized_cpf = sanitize_cpf(case_in.patient_cpf)
    patient = db.query(models.Patient).filter(models.Patient.cpf == sanitized_cpf).first()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found. Register patient first.")
    
    # Find health unit
    health_unit = db.query(models.HealthUnit).filter(models.HealthUnit.cnes == case_in.health_unit_cnes).first()
    if not health_unit:
        # For simplicity, create health unit if it doesn't exist
        health_unit = models.HealthUnit(cnes=case_in.health_unit_cnes, name="Unidade Básica de Saúde")
        db.add(health_unit)
        db.commit()
        db.refresh(health_unit)

    case = models.Case(
        protocol_type=case_in.protocol_type,
        lesion_location=case_in.lesion_location,
        evolution_time=case_in.evolution_time,
        symptoms=case_in.symptoms,
        observations=case_in.observations,
        patient_id=patient.id,
        health_unit_id=health_unit.id,
        solicitor_id=current_user.id,
        status=models.CaseStatus.PENDING
    )
    db.add(case)
    db.commit()
    db.refresh(case)
    return case

@router.post("/{case_id}/images", response_model=case_schema.Image)
async def upload_case_image(
    *,
    db: Session = Depends(deps.get_db),
    case_id: int,
    image_type: str = Form(...),
    is_focused: bool = Form(True),
    is_well_lit: bool = Form(True),
    has_ruler: bool = Form(False),
    file: UploadFile = File(...),
    current_user: models.User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Upload an image for a case.
    """
    case = db.query(models.Case).filter(models.Case.id == case_id).first()
    if not case:
        raise HTTPException(status_code=404, detail="Case not found")
    
    # Save file
    file_ext = os.path.splitext(file.filename)[1]
    file_name = f"{uuid.uuid4()}{file_ext}"
    file_path = os.path.join(UPLOAD_DIR, file_name)
    
    with open(file_path, "wb") as buffer:
        content = await file.read()
        buffer.write(content)
    
    public_url = f"/uploads/{file_name}"

    db_image = models.Image(
        case_id=case_id,
        url=public_url,
        image_type=image_type,
        is_focused=is_focused,
        is_well_lit=is_well_lit,
        has_ruler=has_ruler
    )
    db.add(db_image)
    db.commit()
    db.refresh(db_image)
    return db_image

@router.post("/{case_id}/finalize", response_model=case_schema.Case)
async def finalize_case(
    *,
    db: Session = Depends(deps.get_db),
    case_id: int,
    current_user: models.User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Finalize case registration and trigger AI pre-triaging.
    """
    case = db.query(models.Case).filter(models.Case.id == case_id).first()
    if not case:
        raise HTTPException(status_code=404, detail="Case not found")
    
    # Trigger AI analysis
    image_paths = [os.path.join(UPLOAD_DIR, os.path.basename(img.url)) for img in case.images]
    case_data = {
        "lesion_location": case.lesion_location,
        "evolution_time": case.evolution_time,
        "symptoms": case.symptoms
    }
    
    ai_result = await ai_service.analyze_case(case_data, image_paths)
    
    # Create report with IA result
    report = models.Report(
        case_id=case.id,
        ia_analysis=ai_result.get("hypothesis"),
        ia_urgency=ai_result.get("urgency"),
        ia_reasoning=ai_result.get("reasoning"),
        ia_cid10=ai_result.get("cid10"),
        hypothesis="", # Filled later by dermato
        cid10=ai_result.get("cid10", "")
    )
    db.add(report)
    
    # Update risk level based on AI
    urgency_map = {
        "urgente": models.RiskLevel.VERMELHO,
        "prioritario": models.RiskLevel.AMARELO_GRAVE,
        "rotina": models.RiskLevel.VERDE
    }
    case.risk_level = urgency_map.get(ai_result.get("urgency"), models.RiskLevel.VERDE)

    case.status = models.CaseStatus.ANALYZING

    db.commit()
    db.refresh(case)
    return case
