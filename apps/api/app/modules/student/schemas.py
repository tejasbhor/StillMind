import re
from typing import Optional
from pydantic import BaseModel, field_validator


# ---------------------------------------------------------------------------
# Validation constants
# ---------------------------------------------------------------------------

MAX_NAME_LENGTH = 100
MAX_PHONE_LENGTH = 20
MAX_FIELD_LENGTH = 500


# ---------------------------------------------------------------------------
# Sanitization helpers
# ---------------------------------------------------------------------------


def sanitize_input(value: Optional[str]) -> Optional[str]:
    """Sanitize string input to prevent injection attacks."""
    if value is None:
        return None
    value = value.strip()
    value = value.replace("\x00", "")
    value = re.sub(r"[\x01-\x08\x0b\x0c\x0e-\x1f\x7f]", "", value)
    return value


def sanitize_name(value: Optional[str]) -> Optional[str]:
    """Sanitize name fields with stricter rules."""
    if value is None:
        return None
    value = value.strip()
    value = re.sub(r"[\x00-\x1f\x7f]", "", value)
    value = re.sub(r"\s+", " ", value)
    return value if value else None


def sanitize_phone(value: Optional[str]) -> Optional[str]:
    """Sanitize phone number."""
    if value is None:
        return None
    value = value.strip()
    if not value.startswith("+"):
        value = re.sub(r"[^\d]", "", value)
    if len(value) > MAX_PHONE_LENGTH:
        raise ValueError(f"Phone number too long")
    return value


# ---------------------------------------------------------------------------
# Profile schemas
# ---------------------------------------------------------------------------


class GuardianContact(BaseModel):
    name: str
    phone: str
    relation: str

    @field_validator("name")
    @classmethod
    def validate_name(cls, v: str) -> str:
        v = sanitize_name(v)
        if not v or len(v) < 1:
            raise ValueError("Name is required")
        if len(v) > MAX_NAME_LENGTH:
            raise ValueError(f"Name must not exceed {MAX_NAME_LENGTH} characters")
        return v

    @field_validator("phone")
    @classmethod
    def validate_phone(cls, v: str) -> str:
        return sanitize_phone(v)

    @field_validator("relation")
    @classmethod
    def validate_relation(cls, v: str) -> str:
        v = sanitize_input(v)
        if not v or len(v) < 1:
            raise ValueError("Relationship is required")
        if len(v) > MAX_NAME_LENGTH:
            raise ValueError(
                f"Relationship must not exceed {MAX_NAME_LENGTH} characters"
            )
        return v


class StudentProfileUpdate(BaseModel):
    full_name: Optional[str] = None
    phone: Optional[str] = None
    guardian_contact: Optional[GuardianContact] = None
    version: Optional[int] = None  # For optimistic locking

    @field_validator("full_name")
    @classmethod
    def validate_full_name(cls, v: Optional[str]) -> Optional[str]:
        if v is not None:
            v = sanitize_name(v)
            if v and len(v) > MAX_NAME_LENGTH:
                raise ValueError(f"Name must not exceed {MAX_NAME_LENGTH} characters")
        return v

    @field_validator("phone")
    @classmethod
    def validate_phone(cls, v: Optional[str]) -> Optional[str]:
        return sanitize_phone(v)


class StudentProfileOut(BaseModel):
    id: str
    user_id: str
    full_name: Optional[str]
    college_id: Optional[str]
    phone: Optional[str]
    profile_status: str
    guardian_contact: Optional[dict]
    consent_flag: bool
    version: Optional[int] = None  # For optimistic locking

    model_config = {"from_attributes": True}


# ---------------------------------------------------------------------------
# Consent schemas
# ---------------------------------------------------------------------------


class ConsentEntry(BaseModel):
    granted: bool


class ConsentSubmit(BaseModel):
    data_usage: ConsentEntry
    counseling: ConsentEntry
    emergency_escalation: Optional[ConsentEntry] = None  # optional


class ConsentOut(BaseModel):
    data_usage: Optional[dict] = None
    counseling: Optional[dict] = None
    emergency_escalation: Optional[dict] = None
    profile_status: str
    consent_flag: bool
