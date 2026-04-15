import uuid
from sqlalchemy import String, Boolean, Integer, Enum as SAEnum, TIMESTAMP, func, ForeignKey
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column
from app.core.database import Base


class Assessment(Base):
    __tablename__ = "assessments"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    student_id: Mapped[str] = mapped_column(String(36), ForeignKey("student_profiles.id", ondelete="CASCADE"), nullable=False, index=True)
    assessment_type: Mapped[str] = mapped_column(
        SAEnum("INITIAL", "PERIODIC", "POST_SESSION", name="assessment_type"),
        nullable=False,
    )

    # PHQ-9 — scores per question (q1-q9: 0-3) and total (0-27)
    phq9_scores: Mapped[dict] = mapped_column(JSONB, nullable=False)
    phq9_total: Mapped[int] = mapped_column(Integer, nullable=False)

    # GAD-7 — scores per question (q1-q7: 0-3) and total (0-21)
    gad7_scores: Mapped[dict] = mapped_column(JSONB, nullable=False)
    gad7_total: Mapped[int] = mapped_column(Integer, nullable=False)

    # PHQ-9 Q9 >= 1 → immediate RED override (PRD RULE 1)
    q9_flag: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)

    # Behavioral factors
    sleep_score: Mapped[int] = mapped_column(Integer, nullable=False)            # 1-5
    academic_stress_score: Mapped[int] = mapped_column(Integer, nullable=False)  # 1-5
    social_isolation_level: Mapped[str] = mapped_column(
        SAEnum("LOW", "MEDIUM", "HIGH", name="isolation_level"), nullable=False
    )

    # Processing status — PENDING until risk worker processes it
    risk_processing_status: Mapped[str] = mapped_column(
        SAEnum("PENDING", "DONE", name="risk_processing_status"), default="PENDING"
    )

    # Append-only — never update, never delete
    created_at: Mapped[object] = mapped_column(TIMESTAMP(timezone=True), server_default=func.now())
