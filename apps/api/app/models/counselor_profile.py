import uuid
from sqlalchemy import String, Boolean, Integer, TIMESTAMP, func, ForeignKey, Text
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column
from app.core.database import Base


class CounselorProfile(Base):
    __tablename__ = "counselor_profiles"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id: Mapped[str] = mapped_column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, unique=True, index=True)
    full_name: Mapped[str | None] = mapped_column(Text)
    max_slots_day: Mapped[int] = mapped_column(Integer, default=10)
    working_hours: Mapped[dict | None] = mapped_column(JSONB)
    # {start: "09:00", end: "17:00", timezone: "Asia/Kolkata"}
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    created_at: Mapped[object] = mapped_column(TIMESTAMP(timezone=True), server_default=func.now())
