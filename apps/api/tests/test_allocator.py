from app.modules.counselor.allocator import compute_priority_score, determine_assignment

def test_compute_priority_score():
    # CRI 1.0 (0.6), WORSENING (+0.2), 10 days waiting (+0.2) = 1.0
    assert compute_priority_score(1.0, "WORSENING", 10) == 1.0
    
    # CRI 0.5 (0.3), STABLE (+0.0), 0 days waiting (+0.0) = 0.3
    assert compute_priority_score(0.5, "STABLE", 0) == 0.3
    
    # Waiting days caps at 10 days (max 0.2 boost)
    # CRI 0.5 (0.3), STABLE (+0.0), 50 days waiting (+0.2) = 0.5
    assert compute_priority_score(0.5, "STABLE", 50) == 0.5
    
    # IMPROVING trend gives negative boost
    # CRI 0.5 (0.3), IMPROVING (-0.1), 0 waiting = 0.2
    assert compute_priority_score(0.5, "IMPROVING", 0) == 0.2

def test_determine_assignment():
    assert determine_assignment(0.9, "RED") == "IMMEDIATE_INTERVENTION"
    assert determine_assignment(0.1, "RED") == "IMMEDIATE_INTERVENTION" # overrides priority
    
    assert determine_assignment(0.6, "YELLOW") == "ALLOCATE_SOON"
    assert determine_assignment(0.3, "YELLOW") == "WAITLIST"
    
    assert determine_assignment(0.8, "GREEN") == "ALLOCATE_SOON" # High priority, but GREEN
    assert determine_assignment(0.2, "GREEN") == "WAITLIST"
