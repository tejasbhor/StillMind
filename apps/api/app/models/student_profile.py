import uuid
from sqlalchemy import (
    String,
    Boolean,
    Enum as SAEnum,
    TIMESTAMP,
    func,
    ForeignKey,
    Text,
    Integer,
)
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.core.database import Base


class StudentProfile(Base):
    __tablename__ = "student_profiles"

    id: Mapped[str] = mapped_column(
        String(36), primary_key=True, default=lambda: str(uuid.uuid4())
    )
    user_id: Mapped[str] = mapped_column(
        String(36),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        unique=True,
        index=True,
    )
    full_name: Mapped[str | None] = mapped_column(Text)
    college_id: Mapped[str | None] = mapped_column(String(100), unique=True, index=True)
    phone: Mapped[str | None] = mapped_column(String(20))
    consent_flag: Mapped[bool] = mapped_column(Boolean, default=False)
    consent_version: Mapped[str | None] = mapped_column(String(20))

    # Version for optimistic locking - increment on each update
    version: Mapped[int] = mapped_column(Integer, default=1, nullable=False)

    # Consent details stored as JSONB
    consents: Mapped[dict | None] = mapped_column(JSONB, default=dict)
    # {
    #   "data_usage": {"granted": bool, "ts": "..."},
    #   "counseling": {"granted": bool, "ts": "..."},
    #   "emergency_escalation": {"granted": bool, "ts": "..."}
    # }

    profile_status: Mapped[str] = mapped_column(
        SAEnum("PENDING_CONSENT", "ACTIVE", "INACTIVE", name="student_profile_status"),
        default="PENDING_CONSENT",
    )
    guardian_contact: Mapped[dict | None] = mapped_column(JSONB)
    # {name, phone, relation}

    created_at: Mapped[object] = mapped_column(
        TIMESTAMP(timezone=True), server_default=func.now()
    )
    updated_at: Mapped[object] = mapped_column(
        TIMESTAMP(timezone=True), server_default=func.now(), onupdate=func.now()
    )
