from typing import Annotated
from fastapi import Depends, HTTPException, status, Header
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.ext.asyncio import AsyncSession
from jose import JWTError
import structlog
from app.core.database import get_db
from app.core.security import decode_token
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
    """Factory: returns a dependency that enforces one of the given roles."""

    async def _check(user=Depends(get_current_user)):
        if user.role not in roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Access denied. Required role(s): {', '.join(roles)}",
            )
        return user

    return _check


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
