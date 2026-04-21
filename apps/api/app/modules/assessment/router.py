from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List

from app.core.database import get_db
from app.core.dependencies import require_student
from app.core.responses import success_response
from app.modules.assessment.schemas import AssessmentCreate, AssessmentStudentView
from app.modules.assessment.service import AssessmentService

router = APIRouter(prefix="/students/me/assessments", tags=["Assessments"])
_svc = AssessmentService()

@router.post("", response_model=dict, summary="Submit a new assessment")
async def submit_assessment(
    req: AssessmentCreate,
    user=Depends(require_student),
    db: AsyncSession = Depends(get_db),
):
    assessment = await _svc.submit_assessment(db, user.id, req)
    return success_response(data={"id": assessment.id}, message="Assessment submitted successfully.")

@router.get("", response_model=dict, summary="List your past assessments")
async def list_assessments(
    limit: int = Query(50, le=100, ge=1),
    offset: int = Query(0, ge=0),
    user=Depends(require_student),
    db: AsyncSession = Depends(get_db),
):
    assessments = await _svc.list_assessments(db, user.id, limit=limit, offset=offset)
    data = [AssessmentStudentView.model_validate(a).model_dump() for a in assessments]
    return success_response(data=data)
