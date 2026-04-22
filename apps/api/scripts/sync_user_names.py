import asyncio
import structlog
from sqlalchemy import select, update
from app.core.database import AsyncSessionLocal
from app.models.user import User
from app.models.student_profile import StudentProfile
from app.models.counselor_profile import CounselorProfile

log = structlog.get_logger()

async def sync_names():
    async with AsyncSessionLocal() as db:
        log.info("starting_name_sync")
        
        # 1. Sync Student names
        students = await db.execute(
            select(User.id, StudentProfile.full_name)
            .join(StudentProfile, User.id == StudentProfile.user_id)
            .where(User.full_name == None)
        )
        count = 0
        for user_id, full_name in students:
            if full_name:
                await db.execute(
                    update(User).where(User.id == user_id).values(full_name=full_name)
                )
                count += 1
        
        log.info("students_synced", count=count)
        
        # 2. Sync Counselor names
        counselors = await db.execute(
            select(User.id, CounselorProfile.full_name)
            .join(CounselorProfile, User.id == CounselorProfile.user_id)
            .where(User.full_name == None)
        )
        count = 0
        for user_id, full_name in counselors:
            if full_name:
                await db.execute(
                    update(User).where(User.id == user_id).values(full_name=full_name)
                )
                count += 1
        
        log.info("counselors_synced", count=count)
        
        await db.commit()
        log.info("sync_complete")

if __name__ == "__main__":
    asyncio.run(sync_names())
