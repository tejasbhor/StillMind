import re
from pydantic import BaseModel, EmailStr, field_validator, model_validator
from typing import Optional
import html


# ---------------------------------------------------------------------------
# Constants for validation
# ---------------------------------------------------------------------------

MAX_NAME_LENGTH = 100
MAX_EMAIL_LENGTH = 255
MAX_PHONE_LENGTH = 20
MAX_COLLEGE_ID_LENGTH = 50
MIN_PASSWORD_LENGTH = 8
MAX_PASSWORD_LENGTH = 128


# ---------------------------------------------------------------------------
# Sanitization helpers
# ---------------------------------------------------------------------------


def sanitize_input(value: Optional[str]) -> Optional[str]:
    """Sanitize string input to prevent injection attacks."""
    if value is None:
        return None
    # Strip leading/trailing whitespace
    value = value.strip()
    # Remove null bytes
    value = value.replace("\x00", "")
    # Remove common control characters (but allow newlines in descriptions)
    value = re.sub(r"[\x01-\x08\x0b\x0c\x0e-\x1f\x7f]", "", value)
    return value


def sanitize_name(value: Optional[str]) -> Optional[str]:
    """Sanitize name fields with stricter rules."""
    if value is None:
        return None
    # Strip and basic cleanup
    value = value.strip()
    value = re.sub(r"[\x00-\x1f\x7f]", "", value)
    # Normalize multiple spaces
    value = re.sub(r"\s+", " ", value)
    return value if value else None


# ---------------------------------------------------------------------------
# Requests
# ---------------------------------------------------------------------------


class StudentRegisterRequest(BaseModel):
    email: EmailStr
    password: str
    full_name: str
    college_id: Optional[str] = None
    phone: Optional[str] = None
    idempotency_key: Optional[str] = None
    """If set, must match an existing organization slug (e.g. from your institution's signup link)."""
    organization_slug: Optional[str] = None

    @field_validator("password")
    @classmethod
    def password_strength(cls, v: str) -> str:
        if len(v) < MIN_PASSWORD_LENGTH:
            raise ValueError(
                f"Password must be at least {MIN_PASSWORD_LENGTH} characters"
            )
        if len(v) > MAX_PASSWORD_LENGTH:
            raise ValueError(
                f"Password must not exceed {MAX_PASSWORD_LENGTH} characters"
            )
        return v

    @field_validator("full_name")
    @classmethod
    def validate_full_name(cls, v: str) -> str:
        v = sanitize_name(v)
        if not v or len(v) < 2:
            raise ValueError("Full name must be at least 2 characters")
        if len(v) > MAX_NAME_LENGTH:
            raise ValueError(f"Full name must not exceed {MAX_NAME_LENGTH} characters")
        return v

    @field_validator("college_id")
    @classmethod
    def validate_college_id(cls, v: Optional[str]) -> Optional[str]:
        if v is not None:
            v = sanitize_input(v)
            if len(v) > MAX_COLLEGE_ID_LENGTH:
                raise ValueError(
                    f"College ID must not exceed {MAX_COLLEGE_ID_LENGTH} characters"
                )
        return v

    @field_validator("phone")
    @classmethod
    def validate_phone(cls, v: Optional[str]) -> Optional[str]:
        if v is not None:
            v = sanitize_input(v)
            # Remove all non-digit characters except + at start
            if v:
                if not v.startswith("+"):
                    v = re.sub(r"[^\d]", "", v)
                if len(v) > MAX_PHONE_LENGTH:
                    raise ValueError(
                        f"Phone number must not exceed {MAX_PHONE_LENGTH} digits"
                    )
        return v

    @field_validator("email")
    @classmethod
    def normalize_email(cls, v: str) -> str:
        # Lowercase and strip
        return v.lower().strip()


class LoginRequest(BaseModel):
    email: EmailStr
    password: str

    @field_validator("email")
    @classmethod
    def normalize_email(cls, v: str) -> str:
        return v.lower().strip()


class RefreshRequest(BaseModel):
    refresh_token: Optional[str] = None


class ForgotPasswordRequest(BaseModel):
    email: EmailStr

    @field_validator("email")
    @classmethod
    def normalize_email(cls, v: str) -> str:
        return v.lower().strip()


class ResetPasswordRequest(BaseModel):
    token: str
    new_password: str

    @field_validator("new_password")
    @classmethod
    def password_strength(cls, v: str) -> str:
        if len(v) < MIN_PASSWORD_LENGTH:
            raise ValueError(
                f"Password must be at least {MIN_PASSWORD_LENGTH} characters"
            )
        if len(v) > MAX_PASSWORD_LENGTH:
            raise ValueError(
                f"Password must not exceed {MAX_PASSWORD_LENGTH} characters"
            )
        return v


# ---------------------------------------------------------------------------
# Responses
# ---------------------------------------------------------------------------


class UserOut(BaseModel):
    id: str
    email: str
    role: str
    status: str

    model_config = {"from_attributes": True}


class StudentRegisterResponse(BaseModel):
    user_id: str
    role: str
    profile_status: str


class LoginResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserOut
    session_id: Optional[str] = None
    scopes: Optional[str] = None  # Space-separated permissions for reference


class RefreshResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"


class MeResponse(BaseModel):
    id: str
    email: str
    role: str
    status: str
    profile_complete: bool
    profile_status: Optional[str] = None  # for students only
