import uuid
from sqlalchemy import String, Enum as SAEnum, TIMESTAMP, func, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.core.database import Base


class User(Base):
    __tablename__ = "users"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    organization_id: Mapped[str] = mapped_column(
        String(36),
        ForeignKey("organizations.id", ondelete="RESTRICT"),
        nullable=False,
        index=True,
    )
    role: Mapped[str] = mapped_column(SAEnum("student", "counselor", "admin", "system", name="user_role"), nullable=False)
    email: Mapped[str] = mapped_column(String(255), unique=True, nullable=False, index=True)
    password_hash: Mapped[str] = mapped_column(String(512), nullable=False)
    status: Mapped[str] = mapped_column(SAEnum("ACTIVE", "INACTIVE", name="user_status"), default="ACTIVE")
    created_at: Mapped[object] = mapped_column(TIMESTAMP(timezone=True), server_default=func.now())

    # Many-to-many with roles (relationship defined in rbac.py)
    roles = relationship("Role", secondary="user_roles", back_populates="users")
