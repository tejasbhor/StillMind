from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_
from typing import List
import datetime

from app.core.database import get_db
from app.core.dependencies import require_counselor
from app.core.responses import success_response
from app.modules.counselor.service import CounselorService
from app.modules.session.service import SessionService
from app.models.counselor_profile import CounselorProfile
from app.models.student_profile import StudentProfile
from app.models.allocation import Allocation
from app.models.session import Session
from app.models.risk_log import RiskLog
from app.models.assessment import Assessment

router = APIRouter(prefix="/counselors/me", tags=["Counselor"])
_svc = CounselorService()
_session_svc = SessionService()


async def _get_counselor_profile_id(db: AsyncSession, user_id: str) -> str | None:
    """Resolve user ID to counselor profile ID."""
    result = await db.execute(
        select(CounselorProfile.id).where(CounselorProfile.user_id == user_id)
    )
    return result.scalar_one_or_none()


@router.get("/waitlist", response_model=dict, summary="Get priority waitlist")
async def get_waitlist(
    user=Depends(require_counselor),
    db: AsyncSession = Depends(get_db),
):
    """Retrieve priority-sorted waitlist with computed priority scores."""
    waitlist = await _svc.get_waitlist(db)
    return success_response(data=waitlist)


@router.get("/capacity", response_model=dict, summary="Get counselor capacity")
async def get_capacity(
    user=Depends(require_counselor),
    db: AsyncSession = Depends(get_db),
):
    """Get current case load and availability."""
    profile_id = await _get_counselor_profile_id(db, user.id)
    if not profile_id:
        return success_response(data=None, message="Counselor profile not found")

    capacity = await _svc.get_capacity(db, profile_id)
    return success_response(data=capacity)


@router.post("/auto-allocate", response_model=dict, summary="Trigger auto-allocator")
async def trigger_auto_allocate(
    user=Depends(require_counselor),
    db: AsyncSession = Depends(get_db),
):
    """Trigger background job to auto-allocate waitlisted students."""
    result = await _svc.auto_allocate(db)
    return success_response(data=result, message="Auto-allocation job queued.")


@router.get("/sessions", response_model=dict, summary="Get counselor sessions")
async def get_counselor_sessions(
    date: str = Query(None, description="Filter by date (YYYY-MM-DD)"),
    limit: int = Query(20, le=100, ge=1),
    offset: int = Query(0, ge=0),
    user=Depends(require_counselor),
    db: AsyncSession = Depends(get_db),
):
    """Get today's schedule and upcoming sessions for counselor."""
    profile_id = await _get_counselor_profile_id(db, user.id)
    if not profile_id:
        return success_response(data=[], meta={"total": 0})

    # Build query for sessions
    stmt = (
        select(Session, Allocation, StudentProfile.full_name)
        .join(Allocation, Session.allocation_id == Allocation.id)
        .join(StudentProfile, Allocation.student_id == StudentProfile.id)
        .where(Allocation.counselor_id == profile_id)
    )

    if date:
        try:
            target_date = datetime.datetime.strptime(date, "%Y-%m-%d").date()
            start = datetime.datetime.combine(target_date, datetime.time.min).replace(
                tzinfo=datetime.timezone.utc
            )
            end = datetime.datetime.combine(target_date, datetime.time.max).replace(
                tzinfo=datetime.timezone.utc
            )
            stmt = stmt.where(
                and_(Session.session_date >= start, Session.session_date <= end)
            )
        except ValueError:
            pass

    stmt = stmt.order_by(Session.session_date.asc()).offset(offset).limit(limit)
    result = await db.execute(stmt)
    rows = result.all()

    # Count total
    count_stmt = (
        select(Session).join(Allocation).where(Allocation.counselor_id == profile_id)
    )
    total_result = await db.execute(count_stmt)
    total = len(total_result.scalars().all())

    sessions = []
    for session, alloc, student_name in rows:
        sessions.append(
            {
                "session_id": session.id,
                "allocation_id": session.allocation_id,
                "student_name": student_name,
                "student_id": alloc.student_id,
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


# Student case endpoints - GET /counselors/students/{id}
@router.get(
    "/students/{student_id}", response_model=dict, summary="Get student case summary"
)
async def get_student_case(
    student_id: str,
    user=Depends(require_counselor),
    db: AsyncSession = Depends(get_db),
):
    """Get assigned student case summary - row-level auth enforced."""
    profile_id = await _get_counselor_profile_id(db, user.id)
    if not profile_id:
        raise HTTPException(status_code=403, detail="Counselor profile not found")

    # Verify this student is assigned to this counselor
    alloc_result = await db.execute(
        select(Allocation).where(
            and_(
                Allocation.student_id == student_id,
                Allocation.counselor_id == profile_id,
                Allocation.status.in_(
                    ["ASSIGNED", "CONFIRMED", "IN_PROGRESS", "COMPLETED"]
                ),
            )
        )
    )
    allocation = alloc_result.scalar_one_or_none()
    if not allocation:
        raise HTTPException(
            status_code=403, detail="Not authorized to view this student"
        )

    # Get student profile
    student_result = await db.execute(
        select(StudentProfile).where(StudentProfile.id == student_id)
    )
    student = student_result.scalar_one_or_none()

    # Get latest risk log
    risk_result = await db.execute(
        select(RiskLog)
        .where(RiskLog.student_id == student_id)
        .order_by(RiskLog.created_at.desc())
        .limit(1)
    )
    risk = risk_result.scalar_one_or_none()

    # Get session count
    session_count_result = await db.execute(
        select(Session)
        .join(Allocation)
        .where(
            and_(
                Allocation.student_id == student_id,
                Allocation.counselor_id == profile_id,
                Session.status == "COMPLETED",
            )
        )
    )
    session_count = len(session_count_result.scalars().all())

    return success_response(
        data={
            "student_id": student.id,
            "student_name": student.full_name,
            "college_id": student.college_id,
            "profile_status": student.profile_status,
            "current_risk_level": risk.risk_level if risk else "GREEN",
            "current_trend": risk.trend if risk else "STABLE",
            "cri_score": float(risk.cri_score) if risk and risk.cri_score else 0.0,
            "session_count": session_count,
            "allocation_status": allocation.status,
            "next_session_date": allocation.slot_time.isoformat()
            if allocation.slot_time and allocation.status in ["ASSIGNED", "CONFIRMED"]
            else None,
        }
    )


@router.get(
    "/students/{student_id}/risk",
    response_model=dict,
    summary="Get student risk details with explainability",
)
async def get_student_risk(
    student_id: str,
    user=Depends(require_counselor),
    db: AsyncSession = Depends(get_db),
):
    """Get risk level, CRI, trend, engagement flags, and explainability - PRD §8.2"""
    profile_id = await _get_counselor_profile_id(db, user.id)
    if not profile_id:
        raise HTTPException(status_code=403, detail="Counselor profile not found")

    # Verify assignment
    alloc_result = await db.execute(
        select(Allocation).where(
            and_(
                Allocation.student_id == student_id,
                Allocation.counselor_id == profile_id,
                Allocation.status.in_(
                    ["ASSIGNED", "CONFIRMED", "IN_PROGRESS", "COMPLETED"]
                ),
            )
        )
    )
    if not alloc_result.scalar_one_or_none():
        raise HTTPException(
            status_code=403, detail="Not authorized to view this student"
        )

    # Get latest risk log
    risk_result = await db.execute(
        select(RiskLog)
        .where(RiskLog.student_id == student_id)
        .order_by(RiskLog.created_at.desc())
        .limit(1)
    )
    risk = risk_result.scalar_one_or_none()

    if not risk:
        return success_response(data={"message": "No risk assessment available"})

    # Check for engagement flags (missed sessions)
    missed_result = await db.execute(
        select(Session)
        .join(Allocation)
        .where(
            and_(
                Allocation.student_id == student_id,
                Allocation.counselor_id == profile_id,
                Session.status == "MISSED",
            )
        )
    )
    engagement_flags = []
    if missed_result.scalars().all():
        engagement_flags.append("MISSED_PREVIOUS_SESSION")

    return success_response(
        data={
            "student_id": student_id,
            "cri_score": float(risk.cri_score),
            "risk_level": risk.risk_level,
            "trend": risk.trend,
            "engagement_flags": engagement_flags,
            "reasons": risk.reasoning or [],
            "generated_at": risk.created_at.isoformat()
            if hasattr(risk.created_at, "isoformat")
            else str(risk.created_at),
        }
    )


@router.get(
    "/students/{student_id}/timeline",
    response_model=dict,
    summary="Get student longitudinal timeline",
)
async def get_student_timeline(
    student_id: str,
    limit: int = Query(50, le=100, ge=1),
    offset: int = Query(0, ge=0),
    user=Depends(require_counselor),
    db: AsyncSession = Depends(get_db),
):
    """Get unified chronological view of assessments, sessions, risk transitions - PRD §8.2"""
    profile_id = await _get_counselor_profile_id(db, user.id)
    if not profile_id:
        raise HTTPException(status_code=403, detail="Counselor profile not found")

    # Verify assignment
    alloc_result = await db.execute(
        select(Allocation).where(
            and_(
                Allocation.student_id == student_id,
                Allocation.counselor_id == profile_id,
            )
        )
    )
    if not alloc_result.scalar_one_or_none():
        raise HTTPException(
            status_code=403, detail="Not authorized to view this student"
        )

    # Get assessments
    assessment_stmt = (
        select(Assessment)
        .where(Assessment.student_id == student_id)
        .order_by(Assessment.created_at.desc())
        .offset(offset)
        .limit(limit // 2)
    )
    assessments_result = await db.execute(assessment_stmt)
    assessments = assessments_result.scalars().all()

    # Get sessions
    session_stmt = (
        select(Session)
        .join(Allocation)
        .where(Allocation.student_id == student_id)
        .order_by(Session.session_date.desc())
        .offset(offset)
        .limit(limit // 2)
    )
    sessions_result = await db.execute(session_stmt)
    sessions = sessions_result.scalars().all()

    # Get risk logs
    risk_stmt = (
        select(RiskLog)
        .where(RiskLog.student_id == student_id)
        .order_by(RiskLog.created_at.desc())
        .offset(offset)
        .limit(limit // 2)
    )
    risk_result = await db.execute(risk_stmt)
    risk_logs = risk_result.scalars().all()

    # Merge and sort by date
    timeline = []
    for a in assessments:
        timeline.append(
            {
                "type": "ASSESSMENT",
                "date": a.created_at.isoformat()
                if hasattr(a.created_at, "isoformat")
                else str(a.created_at),
                "data": {
                    "assessment_type": a.assessment_type,
                    "phq9_total": a.phq9_total,
                    "gad7_total": a.gad7_total,
                    "risk_processing_status": a.risk_processing_status,
                },
            }
        )
    for s in sessions:
        timeline.append(
            {
                "type": "SESSION",
                "date": (s.session_date or s.created_at).isoformat()
                if hasattr(s.session_date or s.created_at, "isoformat")
                else str(s.session_date or s.created_at),
                "data": {
                    "session_id": s.id,
                    "status": s.status,
                    "session_date": s.session_date.isoformat()
                    if s.session_date
                    else None,
                },
            }
        )
    for r in risk_logs:
        timeline.append(
            {
                "type": "RISK_UPDATE",
                "date": r.created_at.isoformat()
                if hasattr(r.created_at, "isoformat")
                else str(r.created_at),
                "data": {
                    "risk_level": r.risk_level,
                    "cri_score": float(r.cri_score),
                    "trend": r.trend,
                },
            }
        )

    # Sort by date descending
    timeline.sort(key=lambda x: x["date"], reverse=True)

    return success_response(data=timeline[offset : offset + limit])


@router.get(
    "/students/{student_id}/assessments",
    response_model=dict,
    summary="Get student clinical assessments",
)
async def get_student_assessments(
    student_id: str,
    limit: int = Query(20, le=100, ge=1),
    offset: int = Query(0, ge=0),
    user=Depends(require_counselor),
    db: AsyncSession = Depends(get_db),
):
    """Get full clinical assessment data for assigned student - PRD §8.2"""
    profile_id = await _get_counselor_profile_id(db, user.id)
    if not profile_id:
        raise HTTPException(status_code=403, detail="Counselor profile not found")

    # Verify assignment
    alloc_result = await db.execute(
        select(Allocation).where(
            and_(
                Allocation.student_id == student_id,
                Allocation.counselor_id == profile_id,
            )
        )
    )
    if not alloc_result.scalar_one_or_none():
        raise HTTPException(
            status_code=403, detail="Not authorized to view this student"
        )

    # Get assessments
    stmt = (
        select(Assessment)
        .where(Assessment.student_id == student_id)
        .order_by(Assessment.created_at.desc())
        .offset(offset)
        .limit(limit)
    )
    result = await db.execute(stmt)
    assessments = result.scalars().all()

    # Count total
    count_result = await db.execute(
        select(Assessment).where(Assessment.student_id == student_id)
    )
    total = len(count_result.scalars().all())

    assessment_list = []
    for a in assessments:
        assessment_list.append(
            {
                "assessment_id": a.id,
                "assessment_type": a.assessment_type,
                "phq9_scores": a.phq9_scores,
                "phq9_total": a.phq9_total,
                "gad7_scores": a.gad7_scores,
                "gad7_total": a.gad7_total,
                "q9_flag": a.q9_flag,
                "sleep_score": a.sleep_score,
                "academic_stress_score": a.academic_stress_score,
                "social_isolation_level": a.social_isolation_level,
                "risk_processing_status": a.risk_processing_status,
                "created_at": a.created_at.isoformat()
                if hasattr(a.created_at, "isoformat")
                else str(a.created_at),
            }
        )

    return success_response(
        data=assessment_list, meta={"total": total, "limit": limit, "offset": offset}
    )
