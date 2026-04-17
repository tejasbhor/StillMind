import uuid
from sqlalchemy import String, Text, TIMESTAMP, func
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column
from app.core.database import Base


class AdminConfig(Base):
    """
    Persistent system configuration stored in database.
    All admin-configurable values are stored here for audit trail and persistence.
    PRD §9.2, §9.6
    """

    __tablename__ = "admin_configs"

    id: Mapped[str] = mapped_column(
        String(36), primary_key=True, default=lambda: str(uuid.uuid4())
    )
    config_key: Mapped[str] = mapped_column(
        String(100), nullable=False, unique=True, index=True
    )
    config_value: Mapped[dict] = mapped_column(JSONB, nullable=False)
    description: Mapped[str | None] = mapped_column(Text)
    updated_by: Mapped[str | None] = mapped_column(String(36))
    created_at: Mapped[object] = mapped_column(
        TIMESTAMP(timezone=True), server_default=func.now()
    )
    updated_at: Mapped[object] = mapped_column(
        TIMESTAMP(timezone=True), server_default=func.now(), onupdate=func.now()
    )


DEFAULT_CONFIGS = {
    "resource_policies": {
        "daily_counseling_slots": 60,
        "slot_duration_minutes": 30,
        "working_hours": {
            "start": "09:00",
            "end": "17:00",
            "timezone": "Asia/Kolkata",
        },
    },
    "risk_thresholds": {
        "green_max": 0.30,
        "yellow_max": 0.60,
        "override_rules": {
            "q9_greater_than_equal_1_immediate_red": True,
            "severe_stress_poor_sleep_escalation": True,
        },
    },
    "allocation_weights": {
        "cri": 0.45,
        "trend": 0.20,
        "engagement": 0.20,
        "time_gap": 0.15,
    },
    "alert_thresholds": {
        "red_case_warning": 5,
        "backlog_warning": 10,
    },
    "system_settings": {
        "max_reschedule_attempts": 2,
        "session_reminder_hours": 24,
        "auto_escalation_enabled": True,
    },
}
