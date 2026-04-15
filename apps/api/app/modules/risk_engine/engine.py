from typing import Dict, List

def compute_phq9_total(scores: Dict[str, int]) -> int:
    return sum(scores.values())

def compute_gad7_total(scores: Dict[str, int]) -> int:
    return sum(scores.values())

def normalize_behavioral(sleep: int, stress: int, isolation: str) -> float:
    # sleep: 1 (worst) to 5 (best) -> 1 is 1.0 risk, 5 is 0.0 risk
    sleep_norm = (5 - sleep) / 4.0
    
    # stress: 1 (none) to 5 (severe) -> 5 is 1.0 risk, 1 is 0.0 risk
    stress_norm = (stress - 1) / 4.0
    
    # isolation
    iso_map = {"LOW": 0.0, "MEDIUM": 0.5, "HIGH": 1.0}
    iso_norm = iso_map.get(isolation.upper(), 0.0)
    
    return (sleep_norm + stress_norm + iso_norm) / 3.0

def calculate_cri(phq9_total: int, gad7_total: int, behavioral_score: float) -> float:
    """CRI = (0.45 x PHQ9/27) + (0.35 x GAD7/21) + (0.20 x Behavioral_Score)"""
    return (0.45 * (phq9_total / 27.0)) + (0.35 * (gad7_total / 21.0)) + (0.20 * behavioral_score)

def determine_risk_level(cri: float, phq9_q9: int, sleep: int, stress: int) -> str:
    """
    Returns GREEN, YELLOW, or RED based on core calculation and hard overrides.
    Overrides:
    - Q9 >= 1 -> Immediate RED.
    - Severe academic stress (5) + poor sleep (1 or 2) -> Force YELLOW minimum.
    Base thresholds:
    - 0.00-0.30 -> GREEN
    - 0.30-0.60 -> YELLOW
    - > 0.60 -> RED
    """
    # 1. Base classification
    if cri > 0.60:
        level = "RED"
    elif cri > 0.30:
        level = "YELLOW"
    else:
        level = "GREEN"
        
    # 2. Overrides
    if stress == 5 and sleep <= 2 and level == "GREEN":
        level = "YELLOW"
        
    if phq9_q9 >= 1:
        level = "RED"
        
    return level

def generate_reasoning(cri: float, phq9_total: int, phq9_q9: int, sleep: int, stress: int, isolation: str) -> List[str]:
    reasons = []
    
    if phq9_total >= 15: # Moderately severe / Severe
        reasons.append(f"High PHQ-9 score ({phq9_total}/27)")
        
    if phq9_q9 >= 1:
        reasons.append(f"Self-harm indicator present (Q9 = {phq9_q9})")
        
    if sleep <= 2:
        reasons.append(f"Poor sleep quality (score: {sleep}/5)")
        
    if stress == 5:
        reasons.append(f"Severe academic stress (score: {stress}/5)")
        
    if isolation.upper() == "HIGH":
        reasons.append("High social isolation reported")
        
    if not reasons:
        reasons.append(f"Base calculated risk (CRI: {cri:.2f})")
        
    return reasons
