from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, Enum, Text, Boolean, Table
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import enum
from app.db.base_class import Base

class UserRole(str, enum.Enum):
    SOLICITANTE = "solicitante"
    DERMATOLOGISTA = "dermatologista"
    GESTOR = "gestor"
    ADMIN = "admin"

class ProtocolType(str, enum.Enum):
    PROTOCOL_A = "cancer_pele"  # 3 fotos
    PROTOCOL_B = "outras_dermatoses"  # 5 fotos

class CaseStatus(str, enum.Enum):
    PENDING = "pendente"
    ANALYZING = "em_analise"
    COMPLETED = "concluido"
    INVALIDATED = "invalidado"

class RiskLevel(str, enum.Enum):
    VERDE = "verde"
    AMARELO_LEVE = "amarelo_leve"
    AMARELO_GRAVE = "amarelo_grave"
    VERMELHO = "vermelho"
    URGENCIA = "urgencia"

class User(Base):
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    full_name = Column(String)
    role = Column(Enum(UserRole), default=UserRole.SOLICITANTE)
    is_active = Column(Boolean(), default=True)
    
    cases_requested = relationship("Case", back_populates="solicitor", foreign_keys="Case.solicitor_id")
    cases_assigned = relationship("Case", back_populates="dermatologist", foreign_keys="Case.dermatologist_id")

class HealthUnit(Base):
    id = Column(Integer, primary_key=True, index=True)
    cnes = Column(String, unique=True, index=True, nullable=False)
    name = Column(String, nullable=False)
    municipality = Column(String)

class Patient(Base):
    id = Column(Integer, primary_key=True, index=True)
    cpf = Column(String, unique=True, index=True, nullable=False)
    cns = Column(String, unique=True, index=True)
    full_name = Column(String, nullable=False)
    birth_date = Column(DateTime)
    gender = Column(String)

class Case(Base):
    id = Column(Integer, primary_key=True, index=True)
    protocol_type = Column(Enum(ProtocolType), nullable=False)
    status = Column(Enum(CaseStatus), default=CaseStatus.PENDING)
    risk_level = Column(Enum(RiskLevel), nullable=True)
    
    patient_id = Column(Integer, ForeignKey("patient.id"))
    solicitor_id = Column(Integer, ForeignKey("user.id"))
    dermatologist_id = Column(Integer, ForeignKey("user.id"), nullable=True)
    health_unit_id = Column(Integer, ForeignKey("healthunit.id"))
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Clinical info
    lesion_location = Column(String)
    evolution_time = Column(String)
    symptoms = Column(Text)
    observations = Column(Text)
    
    patient = relationship("Patient")
    solicitor = relationship("User", foreign_keys=[solicitor_id], back_populates="cases_requested")
    dermatologist = relationship("User", foreign_keys=[dermatologist_id], back_populates="cases_assigned")
    health_unit = relationship("HealthUnit")
    images = relationship("Image", back_populates="case")
    report = relationship("Report", back_populates="case", uselist=False)

class Image(Base):
    id = Column(Integer, primary_key=True, index=True)
    case_id = Column(Integer, ForeignKey("case.id"))
    url = Column(String, nullable=False)
    image_type = Column(String)  # panoramic, zoom, dermoscopy
    
    # Quality checklist results
    is_focused = Column(Boolean, default=True)
    is_well_lit = Column(Boolean, default=True)
    has_ruler = Column(Boolean, default=False)
    
    case = relationship("Case", back_populates="images")

class Report(Base):
    id = Column(Integer, primary_key=True, index=True)
    case_id = Column(Integer, ForeignKey("case.id"), unique=True)
    
    hypothesis = Column(Text)
    cid10 = Column(String)
    conduct = Column(Text)
    
    # IA pre-triaging fields
    ia_analysis = Column(Text)  # Legacy field/General summary
    ia_urgency = Column(String)
    ia_reasoning = Column(Text)
    ia_cid10 = Column(String)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    case = relationship("Case", back_populates="report")
