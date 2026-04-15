from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.dependencies import require_counselor
from app.core.responses import success_response, error_response
from app.modules.session.service import SessionService
from app.modules.session.schemas import SessionNoteCreate, SessionOutcomeRequest, OverrideRequest

router = APIRouter(prefix="/counselors/sessions", tags=["Counselor Sessions"])
_svc = SessionService()

@router.post("/{session_id}/notes", summary="Submit structured session note")
async def submit_session_notes(
    session_id: str,
    req: SessionNoteCreate,
    user=Depends(require_counselor),
    db: AsyncSession = Depends(get_db)
):
    note = await _svc.add_session_note(db, session_id, user.id, req)
    return success_response(message="Session notes saved securely.", data={"note_id": note.id})

@router.post("/{session_id}/mark-no-show", summary="Mark session as no-show")
async def mark_no_show(
    session_id: str,
    user=Depends(require_counselor),
    db: AsyncSession = Depends(get_db)
):
    session = await _svc.mark_no_show(db, session_id, user.id)
    return success_response(message="Session marked as missed.")

@router.post("/{session_id}/outcome", summary="Log outcome of session")
async def log_outcome(
    session_id: str,
    req: SessionOutcomeRequest,
    user=Depends(require_counselor),
    db: AsyncSession = Depends(get_db)
):
    await _svc.log_outcome(db, session_id, user.id, req)
    return success_response(message="Outcome logged successfully.")

@router.post("/{allocation_id}/override", summary="Log manual override decision")
async def override_decision(
    allocation_id: str,
    req: OverrideRequest,
    user=Depends(require_counselor),
    db: AsyncSession = Depends(get_db)
):
    await _svc.override_decision(db, allocation_id, user.id, req)
    return success_response(message="Override audited and logged.")
