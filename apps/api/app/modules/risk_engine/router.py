from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.core.database import get_db
from app.core.dependencies import require_student
from app.core.responses import success_response
from app.models.risk_log import RiskLog

router = APIRouter(prefix="/students/me/risk-summary", tags=["Risk"])

@router.get("", response_model=dict, summary="Get high-level risk summary (safe view)")
async def get_risk_summary(
    user=Depends(require_student),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(RiskLog)
        .where(RiskLog.student_id == user.id)
        .order_by(RiskLog.created_at.desc())
        .limit(1)
    )
    risk = result.scalar_one_or_none()
    
    if not risk:
        return success_response(data={"message": "No assessments completed.", "trend": "STABLE"})
    
    # Soft risk message mappings
    msg_map = {
        "GREEN": "You seem to be doing well. Optional support is available.",
        "YELLOW": "You may benefit from some support. We'll help you connect with a counselor.",
        "RED": "We recommend immediate support. You've been prioritized for counseling."
    }
    
    return success_response(data={
        "message": msg_map.get(risk.risk_level),
        "trend": risk.trend,
        "last_assessment_date": risk.created_at.isoformat() if hasattr(risk.created_at, "isoformat") else risk.created_at
    })
