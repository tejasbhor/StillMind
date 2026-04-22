from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, and_, desc
import datetime

from app.core.database import get_db
from app.core.dependencies import require_counselor, require_student, require_admin
from app.core.responses import success_response

from app.models.user import User
from app.models.student_profile import StudentProfile
from app.models.counselor_profile import CounselorProfile
from app.models.assessment import Assessment
from app.models.risk_log import RiskLog
from app.models.allocation import Allocation
from app.models.chat_conversation import ChatConversationParticipant
from app.models.chat_message import ChatMessage

# --- COUNSELOR DASHBOARD ---
counselor_router = APIRouter(prefix="/counselors/me/dashboard", tags=["Dashboards (Counselor)"])

@counselor_router.get("", summary="Counselor summary dashboard")
async def get_counselor_dashboard(user=Depends(require_counselor), db: AsyncSession = Depends(get_db)):
    # 1. Get counselor profile
    profile_stmt = select(CounselorProfile).where(CounselorProfile.user_id == user.id)
    profile_res = await db.execute(profile_stmt)
    profile = profile_res.scalar_one_or_none()
    
    if not profile:
        return success_response(data={
            "priority_queue_count": 0,
            "today_schedule": [],
            "alerts": [],
            "full_name": user.email
        })

    # 2. Today's schedule
    today = datetime.date.today()
    tomorrow = today + datetime.timedelta(days=1)
    
    # We need to manually construct the TZ aware datetime for query
    # Assuming the server is UTC
    start_of_day = datetime.datetime.combine(today, datetime.time.min).replace(tzinfo=datetime.timezone.utc)
    end_of_day = datetime.datetime.combine(today, datetime.time.max).replace(tzinfo=datetime.timezone.utc)

    schedule_stmt = (
        select(Allocation, StudentProfile.full_name)
        .join(StudentProfile, Allocation.student_id == StudentProfile.id)
        .where(
            and_(
                Allocation.counselor_id == profile.id,
                Allocation.slot_time >= start_of_day,
                Allocation.slot_time <= end_of_day
            )
        )
        .order_by(Allocation.slot_time.asc())
    )
    schedule_res = await db.execute(schedule_stmt)
    schedule_rows = schedule_res.all()
    
    today_schedule = []
    for alloc, student_name in schedule_rows:
        # Get risk level for student
        risk_stmt = select(RiskLog.risk_level).where(
            RiskLog.student_id == alloc.student_id
        ).order_by(RiskLog.created_at.desc()).limit(1)
        risk_res = await db.execute(risk_stmt)
        risk_level = risk_res.scalar_one_or_none() or "GREEN"
        
        today_schedule.append({
            "id": alloc.id,
            "student": student_name,
            "time": alloc.slot_time.strftime("%I:%M %p"),
            "status": alloc.status,
            "risk": risk_level
        })

    # 3. Priority Queue Count (Assigned to this counselor but not yet completed)
    queue_stmt = select(func.count(Allocation.id)).where(
        and_(
            Allocation.counselor_id == profile.id,
            Allocation.status.in_(["ASSIGNED", "CONFIRMED", "IN_PROGRESS"])
        )
    )
    queue_res = await db.execute(queue_stmt)
    queue_count = queue_res.scalar() or 0

    # 4. Alerts (Students with RED risk level)
    # This is a bit complex, let's just fetch recent RED logs for students assigned to this counselor
    alert_stmt = (
        select(RiskLog, StudentProfile.full_name)
        .join(StudentProfile, RiskLog.student_id == StudentProfile.id)
        .join(Allocation, Allocation.student_id == StudentProfile.id)
        .where(
            and_(
                Allocation.counselor_id == profile.id,
                RiskLog.risk_level == "RED"
            )
        )
        .order_by(RiskLog.created_at.desc())
        .limit(5)
    )
    alert_res = await db.execute(alert_stmt)
    alert_rows = alert_res.all()
    
    alerts = []
    for log_entry, student_name in alert_rows:
        alerts.append({
            "id": log_entry.id,
            "type": "red-new",
            "label": f"RED Risk: {student_name}",
            "detail": f"Classified RED on {log_entry.created_at.strftime('%d %b')}.",
            "time": log_entry.created_at.strftime("%I:%M %p")
        })

    return success_response(data={
        "full_name": profile.full_name,
        "priority_queue_count": queue_count,
        "today_schedule": today_schedule,
        "alerts": alerts,
        "unread_messages": await _get_unread_total(db, user.id)
    })

@counselor_router.get("/priority-queue", summary="Detailed priority queue for counselor")
async def get_counselor_priority_queue(user=Depends(require_counselor), db: AsyncSession = Depends(get_db)):
    profile_stmt = select(CounselorProfile).where(CounselorProfile.user_id == user.id)
    profile_res = await db.execute(profile_stmt)
    profile = profile_res.scalar_one_or_none()
    
    if not profile:
        return success_response(data=[])

    # One row per active allocation (student may appear more than once if multiple allocations)
    stmt = (
        select(StudentProfile, Allocation)
        .join(Allocation, Allocation.student_id == StudentProfile.id)
        .where(
            and_(
                Allocation.counselor_id == profile.id,
                Allocation.status.in_(["ASSIGNED", "CONFIRMED", "IN_PROGRESS"]),
            )
        )
        .order_by(desc(Allocation.priority_score))
    )
    res = await db.execute(stmt)
    rows = res.all()

    risk_rank = {"RED": 0, "YELLOW": 1, "GREEN": 2}
    data: list[dict] = []

    for student, alloc_rec in rows:
        rl_stmt = (
            select(RiskLog)
            .where(RiskLog.student_id == student.id)
            .order_by(desc(RiskLog.created_at))
            .limit(1)
        )
        rl_res = await db.execute(rl_stmt)
        log_rec = rl_res.scalar_one_or_none()

        last_session_stmt = (
            select(Allocation.completed_at)
            .where(
                and_(
                    Allocation.student_id == student.id,
                    Allocation.status == "COMPLETED",
                )
            )
            .order_by(desc(Allocation.completed_at))
            .limit(1)
        )
        last_session_res = await db.execute(last_session_stmt)
        last_session_date = last_session_res.scalar()

        reasons: list = []
        if log_rec and log_rec.reasoning:
            reasons = list(log_rec.reasoning) if isinstance(log_rec.reasoning, list) else []

        risk = (log_rec.risk_level if log_rec else "GREEN") or "GREEN"
        cri = float(log_rec.cri_score) if log_rec else 0.0
        trend = (log_rec.trend if log_rec else "STABLE") or "STABLE"

        data.append({
            "id": student.id,
            "studentId": student.id[:8].upper(),
            "initials": "".join([n[0] for n in (student.full_name or "").split() if n]) or "?",
            "risk": risk,
            "trend": trend,
            "cri": cri,
            "lastSession": last_session_date.strftime("%d %B %Y") if last_session_date else "N/A",
            "priorityScore": float(alloc_rec.priority_score) if alloc_rec.priority_score is not None else cri,
            "reasons": reasons,
        })

    data.sort(
        key=lambda row: (
            risk_rank.get(row["risk"], 3),
            -row["cri"],
        )
    )

    return success_response(data=data)
student_router = APIRouter(prefix="/students/me/dashboard", tags=["Dashboards (Student)"])

@student_router.get("", summary="Student summary dashboard")
async def get_student_dashboard(user=Depends(require_student), db: AsyncSession = Depends(get_db)):
    # 1. Get student profile
    profile_stmt = select(StudentProfile).where(StudentProfile.user_id == user.id)
    profile_res = await db.execute(profile_stmt)
    profile = profile_res.scalar_one_or_none()
    
    if not profile:
        return success_response(data={
            "next_appointment": None,
            "recent_progress": "N/A",
            "sessions_history_count": 0,
            "full_name": user.email # Fallback
        })

    # 2. Get next appointment (Allocation)
    # Join with CounselorProfile to get the name
    alloc_stmt = (
        select(Allocation, CounselorProfile.full_name)
        .join(CounselorProfile, Allocation.counselor_id == CounselorProfile.id)
        .where(
            and_(
                Allocation.student_id == profile.id,
                Allocation.status.in_(["ASSIGNED", "CONFIRMED"]),
                Allocation.slot_time >= datetime.datetime.now(datetime.timezone.utc)
            )
        )
        .order_by(Allocation.slot_time.asc())
        .limit(1)
    )
    alloc_res = await db.execute(alloc_stmt)
    next_alloc_row = alloc_res.first()
    
    next_appointment = None
    if next_alloc_row:
        alloc, counselor_name = next_alloc_row
        next_appointment = {
            "id": alloc.id,
            "counselor": counselor_name,
            "date": alloc.slot_time.strftime("%A, %d %B %Y"),
            "time": alloc.slot_time.strftime("%I:%M %p"),
            "status": alloc.status,
            "daysUntil": (alloc.slot_time - datetime.datetime.now(datetime.timezone.utc)).days
        }

    # 3. Get recent progress (Trend)
    # Simple logic: check if risk level decreased in last 2 logs
    log_stmt = (
        select(RiskLog.risk_level)
        .where(RiskLog.student_id == profile.id)
        .order_by(RiskLog.created_at.desc())
        .limit(2)
    )
    log_res = await db.execute(log_stmt)
    logs = log_res.scalars().all()
    
    trend = "STABLE"
    if len(logs) >= 2:
        # Values: GREEN=1, YELLOW=2, RED=3 (Mental model)
        risk_map = {"GREEN": 1, "YELLOW": 2, "RED": 3}
        current_val = risk_map.get(logs[0], 2)
        prev_val = risk_map.get(logs[1], 2)
        if current_val < prev_val: trend = "IMPROVING"
        elif current_val > prev_val: trend = "WORSENING"

    # 4. Get session count
    count_stmt = select(func.count(Allocation.id)).where(
        and_(
            Allocation.student_id == profile.id,
            Allocation.status == "COMPLETED"
        )
    )
    count_res = await db.execute(count_stmt)
    history_count = count_res.scalar() or 0

    # 5. Get current risk from profile or latest assessment
    # We might need to add a risk_level field to StudentProfile or fetch latest Assessment
    risk_stmt = select(Assessment.phq9_total, Assessment.gad7_total).where(
        Assessment.student_id == profile.id
    ).order_by(Assessment.created_at.desc()).limit(1)
    risk_res = await db.execute(risk_stmt)
    last_risk = risk_res.first()
    
    current_risk = "GREEN"
    if last_risk:
        phq, gad = last_risk
        if phq > 16 or gad > 12: current_risk = "RED"
        elif phq > 9 or gad > 7: current_risk = "YELLOW"

    return success_response(data={
        "full_name": profile.full_name,
        "next_appointment": next_appointment,
        "recent_progress": trend,
        "sessions_history_count": history_count,
        "risk_level": current_risk,
        "next_assessment_due": (datetime.datetime.now() + datetime.timedelta(days=14)).strftime("%d %B %Y")
    })

# --- ADMIN DASHBOARD ---
admin_router = APIRouter(prefix="/admin/dashboard", tags=["Dashboards (Admin)"])

@admin_router.get("", summary="System metrics and overview")
async def get_admin_dashboard(user=Depends(require_admin), db: AsyncSession = Depends(get_db)):
    org_id = user.organization_id

    total_students_stmt = (
        select(func.count(StudentProfile.id))
        .join(User, StudentProfile.user_id == User.id)
        .where(User.organization_id == org_id)
    )
    total_students = (await db.execute(total_students_stmt)).scalar() or 0

    total_counselors_stmt = (
        select(func.count(CounselorProfile.id))
        .join(User, CounselorProfile.user_id == User.id)
        .where(User.organization_id == org_id)
    )
    total_counselors = (await db.execute(total_counselors_stmt)).scalar() or 0

    sp_in_org = (
        select(StudentProfile.id)
        .join(User, StudentProfile.user_id == User.id)
        .where(User.organization_id == org_id)
    )
    wait_time_stmt = (
        select(func.avg(Allocation.slot_time - Allocation.created_at))
        .where(
            and_(
                Allocation.status.in_(["CONFIRMED", "COMPLETED"]),
                Allocation.student_id.in_(sp_in_org),
            )
        )
    )
    wait_time_res = await db.execute(wait_time_stmt)
    avg_wait = wait_time_res.scalar()

    avg_wait_days = 0.0
    if avg_wait:
        if isinstance(avg_wait, datetime.timedelta):
            avg_wait_days = avg_wait.total_seconds() / 86400
        else:
            try:
                avg_wait_days = float(avg_wait) / 86400 if isinstance(avg_wait, (int, float)) else 0.0
            except Exception:
                avg_wait_days = 0.0

    risk_stats = {"GREEN": 0, "YELLOW": 0, "RED": 0}
    sid_rows = await db.execute(sp_in_org)
    student_ids = [r[0] for r in sid_rows.all()]
    for sid in student_ids:
        rl = await db.execute(
            select(RiskLog.risk_level)
            .where(RiskLog.student_id == sid)
            .order_by(desc(RiskLog.created_at))
            .limit(1)
        )
        lvl = rl.scalar_one_or_none()
        if lvl in risk_stats:
            risk_stats[lvl] += 1
    total_logs = sum(risk_stats.values())
    if total_logs > 0:
        distribution = {k: round((v / total_logs) * 100, 1) for k, v in risk_stats.items()}
    else:
        distribution = {"GREEN": 100.0, "YELLOW": 0.0, "RED": 0.0}

    return success_response(
        data={
            "total_active_students": total_students,
            "total_counselors": total_counselors,
            "average_wait_time_days": round(avg_wait_days, 1),
            "risk_distribution": distribution,
        }
    )


async def _get_unread_total(db: AsyncSession, user_id: str) -> int:
    convo_ids_result = await db.execute(
        select(ChatConversationParticipant.conversation_id).where(
            ChatConversationParticipant.user_id == user_id
        )
    )
    conversation_ids = [row[0] for row in convo_ids_result.all()]
    if not conversation_ids:
        return 0

    count_result = await db.execute(
        select(func.count(ChatMessage.id))
        .where(ChatMessage.conversation_id.in_(conversation_ids))
        .where(ChatMessage.sender_id != user_id)
        .where(ChatMessage.delivery_state != "SEEN")
    )
    return count_result.scalar() or 0
