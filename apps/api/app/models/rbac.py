"""
RBAC Models for Role-Based Access Control
Implements: User -> Roles -> Permissions pattern
"""
import uuid
from sqlalchemy import String, Boolean, Enum as SAEnum, TIMESTAMP, func, ForeignKey, Table, Column
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.core.database import Base


# Junction table for User <-> Role many-to-many
user_roles = Table(
    "user_roles",
    Base.metadata,
    Column("user_id", String(36), ForeignKey("users.id", ondelete="CASCADE"), primary_key=True),
    Column("role_id", String(36), ForeignKey("roles.id", ondelete="CASCADE"), primary_key=True),
)


# Junction table for Role <-> Permission many-to-many
role_permissions = Table(
    "role_permissions",
    Base.metadata,
    Column("role_id", String(36), ForeignKey("roles.id", ondelete="CASCADE"), primary_key=True),
    Column("permission_id", String(36), ForeignKey("permissions.id", ondelete="CASCADE"), primary_key=True),
)


class Permission(Base):
    """Permission - granular access right"""
    __tablename__ = "permissions"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    name: Mapped[str] = mapped_column(String(100), unique=True, nullable=False, index=True)
    description: Mapped[str] = mapped_column(String(255), nullable=True)

    # Many-to-many with roles
    roles = relationship("Role", secondary=role_permissions, back_populates="permissions")


class Role(Base):
    """Role - bundle of permissions"""
    __tablename__ = "roles"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    name: Mapped[str] = mapped_column(String(50), unique=True, nullable=False, index=True)
    description: Mapped[str] = mapped_column(String(255), nullable=True)
    is_system: Mapped[bool] = mapped_column(Boolean, default=False)  # System roles cannot be deleted
    created_at: Mapped[object] = mapped_column(TIMESTAMP(timezone=True), server_default=func.now())

    # Many-to-many with users
    users = relationship("User", secondary=user_roles, back_populates="roles")
    # Many-to-many with permissions
    permissions = relationship("Permission", secondary=role_permissions, back_populates="roles")