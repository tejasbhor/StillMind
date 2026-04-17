"""
Internal API endpoints for background workers and system jobs.
PRD §10.3 - These endpoints require service key authentication.
"""

import uuid
from fastapi import APIRouter, Depends, HTTPException, Header
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_
from typing import Optional

from app.core.database import get_db
from app.core.dependencies import require_internal
from app.core.responses import success_response, error_response
from app.models.assessment import Assessment
from app.models.student_profile import StudentProfile
from app.models.risk_log import RiskLog
from app.models.allocation import Allocation
from app.models.notification import Notification
from app.models.audit_log import AuditLog
from app.modules.risk_engine.engine import (
    calculate_cri,
    determine_risk_level,
    generate_reasoning,
    normalize_behavioral,
)

router = APIRouter(prefix="/internal", tags=["Internal Jobs"])


# ============================================================================
# RISK COMPUTATION - PRD §5 & §13
# ============================================================================


@router.post("/risk/compute", summary="Compute CRI for a student after assessment")
async def compute_risk(
    req: dict,
    user=Depends(require_internal),
    db: AsyncSession = Depends(get_db),
):
    """
    Internal endpoint to compute CRI after assessment submission.
    PRD §5: CRI = (0.45 x PHQ9/27) + (0.35 x GAD7/21) + (0.20 x Behavioral_Score)
    """
    student_id = req.get("student_id")
    assessment_id = req.get("assessment_id")
    trigger = req.get("trigger", "ASSESSMENT_SUBMITTED")

    if not student_id or not assessment_id:
        return error_response(
            "VALIDATION_ERROR", "student_id and assessment_id are required"
        )

    # Get assessment
    result = await db.execute(select(Assessment).where(Assessment.id == assessment_id))
    assessment = result.scalar_one_or_none()

    if not assessment:
        raise HTTPException(status_code=404, detail="Assessment not found")

    # Calculate CRI
    phq9_total = assessment.phq9_total or 0
    gad7_total = assessment.gad7_total or 0
    behavioral_score = normalize_behavioral(
        assessment.sleep_score,
        assessment.academic_stress_score,
        assessment.social_isolation_level,
    )
    cri = calculate_cri(phq9_total, gad7_total, behavioral_score)

    # Determine risk level with overrides
    risk_level = determine_risk_level(
        cri,
        assessment.q9_flag,
        assessment.sleep_score,
        assessment.academic_stress_score,
    )

    # Generate reasoning (explainability - PRD §5.5)
    reasoning = generate_reasoning(
        cri,
        phq9_total,
        assessment.q9_flag,
        assessment.sleep_score,
        assessment.academic_stress_score,
        assessment.social_isolation_level,
    )

    # Determine trend (compare with previous risk log)
    prev_risk = await db.execute(
        select(RiskLog)
        .where(RiskLog.student_id == student_id)
        .order_by(RiskLog.created_at.desc())
        .limit(1)
    )
    prev_log = prev_risk.scalar_one_or_none()

    trend = "STABLE"
    if prev_log and prev_log.cri_score:
        diff = cri - prev_log.cri_score
        if diff > 0.05:
            trend = "WORSENING"
        elif diff < -0.05:
            trend = "IMPROVING"

    # Create risk log
    risk_log_id = str(uuid.uuid4())
    risk_log = RiskLog(
        id=risk_log_id,
        student_id=student_id,
        assessment_id=assessment_id,
        cri_score=cri,
        risk_level=risk_level,
        reasoning=reasoning,
        trend=trend,
        trigger=trigger,
    )
    db.add(risk_log)

    # Update assessment processing status
    assessment.risk_processing_status = "DONE"

    await db.commit()

    return success_response(
        data={
            "risk_log_id": risk_log_id,
            "cri_score": round(cri, 3),
            "risk_level": risk_level,
            "trend": trend,
            "reasoning": reasoning,
            "override_applied": assessment.q9_flag,
        }
    )


# ============================================================================
# ALLOCATION JOBS - PRD §6 & §13
# ============================================================================


@router.post("/allocations/run", summary="Run full allocation ranking cycle")
async def run_allocation(
    req: Optional[dict] = None,
    user=Depends(require_internal),
    db: AsyncSession = Depends(get_db),
):
    """
    Internal endpoint to run allocation job.
    PRD §6.1: Filter RED/YELLOW students -> Compute Priority Score -> Rank -> Assign slots
    """
    # This would typically:
    # 1. Filter students with risk_level in [RED, YELLOW] with no active allocation
    # 2. Compute priority scores for each
    # 3. Rank by priority score descending
    # 4. Assign top N to available counselor slots

    # For now, return a placeholder response
    return success_response(
        message="Allocation job queued",
        data={
            "job_status": "QUEUED",
            "trigger": req.get("trigger", "MANUAL") if req else "SCHEDULED",
        },
    )


@router.post("/allocations/{allocation_id}/release", summary="Release unconfirmed slot")
async def release_allocation(
    allocation_id: str,
    user=Depends(require_internal),
    db: AsyncSession = Depends(get_db),
):
    """
    Internal endpoint to release unconfirmed slot after T-12hrs deadline.
    PRD §6.2: Auto-release slot, status -> RELEASED, rerun allocation for next student
    """
    result = await db.execute(select(Allocation).where(Allocation.id == allocation_id))
    allocation = result.scalar_one_or_none()

    if not allocation:
        raise HTTPException(status_code=404, detail="Allocation not found")

    if allocation.status not in ["ASSIGNED", "CONFIRMED"]:
        return error_response(
            "INVALID_STATE", "Only ASSIGNED or CONFIRMED allocations can be released"
        )

    allocation.status = "RELEASED"

    await db.commit()

    return success_response(
        message="Allocation released",
        data={"allocation_id": allocation_id, "new_status": "RELEASED"},
    )


@router.post(
    "/allocations/{allocation_id}/reassign",
    summary="Reassign released slot to next student",
)
async def reassign_allocation(
    allocation_id: str,
    req: Optional[dict] = None,
    user=Depends(require_internal),
    db: AsyncSession = Depends(get_db),
):
    """
    Internal endpoint to reassign a released slot to next student in queue.
    PRD §6.2: After release, assign to next highest priority student
    """
    # Get the released allocation
    result = await db.execute(select(Allocation).where(Allocation.id == allocation_id))
    old_allocation = result.scalar_one_or_none()

    if not old_allocation:
        raise HTTPException(status_code=404, detail="Allocation not found")

    if old_allocation.status != "RELEASED":
        return error_response(
            "INVALID_STATE", "Only RELEASED allocations can be reassigned"
        )

    # Find next student in PENDING_RANKING status
    next_student = await db.execute(
        select(Allocation)
        .where(Allocation.status == "PENDING_RANKING")
        .order_by(Allocation.priority_score.desc())
        .limit(1)
    )
    next_alloc = next_student.scalar_one_or_none()

    if not next_alloc:
        return success_response(
            message="No pending students in queue", data={"reassigned": False}
        )

    # Update old allocation to REASSIGNED
    old_allocation.status = "REASSIGNED"

    # Update next allocation to ASSIGNED
    next_alloc.status = "ASSIGNED"
    next_alloc.counselor_id = old_allocation.counselor_id

    await db.commit()

    return success_response(
        message="Slot reassigned",
        data={
            "from_allocation_id": allocation_id,
            "to_allocation_id": next_alloc.id,
            "student_id": next_alloc.student_id,
        },
    )


# ============================================================================
# NOTIFICATIONS - PRD §13
# ============================================================================


@router.post(
    "/notifications/send", summary="Dispatch notification via specified channel"
)
async def send_notification(
    req: dict,
    user=Depends(require_internal),
    db: AsyncSession = Depends(get_db),
):
    """
    Internal endpoint to send notifications.
    PRD §13: Support EMAIL, FCM, IN_APP channels
    """
    recipient_user_id = req.get("recipient_user_id")
    channel = req.get("channel", "IN_APP")
    template_code = req.get("template_code")
    payload = req.get("payload", {})

    if not recipient_user_id or not template_code:
        return error_response(
            "VALIDATION_ERROR", "recipient_user_id and template_code are required"
        )

    # Create notification record
    notification = Notification(
        id=str(uuid.uuid4()),
        user_id=recipient_user_id,
        channel=channel,
        template_code=template_code,
        payload=payload,
        status="PENDING",
    )
    db.add(notification)

    await db.commit()

    # In production, this would trigger actual sending via SendGrid/FCM/etc
    return success_response(
        message="Notification queued",
        data={
            "notification_id": notification.id,
            "channel": channel,
            "template_code": template_code,
        },
    )


# ============================================================================
# AUDIT LOGGING - PRD §12.3
# ============================================================================


@router.post("/audit-log", summary="Append audit event (internal only)")
async def create_audit_log(
    req: dict,
    user=Depends(require_internal),
    db: AsyncSession = Depends(get_db),
):
    """
    Internal endpoint for immutable audit log entries.
    PRD §12.3: Append-only, no updates or deletes
    """
    action = req.get("action")
    actor_id = req.get("actor_id")
    actor_role = req.get("actor_role")
    resource_type = req.get("resource_type")
    resource_id = req.get("resource_id")
    metadata = req.get("metadata", {})

    if not action or not actor_id:
        return error_response("VALIDATION_ERROR", "action and actor_id are required")

    audit_log = AuditLog(
        id=str(uuid.uuid4()),
        actor_id=actor_id,
        actor_role=actor_role,
        action=action,
        resource_type=resource_type,
        resource_id=resource_id,
        metadata=metadata,
    )
    db.add(audit_log)

    await db.commit()

    return success_response(
        message="Audit log created", data={"audit_log_id": audit_log.id}
    )


# ============================================================================
# ESCALATION CHECK - PRD §13
# ============================================================================


@router.post(
    "/escalation/check", summary="Check and flag high-risk unresponsive students"
)
async def check_escalations(
    user=Depends(require_internal),
    db: AsyncSession = Depends(get_db),
):
    """
    Internal endpoint to flag RED + unresponsive students for escalation.
    PRD §13: Daily job to check and escalate
    """
    # Find RED students with no recent sessions
    escalated = []

    # This would be a complex query in production
    # For now, return placeholder
    return success_response(
        data={"escalations_triggered": 0, "students_flagged": escalated}
    )
