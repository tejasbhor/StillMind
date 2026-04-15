import uuid
from sqlalchemy import String, Text, TIMESTAMP, func, ForeignKey
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column
from app.core.database import Base


class AuditLog(Base):
    """Append-only — no updates, no deletes (PRD §9.5, §12.3)."""
    __tablename__ = "audit_logs"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    actor_id: Mapped[str | None] = mapped_column(String(36), ForeignKey("users.id"), nullable=True, index=True)
    actor_role: Mapped[str | None] = mapped_column(String(50))

    # e.g. 'COUNSELOR_DEACTIVATED', 'POLICY_UPDATED', 'OVERRIDE_LOGGED'
    action: Mapped[str] = mapped_column(String(100), nullable=False, index=True)

    resource_type: Mapped[str | None] = mapped_column(String(100))
    resource_id: Mapped[str | None] = mapped_column(String(36))

    # Additional context (no clinical raw data)
    metadata_: Mapped[dict | None] = mapped_column("metadata", JSONB)

    performed_at: Mapped[object] = mapped_column(TIMESTAMP(timezone=True), server_default=func.now(), index=True)
