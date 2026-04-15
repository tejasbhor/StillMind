import uuid
from sqlalchemy import String, Integer, Enum as SAEnum, TIMESTAMP, func, ForeignKey
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column
from app.core.database import Base


class Notification(Base):
    __tablename__ = "notifications"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id: Mapped[str] = mapped_column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)

    channel: Mapped[str] = mapped_column(
        SAEnum("EMAIL", "FCM", "IN_APP", name="notification_channel"), nullable=False
    )
    template_code: Mapped[str] = mapped_column(String(100), nullable=False)
    payload: Mapped[dict] = mapped_column(JSONB, nullable=False, default=dict)

    status: Mapped[str] = mapped_column(
        SAEnum("PENDING", "SENT", "FAILED", name="notification_status"),
        nullable=False,
        default="PENDING",
        index=True,
    )
    retry_count: Mapped[int] = mapped_column(Integer, default=0)
    is_read: Mapped[bool] = mapped_column(default=False)

    created_at: Mapped[object] = mapped_column(TIMESTAMP(timezone=True), server_default=func.now())
