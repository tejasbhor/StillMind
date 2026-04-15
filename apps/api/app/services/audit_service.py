"""
Audit service — append-only writes (PRD §9.5, §12.3).
Used internally by every module to log mutations.
"""
import uuid
from datetime import datetime, timezone
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.audit_log import AuditLog


class AuditService:

    @staticmethod
    async def log(
        db: AsyncSession,
        action: str,
        *,
        actor_id: str | None = None,
        actor_role: str | None = None,
        resource_type: str | None = None,
        resource_id: str | None = None,
        metadata: dict | None = None,
    ) -> None:
        """Append an immutable audit entry. Never raises — failure is logged, not propagated."""
        try:
            entry = AuditLog(
                id=str(uuid.uuid4()),
                actor_id=actor_id,
                actor_role=actor_role,
                action=action,
                resource_type=resource_type,
                resource_id=resource_id,
                metadata_=metadata or {},
            )
            db.add(entry)
            await db.flush()  # flush but let caller commit
        except Exception as exc:
            # Audit failure must not crash the main flow
            import structlog
            log = structlog.get_logger(__name__)
            log.error("audit_log_failed", action=action, error=str(exc))


audit = AuditService()
