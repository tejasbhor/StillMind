from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.dependencies import require_student
from app.core.responses import success_response, error_response
from app.modules.allocation.service import AllocationService
from app.modules.allocation.schemas import AllocationConfirmRequest, AllocationView

router = APIRouter(prefix="/students/me/allocation", tags=["Student Allocations"])
_svc = AllocationService()

@router.get("", response_model=dict, summary="Get current allocation")
async def get_allocation(
    user=Depends(require_student),
    db: AsyncSession = Depends(get_db),
):
    alloc = await _svc.get_current_allocation(db, user.id)
    if not alloc:
        return success_response(data=None, message="No active allocation.")
    return success_response(data=alloc)

@router.post("/confirm", response_model=dict, summary="Confirm an assigned slot")
async def confirm_allocation_slot(
    req: AllocationConfirmRequest,
    user=Depends(require_student),
    db: AsyncSession = Depends(get_db)
):
    try:
        alloc = await _svc.confirm_allocation(db, user.id, req.idempotency_key)
        return success_response(message="Allocation confirmed successfully.")
    except Exception as e:
        import traceback
        traceback.print_exc()
        return error_response(str(e), 400)

@router.post("/decline", response_model=dict, summary="Decline an assigned slot")
async def decline_allocation_slot(
    req: AllocationConfirmRequest,
    user=Depends(require_student),
    db: AsyncSession = Depends(get_db)
):
    try:
        alloc = await _svc.decline_allocation(db, user.id, req.idempotency_key)
        return success_response(message="Allocation declined. Slot released.")
    except Exception as e:
        return error_response(str(e), 400)
