from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, and_, or_, desc, extract
from typing import Optional, Tuple
import secrets
import uuid

from pydantic import BaseModel, Field, AliasChoices

from app.core.database import get_db
from app.core.dependencies import require_admin
from app.core.responses import success_response, error_response
from app.core.security import hash_password
from app.models.user import User
from app.models.organization import Organization
from app.models.student_profile import StudentProfile
from app.models.counselor_profile import CounselorProfile
from app.models.allocation import Allocation
from app.models.risk_log import RiskLog
from app.models.audit_log import AuditLog
from app.models.session import Session
from app.models.notification import Notification
from app.models.admin_config import AdminConfig, DEFAULT_CONFIGS
from app.services.audit_service import audit

router = APIRouter(prefix="/admin", tags=["Admin Management"])


# ─── Pydantic Schemas ─────────────────────────────────────────────────────────────


class CreateCounselorRequest(BaseModel):
    email: str
    full_name: str
    password: Optional[str] = None
    max_active_cases: int = Field(
        default=10,
        validation_alias=AliasChoices("max_active_cases", "max_slots_day"),
    )


class UpdateCounselorCapacityRequest(BaseModel):
    max_active_cases: int = Field(
        ...,
        validation_alias=AliasChoices("max_active_cases", "max_slots_day"),
    )


class ReassignCounselorRequest(BaseModel):
    from_counselor_id: str
    to_counselor_id: str
    reason: str = "Manual reassignment"


class ResourcePoliciesUpdate(BaseModel):
    daily_counseling_slots: int
    slot_duration_minutes: int
    working_hours: dict


class RiskThresholdsUpdate(BaseModel):
    green_max: float
    yellow_max: float
    override_rules: dict


class AllocationWeightsUpdate(BaseModel):
    weights: dict


class OrganizationUpdate(BaseModel):
    name: Optional[str] = None
    contact_email: Optional[str] = None
    settings: Optional[dict] = None


# ─── Helper Functions ────────────────────────────────────────────────────────


def _admin_org_id(user) -> str:
    oid = getattr(user, "organization_id", None)
    if not oid:
        raise HTTPException(status_code=400, detail="Admin is not linked to an organization")
    return oid


async def _get_counselor_for_org(
    db: AsyncSession, org_id: str, counselor_id: str
) -> Optional[CounselorProfile]:
    row = await db.execute(
        select(CounselorProfile)
        .join(User, CounselorProfile.user_id == User.id)
        .where(
            CounselorProfile.id == counselor_id,
            User.organization_id == org_id,
        )
    )
    return row.scalar_one_or_none()


async def _get_student_for_org(
    db: AsyncSession, org_id: str, student_id: str
) -> Optional[Tuple[StudentProfile, str]]:
    row = await db.execute(
        select(StudentProfile, User.email)
        .join(User, StudentProfile.user_id == User.id)
        .where(StudentProfile.id == student_id, User.organization_id == org_id)
    )
    return row.first()


async def _ensure_default_configs(db: AsyncSession):
    """Ensure all default configs exist in database."""
    for key, value in DEFAULT_CONFIGS.items():
        result = await db.execute(
            select(AdminConfig).where(AdminConfig.config_key == key)
        )
        existing = result.scalar_one_or_none()
        if not existing:
            config = AdminConfig(
                id=str(uuid.uuid4()),
                config_key=key,
                config_value=value,
                description=f"Default config for {key}",
            )
            db.add(config)
    await db.commit()


async def _get_config(db: AsyncSession, key: str) -> dict:
    """Get config from DB, fallback to default."""
    result = await db.execute(select(AdminConfig).where(AdminConfig.config_key == key))
    config = result.scalar_one_or_none()
    if config:
        return config.config_value
    return DEFAULT_CONFIGS.get(key, {})


# ─── Counselor Management ───────────────────────────────────────────────────


@router.get("/counselors", summary="List all counselors")
async def list_counselors(
    user=Depends(require_admin),
    db: AsyncSession = Depends(get_db),
    offset: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    is_active: Optional[bool] = None,
    search: Optional[str] = None,
):
    """List counselors with aggregated stats (no clinical data)."""
    await _ensure_default_configs(db)
    org_id = _admin_org_id(user)

    stmt = (
        select(CounselorProfile, User.email)
        .join(User, CounselorProfile.user_id == User.id)
        .where(User.organization_id == org_id)
    )
    if is_active is not None:
        stmt = stmt.where(CounselorProfile.is_active == is_active)
    if search:
        stmt = stmt.where(CounselorProfile.full_name.ilike(f"%{search}%"))

    stmt = stmt.offset(offset).limit(limit)
    result = await db.execute(stmt)
    rows = result.all()

    counselors = []
    for profile, email in rows:
        active_result = await db.execute(
            select(func.count(Allocation.id)).where(
                and_(
                    Allocation.counselor_id == profile.id,
                    Allocation.status.in_(["ASSIGNED", "CONFIRMED"]),
                )
            )
        )
        active_cases = active_result.scalar() or 0

        counselors.append(
            {
                "id": profile.id,
                "counselor_id": profile.id,
                "user_id": profile.user_id,
                "email": email,
                "full_name": profile.full_name,
                "is_active": profile.is_active,
                "max_active_cases": profile.max_active_cases,
                "max_slots_day": profile.max_slots_day,
                "assigned_students": active_cases,
                "current_active_cases": active_cases,
                "available_slots": max(0, profile.max_active_cases - active_cases),
                "created_at": profile.created_at.isoformat()
                if hasattr(profile.created_at, "isoformat")
                else str(profile.created_at),
            }
        )

    return success_response(data=counselors)


@router.get("/counselors/{counselor_id}", summary="Get one counselor")
async def get_counselor(
    counselor_id: str,
    user=Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    profile = await _get_counselor_for_org(db, _admin_org_id(user), counselor_id)
    if not profile:
        raise HTTPException(status_code=404, detail="Counselor not found")
    email_row = await db.execute(select(User.email).where(User.id == profile.user_id))
    email = email_row.scalar_one()
    active_result = await db.execute(
        select(func.count(Allocation.id)).where(
            and_(
                Allocation.counselor_id == profile.id,
                Allocation.status.in_(["ASSIGNED", "CONFIRMED"]),
            )
        )
    )
    active_cases = active_result.scalar() or 0
    return success_response(
        data={
            "id": profile.id,
            "counselor_id": profile.id,
            "user_id": profile.user_id,
            "email": email,
            "full_name": profile.full_name,
            "is_active": profile.is_active,
            "max_active_cases": profile.max_active_cases,
            "max_slots_day": profile.max_slots_day,
            "assigned_students": active_cases,
            "current_active_cases": active_cases,
        }
    )


@router.post("/counselors", summary="Create counselor account")
async def create_counselor(
    req: CreateCounselorRequest,
    user=Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    """Create a new counselor user and profile with edge case handling."""
    org_id = _admin_org_id(user)
    email = req.email.lower().strip()

    # Check duplicate email (case-insensitive)
    existing_user = await db.execute(
        select(User).where(func.lower(User.email) == email)
    )
    if existing_user.scalar_one_or_none():
        raise HTTPException(status_code=409, detail="Email already registered")

    # Validate capacity
    if req.max_active_cases < 1 or req.max_active_cases > 50:
        raise HTTPException(
            status_code=400, detail="max_active_cases must be between 1 and 50"
        )

    plain_password = req.password or secrets.token_urlsafe(14)
    user_id = str(uuid.uuid4())
    profile_id = str(uuid.uuid4())

    new_user = User(
        id=user_id,
        organization_id=org_id,
        role="counselor",
        email=email,
        password_hash=hash_password(plain_password),
        status="ACTIVE",
    )
    profile = CounselorProfile(
        id=profile_id,
        user_id=user_id,
        full_name=req.full_name,
        max_slots_day=req.max_active_cases,
        max_active_cases=req.max_active_cases,
        is_active=True,
    )

    db.add(new_user)
    db.add(profile)

    await audit.log(
        db,
        action="COUNSELOR_CREATED",
        actor_id=user.id,
        actor_role="admin",
        metadata={
            "counselor_email": email,
            "max_active_cases": req.max_active_cases,
        },
        resource_id=profile_id,
    )

    await db.commit()

    return success_response(
        data={
            "user_id": user_id,
            "profile_id": profile_id,
            "counselor_id": profile_id,
            "email": email,
            "role": "counselor",
            "temporary_password": plain_password if not req.password else None,
        },
        message="Counselor created successfully",
    )


@router.patch(
    "/counselors/{counselor_id}/status", summary="Activate/Deactivate counselor"
)
async def update_counselor_status(
    counselor_id: str,
    is_active: bool,
    user=Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    """Enable or disable a counselor account with edge case handling."""
    org_id = _admin_org_id(user)
    profile = await _get_counselor_for_org(db, org_id, counselor_id)
    if not profile:
        raise HTTPException(status_code=404, detail="Counselor not found")

    # Check for active allocations before deactivation
    if not is_active:
        active_allocations = await db.execute(
            select(func.count(Allocation.id)).where(
                and_(
                    Allocation.counselor_id == counselor_id,
                    Allocation.status.in_(["ASSIGNED", "CONFIRMED"]),
                )
            )
        )
        active_count = active_allocations.scalar() or 0
        if active_count > 0:
            raise HTTPException(
                status_code=409,
                detail=f"Cannot deactivate: counselor has {active_count} active allocation(s). Reassign them first.",
            )

    old_status = profile.is_active
    profile.is_active = is_active
    await db.commit()

    await audit.log(
        db,
        action="COUNSELOR_STATUS_CHANGED",
        actor_id=user.id,
        actor_role="admin",
        metadata={"old_status": old_status, "new_status": is_active},
        resource_id=counselor_id,
    )

    return success_response(
        message=f"Counselor {'activated' if is_active else 'deactivated'}",
    )


@router.patch(
    "/counselors/{counselor_id}/capacity", summary="Update counselor capacity"
)
async def update_counselor_capacity(
    counselor_id: str,
    req: UpdateCounselorCapacityRequest,
    user=Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    """Update counselor max active cases with edge case handling."""
    org_id = _admin_org_id(user)
    profile = await _get_counselor_for_org(db, org_id, counselor_id)
    if not profile:
        raise HTTPException(status_code=404, detail="Counselor not found")

    if req.max_active_cases < 1 or req.max_active_cases > 50:
        raise HTTPException(
            status_code=400, detail="max_active_cases must be between 1 and 50"
        )

    # Check current active cases
    active_result = await db.execute(
        select(func.count(Allocation.id)).where(
            and_(
                Allocation.counselor_id == counselor_id,
                Allocation.status.in_(["ASSIGNED", "CONFIRMED", "IN_PROGRESS"]),
            )
        )
    )
    current_active = active_result.scalar() or 0

    if req.max_active_cases < current_active:
        raise HTTPException(
            status_code=409,
            detail=f"Cannot reduce capacity below current active cases ({current_active})",
        )

    old_capacity = profile.max_active_cases
    profile.max_active_cases = req.max_active_cases
    profile.max_slots_day = req.max_active_cases
    await db.commit()

    await audit.log(
        db,
        action="COUNSELOR_CAPACITY_UPDATED",
        actor_id=user.id,
        actor_role="admin",
        metadata={"old_capacity": old_capacity, "new_capacity": req.max_active_cases},
        resource_id=counselor_id,
    )

    return success_response(
        message="Counselor capacity updated",
        data={
            "max_active_cases": req.max_active_cases,
            "current_active_cases": current_active,
        },
    )


@router.delete("/counselors/{counselor_id}", summary="Delete counselor")
async def delete_counselor(
    counselor_id: str,
    user=Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    """Delete a counselor with complete edge case handling."""
    org_id = _admin_org_id(user)
    profile = await _get_counselor_for_org(db, org_id, counselor_id)
    if not profile:
        raise HTTPException(status_code=404, detail="Counselor not found")

    # Check for any allocations
    allocations_result = await db.execute(
        select(func.count(Allocation.id)).where(Allocation.counselor_id == counselor_id)
    )
    allocation_count = allocations_result.scalar() or 0

    # Check for active allocations
    active_result = await db.execute(
        select(func.count(Allocation.id)).where(
            and_(
                Allocation.counselor_id == counselor_id,
                Allocation.status.in_(["ASSIGNED", "CONFIRMED", "IN_PROGRESS"]),
            )
        )
    )
    active_count = active_result.scalar() or 0

    # Get user_id for deletion
    user_id = profile.user_id

    # Handle allocations based on status
    if active_count > 0:
        # Release active allocations back to pending
        await db.execute(
            Allocation.__table__.update()
            .where(
                and_(
                    Allocation.counselor_id == counselor_id,
                    Allocation.status.in_(["ASSIGNED", "CONFIRMED", "IN_PROGRESS"]),
                )
            )
            .values(status="PENDING_RANKING", counselor_id=None)
        )

    if allocation_count > 0:
        # Delete old completed allocations
        await db.execute(
            Allocation.__table__.update()
            .where(
                and_(
                    Allocation.counselor_id == counselor_id,
                    Allocation.status.in_(
                        ["COMPLETED", "DECLINED", "EXPIRED", "CANCELLED"]
                    ),
                )
            )
            .values(counselor_id=None)
        )

    # Delete counselor profile
    await db.execute(
        CounselorProfile.__table__.delete().where(CounselorProfile.id == counselor_id)
    )

    # Delete user account
    await db.execute(User.__table__.delete().where(User.id == user_id))

    await audit.log(
        db,
        action="COUNSELOR_DELETED",
        actor_id=user.id,
        actor_role="admin",
        metadata={
            "deleted_counselor_id": counselor_id,
            "user_id": user_id,
            "allocations_handled": allocation_count,
        },
    )

    await db.commit()

    return success_response(message="Counselor deleted successfully")


@router.post("/counselors/reassign", summary="Reassign students between counselors")
async def reassign_counselor_students(
    req: ReassignCounselorRequest,
    user=Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    """Reassign all students from one counselor to another."""
    org_id = _admin_org_id(user)
    from_profile = await _get_counselor_for_org(db, org_id, req.from_counselor_id)
    if not from_profile:
        raise HTTPException(status_code=404, detail="Source counselor not found")

    to_profile = await _get_counselor_for_org(db, org_id, req.to_counselor_id)
    if not to_profile:
        raise HTTPException(status_code=404, detail="Target counselor not found")

    if req.from_counselor_id == req.to_counselor_id:
        raise HTTPException(
            status_code=400, detail="Source and target counselors must be different"
        )

    # Get active allocations count
    active_result = await db.execute(
        select(func.count(Allocation.id)).where(
            and_(
                Allocation.counselor_id == req.from_counselor_id,
                Allocation.status.in_(["ASSIGNED", "CONFIRMED", "IN_PROGRESS"]),
            )
        )
    )
    active_count = active_result.scalar() or 0

    # Check target capacity
    target_active_result = await db.execute(
        select(func.count(Allocation.id)).where(
            and_(
                Allocation.counselor_id == req.to_counselor_id,
                Allocation.status.in_(["ASSIGNED", "CONFIRMED", "IN_PROGRESS"]),
            )
        )
    )
    target_active_count = target_active_result.scalar() or 0

    available_slots = to_profile.max_active_cases - target_active_count
    if active_count > available_slots:
        raise HTTPException(
            status_code=409,
            detail=f"Target counselor has only {available_slots} available slots, but source has {active_count} active allocations",
        )

    # Perform reassignment
    await db.execute(
        Allocation.__table__.update()
        .where(
            and_(
                Allocation.counselor_id == req.from_counselor_id,
                Allocation.status.in_(["ASSIGNED", "CONFIRMED", "IN_PROGRESS"]),
            )
        )
        .values(counselor_id=req.to_counselor_id)
    )

    await audit.log(
        db,
        action="STUDENTS_REASSIGNED",
        actor_id=user.id,
        actor_role="admin",
        metadata={
            "from_counselor": req.from_counselor_id,
            "to_counselor": req.to_counselor_id,
            "count": active_count,
            "reason": req.reason,
        },
    )

    await db.commit()

    return success_response(
        message=f"Successfully reassigned {active_count} students",
        data={"reassigned_count": active_count},
    )


# ─── Student Management ────────────────────────────────────────────────────


@router.get("/students", summary="List all students (aggregated data only)")
async def list_students(
    user=Depends(require_admin),
    db: AsyncSession = Depends(get_db),
    offset: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    risk_level: Optional[str] = None,
    status: Optional[str] = None,
    search: Optional[str] = None,
):
    """List students with risk summaries - PRD §9.3: Admin sees aggregated data only."""
    org_id = _admin_org_id(user)

    rn_risk = func.row_number().over(
        partition_by=RiskLog.student_id,
        order_by=RiskLog.created_at.desc(),
    ).label("rn_risk")

    risk_ranked = (
        select(RiskLog.student_id, RiskLog.risk_level, RiskLog.cri_score, rn_risk).where(
            RiskLog.student_id.in_(
                select(StudentProfile.id)
                .join(User, StudentProfile.user_id == User.id)
                .where(User.organization_id == org_id)
            )
        )
    ).subquery()

    risk_sq = (
        select(
            risk_ranked.c.student_id,
            risk_ranked.c.risk_level,
            risk_ranked.c.cri_score,
        ).where(risk_ranked.c.rn_risk == 1)
    ).subquery()

    rn_alloc = func.row_number().over(
        partition_by=Allocation.student_id,
        order_by=Allocation.created_at.desc(),
    ).label("rn_alloc")

    alloc_ranked = (
        select(
            Allocation.student_id,
            CounselorProfile.full_name.label("counselor_name"),
            rn_alloc,
        )
        .join(CounselorProfile, Allocation.counselor_id == CounselorProfile.id)
        .where(
            Allocation.counselor_id.isnot(None),
            Allocation.status.in_(["ASSIGNED", "CONFIRMED", "IN_PROGRESS"]),
            Allocation.student_id.in_(
                select(StudentProfile.id)
                .join(User, StudentProfile.user_id == User.id)
                .where(User.organization_id == org_id)
            ),
        )
    ).subquery()

    counselor_sq = (
        select(alloc_ranked.c.student_id, alloc_ranked.c.counselor_name).where(
            alloc_ranked.c.rn_alloc == 1
        )
    ).subquery()

    stmt = (
        select(
            StudentProfile,
            User.email,
            risk_sq.c.risk_level,
            risk_sq.c.cri_score,
            counselor_sq.c.counselor_name,
        )
        .join(User, StudentProfile.user_id == User.id)
        .outerjoin(risk_sq, StudentProfile.id == risk_sq.c.student_id)
        .outerjoin(counselor_sq, StudentProfile.id == counselor_sq.c.student_id)
        .where(User.organization_id == org_id)
    )

    if risk_level:
        stmt = stmt.where(risk_sq.c.risk_level == risk_level)
    if status:
        stmt = stmt.where(StudentProfile.profile_status == status)
    if search:
        stmt = stmt.where(
            or_(
                StudentProfile.full_name.ilike(f"%{search}%"),
                StudentProfile.college_id.ilike(f"%{search}%"),
            )
        )

    stmt = stmt.order_by(desc(StudentProfile.updated_at)).offset(offset).limit(limit)
    result = await db.execute(stmt)
    rows = result.all()

    students = []
    for profile, email, r_level, cri, counselor_name in rows:
        sessions_result = await db.execute(
            select(func.count(Allocation.id)).where(
                and_(
                    Allocation.student_id == profile.id,
                    Allocation.status == "COMPLETED",
                )
            )
        )
        sessions_count = sessions_result.scalar() or 0

        last_ts = profile.updated_at or profile.created_at
        last_activity = (
            last_ts.isoformat() if hasattr(last_ts, "isoformat") else str(last_ts)
        )

        students.append(
            {
                "id": profile.id,
                "student_id": profile.id,
                "user_id": profile.user_id,
                "email": email,
                "full_name": profile.full_name,
                "college_id": profile.college_id,
                "profile_status": profile.profile_status,
                "consent_flag": profile.consent_flag,
                "risk_level": r_level or "UNKNOWN",
                "cri_score": float(cri) if cri is not None else None,
                "completed_sessions": sessions_count,
                "last_activity": last_activity,
                "assigned_counselor": counselor_name,
                "created_at": profile.created_at.isoformat()
                if hasattr(profile.created_at, "isoformat")
                else str(profile.created_at),
            }
        )

    return success_response(data=students)


@router.get("/students/{student_id}", summary="Get student details (admin-safe view)")
async def get_student_details(
    student_id: str,
    user=Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    """Get student details - PRD §9.3: No raw clinical data, only CRI scores."""
    row = await _get_student_for_org(db, _admin_org_id(user), student_id)
    if not row:
        raise HTTPException(status_code=404, detail="Student not found")

    profile, email = row

    risk_result = await db.execute(
        select(RiskLog)
        .where(RiskLog.student_id == student_id)
        .order_by(RiskLog.created_at.desc())
        .limit(10)
    )
    risk_logs = risk_result.scalars().all()

    return success_response(
        data={
            "id": profile.id,
            "student_id": profile.id,
            "email": email,
            "full_name": profile.full_name,
            "college_id": profile.college_id,
            "profile_status": profile.profile_status,
            "consent_flag": profile.consent_flag,
            "guardian_contact": profile.guardian_contact,
            "risk_history": [
                {
                    "cri_score": float(log.cri_score),
                    "risk_level": log.risk_level,
                    "trend": log.trend,
                    "created_at": log.created_at.isoformat()
                    if hasattr(log.created_at, "isoformat")
                    else str(log.created_at),
                }
                for log in risk_logs
            ],
        }
    )


# ─── System Health ────────────────────────────────────────────────────────


@router.get("/system-health", summary="System health check")
async def system_health(
    user=Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    """Check database connectivity and basic system stats."""
    try:
        org_id = _admin_org_id(user)

        user_count = (
            await db.execute(
                select(func.count(User.id)).where(User.organization_id == org_id)
            )
        ).scalar()

        student_count = await db.execute(
            select(func.count(StudentProfile.id))
            .join(User, StudentProfile.user_id == User.id)
            .where(User.organization_id == org_id)
        )
        counselor_count = await db.execute(
            select(func.count(CounselorProfile.id))
            .join(User, CounselorProfile.user_id == User.id)
            .where(User.organization_id == org_id)
        )
        sp_in_org = (
            select(StudentProfile.id)
            .join(User, StudentProfile.user_id == User.id)
            .where(User.organization_id == org_id)
        )
        allocation_count = await db.execute(
            select(func.count(Allocation.id)).where(Allocation.student_id.in_(sp_in_org))
        )

        avg_wait_stmt = select(
            func.avg(
                extract("epoch", func.coalesce(Allocation.slot_time, func.now()) - Allocation.created_at)
                / 86400.0
            )
        ).where(
            and_(
                Allocation.status.in_(["ASSIGNED", "CONFIRMED"]),
                Allocation.student_id.in_(sp_in_org),
            )
        )
        avg_wait_res = await db.execute(avg_wait_stmt)
        avg_wait = avg_wait_res.scalar() or 0

        return success_response(
            data={
                "status": "healthy",
                "database": "connected",
                "counts": {
                    "users": user_count,
                    "students": student_count.scalar(),
                    "counselors": counselor_count.scalar(),
                    "allocations": allocation_count.scalar(),
                },
                "metrics": {
                    "average_wait_time_days": round(float(avg_wait), 1) if avg_wait else 0.0,
                },
            }
        )
    except Exception as e:
        return success_response(
            data={
                "status": "unhealthy",
                "error": str(e),
            }
        )


# ─── Configuration (Persistent) ────────────────────────────────────────────


@router.get("/config/resource-policies", summary="Get resource policies")
async def get_resource_policies(
    user=Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    """Get slot count, duration, working hours - PRD §9.2"""
    await _ensure_default_configs(db)
    config = await _get_config(db, "resource_policies")
    return success_response(data=config)


@router.put("/config/resource-policies", summary="Update resource policies")
async def update_resource_policies(
    req: ResourcePoliciesUpdate,
    user=Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    """Update slot count, duration, working hours - audit logged - PRD §9.2"""
    # Validate input
    if req.daily_counseling_slots < 1 or req.daily_counseling_slots > 500:
        raise HTTPException(
            status_code=400, detail="daily_counseling_slots must be between 1 and 500"
        )
    if req.slot_duration_minutes < 15 or req.slot_duration_minutes > 120:
        raise HTTPException(
            status_code=400, detail="slot_duration_minutes must be between 15 and 120"
        )

    config_value = {
        "daily_counseling_slots": req.daily_counseling_slots,
        "slot_duration_minutes": req.slot_duration_minutes,
        "working_hours": req.working_hours,
    }

    result = await db.execute(
        select(AdminConfig).where(AdminConfig.config_key == "resource_policies")
    )
    config = result.scalar_one_or_none()
    if config:
        config.config_value = config_value
        config.updated_by = user.id
    else:
        config = AdminConfig(
            id=str(uuid.uuid4()),
            config_key="resource_policies",
            config_value=config_value,
            updated_by=user.id,
        )
        db.add(config)

    await audit.log(
        db,
        action="RESOURCE_POLICY_UPDATED",
        actor_id=user.id,
        actor_role="admin",
        metadata=config_value,
    )

    await db.commit()
    return success_response(message="Resource policies updated", data=config_value)


@router.get("/config/risk-thresholds", summary="Get risk thresholds")
async def get_risk_thresholds(
    user=Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    """Get CRI thresholds and override rules - PRD §9.6"""
    await _ensure_default_configs(db)
    config = await _get_config(db, "risk_thresholds")
    return success_response(data=config)


@router.put("/config/risk-thresholds", summary="Update risk thresholds")
async def update_risk_thresholds(
    req: RiskThresholdsUpdate,
    user=Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    """Update CRI thresholds and override rules - audit logged - PRD §9.6"""
    if req.green_max < 0 or req.green_max > 1:
        raise HTTPException(status_code=400, detail="green_max must be between 0 and 1")
    if req.yellow_max < 0 or req.yellow_max > 1:
        raise HTTPException(
            status_code=400, detail="yellow_max must be between 0 and 1"
        )
    if req.green_max >= req.yellow_max:
        raise HTTPException(
            status_code=400, detail="green_max must be less than yellow_max"
        )

    config_value = {
        "risk_thresholds": {"green_max": req.green_max, "yellow_max": req.yellow_max},
        "override_rules": req.override_rules,
    }

    result = await db.execute(
        select(AdminConfig).where(AdminConfig.config_key == "risk_thresholds")
    )
    config = result.scalar_one_or_none()
    if config:
        config.config_value = config_value
        config.updated_by = user.id
    else:
        config = AdminConfig(
            id=str(uuid.uuid4()),
            config_key="risk_thresholds",
            config_value=config_value,
            updated_by=user.id,
        )
        db.add(config)

    await audit.log(
        db,
        action="RISK_THRESHOLDS_UPDATED",
        actor_id=user.id,
        actor_role="admin",
        metadata=config_value,
    )

    await db.commit()
    return success_response(message="Risk thresholds updated", data=config_value)


@router.get("/config/allocation-weights", summary="Get allocation weights")
async def get_allocation_weights(
    user=Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    """Get priority score weights - PRD §9.6"""
    await _ensure_default_configs(db)
    config = await _get_config(db, "allocation_weights")
    return success_response(data=config)


@router.put("/config/allocation-weights", summary="Update allocation weights")
async def update_allocation_weights(
    req: AllocationWeightsUpdate,
    user=Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    """Update priority score weights - audit logged - PRD §9.6"""
    weights = req.weights
    total = sum(weights.values())
    if abs(total - 1.0) > 0.01:
        raise HTTPException(status_code=400, detail="Weights must sum to 1.0")

    result = await db.execute(
        select(AdminConfig).where(AdminConfig.config_key == "allocation_weights")
    )
    config = result.scalar_one_or_none()
    if config:
        config.config_value = {"weights": weights}
        config.updated_by = user.id
    else:
        config = AdminConfig(
            id=str(uuid.uuid4()),
            config_key="allocation_weights",
            config_value={"weights": weights},
            updated_by=user.id,
        )
        db.add(config)

    await audit.log(
        db,
        action="ALLOCATION_WEIGHTS_UPDATED",
        actor_id=user.id,
        actor_role="admin",
        metadata={"weights": weights},
    )

    await db.commit()
    return success_response(message="Allocation weights updated", data=req.weights)


# ─── Organization (single-tenant / licensed deployment) ────────────────────────


@router.get("/organization", summary="Get organization for this deployment")
async def get_organization(
    user=Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    org_id = _admin_org_id(user)
    res = await db.execute(select(Organization).where(Organization.id == org_id))
    org = res.scalar_one_or_none()
    if not org:
        raise HTTPException(status_code=404, detail="Organization not found")
    return success_response(
        data={
            "id": org.id,
            "name": org.name,
            "slug": org.slug,
            "contact_email": org.contact_email,
            "settings": org.settings or {},
            "created_at": org.created_at.isoformat()
            if hasattr(org.created_at, "isoformat")
            else str(org.created_at),
        }
    )


@router.patch("/organization", summary="Update organization profile")
async def patch_organization(
    req: OrganizationUpdate,
    user=Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    org_id = _admin_org_id(user)
    res = await db.execute(select(Organization).where(Organization.id == org_id))
    org = res.scalar_one_or_none()
    if not org:
        raise HTTPException(status_code=404, detail="Organization not found")
    if req.name is not None:
        org.name = req.name.strip()
    if req.contact_email is not None:
        org.contact_email = req.contact_email.strip() or None
    if req.settings is not None:
        org.settings = req.settings
    await audit.log(
        db,
        action="ORGANIZATION_UPDATED",
        actor_id=user.id,
        actor_role="admin",
        metadata={"organization_id": org_id},
        resource_id=org_id,
    )
    await db.commit()
    return success_response(
        message="Organization updated",
        data={
            "id": org.id,
            "name": org.name,
            "slug": org.slug,
            "contact_email": org.contact_email,
            "settings": org.settings or {},
        },
    )


# ─── Analytics ─────────────────────────────────────────────────────────────────────────────────


@router.get("/analytics/risk-distribution", summary="Get aggregated risk distribution")
async def get_risk_distribution(
    user=Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    """Get risk distribution as percentages only - PRD §9.3"""
    org_id = _admin_org_id(user)

    rn = func.row_number().over(
        partition_by=RiskLog.student_id,
        order_by=RiskLog.created_at.desc(),
    ).label("rn")

    risk_ranked = (
        select(RiskLog.student_id, RiskLog.risk_level, rn).where(
            RiskLog.student_id.in_(
                select(StudentProfile.id)
                .join(User, StudentProfile.user_id == User.id)
                .where(User.organization_id == org_id)
            )
        )
    ).subquery()

    stmt = (
        select(risk_ranked.c.risk_level, func.count())
        .where(risk_ranked.c.rn == 1)
        .group_by(risk_ranked.c.risk_level)
    )

    result = await db.execute(stmt)

    distribution = {"GREEN": 0, "YELLOW": 0, "RED": 0}
    total = 0
    for level, count in result.all():
        if level in distribution:
            distribution[level] = count
            total += count

    if total > 0:
        return success_response(
            data={
                "green": round(distribution["GREEN"] / total * 100, 1),
                "yellow": round(distribution["YELLOW"] / total * 100, 1),
                "red": round(distribution["RED"] / total * 100, 1),
                "total_students": total,
            }
        )

    return success_response(
        data={"green": 100.0, "yellow": 0.0, "red": 0.0, "total_students": 0}
    )


@router.get("/analytics/resource-utilization", summary="Get slot utilization metrics")
async def get_resource_utilization(
    user=Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    """Get slot utilization, wait time, backlog - PRD §9.3"""
    org_id = _admin_org_id(user)

    total_counselors = await db.execute(
        select(func.count(CounselorProfile.id))
        .join(User, CounselorProfile.user_id == User.id)
        .where(
            CounselorProfile.is_active == True,
            User.organization_id == org_id,
        )
    )
    counselor_count = total_counselors.scalar() or 0

    await _ensure_default_configs(db)
    config = await _get_config(db, "resource_policies")
    daily_slots = config.get("daily_counseling_slots", 60)
    total_slots = counselor_count * daily_slots

    sp_in_org = (
        select(StudentProfile.id)
        .join(User, StudentProfile.user_id == User.id)
        .where(User.organization_id == org_id)
    )

    used_result = await db.execute(
        select(func.count(Allocation.id)).where(
            and_(
                Allocation.status.in_(["CONFIRMED", "COMPLETED"]),
                Allocation.student_id.in_(sp_in_org),
            )
        )
    )
    used_slots = used_result.scalar() or 0

    backlog_result = await db.execute(
        select(func.count(Allocation.id)).where(
            and_(
                Allocation.status == "PENDING_RANKING",
                Allocation.student_id.in_(sp_in_org),
            )
        )
    )
    backlog = backlog_result.scalar() or 0

    avg_wait_stmt = select(
        func.avg(
            extract("epoch", func.coalesce(Allocation.slot_time, func.now()) - Allocation.created_at)
            / 86400.0
        )
    ).where(
        and_(
            Allocation.status.in_(["ASSIGNED", "CONFIRMED"]),
            Allocation.student_id.in_(sp_in_org),
        )
    )
    avg_wait_res = await db.execute(avg_wait_stmt)
    avg_wait = avg_wait_res.scalar()

    return success_response(
        data={
            "slots_available": total_slots,
            "slots_used": used_slots,
            "utilization_rate": round(used_slots / total_slots * 100, 1)
            if total_slots > 0
            else 0,
            "backlog_unassigned_students": backlog,
            "average_wait_time_days": round(float(avg_wait), 1) if avg_wait else 0.0,
            "active_counselors": counselor_count,
        }
    )


@router.get("/analytics/engagement", summary="Get engagement metrics")
async def get_engagement_metrics(
    user=Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    """Get assessment completion, no-show, drop-off rates - PRD §9.3"""
    org_id = _admin_org_id(user)

    total_students = await db.execute(
        select(func.count(StudentProfile.id))
        .join(User, StudentProfile.user_id == User.id)
        .where(User.organization_id == org_id)
    )
    total = total_students.scalar() or 0

    sp_in_org = (
        select(StudentProfile.id)
        .join(User, StudentProfile.user_id == User.id)
        .where(User.organization_id == org_id)
    )

    no_show_result = await db.execute(
        select(func.count(Session.id))
        .join(Allocation, Session.allocation_id == Allocation.id)
        .where(
            and_(
                Session.status == "MISSED",
                Allocation.student_id.in_(sp_in_org),
            )
        )
    )
    no_shows = no_show_result.scalar() or 0

    completed_result = await db.execute(
        select(func.count(Allocation.id)).where(
            and_(
                Allocation.status == "COMPLETED",
                Allocation.student_id.in_(sp_in_org),
            )
        )
    )
    completed = completed_result.scalar() or 0

    assessment_result = await db.execute(
        select(func.count(RiskLog.id)).where(
            RiskLog.student_id.in_(sp_in_org),
        )
    )
    total_assessments = assessment_result.scalar() or 0

    return success_response(
        data={
            "total_students": total,
            "assessment_completion_rate": round(total_assessments / total * 100, 1)
            if total > 0
            else 0,
            "no_show_rate": round(no_shows / max(total, 1) * 100, 1) if total > 0 else 0,
            "drop_off_rate": 0.0,
            "completion_rate": round(completed / max(total, 1) * 100, 1) if total > 0 else 0,
            "period_days": 30,
        }
    )


# ─── Alerts ─────────────────────────────────────────���─���───────────────────────────


@router.get("/alerts", summary="Get active system alerts")
async def get_alerts(
    user=Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    """Get active alerts for counselor overload, RED cases - PRD §9.7"""
    org_id = _admin_org_id(user)
    await _ensure_default_configs(db)
    alert_config = await _get_config(db, "alert_thresholds")

    sp_in_org = (
        select(StudentProfile.id)
        .join(User, StudentProfile.user_id == User.id)
        .where(User.organization_id == org_id)
    )

    alerts = []

    rn = func.row_number().over(
        partition_by=RiskLog.student_id,
        order_by=RiskLog.created_at.desc(),
    ).label("rn")

    risk_ranked = (
        select(RiskLog.student_id, RiskLog.risk_level, rn).where(
            RiskLog.student_id.in_(sp_in_org)
        )
    ).subquery()

    red_count_result = await db.execute(
        select(func.count())
        .select_from(risk_ranked)
        .where(and_(risk_ranked.c.rn == 1, risk_ranked.c.risk_level == "RED"))
    )
    red_count = red_count_result.scalar() or 0
    red_threshold = alert_config.get("red_case_warning", 5)

    if red_count >= red_threshold:
        alerts.append(
            {
                "type": "warning",
                "label": "High RED case count",
                "detail": f"{red_count} students classified as RED. Consider adding temporary slots.",
                "action": "ADD_SLOTS",
            }
        )

    backlog_result = await db.execute(
        select(func.count(Allocation.id)).where(
            and_(
                Allocation.status == "PENDING_RANKING",
                Allocation.student_id.in_(sp_in_org),
            )
        )
    )
    backlog = backlog_result.scalar() or 0
    backlog_threshold = alert_config.get("backlog_warning", 10)

    if backlog >= backlog_threshold:
        alerts.append(
            {
                "type": "info",
                "label": "Allocation backlog",
                "detail": f"{backlog} students awaiting assignment.",
                "action": "RUN_ALLOCATION",
            }
        )

    overloaded_result = await db.execute(
        select(func.count(CounselorProfile.id))
        .join(User, CounselorProfile.user_id == User.id)
        .where(
            User.organization_id == org_id,
            CounselorProfile.is_active == True,
            CounselorProfile.current_active_cases >= CounselorProfile.max_active_cases,
        )
    )
    overloaded_counselors = overloaded_result.scalar() or 0

    if overloaded_counselors > 0:
        alerts.append(
            {
                "type": "warning",
                "label": "Counselor overload",
                "detail": f"{overloaded_counselors} counselor(s) at full capacity.",
                "action": "ADD_COUNSELOR",
            }
        )

    return success_response(data=alerts)


# ─── Allocation Transparency ────────────────────────────────────────────────


@router.get("/allocations", summary="Get allocation transparency data")
async def get_allocations(
    limit: int = Query(20, le=100, ge=1),
    offset: int = Query(0, ge=0),
    status: Optional[str] = None,
    user=Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    """Get which students got slots with abstracted reason - PRD §9.4"""
    org_id = _admin_org_id(user)

    stmt = (
        select(Allocation, StudentProfile.full_name, CounselorProfile.full_name)
        .join(StudentProfile, Allocation.student_id == StudentProfile.id)
        .join(User, StudentProfile.user_id == User.id)
        .outerjoin(CounselorProfile, Allocation.counselor_id == CounselorProfile.id)
        .where(User.organization_id == org_id)
    )

    if status:
        stmt = stmt.where(Allocation.status == status)

    stmt = stmt.order_by(Allocation.created_at.desc()).offset(offset).limit(limit)
    result = await db.execute(stmt)
    rows = result.all()

    allocations = []
    for alloc, student_name, counselor_name in rows:
        allocations.append(
            {
                "allocation_id": alloc.id,
                "student_name": student_name,
                "counselor_name": counselor_name or "Unassigned",
                "slot_time": alloc.slot_time.isoformat() if alloc.slot_time else None,
                "status": alloc.status,
                "priority_score": float(alloc.priority_score)
                if alloc.priority_score
                else None,
                "reason_summary": alloc.reason_summary
                or "Priority based on risk and availability",
                "created_at": alloc.created_at.isoformat()
                if hasattr(alloc.created_at, "isoformat")
                else str(alloc.created_at),
            }
        )

    return success_response(data=allocations)
