from pydantic import BaseModel
from typing import List, Optional

class CounselorProfileView(BaseModel):
    id: str
    department: str
    specializations: List[str]
    max_active_cases: int
    current_active_cases: int

    model_config = {"from_attributes": True}

class WaitlistView(BaseModel):
    student_id: str
    student_name: str
    priority_score: float
    waiting_days: int
    risk_level: str
    trend: str
    matched_counselor_id: Optional[str] = None
    
    model_config = {"from_attributes": True}
