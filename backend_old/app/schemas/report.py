from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class ReportBase(BaseModel):
    hypothesis: str
    cid10: Optional[str] = None
    conduct: str

class ReportCreate(ReportBase):
    case_id: int

class ReportUpdate(BaseModel):
    hypothesis: Optional[str] = None
    cid10: Optional[str] = None
    conduct: Optional[str] = None

class Report(ReportBase):
    id: int
    case_id: int
    ia_analysis: Optional[str] = None
    ia_urgency: Optional[str] = None
    ia_reasoning: Optional[str] = None
    ia_cid10: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True
