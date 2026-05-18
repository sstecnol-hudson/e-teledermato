from sqlalchemy.orm import Session
from app.db.session import SessionLocal, engine
from app.db.base import Base
from app.models.models import User, UserRole, Patient, HealthUnit
from app.core.security import get_password_hash
from datetime import datetime

def seed():
    # Create tables
    Base.metadata.create_all(bind=engine)
    
    db = SessionLocal()
    
    # 1. Create Users
    users = [
        {
            "email": "solicitante@teste.com",
            "password": "senha",
            "full_name": "Dr. João Solicitante",
            "role": UserRole.SOLICITANTE
        },
        {
            "email": "dermato@teste.com",
            "password": "senha",
            "full_name": "Dra. Maria Dermatologista",
            "role": UserRole.DERMATOLOGISTA
        }
    ]
    
    for u_data in users:
        user = db.query(User).filter(User.email == u_data["email"]).first()
        if not user:
            user = User(
                email=u_data["email"],
                hashed_password=get_password_hash(u_data["password"]),
                full_name=u_data["full_name"],
                role=u_data["role"]
            )
            db.add(user)
    
    # 2. Create Health Unit
    unit = db.query(HealthUnit).filter(HealthUnit.cnes == "1234567").first()
    if not unit:
        unit = HealthUnit(cnes="1234567", name="UBS Central Municipal", municipality="São Paulo")
        db.add(unit)

    # 3. Create Patient
    patient = db.query(Patient).filter(Patient.cpf == "123.456.789-00").first()
    if not patient:
        patient = Patient(
            cpf="123.456.789-00",
            full_name="Paciente de Teste Exemplo",
            birth_date=datetime(1985, 5, 20),
            gender="M"
        )
        db.add(patient)

    db.commit()
    db.close()
    print("Seed concluído com sucesso!")

if __name__ == "__main__":
    seed()
