import uuid
from sqlalchemy import String, Enum as SAEnum, TIMESTAMP, func, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column
from app.core.database import Base


class Session(Base):
    __tablename__ = "sessions"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    allocation_id: Mapped[str] = mapped_column(String(36), ForeignKey("allocations.id"), nullable=False, index=True)

    status: Mapped[str] = mapped_column(
        SAEnum(
            "SCHEDULED", "CONFIRMED", "IN_PROGRESS",
            "COMPLETED", "MISSED", "CANCELLED",
            name="session_status",
        ),
        nullable=False,
        default="SCHEDULED",
        index=True,
    )

    session_date: Mapped[object] = mapped_column(TIMESTAMP(timezone=True), nullable=True)
    created_at: Mapped[object] = mapped_column(TIMESTAMP(timezone=True), server_default=func.now())
