import json
from datetime import datetime
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_

from app.core.database import get_db
from app.core.dependencies import require_admin
from app.core.responses import success_response
from app.models.audit_log import AuditLog

router = APIRouter(prefix="/admin", tags=["Admin Control Plane"])

@router.get("/audit-logs", summary="Browse immutable system audit logs")
async def get_audit_logs(
    user=Depends(require_admin),
    db: AsyncSession = Depends(get_db),
    limit: int = 50,
    offset: int = 0
):
    result = await db.execute(
        select(AuditLog)
        .order_by(AuditLog.performed_at.desc())
        .offset(offset)
        .limit(limit)
    )
    logs = result.scalars().all()
    # Serializer
    data = []
    for l in logs:
        data.append({
            "id": l.id,
            "actor_id": l.actor_id,
            "actor_role": l.actor_role,
            "action": l.action,
            "resource_id": str(l.resource_id) if l.resource_id else None,
            "metadata": l.metadata,
            "performed_at": l.performed_at.isoformat() if isinstance(l.performed_at, datetime) else str(l.performed_at)
        })
    return success_response(data=data)
