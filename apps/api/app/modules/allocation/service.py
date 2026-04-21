from fastapi import HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from datetime import datetime, timezone
from sqlalchemy import select, and_, or_

from app.models.allocation import Allocation
from app.models.counselor_profile import CounselorProfile
from app.services.audit_service import audit
from app.core.idempotency import check_idempotency, store_idempotency, compute_fingerprint
from app.core.student_context import resolve_student_profile_id

class AllocationService:
    async def get_current_allocation(self, db: AsyncSession, user_id: str):
        """`user_id` is `users.id`; allocations reference `student_profiles.id`."""
        profile_id = await resolve_student_profile_id(db, user_id)
        if not profile_id:
            return None
        now = datetime.now(timezone.utc)
        result = await db.execute(
            select(Allocation, CounselorProfile.full_name)
            .join(CounselorProfile, CounselorProfile.id == Allocation.counselor_id)
            .where(
                and_(
                    Allocation.student_id == profile_id,
                    Allocation.status.in_(["ASSIGNED", "CONFIRMED"]),
                    or_(Allocation.slot_time.is_(None), Allocation.slot_time >= now),
                )
            )
            .order_by(Allocation.slot_time.asc())
            .limit(1)
        )
        row = result.first()
        if not row:
            return None

        alloc, counselor_name = row
        return {
            "id": alloc.id,
            "counselor_name": counselor_name,
            "status": alloc.status,
            "slot_time": alloc.slot_time.isoformat() if alloc.slot_time else None,
            "created_at": alloc.created_at.isoformat() if hasattr(alloc.created_at, "isoformat") else alloc.created_at,
            "reason_summary": alloc.reason_summary,
        }

    async def confirm_allocation(self, db: AsyncSession, user_id: str, idempotency_key: str):
        # Check idempotency
        fingerprint = compute_fingerprint(user_id, "/allocation/confirm", {"key": idempotency_key})
        is_dup, stored = await check_idempotency(idempotency_key, fingerprint)
        if is_dup:
            if stored:
                return stored  # Return cached response
            raise HTTPException(status_code=409, detail="Idempotency key conflict")

        profile_id = await resolve_student_profile_id(db, user_id)
        if not profile_id:
            raise HTTPException(status_code=404, detail="Student profile not found.")

        result = await db.execute(
            select(Allocation).where(
                and_(
                    Allocation.id == idempotency_key,
                    Allocation.student_id == profile_id,
                    Allocation.status == "ASSIGNED",
                )
            )
        )
        alloc = result.scalars().first()
        if not alloc:
            raise HTTPException(status_code=404, detail="No pending ASSIGNED allocation found.")

        alloc.status = "CONFIRMED"
        await audit.log(db, action="ALLOCATION_CONFIRMED", actor_id=user_id, actor_role="student", resource_id=alloc.id, metadata={"idempotency_key": idempotency_key})
        await db.commit()

        # Store idempotency response
        response = {"id": alloc.id, "status": alloc.status, "student_profile_id": profile_id}
        await store_idempotency(idempotency_key, fingerprint, response)
        return response

    async def decline_allocation(self, db: AsyncSession, user_id: str, idempotency_key: str):
        # Check idempotency
        fingerprint = compute_fingerprint(user_id, "/allocation/decline", {"key": idempotency_key})
        is_dup, stored = await check_idempotency(idempotency_key, fingerprint)
        if is_dup:
            if stored:
                return stored
            raise HTTPException(status_code=409, detail="Idempotency key conflict")

        profile_id = await resolve_student_profile_id(db, user_id)
        if not profile_id:
            raise HTTPException(status_code=404, detail="Student profile not found.")

        result = await db.execute(
            select(Allocation).where(
                and_(
                    Allocation.id == idempotency_key,
                    Allocation.student_id == profile_id,
                    Allocation.status == "ASSIGNED",
                )
            )
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

        await audit.log(db, action="ALLOCATION_DECLINED", actor_id=user_id, actor_role="student", resource_id=alloc.id, metadata={"idempotency_key": idempotency_key})
        await db.commit()

        response = {"id": alloc.id, "status": alloc.status, "student_profile_id": profile_id}
        await store_idempotency(idempotency_key, fingerprint, response)
        return response

    async def reschedule_allocation(self, db: AsyncSession, user_id: str, idempotency_key: str):
        profile_id = await resolve_student_profile_id(db, user_id)
        if not profile_id:
            raise HTTPException(status_code=404, detail="Student profile not found.")

        result = await db.execute(
            select(Allocation).where(
                and_(
                    Allocation.id == idempotency_key,
                    Allocation.student_id == profile_id,
                    Allocation.status.in_(["ASSIGNED", "CONFIRMED"]),
                )
            )
        )
        alloc = result.scalars().first()
        if not alloc:
            raise HTTPException(status_code=404, detail="No active allocation found for reschedule.")

        alloc.status = "RESCHEDULING"

        # Free up counselor capacity
        counselor_result = await db.execute(select(CounselorProfile).where(CounselorProfile.id == alloc.counselor_id))
        counselor = counselor_result.scalar_one_or_none()
        if counselor and counselor.current_active_cases > 0:
            counselor.current_active_cases -= 1

        await audit.log(db, action="ALLOCATION_RESCHEDULE_REQUESTED", actor_id=user_id, actor_role="student", resource_id=alloc.id, metadata={"idempotency_key": idempotency_key})
        await db.commit()
        return alloc
