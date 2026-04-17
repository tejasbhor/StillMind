from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.core.database import get_db
from app.core.dependencies import require_student
from app.core.responses import success_response
from app.models.risk_log import RiskLog
from app.models.student_profile import StudentProfile

router = APIRouter(prefix="/students/me", tags=["Risk"])


@router.get(
    "/risk-summary",
    response_model=dict,
    summary="Get high-level risk summary (safe view)",
)
async def get_risk_summary(
    user=Depends(require_student),
    db: AsyncSession = Depends(get_db),
):
    # Get student profile id from user id
    profile_result = await db.execute(
        select(StudentProfile.id).where(StudentProfile.user_id == user.id)
    )
    profile_id = profile_result.scalar_one_or_none()

    if not profile_id:
        return success_response(
            data={"message": "No assessments completed.", "trend": "STABLE"}
        )

    result = await db.execute(
        select(RiskLog)
        .where(RiskLog.student_id == profile_id)
        .order_by(RiskLog.created_at.desc())
        .limit(1)
    )
    risk = result.scalar_one_or_none()

    if not risk:
        return success_response(
            data={"message": "No assessments completed.", "trend": "STABLE"}
        )

    # Soft risk message mappings - PRD §7.2
    support_band_map = {
        "GREEN": "OPTIONAL_COUNSELING",
        "YELLOW": "SUGGESTED_COUNSELING",
        "RED": "PRIORITY_SCHEDULING",
    }
    msg_map = {
        "GREEN": "You seem to be doing well. Optional support is available.",
        "YELLOW": "You may benefit from some support. We'll help you connect with a counselor.",
        "RED": "We recommend immediate support. You've been prioritized for counseling.",
    }

    return success_response(
        data={
            "support_band": support_band_map.get(risk.risk_level),
            "message": msg_map.get(risk.risk_level),
            "trend": risk.trend,
            "recommended_next_step": "COMPLETE_SLOT_CONFIRMATION"
            if risk.risk_level in ["YELLOW", "RED"]
            else "OPTIONAL_ASSESSMENT",
            "last_assessment_date": risk.created_at.isoformat()
            if hasattr(risk.created_at, "isoformat")
            else str(risk.created_at),
        }
    )
