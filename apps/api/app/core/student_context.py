"""Resolve student profile (clinical id) from auth user id."""

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.student_profile import StudentProfile


async def resolve_student_profile_id(db: AsyncSession, user_id: str) -> str | None:
    r = await db.execute(select(StudentProfile.id).where(StudentProfile.user_id == user_id))
    return r.scalar_one_or_none()
