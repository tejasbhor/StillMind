from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.dependencies import require_student
from app.core.responses import success_response
from app.modules.student.schemas import StudentProfileUpdate, StudentProfileOut, ConsentSubmit, ConsentOut
from app.modules.student.service import StudentService

router = APIRouter(prefix="/students", tags=["Student"])
_svc = StudentService()


@router.get("/me/profile", response_model=dict, summary="Get own student profile")
async def get_profile(
    user=Depends(require_student),
    db: AsyncSession = Depends(get_db),
):
    profile = await _svc.get_profile(db, user.id)
    return success_response(data=StudentProfileOut.model_validate(profile).model_dump())


@router.patch("/me/profile", response_model=dict, summary="Update own student profile")
async def update_profile(
    req: StudentProfileUpdate,
    user=Depends(require_student),
    db: AsyncSession = Depends(get_db),
):
    profile = await _svc.update_profile(db, user.id, req)
    return success_response(data=StudentProfileOut.model_validate(profile).model_dump(), message="Profile updated")


@router.get("/me/consents", response_model=dict, summary="View own consents")
async def get_consents(
    user=Depends(require_student),
    db: AsyncSession = Depends(get_db),
):
    data = await _svc.get_consents(db, user.id)
    return success_response(data=data)


@router.put("/me/consents", response_model=dict, summary="Submit consents")
async def submit_consents(
    req: ConsentSubmit,
    user=Depends(require_student),
    db: AsyncSession = Depends(get_db),
):
    data = await _svc.submit_consents(db, user.id, req)
    msg = "Consents recorded. Profile activated." if data["profile_status"] == "ACTIVE" else "Consents recorded."
    return success_response(data=data, message=msg)
