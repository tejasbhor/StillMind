from pydantic import BaseModel, Field
from typing import Dict, Optional
from datetime import datetime

class AssessmentCreate(BaseModel):
    # PHQ-9 answers (0-3)
    phq9: Dict[str, int] = Field(..., description="Dict of answers for q1 to q9, values 0-3")
    # GAD-7 answers (0-3)
    gad7: Dict[str, int] = Field(..., description="Dict of answers for q1 to q7, values 0-3")

    # Behavioral
    sleep_score: int = Field(..., ge=1, le=5, description="1=worst, 5=best")
    academic_stress_score: int = Field(..., ge=1, le=5, description="1=none, 5=severe")
    social_isolation_level: str = Field(..., description="'LOW', 'MEDIUM', or 'HIGH'")
    
class AssessmentStudentView(BaseModel):
    id: str
    assessment_type: Optional[str] = None
    risk_processing_status: Optional[str] = None
    created_at: Optional[datetime] = None

    model_config = {"from_attributes": True}
