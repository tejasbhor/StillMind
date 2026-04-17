from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_

from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.core.responses import success_response
from app.models.user import User
from app.models.notification import Notification

router = APIRouter(prefix="/notifications", tags=["Notifications"])


@router.get("", summary="List notifications for current user")
async def list_notifications(
    limit: int = Query(20, le=100, ge=1),
    offset: int = Query(0, ge=0),
    unread_only: bool = Query(False),
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    stmt = select(Notification).where(Notification.user_id == user.id)
    if unread_only:
        stmt = stmt.where(Notification.is_read == False)  # noqa: E712
    stmt = stmt.order_by(Notification.created_at.desc()).offset(offset).limit(limit)
    result = await db.execute(stmt)
    notifications = result.scalars().all()

    return success_response(data=[
        {
            "id": n.id,
            "channel": n.channel,
            "template_code": n.template_code,
            "payload": n.payload,
            "is_read": n.is_read,
            "status": n.status,
            "created_at": n.created_at.isoformat() if hasattr(n.created_at, "isoformat") else n.created_at,
        }
        for n in notifications
    ])


@router.post("/{notification_id}/read", summary="Mark notification as read")
async def mark_notification_read(
    notification_id: str,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Notification).where(
            and_(Notification.id == notification_id, Notification.user_id == user.id)
        )
    )
    notification = result.scalar_one_or_none()
    if not notification:
        raise HTTPException(status_code=404, detail="Notification not found.")

    notification.is_read = True
    await db.commit()
    return success_response(message="Notification marked as read.")


@router.post("/mark-all-read", summary="Mark all notifications as read")
async def mark_all_read(
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Notification).where(
            and_(Notification.user_id == user.id, Notification.is_read == False)  # noqa: E712
        )
    )
    notifications = result.scalars().all()
    for n in notifications:
        n.is_read = True
    await db.commit()
    return success_response(message=f"{len(notifications)} notifications marked as read.")
