from fastapi import APIRouter
from app.api.v1.endpoints import login, cases, patients, reports, users

api_router = APIRouter()
api_router.include_router(login.router, prefix="/login", tags=["login"])
api_router.include_router(users.router, prefix="/users", tags=["users"])
api_router.include_router(cases.router, prefix="/cases", tags=["cases"])
api_router.include_router(patients.router, prefix="/patients", tags=["patients"])
api_router.include_router(reports.router, prefix="/reports", tags=["reports"])
