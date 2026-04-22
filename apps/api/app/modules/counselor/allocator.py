from typing import Optional

def compute_priority_score(
    cri: float,
    trend: str,
    waiting_days: int,
    weights: Optional[dict] = None,
) -> float:
    """
    Computes priority based on CRI, Risk Trend, and Days Waiting.
    """
    if not weights:
        # Fallback to defaults from PRD
        weights = {"cri": 0.5, "trend": 0.2, "engagement": 0.2, "time_gap": 0.1}

    w_cri = weights.get("cri", 0.5)
    w_trend = weights.get("trend", 0.2)
    w_gap = weights.get("time_gap", 0.1)

    base_score = cri * w_cri

    trend_boost = 0.0
    if trend == "WORSENING":
        trend_boost = w_trend
    elif trend == "IMPROVING":
        trend_boost = -0.1  # Constant small negative boost for improvement

    # Waiting time: boost by time_gap weight over 10 days
    wait_boost = min(waiting_days * (w_gap / 10.0), w_gap)

    raw_score = base_score + trend_boost + wait_boost
    return round(max(0.0, min(1.0, raw_score)), 4)

def determine_assignment(priority_score: float, risk_level: str) -> str:
    """
    If RED, immediate counselor flag.
    If YELLOW > 0.5 priority score, allocate next available.
    Else WAITLIST.
    """
    if risk_level == "RED":
        return "IMMEDIATE_INTERVENTION"
    elif risk_level == "YELLOW" and priority_score >= 0.5:
        return "ALLOCATE_SOON"
    elif priority_score >= 0.7:
        return "ALLOCATE_SOON"
    else:
        return "WAITLIST"

def compute_match_score(student_concerns: list[str], counselor_specialties: list[str]) -> float:
    """
    Computes a matching score (0.0 to 1.0) based on how well the counselor's
    specialties align with the student's clinical concerns.
    """
    if not student_concerns:
        return 0.5 # Neutral match if no specific concerns listed
    
    if not counselor_specialties:
        return 0.2 # Low match if counselor has no declared specialties
    
    matches = set(student_concerns).intersection(set(counselor_specialties))
    match_ratio = len(matches) / len(student_concerns)
    
    return round(match_ratio, 2)
