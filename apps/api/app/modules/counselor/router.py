from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List

from app.core.database import get_db
from app.core.dependencies import require_counselor
from app.core.responses import success_response
from app.modules.counselor.service import CounselorService

router = APIRouter(prefix="/counselors/me", tags=["Counselor Dashboard"])
_svc = CounselorService()

@router.get("/waitlist", response_model=dict, summary="Get priority waitlist")
async def get_waitlist(
    user=Depends(require_counselor),
    db: AsyncSession = Depends(get_db),
):
    # Retrieve priority-sorted waitlist
    # return success_response(data=logs)
    return success_response(data=[])

@router.post("/auto-allocate", response_model=dict, summary="Trigger auto-allocator")
async def trigger_auto_allocate(
    user=Depends(require_counselor),
    db: AsyncSession = Depends(get_db),
):
    await _svc.auto_allocate(db)
    return success_response(message="Auto-allocation triggered.")
