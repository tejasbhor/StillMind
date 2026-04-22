from typing import Dict, List, Optional


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


def calculate_cri(
    phq9_total: int,
    gad7_total: int,
    behavioral_score: float,
    weights: Optional[Dict[str, float]] = None,
) -> float:
    """
    CRI = (w1 x PHQ9/27) + (w2 x GAD7/21) + (w3 x Behavioral_Score)
    Default weights: PHQ9=0.45, GAD7=0.35, Behavioral=0.20
    """
    if not weights:
        weights = {"phq9": 0.45, "gad7": 0.35, "behavioral": 0.20}

    w_phq9 = weights.get("phq9", 0.45)
    w_gad7 = weights.get("gad7", 0.35)
    w_beh = weights.get("behavioral", 0.20)

    return (
        (w_phq9 * (phq9_total / 27.0))
        + (w_gad7 * (gad7_total / 21.0))
        + (w_beh * behavioral_score)
    )


def determine_risk_level(
    cri: float,
    phq9_q9: int,
    sleep: int,
    stress: int,
    thresholds: Optional[Dict[str, float]] = None,
    overrides: Optional[Dict[str, bool]] = None,
) -> str:
    """
    Returns GREEN, YELLOW, or RED based on core calculation and dynamic overrides.
    """
    if not thresholds:
        thresholds = {"green_max": 0.30, "yellow_max": 0.60}
    if not overrides:
        overrides = {
            "q9_greater_than_equal_1_immediate_red": True,
            "severe_stress_poor_sleep_escalation": True,
        }

    green_max = thresholds.get("green_max", 0.30)
    yellow_max = thresholds.get("yellow_max", 0.60)

    # 1. Base classification
    if cri > yellow_max:
        level = "RED"
    elif cri > green_max:
        level = "YELLOW"
    else:
        level = "GREEN"

    # 2. Overrides
    if (
        overrides.get("severe_stress_poor_sleep_escalation", True)
        and stress == 5
        and sleep <= 2
        and level == "GREEN"
    ):
        level = "YELLOW"

    if overrides.get("q9_greater_than_equal_1_immediate_red", True) and phq9_q9 >= 1:
        level = "RED"

    return level


def generate_reasoning(
    cri: float, phq9_total: int, phq9_q9: int, sleep: int, stress: int, isolation: str
) -> List[str]:
    reasons = []

    if phq9_total >= 15:  # Moderately severe / Severe
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
