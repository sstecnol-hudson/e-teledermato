from typing import Any
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.api import deps
from app.models import models
from app.schemas import report as report_schema
from app.services.pdf_service import pdf_service
from fastapi.responses import Response

router = APIRouter()

@router.post("/", response_model=report_schema.Report)
def create_report(
    *,
    db: Session = Depends(deps.get_db),
    report_in: report_schema.ReportCreate,
    current_user: models.User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Create or update report for a case (Dermatologist only).
    """
    if current_user.role != models.UserRole.DERMATOLOGISTA and current_user.role != models.UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Not enough permissions")
    
    case = db.query(models.Case).filter(models.Case.id == report_in.case_id).first()
    if not case:
        raise HTTPException(status_code=404, detail="Case not found")
    
    # Check if report already exists (created by IA)
    report = db.query(models.Report).filter(models.Report.case_id == report_in.case_id).first()
    
    if report:
        report.hypothesis = report_in.hypothesis
        report.cid10 = report_in.cid10
        report.conduct = report_in.conduct
    else:
        report = models.Report(
            case_id=report_in.case_id,
            hypothesis=report_in.hypothesis,
            cid10=report_in.cid10,
            conduct=report_in.conduct
        )
        db.add(report)
    
    # Update case status and dermatologist
    case.status = models.CaseStatus.COMPLETED
    case.dermatologist_id = current_user.id
    
    db.commit()
    db.refresh(report)
    return report

@router.get("/{case_id}", response_model=report_schema.Report)
def read_report(
    *,
    db: Session = Depends(deps.get_db),
    case_id: int,
    current_user: models.User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Get report by case ID.
    """
    report = db.query(models.Report).filter(models.Report.case_id == case_id).first()
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")
    return report

@router.get("/{case_id}/pdf")
def get_report_pdf(
    *,
    db: Session = Depends(deps.get_db),
    case_id: int,
    current_user: models.User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Generate and download PDF report.
    """
    case = db.query(models.Case).filter(models.Case.id == case_id).first()
    report = db.query(models.Report).filter(models.Report.case_id == case_id).first()
    
    if not case or not report:
        raise HTTPException(status_code=404, detail="Case or report not found")
    
    pdf_buffer = pdf_service.generate_case_report(case, report, case.patient)
    
    return Response(
        content=pdf_buffer.getvalue(),
        media_type="application/pdf",
        headers={
            "Content-Disposition": f"attachment; filename=laudo_teledermato_{case_id}.pdf"
        }
    )
