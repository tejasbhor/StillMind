import uuid
import datetime
from fastapi import HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_

from app.models.session import Session
from app.models.session_note import SessionNote
from app.models.allocation import Allocation
from app.services.audit_service import audit
from app.modules.session.schemas import SessionNoteCreate, SessionOutcomeRequest, OverrideRequest

class SessionService:
    async def create_session(self, db: AsyncSession, allocation_id: str, slot_time: datetime.datetime):
        # Called when allocation is CONFIRMED
        session = Session(
            id=str(uuid.uuid4()),
            allocation_id=allocation_id,
            status="SCHEDULED",
            session_date=slot_time
        )
        db.add(session)
        await db.commit()
        await db.refresh(session)
        return session

    async def get_my_sessions(self, db: AsyncSession, user_id: str, role: str):
        # In a real impl, join with Allocation and check counselor_id or student_id matches user_id
        # Simplification for MVP tests
        pass

    async def mark_no_show(self, db: AsyncSession, session_id: str, counselor_id: str):
        result = await db.execute(select(Session).where(Session.id == session_id))
        session = result.scalar_one_or_none()
        if not session:
            raise HTTPException(404, "Session not found")
        
        # In production check if this session belongs to the counselor
        session.status = "MISSED"
        await audit.log(db, action="SESSION_NO_SHOW", actor_id=counselor_id, actor_role="counselor", resource_id=session.id)
        
        # Trigger engagement flag (domain event hook placeholder)
        await db.commit()
        return session

    async def add_session_note(self, db: AsyncSession, session_id: str, counselor_id: str, req: SessionNoteCreate):
        result = await db.execute(select(Session).where(Session.id == session_id))
        session = result.scalar_one_or_none()
        if not session:
            raise HTTPException(404, "Session not found")
            
        note = SessionNote(
            id=str(uuid.uuid4()),
            session_id=session.id,
            counselor_id=counselor_id,
            mood=req.mood,
            engagement=req.engagement,
            key_concerns=req.key_concerns,
            risk_flag=req.risk_flag,
            action_plan=req.action_plan
        )
        session.status = "COMPLETED"
        db.add(note)
        
        await audit.log(db, action="SESSION_NOTE_ADDED", actor_id=counselor_id, actor_role="counselor", resource_id=session.id)
        await db.commit()
        return note

    async def log_outcome(self, db: AsyncSession, session_id: str, counselor_id: str, req: SessionOutcomeRequest):
        # Typically log the outcome or attach it to the session note / external outcome table
        await audit.log(db, action="SESSION_OUTCOME_LOGGED", actor_id=counselor_id, actor_role="counselor", resource_id=session_id, metadata=req.model_dump())
        return {"status": "success"}

    async def override_decision(self, db: AsyncSession, allocation_id: str, counselor_id: str, req: OverrideRequest):
        await audit.log(
            db, 
            action="COUNSELOR_OVERRIDE", 
            actor_id=counselor_id, 
            actor_role="counselor", 
            resource_id=allocation_id, 
            metadata=req.model_dump()
        )
        return {"status": "success"}
