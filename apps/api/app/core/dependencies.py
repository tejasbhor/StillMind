from typing import Annotated
from fastapi import Depends, HTTPException, status, Header
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.ext.asyncio import AsyncSession
from jose import JWTError
import structlog
from app.core.database import get_db
from app.core.security import decode_token, require_scope
from app.core.config import settings

bearer = HTTPBearer()


async def get_current_user(
    credentials: Annotated[HTTPAuthorizationCredentials, Depends(bearer)],
    db: Annotated[AsyncSession, Depends(get_db)],
):
    """Extract and validate JWT; return full user ORM object."""
    from app.models.user import User
    from sqlalchemy import select
    from app.modules.auth.service import _check_session_valid

    token = credentials.credentials
    try:
        payload = decode_token(token)
        if payload.get("type") != "access":
            raise ValueError("not access token")
        user_id: str = payload.get("sub")
        session_id: str = payload.get("session_id")  # Session tracking
        if not user_id:
            raise ValueError("missing sub")
    except (JWTError, ValueError):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # Validate session - if session was invalidated (new login), reject token
    if session_id and not _check_session_valid(user_id, session_id):
        logger = structlog.get_logger()
        logger.warning("session_invalidated", user_id=user_id)
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Session expired. Please log in again.",
            headers={"WWW-Authenticate": "Bearer", "X-Session-Expired": "1"},
        )

    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    if not user or user.status != "ACTIVE":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found or inactive",
        )
    return user


def require_role(*roles: str):
    """Factory: returns a dependency that enforces one of the given roles.

    Usage:
        @app.get("/admin/users", dependencies=[Security(require_role("admin"))])
        async def admin_users(...):
            ...

    Note: For finer-grained access, use require_scope_dependency() instead.
    """

    async def _check(user=Depends(get_current_user)):
        if user.role not in roles:
            # Log attempt for audit
            logger = structlog.get_logger()
            logger.warning(
                "role_access_denied",
                user_id=user.id,
                user_role=user.role,
                required_roles=roles,
            )
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Access denied. Required role(s): {', '.join(roles)}",
                headers={"WWW-Authenticate": "Bearer"},
            )
        return user

    return _check


# Convenience role dependencies
require_student = require_role("student")
require_counselor = require_role("counselor")
require_admin = require_role("admin")


def require_scope_dependency(*required_scopes: str):
    """Factory: returns a dependency that enforces one or more scopes.

    Usage:
        @app.get("/users", dependencies=[Security(require_scope_dependency("users:read"))])
        async def get_users(...):
            ...
    """

    async def _check_scope(
        credentials: Annotated[HTTPAuthorizationCredentials, Depends(bearer)],
    ):
        token = credentials.credentials
        try:
            payload = decode_token(token)
            token_scopes = payload.get("scopes", [])

            # Check each required scope
            for required in required_scopes:
                # Grant access if user has specific permission OR admin:write (superuser)
                if required not in token_scopes and "admin:write" not in token_scopes:
                    raise HTTPException(
                        status_code=status.HTTP_403_FORBIDDEN,
                        detail=f"Insufficient permissions. Required: {required}",
                        headers={
                            "WWW-Authenticate": f'Bearer scope="{required}"',
                            "X-Required-Scope": required,
                        },
                    )
            return payload
        except HTTPException:
            raise
        except Exception:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token for scope check",
                headers={"WWW-Authenticate": "Bearer"},
            )

    return _check_scope


# Convenience dependencies for common permissions
def require_users_read():
    """Require users:read permission"""
    return require_scope_dependency("users:read")


def require_users_write():
    """Require users:write permission"""
    return require_scope_dependency("users:write")


def require_admin_read():
    """Require admin:read permission"""
    return require_scope_dependency("admin:read")


def require_admin_write():
    """Require admin:write permission"""
    return require_scope_dependency("admin:write")


def require_analytics_read():
    """Require analytics:read permission"""
    return require_scope_dependency("analytics:read")


def require_audit_read():
    """Require audit:read permission"""
    return require_scope_dependency("audit:read")


def require_internal_key(x_service_key: str = Header(..., alias="X-Service-Key")):
    """Guard for /internal/* endpoints — service key only."""
    if x_service_key != settings.INTERNAL_SERVICE_KEY:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, detail="Invalid service key"
        )


# Convenience role dependencies
require_student = require_role("student")
require_counselor = require_role("counselor")
require_admin = require_role("admin")
require_staff = require_role("counselor", "admin")


# Internal service key dependency
async def require_internal(
    x_service_key: str = Header(..., alias="X-Service-Key"),
    db: Annotated[AsyncSession, Depends(get_db)] = None,
):
    """Guard for /internal/* endpoints — service key only."""
    if x_service_key != settings.INTERNAL_SERVICE_KEY:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, detail="Invalid service key"
        )

    # Return a mock internal user for audit logging purposes
    class InternalUser:
        def __init__(self):
            self.id = "internal_system"
            self.role = "system"

    return InternalUser()


# Typed annotations
DbSession = Annotated[AsyncSession, Depends(get_db)]
CurrentUser = Annotated[object, Depends(get_current_user)]
