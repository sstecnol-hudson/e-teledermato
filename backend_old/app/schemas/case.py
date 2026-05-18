from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime
from app.models.models import ProtocolType, CaseStatus, RiskLevel

class ImageBase(BaseModel):
    url: str
    image_type: str
    is_focused: bool = True
    is_well_lit: bool = True
    has_ruler: bool = False

class Image(ImageBase):
    id: int
    case_id: int

    class Config:
        from_attributes = True

class CaseBase(BaseModel):
    protocol_type: ProtocolType
    lesion_location: str
    evolution_time: str
    symptoms: Optional[str] = None
    observations: Optional[str] = None

class CaseCreate(CaseBase):
    patient_cpf: str
    health_unit_cnes: str

class Case(CaseBase):
    id: int
    status: CaseStatus
    risk_level: Optional[RiskLevel] = None
    patient_id: int
    solicitor_id: int
    dermatologist_id: Optional[int] = None
    health_unit_id: int
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    images: List[Image] = []

    class Config:
        from_attributes = True
