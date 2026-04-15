from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_, func
from app.models.student_profile import StudentProfile
from app.models.risk_log import RiskLog
from app.models.allocation import Allocation
from app.models.counselor_profile import CounselorProfile
import datetime

class CounselorService:
    async def get_waitlist(self, db: AsyncSession):
        """
        Returns a priority sorted list of students waiting for allocation.
        """
        # In a real scenario we use the RiskLog with latest 'created_at' for each student
        # and join with StudentProfile and their Waiting statuses.
        # For MVP, let's fetch active unallocated RiskLogs
        
        result = await db.execute(
            select(RiskLog)
            .where(RiskLog.risk_level != "GREEN") # Only Yellow/Red need allocation
            # We would join Allocation to ensure they aren't already allocated
            .order_by(RiskLog.created_at.desc())
        )
        
        logs = result.scalars().all()
        # Filter logic here to group by latest per student and compute priority
        
        return logs

    async def auto_allocate(self, db: AsyncSession):
        """
        Runs the auto-allocation logic matching waitlisted students to counselors
        based on Priority Score and Counselor capacity.
        """
        pass
