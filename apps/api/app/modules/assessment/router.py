from fastapi import APIRouter, Depends
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
    user=Depends(require_student),
    db: AsyncSession = Depends(get_db),
):
    assessments = await _svc.list_assessments(db, user.id)
    out = [AssessmentStudentView.model_validate(a).model_dump() for a in assessments]
    # format dates correctly
    for a in out:
        if hasattr(a["created_at"], "isoformat"):
            a["created_at"] = a["created_at"].isoformat()
    return success_response(data=out)
