import uuid
from datetime import datetime, timezone
from sqlalchemy import (
    String,
    TIMESTAMP,
    func,
    ForeignKey,
    Text,
    Boolean,
    Enum as SAEnum,
)
from sqlalchemy.orm import Mapped, mapped_column
from app.core.database import Base


class ChatMessage(Base):
    """
    Persists real-time communication between the assigned counselor and student.
    Grouped by `allocation_id` which acts as the "Chat Room", guaranteeing that
    only an explicitly assigned counselor-student pair can communicate.

    Production features:
    - idempotency_key: Prevents duplicate messages on retry
    - delivery_state: Tracks PERSISTED → DELIVERED → SEEN
    - is_edited/is_deleted: Soft delete and edit tracking
    - client_message_id: Client-generated ID for deduplication
    """

    __tablename__ = "chat_messages"

    id: Mapped[str] = mapped_column(
        String(36), primary_key=True, default=lambda: str(uuid.uuid4())
    )
    allocation_id: Mapped[str] = mapped_column(
        String(36),
        ForeignKey("allocations.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    sender_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False
    )
    content: Mapped[str] = mapped_column(Text, nullable=False)

    # Client-generated ID for deduplication (client retries with same ID)
    client_message_id: Mapped[str | None] = mapped_column(
        String(36), nullable=True, index=True
    )

    # Idempotency key for preventing duplicates
    idempotency_key: Mapped[str | None] = mapped_column(
        String(36), nullable=True, unique=True, index=True
    )

    # Delivery state: PERSISTED (saved), DELIVERED (recipient online), SEEN (read)
    delivery_state: Mapped[str] = mapped_column(
        SAEnum("PERSISTED", "DELIVERED", "SEEN", name="delivery_state"),
        default="PERSISTED",
        nullable=False,
    )
    delivered_at: Mapped[object | None] = mapped_column(
        TIMESTAMP(timezone=True), nullable=True
    )
    seen_at: Mapped[object | None] = mapped_column(
        TIMESTAMP(timezone=True), nullable=True
    )

    # Message edit/delete tracking
    is_edited: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    is_deleted: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    edit_history: Mapped[dict | None] = mapped_column(
        Text, nullable=True
    )  # JSON storing edit history

    # For unread counts - which users have read
    seen_by: Mapped[dict | None] = mapped_column(
        Text, nullable=True
    )  # JSON: {user_id: timestamp}

    created_at: Mapped[object] = mapped_column(
        TIMESTAMP(timezone=True), server_default=func.now(), index=True
    )
    updated_at: Mapped[object] = mapped_column(
        TIMESTAMP(timezone=True), server_default=func.now(), onupdate=func.now()
    )
