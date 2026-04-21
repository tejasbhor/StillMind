from datetime import datetime, timedelta, timezone
from typing import Any, Optional
from passlib.context import CryptContext
from jose import JWTError, jwt
from app.core.config import settings
import secrets
import hashlib
import structlog

logger = structlog.get_logger()

# ---------------------------------------------------------------------------
# Password hashing — Argon2id (PRD §12.1)
# ---------------------------------------------------------------------------
pwd_context = CryptContext(schemes=["argon2"], deprecated="auto")

# Generate a dummy hash for anti-timing attack (never used for real auth)
# This ensures response time is uniform regardless of whether user exists
_dummy_hash = pwd_context.hash(secrets.token_urlsafe(32))


def hash_password(password: str) -> str:
    # Generate new salt for each password
    return pwd_context.hash(password)


def verify_password(plain: str, hashed: str) -> bool:
    # Handle the dummy hash specially (always returns False but with consistent timing)
    if hashed == _dummy_hash:
        # Log attempt but don't reveal it's a dummy
        logger.warning("dummy_hash_validation_attempted")
        return False
    return pwd_context.verify(plain, hashed)


def get_dummy_hash() -> str:
    """Return dummy hash for anti-timing attack in login."""
    return _dummy_hash


# ---------------------------------------------------------------------------
# JWT — short-lived access + rotating refresh tokens with scopes
# ---------------------------------------------------------------------------


def _now_utc() -> datetime:
    return datetime.now(timezone.utc)


# Scopes for granular permissions
SCOPES = {
    "student": ["read:profile", "read:assessment", "write:assessment", "read:chat"],
    "counselor": ["read:students", "write:notes", "read:chat", "write:chat"],
    "admin": [
        "read:students",
        "write:students",
        "read:analytics",
        "write:config",
        "read:audit",
    ],
}


def create_access_token(
    data: dict,
    expires_delta: Optional[timedelta] = None,
    scopes: Optional[list] = None,
) -> str:
    """Create JWT access token with scopes.

    Args:
        data: Token payload (must include 'role' for scope lookup)
        expires_delta: Optional custom expiration
        scopes: Optional explicit scopes (overrides role-based lookup)
    """
    to_encode = data.copy()
    expire = _now_utc() + (
        expires_delta or timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    )
    role = data.get("role", "student")

    # Use provided scopes OR derive from role
    token_scopes = scopes or SCOPES.get(role, [])

    to_encode.update(
        {
            "exp": expire,
            "type": "access",
            "scopes": token_scopes,
        }
    )
    return jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.JWT_ALGORITHM)


def create_refresh_token(data: dict, scopes: Optional[list] = None) -> str:
    """Create refresh token with scopes for rotation."""
    to_encode = data.copy()
    expire = _now_utc() + timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)
    role = data.get("role", "student")

    # Use provided scopes OR derive from role
    token_scopes = scopes or SCOPES.get(role, [])

    to_encode.update(
        {
            "exp": expire,
            "type": "refresh",
            "scopes": token_scopes,
        }
    )
    return jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.JWT_ALGORITHM)


def decode_token(token: str) -> dict[str, Any]:
    """Raises JWTError on invalid/expired token."""
    return jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.JWT_ALGORITHM])


def require_scope(token_payload: dict, required_scope: str) -> bool:
    """Check if token has required scope."""
    token_scopes = token_payload.get("scopes", [])
    return required_scope in token_scopes
