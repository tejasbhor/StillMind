import pytest
from app.modules.risk_engine.engine import (
    compute_phq9_total, compute_gad7_total, normalize_behavioral, calculate_cri, determine_risk_level, generate_reasoning
)
from app.modules.risk_engine.trend import compute_trend

def test_compute_phq9_total():
    scores = {"q1": 3, "q2": 1, "q9": 0}
    assert compute_phq9_total(scores) == 4

def test_normalize_behavioral():
    # sleep=5 (0.0), stress=1 (0.0), iso="LOW" (0.0) -> 0.0
    assert normalize_behavioral(5, 1, "LOW") == 0.0
    
    # sleep=1 (1.0), stress=5 (1.0), iso="HIGH" (1.0) -> 1.0
    assert normalize_behavioral(1, 5, "HIGH") == 1.0
    
    # sleep=3 (0.5), stress=3 (0.5), iso="MEDIUM" (0.5) -> 0.5
    assert normalize_behavioral(3, 3, "MEDIUM") == 0.5

def test_calculate_cri():
    # Max risk: PHQ9=27, GAD7=21, Behav=1.0
    # CRI = 0.45 + 0.35 + 0.20 = 1.0
    assert round(calculate_cri(27, 21, 1.0), 3) == 1.0
    
    # Min risk:
    assert round(calculate_cri(0, 0, 0.0), 3) == 0.0

def test_determine_risk_level():
    # Base GREEN
    assert determine_risk_level(0.20, phq9_q9=0, sleep=5, stress=1) == "GREEN"
    # Base YELLOW
    assert determine_risk_level(0.40, phq9_q9=0, sleep=5, stress=1) == "YELLOW"
    # Base RED
    assert determine_risk_level(0.70, phq9_q9=0, sleep=5, stress=1) == "RED"
    
    # Override: Q9 >= 1
    assert determine_risk_level(0.10, phq9_q9=1, sleep=5, stress=1) == "RED"
    
    # Override: Stress 5 + Sleep <= 2
    assert determine_risk_level(0.10, phq9_q9=0, sleep=2, stress=5) == "YELLOW"

def test_compute_trend():
    assert compute_trend(0.50, 0.55) == "WORSENING"
    assert compute_trend(0.50, 0.45) == "IMPROVING"
    assert compute_trend(0.50, 0.54) == "STABLE"
    assert compute_trend(0.50, 0.46) == "STABLE"

def test_generate_reasoning():
    reasons = generate_reasoning(0.8, 20, 2, 1, 5, "HIGH")
    assert "High PHQ-9 score (20/27)" in reasons
    assert "Self-harm indicator present (Q9 = 2)" in reasons
    assert "Poor sleep quality (score: 1/5)" in reasons
    assert "Severe academic stress (score: 5/5)" in reasons
    assert "High social isolation reported" in reasons
