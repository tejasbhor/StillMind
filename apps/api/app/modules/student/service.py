from datetime import datetime, timezone
from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.models.student_profile import StudentProfile
from app.modules.student.schemas import (
    StudentProfileUpdate,
    ConsentSubmit,
    sanitize_name,
    sanitize_input,
    sanitize_phone,
)


class StudentService:
    async def _get_profile(self, db: AsyncSession, user_id: str) -> StudentProfile:
        result = await db.execute(
            select(StudentProfile).where(StudentProfile.user_id == user_id)
        )
        profile = result.scalar_one_or_none()
        if not profile:
            raise HTTPException(status_code=404, detail="Student profile not found")
        return profile

    # ------------------------------------------------------------------
    # Profile with optimistic locking
    # ------------------------------------------------------------------
    async def get_profile(self, db: AsyncSession, user_id: str) -> StudentProfile:
        return await self._get_profile(db, user_id)

    async def update_profile(
        self, db: AsyncSession, user_id: str, req: StudentProfileUpdate
    ) -> StudentProfile:
        profile = await self._get_profile(db, user_id)

        # Optimistic locking check
        if req.version is not None and req.version != profile.version:
            raise HTTPException(
                status_code=409,
                detail="Profile was modified by another request. Please refresh and try again.",
            )

        if req.full_name is not None:
            profile.full_name = sanitize_name(req.full_name)
        if req.phone is not None:
            profile.phone = sanitize_phone(req.phone)
        if req.guardian_contact is not None:
            gc = req.guardian_contact
            profile.guardian_contact = {
                "name": sanitize_name(gc.name),
                "phone": sanitize_phone(gc.phone),
                "relation": sanitize_input(gc.relation),
            }

        if req.notification_preferences is not None:
            consents = dict(profile.consents or {})
            consents["notification_preferences"] = req.notification_preferences.model_dump()
            profile.consents = consents

        # Increment version
        profile.version = (profile.version or 0) + 1
        profile.updated_at = datetime.now(timezone.utc)

        await db.commit()
        await db.refresh(profile)
        return profile

    # ------------------------------------------------------------------
    # Consents — PRD §7.1
    # ------------------------------------------------------------------
    async def get_consents(self, db: AsyncSession, user_id: str) -> dict:
        profile = await self._get_profile(db, user_id)
        return {
            "data_usage": (profile.consents or {}).get("data_usage"),
            "counseling": (profile.consents or {}).get("counseling"),
            "emergency_escalation": (profile.consents or {}).get(
                "emergency_escalation"
            ),
            "profile_status": profile.profile_status,
            "consent_flag": profile.consent_flag,
        }

    async def submit_consents(
        self, db: AsyncSession, user_id: str, req: ConsentSubmit
    ) -> dict:
        profile = await self._get_profile(db, user_id)

        now_ts = datetime.now(timezone.utc).isoformat()
        consents = profile.consents or {}

        consents["data_usage"] = {"granted": req.data_usage.granted, "ts": now_ts}
        consents["counseling"] = {"granted": req.counseling.granted, "ts": now_ts}
        if req.emergency_escalation is not None:
            consents["emergency_escalation"] = {
                "granted": req.emergency_escalation.granted,
                "ts": now_ts,
            }

        # Both required consents must be granted to activate profile
        required_granted = req.data_usage.granted and req.counseling.granted

        profile.consents = consents
        profile.consent_flag = required_granted
        profile.consent_version = "v1.0"
        if required_granted:
            profile.profile_status = "ACTIVE"

        await db.commit()
        await db.refresh(profile)

        return {
            "data_usage": consents.get("data_usage"),
            "counseling": consents.get("counseling"),
            "emergency_escalation": consents.get("emergency_escalation"),
            "profile_status": profile.profile_status,
            "consent_flag": profile.consent_flag,
        }
