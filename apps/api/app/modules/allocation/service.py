from fastapi import HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_

from app.models.allocation import Allocation
from app.models.counselor_profile import CounselorProfile
from app.services.audit_service import audit
from app.models.user import User
from app.core.idempotency import check_idempotency, store_idempotency, compute_fingerprint

class AllocationService:
    async def get_current_allocation(self, db: AsyncSession, student_id: str):
        result = await db.execute(
            select(Allocation, User.full_name.label("counselor_name"))
            .join(CounselorProfile, CounselorProfile.id == Allocation.counselor_id)
            .join(User, User.id == CounselorProfile.user_id)
            .where(and_(
                Allocation.student_id == student_id,
                Allocation.status.in_(["ASSIGNED", "CONFIRMED", "IN_PROGRESS"])
            ))
            .order_by(Allocation.created_at.desc())
            .limit(1)
        )
        row = result.first()
        if not row:
            return None
        
        alloc, c_name = row
        return {
            "id": alloc.id,
            "counselor_name": c_name,
            "status": alloc.status,
            "slot_time": alloc.slot_time.isoformat() if alloc.slot_time else None,
            "created_at": alloc.created_at.isoformat() if hasattr(alloc.created_at, "isoformat") else alloc.created_at
        }

    async def confirm_allocation(self, db: AsyncSession, student_id: str, idempotency_key: str):
        # Check idempotency
        fingerprint = compute_fingerprint(student_id, "/allocation/confirm", {"key": idempotency_key})
        is_dup, stored = await check_idempotency(idempotency_key, fingerprint)
        if is_dup:
            if stored:
                return stored  # Return cached response
            raise HTTPException(status_code=409, detail="Idempotency key conflict")
        
        result = await db.execute(
            select(Allocation).where(and_(
                Allocation.student_id == student_id,
                Allocation.status == "ASSIGNED"
            )).order_by(Allocation.created_at.desc())
        )
        alloc = result.scalars().first()
        if not alloc:
            raise HTTPException(status_code=404, detail="No pending ASSIGNED allocation found.")
            
        alloc.status = "CONFIRMED"
        await audit.log(db, action="ALLOCATION_CONFIRMED", actor_id=student_id, actor_role="student", resource_id=alloc.id, metadata={"idempotency_key": idempotency_key})
        await db.commit()
        
        # Store idempotency response
        response = {"id": alloc.id, "status": alloc.status, "student_id": student_id}
        await store_idempotency(idempotency_key, fingerprint, response)
        return response

    async def decline_allocation(self, db: AsyncSession, student_id: str, idempotency_key: str):
        # Check idempotency
        fingerprint = compute_fingerprint(student_id, "/allocation/decline", {"key": idempotency_key})
        is_dup, stored = await check_idempotency(idempotency_key, fingerprint)
        if is_dup:
            if stored:
                return stored
            raise HTTPException(status_code=409, detail="Idempotency key conflict")
        
        result = await db.execute(
            select(Allocation).where(and_(
                Allocation.student_id == student_id,
                Allocation.status == "ASSIGNED"
            )).order_by(Allocation.created_at.desc())
        )
        alloc = result.scalars().first()
        if not alloc:
            raise HTTPException(status_code=404, detail="No pending ASSIGNED allocation found.")
            
        alloc.status = "DECLINED"
        
        # Free up counselor capacity
        counselor_result = await db.execute(select(CounselorProfile).where(CounselorProfile.id == alloc.counselor_id))
        counselor = counselor_result.scalar_one_or_none()
        if counselor and counselor.current_active_cases > 0:
            counselor.current_active_cases -= 1
            
        await audit.log(db, action="ALLOCATION_DECLINED", actor_id=student_id, actor_role="student", resource_id=alloc.id, metadata={"idempotency_key": idempotency_key})
        await db.commit()
        
        response = {"id": alloc.id, "status": alloc.status, "student_id": student_id}
        await store_idempotency(idempotency_key, fingerprint, response)
        return response

    async def reschedule_allocation(self, db: AsyncSession, student_id: str, idempotency_key: str):
        result = await db.execute(
            select(Allocation).where(and_(
                Allocation.student_id == student_id,
                Allocation.status == "ASSIGNED"
            )).order_by(Allocation.created_at.desc())
        )
        alloc = result.scalars().first()
        if not alloc:
            raise HTTPException(status_code=404, detail="No pending ASSIGNED allocation found.")
            
        alloc.status = "RESCHEDULING"
        
        # Free up counselor capacity
        counselor_result = await db.execute(select(CounselorProfile).where(CounselorProfile.id == alloc.counselor_id))
        counselor = counselor_result.scalar_one_or_none()
        if counselor and counselor.current_active_cases > 0:
            counselor.current_active_cases -= 1
            
        await audit.log(db, action="ALLOCATION_RESCHEDULE_REQUESTED", actor_id=student_id, actor_role="student", resource_id=alloc.id, metadata={"idempotency_key": idempotency_key})
        await db.commit()
        return alloc
