from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_, func, desc
from app.models.student_profile import StudentProfile
from app.models.risk_log import RiskLog
from app.models.allocation import Allocation
from app.models.counselor_profile import CounselorProfile
from app.modules.counselor.allocator import compute_priority_score
from app.core.database import AsyncSessionLocal
from app.modules.allocation.worker import run_allocation_cycle
import datetime

class CounselorService:
    async def get_waitlist(self, db: AsyncSession, counselor_id: str | None = None):
        """
        Returns a priority sorted list of students waiting for allocation.
        Computes proper priority scores using CRI, trend, and waiting time.
        """
        now_utc = datetime.datetime.now(datetime.timezone.utc)
        
        # Get students without active allocations who have RED/YELLOW risk
        alloc_subq = select(Allocation.student_id).where(
            Allocation.status.in_(["ASSIGNED", "CONFIRMED", "IN_PROGRESS", "PENDING_RANKING"])
        ).subquery()
        
        result = await db.execute(
            select(RiskLog, StudentProfile)
            .join(StudentProfile, RiskLog.student_id == StudentProfile.id)
            .where(and_(
                RiskLog.risk_level.in_(["RED", "YELLOW"]),
                RiskLog.student_id.not_in(alloc_subq)
            ))
            .order_by(desc(RiskLog.created_at))
        )
        
        rows = result.all()
        
        # Group by student (get latest log per student)
        student_logs = {}
        for log, profile in rows:
            if log.student_id not in student_logs or log.created_at > student_logs[log.student_id][0].created_at:
                student_logs[log.student_id] = (log, profile)
        
        # Compute priority scores
        waitlist = []
        for student_id, (log, profile) in student_logs.items():
            waiting_days = (now_utc - log.created_at).days if log.created_at else 0
            waiting_days = max(0, waiting_days)
            
            priority_score = compute_priority_score(
                float(log.cri_score),
                log.trend,
                waiting_days
            )
            
            waitlist.append({
                "student_id": student_id,
                "student_name": profile.full_name,
                "risk_level": log.risk_level,
                "cri_score": float(log.cri_score),
                "trend": log.trend,
                "waiting_days": waiting_days,
                "priority_score": priority_score,
                "reasoning": log.reasoning,
            })
        
        # Sort: RED first, then by priority score descending
        waitlist.sort(key=lambda x: (0 if x["risk_level"] == "RED" else 1, -x["priority_score"]))
        
        return waitlist

    async def auto_allocate(self, db: AsyncSession):
        """
        Triggers the background allocation worker to match waitlisted students
to available counselors based on Priority Score and Counselor capacity.
        """
        # Enqueue the allocation job to run in the background worker
        from app.workers.settings import arq_redis_settings
        from arq import create_pool
        
        redis = await create_pool(arq_redis_settings)
        job = await redis.enqueue_job("run_allocation_cycle")
        return {"job_id": job.job_id, "status": "queued"}
    
    async def get_capacity(self, db: AsyncSession, counselor_id: str):
        """Get current capacity stats for a counselor."""
        result = await db.execute(
            select(CounselorProfile).where(CounselorProfile.id == counselor_id)
        )
        profile = result.scalar_one_or_none()
        
        if not profile:
            return None
            
        # Count active allocations
        active_result = await db.execute(
            select(func.count(Allocation.id)).where(
                and_(
                    Allocation.counselor_id == counselor_id,
                    Allocation.status.in_(["ASSIGNED", "CONFIRMED", "IN_PROGRESS"])
                )
            )
        )
        active_count = active_result.scalar() or 0
        
        return {
            "max_active_cases": profile.max_active_cases,
            "current_active_cases": active_count,
            "available_slots": max(0, profile.max_active_cases - active_count),
            "is_active": profile.is_active,
        }
    
    async def update_capacity(self, db: AsyncSession, counselor_id: str, delta: int):
        """Update counselor's current active case count (called on assign/complete)."""
        result = await db.execute(
            select(CounselorProfile).where(CounselorProfile.id == counselor_id)
        )
        profile = result.scalar_one_or_none()
        
        if not profile:
            return False
            
        profile.current_active_cases = max(0, profile.current_active_cases + delta)
        await db.commit()
        return True
