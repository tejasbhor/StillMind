from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_

from app.core.database import get_db
from app.core.dependencies import require_student
from app.core.responses import success_response
from app.modules.student.schemas import (
    StudentProfileUpdate,
    StudentProfileOut,
    ConsentSubmit,
    ConsentOut,
)
from app.modules.student.service import StudentService
from app.models.student_profile import StudentProfile
from app.models.allocation import Allocation
from app.models.session import Session
from app.models.session_note import SessionNote
from app.models.counselor_profile import CounselorProfile

router = APIRouter(prefix="/students", tags=["Student"])
_svc = StudentService()


@router.get("/me/profile", response_model=dict, summary="Get own student profile")
async def get_profile(
    user=Depends(require_student),
    db: AsyncSession = Depends(get_db),
):
    profile = await _svc.get_profile(db, user.id)
    data = StudentProfileOut.model_validate(profile).model_dump()
    prefs = (profile.consents or {}).get("notification_preferences")
    if prefs is not None:
        data["notification_preferences"] = prefs
    return success_response(data=data)


@router.patch("/me/profile", response_model=dict, summary="Update own student profile")
async def update_profile(
    req: StudentProfileUpdate,
    user=Depends(require_student),
    db: AsyncSession = Depends(get_db),
):
    profile = await _svc.update_profile(db, user.id, req)
    data = StudentProfileOut.model_validate(profile).model_dump()
    prefs = (profile.consents or {}).get("notification_preferences")
    if prefs is not None:
        data["notification_preferences"] = prefs
    return success_response(
        data=data,
        message="Profile updated",
    )


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
    msg = (
        "Consents recorded. Profile activated."
        if data["profile_status"] == "ACTIVE"
        else "Consents recorded."
    )
    return success_response(data=data, message=msg)


@router.get(
    "/me/sessions", response_model=dict, summary="Get student sessions (safe view)"
)
async def get_student_sessions(
    limit: int = Query(20, le=100, ge=1),
    offset: int = Query(0, ge=0),
    user=Depends(require_student),
    db: AsyncSession = Depends(get_db),
):
    # Get student profile id
    profile_result = await db.execute(
        select(StudentProfile.id).where(StudentProfile.user_id == user.id)
    )
    profile_id = profile_result.scalar_one_or_none()

    if not profile_id:
        return success_response(
            data=[], meta={"total": 0, "limit": limit, "offset": offset}
        )

    # Get sessions via allocations
    stmt = (
        select(Session, Allocation, CounselorProfile.full_name)
        .join(Allocation, Session.allocation_id == Allocation.id)
        .join(CounselorProfile, Allocation.counselor_id == CounselorProfile.id)
        .where(Allocation.student_id == profile_id)
        .order_by(Session.session_date.desc())
        .offset(offset)
        .limit(limit)
    )
    result = await db.execute(stmt)
    rows = result.all()

    # Count total
    count_stmt = (
        select(Session).join(Allocation).where(Allocation.student_id == profile_id)
    )
    total_result = await db.execute(count_stmt)
    total = len(total_result.scalars().all())

    sessions = []
    for session, alloc, counselor_name in rows:
        sessions.append(
            {
                "session_id": session.id,
                "allocation_id": session.allocation_id,
                "counselor_name": counselor_name,
                "session_date": session.session_date.isoformat()
                if session.session_date
                else None,
                "status": session.status,
                "created_at": session.created_at.isoformat()
                if hasattr(session.created_at, "isoformat")
                else str(session.created_at),
            }
        )

    return success_response(
        data=sessions, meta={"total": total, "limit": limit, "offset": offset}
    )


@router.get(
    "/me/session-summaries",
    response_model=dict,
    summary="Get filtered session summaries (safe language only)",
)
async def get_session_summaries(
    limit: int = Query(20, le=100, ge=1),
    offset: int = Query(0, ge=0),
    user=Depends(require_student),
    db: AsyncSession = Depends(get_db),
):
    # Get student profile id
    profile_result = await db.execute(
        select(StudentProfile.id).where(StudentProfile.user_id == user.id)
    )
    profile_id = profile_result.scalar_one_or_none()

    if not profile_id:
        return success_response(
            data=[], meta={"total": 0, "limit": limit, "offset": offset}
        )

    # Get session notes for completed sessions - safe view only (PRD §7.5)
    stmt = (
        select(SessionNote, Session, CounselorProfile.full_name)
        .join(Session, SessionNote.session_id == Session.id)
        .join(Allocation, Session.allocation_id == Allocation.id)
        .join(CounselorProfile, Allocation.counselor_id == CounselorProfile.id)
        .where(and_(Allocation.student_id == profile_id, Session.status == "COMPLETED"))
        .order_by(Session.created_at.desc())
        .offset(offset)
        .limit(limit)
    )
    result = await db.execute(stmt)
    rows = result.all()

    # Count total
    count_stmt = (
        select(SessionNote)
        .join(Session)
        .join(Allocation)
        .where(and_(Allocation.student_id == profile_id, Session.status == "COMPLETED"))
    )
    total_result = await db.execute(count_stmt)
    total = len(total_result.scalars().all())

    summaries = []
    for note, session, counselor_name in rows:
        # Safe language only - no raw scores, no clinical labels
        concerns_safe = []
        concern_mapping = {
            "ACADEMIC_STRESS": "Academic matters",
            "SLEEP": "Sleep and rest",
            "RELATIONSHIPS": "Social connections",
            "FAMILY": "Family matters",
            "HEALTH": "Physical health",
            "CAREER": "Future planning",
        }
        for concern in note.key_concerns or []:
            concerns_safe.append(concern_mapping.get(concern, "General discussion"))

        risk_label = {
            "IMPROVING": "Moving forward",
            "STABLE": "Steadily balanced",
            "WORSENING": "Needs attention",
        }.get(note.risk_flag, "Steadily balanced")

        summaries.append(
            {
                "session_date": session.session_date.isoformat()
                if session.session_date
                else None,
                "counselor_name": counselor_name,
                "key_concerns": concerns_safe,
                "progress_summary": risk_label,
                "action_plan": note.action_plan
                if note.action_plan
                else "Continue as discussed",
            }
        )

    return success_response(
        data=summaries, meta={"total": total, "limit": limit, "offset": offset}
    )
