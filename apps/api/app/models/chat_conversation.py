import uuid
from sqlalchemy import String, TIMESTAMP, func, ForeignKey, Enum as SAEnum, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column
from app.core.database import Base


class ChatConversation(Base):
    __tablename__ = "chat_conversations"

    id: Mapped[str] = mapped_column(
        String(36), primary_key=True, default=lambda: str(uuid.uuid4())
    )
    kind: Mapped[str] = mapped_column(
        SAEnum("DIRECT", "GROUP", name="chat_conversation_kind"),
        nullable=False,
        default="DIRECT",
    )
    title: Mapped[str | None] = mapped_column(String(200), nullable=True)
    status: Mapped[str] = mapped_column(
        SAEnum("ACTIVE", "ARCHIVED", name="chat_conversation_status"),
        nullable=False,
        default="ACTIVE",
        index=True,
    )
    allocation_id: Mapped[str | None] = mapped_column(
        String(36),
        ForeignKey("allocations.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )
    created_by_user_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False
    )
    created_at: Mapped[object] = mapped_column(
        TIMESTAMP(timezone=True), server_default=func.now(), index=True
    )
    updated_at: Mapped[object] = mapped_column(
        TIMESTAMP(timezone=True), server_default=func.now(), onupdate=func.now()
    )


class ChatConversationParticipant(Base):
    __tablename__ = "chat_conversation_participants"
    __table_args__ = (
        UniqueConstraint(
            "conversation_id",
            "user_id",
            name="uq_chat_conversation_participant_conversation_user",
        ),
    )

    id: Mapped[str] = mapped_column(
        String(36), primary_key=True, default=lambda: str(uuid.uuid4())
    )
    conversation_id: Mapped[str] = mapped_column(
        String(36),
        ForeignKey("chat_conversations.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    user_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True
    )
    role: Mapped[str] = mapped_column(
        SAEnum("student", "counselor", "admin", "system", name="chat_participant_role"),
        nullable=False,
    )
    joined_at: Mapped[object] = mapped_column(
        TIMESTAMP(timezone=True), server_default=func.now()
    )
