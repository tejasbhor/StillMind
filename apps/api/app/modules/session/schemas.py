from pydantic import BaseModel, Field
from typing import List, Optional

class SessionNoteCreate(BaseModel):
    mood: str = Field(..., pattern="^(LOW|NEUTRAL|HIGH)$")
    engagement: str = Field(..., pattern="^(LOW|MEDIUM|HIGH)$")
    key_concerns: List[str] = Field(..., min_length=1)
    risk_flag: str = Field(..., pattern="^(IMPROVING|STABLE|WORSENING)$")
    action_plan: str = Field(..., min_length=10)

class SessionOutcomeRequest(BaseModel):
    outcome: str = Field(..., pattern="^(IMPROVED|NO_CHANGE|WORSENED)$")
    requires_escalation: bool = False
    immediate_followup: bool = False

class OverrideRequest(BaseModel):
    reason: str = Field(..., min_length=10)
    new_priority: Optional[float] = None
