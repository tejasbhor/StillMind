import uuid
import datetime
import structlog
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_, func

from app.core.database import AsyncSessionLocal
from app.models.student_profile import StudentProfile
from app.models.counselor_profile import CounselorProfile
from app.models.user import User
from app.modules.notifications import service as notification_service
from app.models.allocation import Allocation
from app.models.risk_log import RiskLog
from app.models.admin_config import AdminConfig
from app.modules.counselor.allocator import compute_priority_score
from app.services.audit_service import audit

log = structlog.get_logger(__name__)

async def run_allocation_cycle(ctx):
    """
    Scheduled ARQ worker job. 
    1. Filter: RED/YELLOW students with no active allocation.
    2. Compute Priority: Using CRI, trend, days waiting.
    3. Rank: Order by priority desc.
    4. Assign: Top N to counselors based on capacity.
    """
    log.info("allocation_cycle_started")
    now_utc = datetime.datetime.utcnow()
    
    async with AsyncSessionLocal() as db:
        try:
            # Get counselors with available capacity
            c_result = await db.execute(
                select(CounselorProfile)
                .where(CounselorProfile.is_active == True)
            )
            counselors = c_result.scalars().all()
            available_counselors = [c for c in counselors if c.current_active_cases < c.max_active_cases]
            
            if not available_counselors:
                log.warning("allocation_cycle_no_counselor_capacity")
                return

            # Note: For MVP in this PRD, we define eligibility as Risk=RED/YELLOW & no valid allocation
            # We fetch all active risk logs that aren't GREEN
            # Need to find students who don't have an active allocation.
            
            # Simple approach: fetch all unallocated students
            alloc_subq = select(Allocation.student_id).where(
                Allocation.status.in_(["ASSIGNED", "CONFIRMED", "PENDING_RANKING"])
            ).subquery()
            
            r_result = await db.execute(
                select(RiskLog)
                .where(and_(
                    RiskLog.risk_level.in_(["RED", "YELLOW"]),
                    RiskLog.student_id.not_in(alloc_subq)
                ))
            )
            # Group to get latest log per student
            student_latest_logs = {}
            for r in r_result.scalars().all():
                if r.student_id not in student_latest_logs or r.created_at > student_latest_logs[r.student_id].created_at:
                    student_latest_logs[r.student_id] = r
            
            # Rank students using dynamic weights
            config_res = await db.execute(select(AdminConfig).where(AdminConfig.config_key == "allocation_weights"))
            w_config = config_res.scalar_one_or_none()
            weights = w_config.config_value.get("weights") if w_config else None
            
            ranked_students = []
            for student_id, log_rec in student_latest_logs.items():
                waiting_days = (now_utc - getattr(log_rec, 'created_at', now_utc)).days
                waiting_days = max(0, waiting_days)
                
                score = compute_priority_score(
                    float(log_rec.cri_score), 
                    log_rec.trend, 
                    waiting_days,
                    weights=weights
                )
                ranked_students.append({
                    "student_id": student_id,
                    "risk_level": log_rec.risk_level,
                    "score": score
                })
            
            # Sort: RED first usually implicitly handled by CRI, but we can do a secondary sort
            ranked_students.sort(key=lambda x: (1 if x["risk_level"] == "RED" else 0, x["score"]), reverse=True)
            
            # Allocation loop
            allocations_made = 0
            from app.modules.counselor.allocator import compute_match_score
            
            for student in ranked_students:
                if not available_counselors:
                    break # No capacity left
                    
                # 1. Fetch student concerns
                s_profile_res = await db.execute(
                    select(StudentProfile).where(StudentProfile.id == student["student_id"])
                )
                s_profile = s_profile_res.scalar_one_or_none()
                concerns = s_profile.clinical_concerns if s_profile else []

                # 2. Find best matching counselor based on (Match Score + Capacity weight)
                def get_counselor_score(c: CounselorProfile):
                    match_score = compute_match_score(concerns, c.specialties or [])
                    capacity_score = (c.max_active_cases - c.current_active_cases) / c.max_active_cases
                    return (match_score * 0.7) + (capacity_score * 0.3)

                available_counselors.sort(key=get_counselor_score, reverse=True)
                selected_counselor = available_counselors[0]
                
                new_allocation = Allocation(
                    id=str(uuid.uuid4()),
                    student_id=student["student_id"],
                    counselor_id=selected_counselor.id,
                    priority_score=student["score"],
                    status="ASSIGNED",
                    reason_summary=f"Matched automatically. Priority {student['score']:.2f}. Match quality: {compute_match_score(concerns, selected_counselor.specialties or []):.1f}"
                )
                db.add(new_allocation)
                selected_counselor.current_active_cases += 1
                allocations_made += 1
                
                # 3. Notify Student (Email)
                try:
                    user_stmt = select(User.email).where(User.id == s_profile.user_id)
                    user_res = await db.execute(user_stmt)
                    to_email = user_res.scalar()
                    if to_email:
                        await notification_service.send_counselor_assigned(
                            to_email=to_email,
                            counselor_name=selected_counselor.full_name,
                            name=s_profile.full_name
                        )
                except Exception as e:
                    log.error("allocation_email_failed", error=str(e), student_id=student["student_id"])
                
                if selected_counselor.current_active_cases >= selected_counselor.max_active_cases:
                    available_counselors.remove(selected_counselor)

            await db.commit()
            log.info("allocation_cycle_completed", assigned_count=allocations_made, pending_queue_size=len(ranked_students)-allocations_made)
            
        except Exception as exc:
            log.error("allocation_cycle_failed", error=str(exc))
            await db.rollback()
            raise
