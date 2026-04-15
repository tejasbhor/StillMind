from typing import Optional
from pydantic import BaseModel


# ---------------------------------------------------------------------------
# Profile schemas
# ---------------------------------------------------------------------------

class GuardianContact(BaseModel):
    name: str
    phone: str
    relation: str


class StudentProfileUpdate(BaseModel):
    full_name: Optional[str] = None
    phone: Optional[str] = None
    guardian_contact: Optional[GuardianContact] = None


class StudentProfileOut(BaseModel):
    id: str
    user_id: str
    full_name: Optional[str]
    college_id: Optional[str]
    phone: Optional[str]
    profile_status: str
    guardian_contact: Optional[dict]
    consent_flag: bool

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
