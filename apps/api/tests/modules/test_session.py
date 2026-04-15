import pytest
from app.modules.session.schemas import SessionNoteCreate, SessionOutcomeRequest, OverrideRequest

def test_session_note_validation():
    # Valid note
    valid_note = SessionNoteCreate(
        mood="NEUTRAL",
        engagement="HIGH",
        key_concerns=["ACADEMIC_STRESS", "ANXIETY"],
        risk_flag="STABLE",
        action_plan="Follow up in 2 weeks. Student will use mindfulness exercises."
    )
    assert valid_note.mood == "NEUTRAL"
    assert len(valid_note.key_concerns) == 2

    # Invalid mood
    from pydantic import ValidationError
    with pytest.raises(ValidationError):
        SessionNoteCreate(
            mood="HAPPY", # Invalid enum string
            engagement="HIGH",
            key_concerns=["ACADEMIC_STRESS"],
            risk_flag="STABLE",
            action_plan="Follow up in 2 weeks."
        )

def test_session_outcome_validation():
    valid = SessionOutcomeRequest(
        outcome="IMPROVED",
        requires_escalation=False,
        immediate_followup=False
    )
    assert valid.outcome == "IMPROVED"
    
    with pytest.raises(Exception):
        SessionOutcomeRequest(
            outcome="UNKNOWN",
        )

def test_override_validation():
    valid = OverrideRequest(
        reason="Talked to the student today and they are doing fine. Can wait.",
        new_priority=0.5
    )
    assert valid.reason != ""
    
    # Too short
    with pytest.raises(Exception):
        OverrideRequest(
            reason="short"
        )
