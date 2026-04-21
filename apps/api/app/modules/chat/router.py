from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel, Field
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.core.responses import success_response
from app.models.allocation import Allocation
from app.models.chat_conversation import ChatConversation, ChatConversationParticipant
from app.models.chat_message import ChatMessage
from app.models.counselor_profile import CounselorProfile
from app.models.student_profile import StudentProfile
from app.models.user import User

router = APIRouter(prefix="/chat", tags=["Real-time Chat"])


class CreateConversationRequest(BaseModel):
    participant_ids: list[str] = Field(default_factory=list, min_length=1)
    title: str | None = None
    allocation_id: str | None = None
    kind: str = "GROUP"


async def _display_name_for_user_id(db: AsyncSession, user: User) -> str:
    if user.role == "student":
        row = await db.execute(
            select(StudentProfile.full_name).where(StudentProfile.user_id == user.id)
        )
        return row.scalar_one_or_none() or user.email
    if user.role == "counselor":
        row = await db.execute(
            select(CounselorProfile.full_name).where(CounselorProfile.user_id == user.id)
        )
        return row.scalar_one_or_none() or user.email
    return user.email


async def _assert_member_or_403(
    db: AsyncSession, conversation_id: str, user_id: str
) -> ChatConversation:
    convo_result = await db.execute(
        select(ChatConversation).where(ChatConversation.id == conversation_id)
    )
    conversation = convo_result.scalar_one_or_none()
    if not conversation:
        raise HTTPException(status_code=404, detail="Conversation not found.")

    member_result = await db.execute(
        select(ChatConversationParticipant.id).where(
            ChatConversationParticipant.conversation_id == conversation_id,
            ChatConversationParticipant.user_id == user_id,
        )
    )
    if not member_result.scalar_one_or_none():
        raise HTTPException(status_code=403, detail="Not authorized.")
    return conversation


@router.get("/presence/{user_id}", summary="Check if user is online")
async def check_presence(user_id: str):
    from app.modules.chat.socket import _user_presence

    return success_response(data={"user_id": user_id, "online": user_id in _user_presence})


@router.post("/token", summary="Generate Socket.IO auth token for current user")
async def get_chat_token(user=Depends(get_current_user)):
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
    memberships = await db.execute(
        select(ChatConversationParticipant).where(
            ChatConversationParticipant.user_id == user.id
        )
    )
    participants = memberships.scalars().all()
    if not participants:
        return success_response(data=[])

    conversations_data = []
    for member in participants:
        convo_result = await db.execute(
            select(ChatConversation).where(ChatConversation.id == member.conversation_id)
        )
        convo = convo_result.scalar_one_or_none()
        if not convo or convo.status != "ACTIVE":
            continue

        last_msg_result = await db.execute(
            select(ChatMessage)
            .where(ChatMessage.conversation_id == convo.id)
            .order_by(ChatMessage.created_at.desc())
            .limit(1)
        )
        last_msg = last_msg_result.scalar_one_or_none()

        participant_rows = await db.execute(
            select(User, ChatConversationParticipant).join(
                ChatConversationParticipant,
                ChatConversationParticipant.user_id == User.id,
            ).where(ChatConversationParticipant.conversation_id == convo.id)
        )
        participant_payload = []
        for p_user, p_link in participant_rows.all():
            participant_payload.append(
                {
                    "user_id": p_user.id,
                    "role": p_link.role,
                    "name": await _display_name_for_user_id(db, p_user),
                }
            )
        other_names = [p["name"] for p in participant_payload if p["user_id"] != user.id]
        summary_name = convo.title or ", ".join(other_names[:2]) or "Conversation"

        conversations_data.append(
            {
                "conversation_id": convo.id,
                "allocation_id": convo.allocation_id,
                "title": convo.title,
                "participants": participant_payload,
                "other_party_name": summary_name,
                "kind": convo.kind,
                "status": convo.status,
                "last_message": (
                    {
                        "content": last_msg.content,
                        "sender_id": last_msg.sender_id,
                        "created_at": (
                            last_msg.created_at.isoformat()
                            if hasattr(last_msg.created_at, "isoformat")
                            else str(last_msg.created_at)
                        ),
                    }
                    if last_msg
                    else None
                ),
            }
        )

    conversations_data.sort(
        key=lambda c: c["last_message"]["created_at"] if c["last_message"] else "",
        reverse=True,
    )
    return success_response(data=conversations_data)


@router.get("/rooms/{conversation_id}/messages", summary="Get chat history for a room")
async def get_chat_history(
    conversation_id: str,
    limit: int = Query(50, le=100, ge=1),
    offset: int = Query(0, ge=0),
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    await _assert_member_or_403(db, conversation_id, user.id)

    result = await db.execute(
        select(ChatMessage)
        .where(ChatMessage.conversation_id == conversation_id)
        .order_by(ChatMessage.created_at.desc())
        .offset(offset)
        .limit(limit)
    )
    messages = list(reversed(result.scalars().all()))

    return success_response(
        data=[
            {
                "id": msg.id,
                "sender_id": msg.sender_id,
                "content": msg.content,
                "created_at": (
                    msg.created_at.isoformat()
                    if hasattr(msg.created_at, "isoformat")
                    else msg.created_at
                ),
            }
            for msg in messages
        ]
    )


@router.post("/conversations", summary="Create a conversation with participants")
async def create_conversation(
    req: CreateConversationRequest,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    participant_ids = set(req.participant_ids)
    participant_ids.add(user.id)

    users_result = await db.execute(select(User).where(User.id.in_(participant_ids)))
    users = users_result.scalars().all()
    if len(users) != len(participant_ids):
        raise HTTPException(status_code=400, detail="One or more participants not found.")

    if req.kind == "DIRECT" and len(participant_ids) != 2:
        raise HTTPException(
            status_code=400, detail="DIRECT conversations require exactly 2 participants."
        )

    if req.allocation_id:
        alloc_result = await db.execute(
            select(Allocation).where(Allocation.id == req.allocation_id)
        )
        if not alloc_result.scalar_one_or_none():
            raise HTTPException(status_code=404, detail="Allocation not found.")

    convo = ChatConversation(
        kind=req.kind,
        title=req.title.strip() if req.title else None,
        allocation_id=req.allocation_id,
        created_by_user_id=user.id,
    )
    db.add(convo)
    await db.flush()

    for p in users:
        db.add(
            ChatConversationParticipant(
                conversation_id=convo.id,
                user_id=p.id,
                role=p.role,
            )
        )
    await db.commit()
    return success_response(data={"conversation_id": convo.id, "status": convo.status})


@router.get(
    "/conversations/{conversation_id}/unread-count",
    summary="Get unread message count for a conversation",
)
async def get_unread_count(
    conversation_id: str,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    await _assert_member_or_403(db, conversation_id, user.id)
    count_result = await db.execute(
        select(func.count(ChatMessage.id))
        .where(ChatMessage.conversation_id == conversation_id)
        .where(ChatMessage.sender_id != user.id)
        .where(ChatMessage.delivery_state != "SEEN")
    )
    return success_response(data={"unread_count": count_result.scalar() or 0})


@router.get(
    "/conversations/{conversation_id}/sync",
    summary="Sync missed messages since a timestamp",
)
async def sync_missed_messages(
    conversation_id: str,
    since: str = Query(description="ISO timestamp to sync messages after"),
    limit: int = Query(50, le=100, ge=1),
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    await _assert_member_or_403(db, conversation_id, user.id)
    try:
        since_dt = datetime.fromisoformat(since.replace("Z", "+00:00"))
    except ValueError:
        since_dt = datetime.now(timezone.utc)

    result = await db.execute(
        select(ChatMessage)
        .where(ChatMessage.conversation_id == conversation_id)
        .where(ChatMessage.created_at > since_dt)
        .order_by(ChatMessage.created_at.asc())
        .limit(limit)
    )
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
                "created_at": (
                    msg.created_at.isoformat()
                    if hasattr(msg.created_at, "isoformat")
                    else msg.created_at
                ),
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
    convo_ids_result = await db.execute(
        select(ChatConversationParticipant.conversation_id).where(
            ChatConversationParticipant.user_id == user.id
        )
    )
    conversation_ids = [row[0] for row in convo_ids_result.all()]
    if not conversation_ids:
        return success_response(data={"unread_count": 0})

    count_result = await db.execute(
        select(func.count(ChatMessage.id))
        .where(ChatMessage.conversation_id.in_(conversation_ids))
        .where(ChatMessage.sender_id != user.id)
        .where(ChatMessage.delivery_state != "SEEN")
    )
    return success_response(data={"unread_count": count_result.scalar() or 0})
