"""
RBAC Service - Manages roles and permissions
"""

import structlog
from typing import Optional
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.models.user import User
from app.models.rbac import Role, Permission

logger = structlog.get_logger()


# Default permissions (should be seeded)
DEFAULT_PERMISSIONS = [
    # Student permissions
    "profile:read",
    "profile:write",
    "assessment:read",
    "assessment:write",
    "chat:read",
    "chat:write",
    "appointment:read",
    "appointment:write",
    # Counselor permissions
    "students:read",
    "students:write",
    "notes:read",
    "notes:write",
    "allocation:read",
    "risk:read",
    "chat:counselor",
    # Admin permissions
    "admin:read",
    "admin:write",
    "analytics:read",
    "audit:read",
    "config:read",
    "config:write",
    "users:read",
    "users:write",
]


# Default roles and their permissions
ROLE_PERMISSIONS = {
    "student": [
        "profile:read",
        "profile:write",
        "assessment:read",
        "assessment:write",
        "chat:read",
        "chat:write",
        "appointment:read",
        "appointment:write",
    ],
    "counselor": [
        "students:read",
        "notes:read",
        "notes:write",
        "allocation:read",
        "risk:read",
        "chat:counselor",
        "profile:read",
    ],
    "admin": [
        "admin:read",
        "admin:write",
        "analytics:read",
        "audit:read",
        "config:read",
        "config:write",
        "users:read",
        "users:write",
    ],
    "system": [
        # System role gets all permissions
        "*"
    ],
}


class RBACService:
    """Service for RBAC operations"""

    async def seed_permissions(self, db: AsyncSession) -> None:
        """Seed default permissions"""
        for perm_name in DEFAULT_PERMISSIONS:
            # Check if exists
            result = await db.execute(
                select(Permission).where(Permission.name == perm_name)
            )
            if not result.scalar_one_or_none():
                perm = Permission(
                    name=perm_name, description=f"Permission: {perm_name}"
                )
                db.add(perm)

        await db.commit()
        logger.info("rbac_permissions_seeded", count=len(DEFAULT_PERMISSIONS))

    async def seed_roles(self, db: AsyncSession) -> None:
        """Seed default roles with permissions"""
        for role_name, perms in ROLE_PERMISSIONS.items():
            # Check if role exists
            result = await db.execute(
                select(Role)
                .where(Role.name == role_name)
                .options(selectinload(Role.permissions))
            )
            role = result.scalar_one_or_none()

            if not role:
                role = Role(
                    name=role_name,
                    description=f"Role: {role_name}",
                    is_system=(role_name == "system"),
                )
                db.add(role)
                await db.flush()

            # Assign permissions
            if "*" in perms:
                # Get all permissions
                result = await db.execute(select(Permission))
                perms_to_assign = result.scalars().all()
                for perm in perms_to_assign:
                    if perm not in role.permissions:
                        role.permissions.append(perm)
            else:
                for p in perms:
                    result = await db.execute(
                        select(Permission).where(Permission.name == p)
                    )
                    perm = result.scalar_one_or_none()
                    if perm and perm not in role.permissions:
                        role.permissions.append(perm)

        await db.commit()
        logger.info("rbac_roles_seeded", count=len(ROLE_PERMISSIONS))

    async def get_user_permissions(self, db: AsyncSession, user: User) -> list[str]:
        """Get all permissions for a user based on their role"""
        # Get role from user table (simple approach)
        role_name = user.role

        # Map role to permissions
        perms = ROLE_PERMISSIONS.get(role_name, [])

        if "*" in perms:
            # Get all permissions
            result = await db.execute(select(Permission.name))
            all_perms = result.scalars().all()
            return list(all_perms)

        return perms

    async def get_user_scopes(self, db: AsyncSession, user: User) -> str:
        """Get space-separated scope string for JWT"""
        perms = await self.get_user_permissions(db, user)
        return " ".join(sorted(set(perms)))

    async def check_permission(
        self, db: AsyncSession, user: User, required_permission: str
    ) -> bool:
        """Check if user has a specific permission"""
        user_perms = await self.get_user_permissions(db, user)

        # Admin always has access
        if "admin:write" in user_perms or "*" in user_perms:
            return True

        # Check specific permission
        return required_permission in user_perms


rbac_service = RBACService()
