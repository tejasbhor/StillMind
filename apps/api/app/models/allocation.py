import uuid
from sqlalchemy import String, Integer, Enum as SAEnum, TIMESTAMP, func, ForeignKey, Numeric, Text
from sqlalchemy.orm import Mapped, mapped_column
from app.core.database import Base


class Allocation(Base):
    __tablename__ = "allocations"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    student_id: Mapped[str] = mapped_column(String(36), ForeignKey("student_profiles.id", ondelete="CASCADE"), nullable=False, index=True)
    counselor_id: Mapped[str] = mapped_column(String(36), ForeignKey("counselor_profiles.id"), nullable=False, index=True)

    priority_score: Mapped[float] = mapped_column(Numeric(5, 4), nullable=False)
    slot_time: Mapped[object] = mapped_column(TIMESTAMP(timezone=True), nullable=True)

    status: Mapped[str] = mapped_column(
        SAEnum(
            "PENDING_RANKING", "ASSIGNED", "CONFIRMED", "DECLINED",
            "EXPIRED", "RELEASED", "REASSIGNED", "COMPLETED",
            "RESCHEDULING", "CANCELLED",
            name="allocation_status",
        ),
        nullable=False,
        default="PENDING_RANKING",
        index=True,
    )

    # Human-readable summary — visible to admin (no raw clinical data)
    reason_summary: Mapped[str | None] = mapped_column(Text)

    # Optimistic locking — checked on every status update (PRD §12.3)
    version: Mapped[int] = mapped_column(Integer, default=1, nullable=False)

    created_at: Mapped[object] = mapped_column(TIMESTAMP(timezone=True), server_default=func.now())
    completed_at: Mapped[object | None] = mapped_column(TIMESTAMP(timezone=True), nullable=True)
