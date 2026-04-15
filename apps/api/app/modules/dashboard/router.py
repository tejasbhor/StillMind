from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, and_
import datetime

from app.core.database import get_db
from app.core.dependencies import require_counselor, require_student, require_admin
from app.core.responses import success_response

from app.models.risk_log import RiskLog
from app.models.allocation import Allocation
from app.models.session import Session

# --- COUNSELOR DASHBOARD ---
counselor_router = APIRouter(prefix="/counselors/me/dashboard", tags=["Dashboards (Counselor)"])

@counselor_router.get("", summary="Counselor summary dashboard")
async def get_counselor_dashboard(user=Depends(require_counselor), db: AsyncSession = Depends(get_db)):
    # Get active allocations
    # Quick mock summary
    return success_response(data={
        "priority_queue_count": 0, # Students pending confirmation
        "today_schedule": [], # Upcoming sessions
        "alerts": [] # RED + WORSENING trend alerts
    })

# --- STUDENT DASHBOARD ---
student_router = APIRouter(prefix="/students/me/dashboard", tags=["Dashboards (Student)"])

@student_router.get("", summary="Student summary dashboard")
async def get_student_dashboard(user=Depends(require_student), db: AsyncSession = Depends(get_db)):
    # Safe progress overview, next appointment
    return success_response(data={
        "next_appointment": None,
        "recent_progress": "N/A", # "Improving" / "Stable", etc (no clinical language)
        "sessions_history_count": 0
    })

# --- ADMIN DASHBOARD ---
admin_router = APIRouter(prefix="/admin/dashboard", tags=["Dashboards (Admin)"])

@admin_router.get("", summary="System metrics and overview")
async def get_admin_dashboard(user=Depends(require_admin), db: AsyncSession = Depends(get_db)):
    # Aggregated system data
    
    # Example: getting total users
    from app.models.user import User
    total_users = await db.execute(select(func.count(User.id)))
    
    return success_response(data={
        "total_active_students": 5,
        "total_counselors": 2,
        "average_wait_time_days": 1.5,
        "risk_distribution": {
            "GREEN": 80.0,
            "YELLOW": 15.0,
            "RED": 5.0
        }
    })
