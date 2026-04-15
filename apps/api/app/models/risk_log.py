import uuid
from sqlalchemy import String, Enum as SAEnum, TIMESTAMP, func, ForeignKey, Numeric
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column
from app.core.database import Base


class RiskLog(Base):
    """Append-only — no updates, no deletes (PRD §12.3)."""
    __tablename__ = "risk_logs"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    student_id: Mapped[str] = mapped_column(String(36), ForeignKey("student_profiles.id", ondelete="CASCADE"), nullable=False, index=True)
    assessment_id: Mapped[str] = mapped_column(String(36), ForeignKey("assessments.id"), nullable=False)

    # CRI score — 0.000 to 1.000
    cri_score: Mapped[float] = mapped_column(Numeric(4, 3), nullable=False)
    risk_level: Mapped[str] = mapped_column(
        SAEnum("GREEN", "YELLOW", "RED", name="risk_level"), nullable=False
    )

    # Human-readable reasons array (shown to counselors — §8.2)
    reasoning: Mapped[list] = mapped_column(JSONB, nullable=False, default=list)

    trend: Mapped[str] = mapped_column(
        SAEnum("IMPROVING", "STABLE", "WORSENING", name="risk_trend"), nullable=False, default="STABLE"
    )
    trigger: Mapped[str] = mapped_column(
        SAEnum("ASSESSMENT_SUBMITTED", "PERIODIC_RECOMPUTE", name="risk_trigger"), nullable=False
    )

    created_at: Mapped[object] = mapped_column(TIMESTAMP(timezone=True), server_default=func.now(), index=True)
