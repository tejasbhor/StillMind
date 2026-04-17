from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_, func

from app.core.database import get_db
from app.core.dependencies import (
    get_current_user,
    require_student,
    require_counselor,
    require_staff,
)
from app.core.responses import success_response
from app.models.user import User
from app.models.chat_message import ChatMessage
from app.models.allocation import Allocation
from app.models.student_profile import StudentProfile
from app.models.counselor_profile import CounselorProfile

router = APIRouter(prefix="/chat", tags=["Real-time Chat"])

# Import presence tracking from socket
import socketio

# This is a simple check - in production you'd use Redis
_presence_cache: dict = {}  # user_id -> {"sid": "...", "connected_at": ...}


@router.get(
    "/presence/{user_id}",
    summary="Check if user is online",
)
async def check_presence(user_id: str):
    """
    Check if a user is online based on socket connection.
    Returns online status from the in-memory presence tracking.
    """
    from app.modules.chat.socket import _user_presence

    # Check if user is in presence dict
    is_online = user_id in _user_presence

    return success_response(
        data={
            "user_id": user_id,
            "online": is_online,
        }
    )


async def _resolve_profile_id(db: AsyncSession, user: User) -> str | None:
    """Resolve user.id to the corresponding profile.id for allocation auth checks."""
    if user.role == "student":
        result = await db.execute(
            select(StudentProfile.id).where(StudentProfile.user_id == user.id)
        )
        return result.scalar_one_or_none()
    elif user.role == "counselor":
        result = await db.execute(
            select(CounselorProfile.id).where(CounselorProfile.user_id == user.id)
        )
        return result.scalar_one_or_none()
    return None


@router.post("/token", summary="Generate Socket.IO auth token for current user")
async def get_chat_token(user=Depends(get_current_user)):
    """
    Returns the current access token which the frontend passes to Socket.IO
    as the auth.token parameter during connection. The JWT already contains
    sub (user_id) and role claims.
    """
    return success_response(
        data={
            "token_required": True,
            "hint": "Use your access_token as auth.token on Socket.IO connect",
        }
    )


@router.get("/conversations", summary="List accessible chat conversations")
async def list_conversations(
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Returns all active allocations the current user is part of,
    with the last message preview for each conversation.
    """
    profile_id = await _resolve_profile_id(db, user)
    if not profile_id:
        return success_response(data=[])

    if user.role == "student":
        alloc_stmt = select(Allocation).where(
            and_(
                Allocation.student_id == profile_id,
                Allocation.status.in_(["ASSIGNED", "CONFIRMED"]),
            )
        )
    elif user.role == "counselor":
        alloc_stmt = select(Allocation).where(
            and_(
                Allocation.counselor_id == profile_id,
                Allocation.status.in_(["ASSIGNED", "CONFIRMED"]),
            )
        )
    else:
        return success_response(data=[])

    alloc_result = await db.execute(alloc_stmt)
    allocations = alloc_result.scalars().all()

    conversations = []
    for alloc in allocations:
        # Fetch last message
        msg_stmt = (
            select(ChatMessage)
            .where(ChatMessage.allocation_id == alloc.id)
            .order_by(ChatMessage.created_at.desc())
            .limit(1)
        )
        msg_result = await db.execute(msg_stmt)
        last_msg = msg_result.scalar_one_or_none()

        # Fetch the other party's name
        other_name = None
        if user.role == "student":
            c_result = await db.execute(
                select(CounselorProfile.full_name).where(
                    CounselorProfile.id == alloc.counselor_id
                )
            )
            other_name = c_result.scalar_one_or_none()
        elif user.role == "counselor":
            s_result = await db.execute(
                select(StudentProfile.full_name).where(
                    StudentProfile.id == alloc.student_id
                )
            )
            other_name = s_result.scalar_one_or_none()

        conversations.append(
            {
                "allocation_id": alloc.id,
                "other_party_name": other_name,
                "status": alloc.status,
                "slot_time": alloc.slot_time.isoformat() if alloc.slot_time else None,
                "last_message": {
                    "content": last_msg.content,
                    "created_at": last_msg.created_at.isoformat()
                    if hasattr(last_msg.created_at, "isoformat")
                    else str(last_msg.created_at),
                }
                if last_msg
                else None,
            }
        )

    return success_response(data=conversations)


@router.get(
    "/rooms/{allocation_id}/messages", summary="Get chat history for a specific room"
)
async def get_chat_history(
    allocation_id: str,
    limit: int = Query(50, le=100, ge=1),
    offset: int = Query(0, ge=0),
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Fetch paginated chat history for a specific allocation room.
    Only the assigned counselor or student can view messages.
    """
    # 1. Fetch allocation
    stmt = select(Allocation).where(Allocation.id == allocation_id)
    result = await db.execute(stmt)
    allocation = result.scalar_one_or_none()

    if not allocation:
        raise HTTPException(status_code=404, detail="Chat room not found.")

    # 2. Authorize — compare profile IDs, not user.id
    profile_id = await _resolve_profile_id(db, user)
    if profile_id is None:
        raise HTTPException(status_code=403, detail="Profile not found.")

    if user.role == "student" and allocation.student_id != profile_id:
        raise HTTPException(
            status_code=403, detail="Not authorized for this chat room."
        )
    if user.role == "counselor" and allocation.counselor_id != profile_id:
        raise HTTPException(
            status_code=403, detail="Not authorized for this chat room."
        )

    # 3. Fetch paginated history (oldest-first for display)
    history_stmt = (
        select(ChatMessage)
        .where(ChatMessage.allocation_id == allocation_id)
        .order_by(ChatMessage.created_at.desc())
        .offset(offset)
        .limit(limit)
    )
    result = await db.execute(history_stmt)
    messages = result.scalars().all()

    # Reverse so oldest-first for UI display
    messages = list(reversed(messages))

    return success_response(
        data=[
            {
                "id": msg.id,
                "sender_id": msg.sender_id,
                "content": msg.content,
                "created_at": msg.created_at.isoformat()
                if hasattr(msg.created_at, "isoformat")
                else msg.created_at,
            }
            for msg in messages
        ]
    )


@router.post(
    "/conversations", summary="Create conversation — only if assignment exists"
)
async def create_conversation(
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Conversations are implicitly created when an allocation is made.
    This endpoint confirms that an active allocation exists and returns the room ID.
    """
    profile_id = await _resolve_profile_id(db, user)
    if not profile_id:
        raise HTTPException(status_code=404, detail="Profile not found.")

    if user.role == "student":
        stmt = select(Allocation).where(
            and_(
                Allocation.student_id == profile_id,
                Allocation.status.in_(["ASSIGNED", "CONFIRMED"]),
            )
        )
    elif user.role == "counselor":
        stmt = select(Allocation).where(
            and_(
                Allocation.counselor_id == profile_id,
                Allocation.status.in_(["ASSIGNED", "CONFIRMED"]),
            )
        )
    else:
        raise HTTPException(
            status_code=403,
            detail="Only students and counselors can create conversations.",
        )

    result = await db.execute(stmt.order_by(Allocation.created_at.desc()).limit(1))
    allocation = result.scalar_one_or_none()

    if not allocation:
        raise HTTPException(
            status_code=404, detail="No active assignment found. Chat unavailable."
        )

    return success_response(
        data={
            "allocation_id": allocation.id,
            "status": allocation.status,
        }
    )


@router.get(
    "/conversations/{allocation_id}/unread-count",
    summary="Get unread message count for a conversation",
)
async def get_unread_count(
    allocation_id: str,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Get the count of unread messages in a conversation.
    Messages from other users that haven't been seen yet.
    """
    profile_id = await _resolve_profile_id(db, user)
    if not profile_id:
        raise HTTPException(status_code=403, detail="Profile not found.")

    # Verify allocation
    result = await db.execute(select(Allocation).where(Allocation.id == allocation_id))
    allocation = result.scalar_one_or_none()
    if not allocation:
        raise HTTPException(status_code=404, detail="Conversation not found.")

    # Verify membership
    if user.role == "student" and allocation.student_id != profile_id:
        raise HTTPException(status_code=403, detail="Not authorized.")
    if user.role == "counselor" and allocation.counselor_id != profile_id:
        raise HTTPException(status_code=403, detail="Not authorized.")

    # Count unread (not from self, not seen)
    count_result = await db.execute(
        select(func.count(ChatMessage.id))
        .where(ChatMessage.allocation_id == allocation_id)
        .where(ChatMessage.sender_id != user.id)
        .where(ChatMessage.delivery_state != "SEEN")
    )
    unread_count = count_result.scalar() or 0

    return success_response(data={"unread_count": unread_count})


@router.get(
    "/conversations/{allocation_id}/sync",
    summary="Sync missed messages since a timestamp",
)
async def sync_missed_messages(
    allocation_id: str,
    since: str = Query(description="ISO timestamp to sync messages after"),
    limit: int = Query(50, le=100, ge=1),
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Sync messages after a given timestamp.
    Used when reconnecting to fill gaps from being offline.
    """
    profile_id = await _resolve_profile_id(db, user)
    if not profile_id:
        raise HTTPException(status_code=403, detail="Profile not found.")

    # Verify allocation
    result = await db.execute(select(Allocation).where(Allocation.id == allocation_id))
    allocation = result.scalar_one_or_none()
    if not allocation:
        raise HTTPException(status_code=404, detail="Conversation not found.")

    # Verify membership
    if user.role == "student" and allocation.student_id != profile_id:
        raise HTTPException(status_code=403, detail="Not authorized.")
    if user.role == "counselor" and allocation.counselor_id != profile_id:
        raise HTTPException(status_code=403, detail="Not authorized.")

    # Fetch messages after timestamp
    from datetime import datetime, timezone

    try:
        since_dt = datetime.fromisoformat(since.replace("Z", "+00:00"))
    except ValueError:
        since_dt = datetime.now(timezone.utc)

    stmt = (
        select(ChatMessage)
        .where(ChatMessage.allocation_id == allocation_id)
        .where(ChatMessage.created_at > since_dt)
        .order_by(ChatMessage.created_at.asc())
        .limit(limit)
    )
    result = await db.execute(stmt)
    messages = result.scalars().all()

    return success_response(
        data=[
            {
                "id": msg.id,
                "sender_id": msg.sender_id,
                "content": msg.content,
                "delivery_state": msg.delivery_state,
                "is_edited": msg.is_edited,
                "is_deleted": msg.is_deleted,
                "created_at": msg.created_at.isoformat()
                if hasattr(msg.created_at, "isoformat")
                else msg.created_at,
            }
            for msg in messages
        ]
    )


@router.get(
    "/conversations/unread-total",
    summary="Get total unread count across all conversations",
)
async def get_total_unread_count(
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Get total unread messages across all conversations.
    """
    profile_id = await _resolve_profile_id(db, user)
    if not profile_id:
        return success_response(data={"unread_count": 0})

    # Get all allocations for user
    if user.role == "student":
        alloc_stmt = select(Allocation.id).where(
            and_(
                Allocation.student_id == profile_id,
                Allocation.status.in_(["ASSIGNED", "CONFIRMED"]),
            )
        )
    elif user.role == "counselor":
        alloc_stmt = select(Allocation.id).where(
            and_(
                Allocation.counselor_id == profile_id,
                Allocation.status.in_(["ASSIGNED", "CONFIRMED"]),
            )
        )
    else:
        return success_response(data={"unread_count": 0})

    alloc_result = await db.execute(alloc_stmt)
    allocation_ids = [row[0] for row in alloc_result.fetchall()]

    if not allocation_ids:
        return success_response(data={"unread_count": 0})

    # Count all unread messages
    count_result = await db.execute(
        select(func.count(ChatMessage.id))
        .where(ChatMessage.allocation_id.in_(allocation_ids))
        .where(ChatMessage.sender_id != user.id)
        .where(ChatMessage.delivery_state != "SEEN")
    )
    unread_count = count_result.scalar() or 0

    return success_response(data={"unread_count": unread_count})
