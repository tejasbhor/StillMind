from typing import Optional

def compute_priority_score(cri: float, trend: str, waiting_days: int) -> float:
    """
    Computes priority based on CRI, Risk Trend, and Days Waiting.
    Weights: 
    - CRI: 60%
    - Trend: WORSENING defaults to +0.2 max boost. STABLE: 0, IMPROVING: -0.1.
    - Waiting time: +0.02 per day waiting (max 0.2)
    """
    base_score = cri * 0.6
    
    trend_boost = 0.0
    if trend == "WORSENING":
        trend_boost = 0.2
    elif trend == "IMPROVING":
        trend_boost = -0.1
        
    wait_boost = min(waiting_days * 0.02, 0.2)
    
    raw_score = base_score + trend_boost + wait_boost
    return round(max(0.0, min(1.0, raw_score)), 2)  # Clamp between 0 and 1

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
