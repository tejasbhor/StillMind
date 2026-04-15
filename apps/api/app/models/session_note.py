import uuid
from sqlalchemy import String, Text, Enum as SAEnum, TIMESTAMP, func, ForeignKey, ARRAY
from sqlalchemy.orm import Mapped, mapped_column
from app.core.database import Base


class SessionNote(Base):
    __tablename__ = "session_notes"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    session_id: Mapped[str] = mapped_column(String(36), ForeignKey("sessions.id"), nullable=False, unique=True, index=True)
    counselor_id: Mapped[str] = mapped_column(String(36), ForeignKey("counselor_profiles.id"), nullable=False)

    # Structured note — no free text accepted (PRD §8.3)
    mood: Mapped[str] = mapped_column(SAEnum("LOW", "NEUTRAL", "HIGH", name="note_mood"), nullable=False)
    engagement: Mapped[str] = mapped_column(SAEnum("LOW", "MEDIUM", "HIGH", name="note_engagement"), nullable=False)
    key_concerns: Mapped[list] = mapped_column(ARRAY(Text), nullable=False, default=list)
    risk_flag: Mapped[str] = mapped_column(SAEnum("IMPROVING", "STABLE", "WORSENING", name="note_risk_flag"), nullable=False)
    action_plan: Mapped[str] = mapped_column(Text, nullable=False)

    created_at: Mapped[object] = mapped_column(TIMESTAMP(timezone=True), server_default=func.now())
