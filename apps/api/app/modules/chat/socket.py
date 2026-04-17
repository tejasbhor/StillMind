import socketio
import structlog
import time
import uuid
import json
from collections import defaultdict
from datetime import datetime, timezone
from jose import JWTError, jwt
from sqlalchemy import select, and_, func

from app.core.config import settings
from app.core.database import AsyncSessionLocal
from app.models.chat_message import ChatMessage
from app.models.allocation import Allocation
from app.models.student_profile import StudentProfile
from app.models.counselor_profile import CounselorProfile

log = structlog.get_logger(__name__)

# Simple in-memory rate limiter: user_id -> [(timestamp, message_count)]
_rate_limiter: dict = defaultdict(list)
RATE_LIMIT_SECONDS = 60
RATE_LIMIT_MAX_MESSAGES = 20

# Typing indicators: room_id -> {user_id: timestamp}
_typing_indicators: dict = defaultdict(dict)
TYPING_TIMEOUT_SECONDS = 5

# Presence tracking: user_id -> {allocation_id: last_active}
_user_presence: dict = defaultdict(dict)
PRESENCE_LAST_SEEN_TTL = 30  # seconds

# Message deduplication cache: idempotency_key -> message_id
_idempotency_cache: dict[str, str] = {}


def _check_rate_limit(user_id: str) -> bool:
    """Check if user is within rate limits. Returns True if allowed."""
    now = time.time()
    window_start = now - RATE_LIMIT_SECONDS

    user_messages = _rate_limiter[user_id]
    # Clean old entries
    user_messages[:] = [(ts, cnt) for ts, cnt in user_messages if ts > window_start]

    total_messages = sum(cnt for _, cnt in user_messages)
    if total_messages >= RATE_LIMIT_MAX_MESSAGES:
        return False

    # Add current message
    if user_messages and user_messages[-1][0] == now:
        user_messages[-1] = (now, user_messages[-1][1] + 1)
    else:
        user_messages.append((now, 1))

    return True


def _check_typing_rate_limit(user_id: str) -> bool:
    """Check typing indicator rate limit."""
    now = time.time()
    user_typing = _typing_indicators.get(user_id, {})

    # Clean old entries
    for k in list(user_typing.keys()):
        if now - user_typing[k] > TYPING_TIMEOUT_SECONDS:
            del user_typing[k]

    # Max 1 typing event per second
    if user_id in user_typing and now - user_typing[user_id] < 1:
        return False

    user_typing[user_id] = now
    return True


async def _clean_typing_indicators(room_id: str):
    """Clean stale typing indicators for a room."""
    now = time.time()
    room_typing = _typing_indicators.get(room_id, {})
    for user_id in list(room_typing.keys()):
        if now - room_typing[user_id] > TYPING_TIMEOUT_SECONDS:
            del room_typing[user_id]


def _cleanup_stale_presence():
    """Clean stale presence data."""
    now = time.time()
    for user_id in list(_user_presence.keys()):
        user_rooms = _user_presence.get(user_id, {})
        for room_id in list(user_rooms.keys()):
            if now - user_rooms[room_id] > PRESENCE_LAST_SEEN_TTL:
                del user_rooms[room_id]
        if not user_rooms:
            del _user_presence[user_id]


sio = socketio.AsyncServer(
    async_mode="asgi",
    cors_allowed_origins=settings.CORS_ORIGINS,
)
socket_app = socketio.ASGIApp(sio)


async def _get_user_id_and_profile_id(user_id: str, role: str):
    """Resolve user_id to the corresponding profile_id for authorization checks."""
    async with AsyncSessionLocal() as db:
        if role == "student":
            result = await db.execute(
                select(StudentProfile.id).where(StudentProfile.user_id == user_id)
            )
            profile_id = result.scalar_one_or_none()
        elif role == "counselor":
            result = await db.execute(
                select(CounselorProfile.id).where(CounselorProfile.user_id == user_id)
            )
            profile_id = result.scalar_one_or_none()
        else:
            profile_id = None
    return profile_id


@sio.event
async def connect(sid, environ, auth):
    """Validate JWT on connect. Store user_id, role, and profile_id in session."""
    from app.modules.auth.service import _check_session_valid

    token = (auth or {}).get("token")
    if not token:
        log.warning("socket_connect_no_token", sid=sid)
        return False

    try:
        payload = jwt.decode(
            token, settings.SECRET_KEY, algorithms=[settings.JWT_ALGORITHM]
        )
        if payload.get("type") != "access":
            raise ValueError("not access token")
        user_id: str = payload.get("sub")
        role: str = payload.get("role")
        session_id: str = payload.get("session_id")  # Session validation

        # Validate session - reject if session was invalidated
        if session_id and not _check_session_valid(user_id, session_id):
            log.warning("socket_connect_session_invalidated", sid=sid, user_id=user_id)
            return False

        if not user_id or not role:
            raise ValueError("missing sub or role")
    except (JWTError, ValueError) as exc:
        log.warning("socket_connect_auth_failed", sid=sid, error=str(exc))
        return False

    # Resolve profile_id for room authorization
    profile_id = await _get_user_id_and_profile_id(user_id, role)
    if not profile_id:
        log.warning("socket_connect_no_profile", sid=sid, user_id=user_id, role=role)
        return False

    # Mark user as online on connect (store sid for presence)
    _user_presence[user_id] = {
        "sid": sid,
        "connected_at": time.time(),
        "role": role,
    }

    await sio.save_session(
        sid,
        {
            "user_id": user_id,
            "role": role,
            "profile_id": profile_id,
        },
    )
    log.info("socket_client_connected", sid=sid, user_id=user_id, role=role)
    return True


@sio.event
async def disconnect(sid):
    session_data = await sio.get_session(sid)
    if session_data:
        user_id = session_data.get("user_id")
        if user_id and user_id in _user_presence:
            del _user_presence[user_id]
    log.info("socket_client_disconnected", sid=sid)


@sio.event
async def typing(sid, data):
    """
    Handle typing indicator events.
    data format: { "room": "allocation_id", "is_typing": true/false }
    """
    room_id = data.get("room")
    is_typing = data.get("is_typing", False)

    if not room_id:
        return {"error": "Missing 'room' field."}

    session_data = await sio.get_session(sid)
    sender_id = session_data.get("user_id")

    if not sender_id:
        return {"error": "Not authenticated."}

    # Rate limit typing events
    if is_typing and not _check_typing_rate_limit(sender_id):
        return  # Silently ignore excessive typing events

    # Broadcast typing status to room (excluding sender)
    await sio.emit(
        "typing",
        {
            "user_id": sender_id,
            "is_typing": is_typing,
        },
        room=room_id,
        skip_sid=sid,
    )


@sio.event
async def mark_read(sid, data):
    """
    Mark messages as read.
    data format: { "room": "allocation_id", "message_id": "optional, marks single" }
    If message_id is omitted, marks all messages in room as read.
    """
    room_id = data.get("room")
    message_id = data.get("message_id")

    if not room_id:
        return {"error": "Missing 'room' field."}

    session_data = await sio.get_session(sid)
    user_id = session_data.get("user_id")

    if not user_id:
        return {"error": "Not authenticated."}

    try:
        async with AsyncSessionLocal() as db:
            if message_id:
                # Mark single message as seen
                stmt = (
                    ChatMessage.__table__.update()
                    .where(ChatMessage.id == message_id)
                    .where(ChatMessage.allocation_id == room_id)
                    .where(ChatMessage.sender_id != user_id)  # Not own messages
                    .values(
                        delivery_state="SEEN",
                        seen_at=datetime.now(timezone.utc),
                    )
                )
                await db.execute(stmt)
            else:
                # Mark all unread messages as seen
                stmt = (
                    ChatMessage.__table__.update()
                    .where(ChatMessage.allocation_id == room_id)
                    .where(ChatMessage.sender_id != user_id)
                    .where(ChatMessage.delivery_state != "SEEN")
                    .values(
                        delivery_state="SEEN",
                        seen_at=datetime.now(timezone.utc),
                    )
                )
                await db.execute(stmt)

            await db.commit()

        # Notify sender that messages were read
        await sio.emit(
            "messages_read",
            {"room": room_id, "reader_id": user_id},
            room=room_id,
        )
        return {"success": True}

    except Exception as e:
        log.error("mark_read_error", error=str(e))
        return {"error": "Failed to mark messages as read."}


@sio.event
async def edit_message(sid, data):
    """
    Edit a message.
    data format: { "room": "allocation_id", "message_id": "msg_id", "new_content": "text" }
    """
    room_id = data.get("room")
    message_id = data.get("message_id")
    new_content = data.get("new_content")

    if not room_id or not message_id or not new_content:
        return {"error": "Invalid format. Required: room, message_id, new_content."}

    if len(new_content.strip()) == 0:
        return {"error": "Content cannot be empty."}

    if len(new_content) > 5000:
        return {"error": "Message too long (max 3000 characters)."}

    session_data = await sio.get_session(sid)
    sender_id = session_data.get("user_id")

    try:
        async with AsyncSessionLocal() as db:
            # Get original message
            result = await db.execute(
                select(ChatMessage).where(ChatMessage.id == message_id)
            )
            msg = result.scalar_one_or_none()

            if not msg:
                return {"error": "Message not found."}

            if msg.sender_id != sender_id:
                return {"error": "Can only edit your own messages."}

            if msg.is_deleted:
                return {"error": "Cannot edit a deleted message."}

            # Store edit history
            edit_history = []
            if msg.edit_history:
                edit_history = json.loads(msg.edit_history)
            edit_history.append(
                {
                    "content": msg.content,
                    "edited_at": msg.updated_at.isoformat() if msg.updated_at else None,
                }
            )

            # Update message
            msg.content = new_content.strip()
            msg.is_edited = True
            msg.edit_history = json.dumps(edit_history)
            msg.updated_at = datetime.now(timezone.utc)

            await db.commit()
            await db.refresh(msg)

            # Broadcast edit to room
            await sio.emit(
                "message_edited",
                {
                    "message_id": message_id,
                    "new_content": new_content,
                    "edited_at": msg.updated_at.isoformat(),
                },
                room=room_id,
            )
            return {"success": True}

    except Exception as e:
        log.error("edit_message_error", error=str(e))
        return {"error": "Failed to edit message."}


@sio.event
async def delete_message(sid, data):
    """
    Soft delete a message.
    data format: { "room": "allocation_id", "message_id": "msg_id" }
    """
    room_id = data.get("room")
    message_id = data.get("message_id")

    if not room_id or not message_id:
        return {"error": "Invalid format. Required: room, message_id."}

    session_data = await sio.get_session(sid)
    sender_id = session_data.get("user_id")

    try:
        async with AsyncSessionLocal() as db:
            result = await db.execute(
                select(ChatMessage).where(ChatMessage.id == message_id)
            )
            msg = result.scalar_one_or_none()

            if not msg:
                return {"error": "Message not found."}

            if msg.sender_id != sender_id:
                return {"error": "Can only delete your own messages."}

            msg.is_deleted = True
            msg.content = "[Message deleted]"
            msg.updated_at = datetime.now(timezone.utc)

            await db.commit()

            # Broadcast delete to room
            await sio.emit(
                "message_deleted",
                {"message_id": message_id},
                room=room_id,
            )
            return {"success": True}

    except Exception as e:
        log.error("delete_message_error", error=str(e))
        return {"error": "Failed to delete message."}


@sio.event
async def join_chat(sid, data):
    """Join a chat room (allocation_id). Validates that the user is a participant."""
    room_id = data.get("room")
    if not room_id:
        return {"error": "Missing 'room' field."}

    session_data = await sio.get_session(sid)
    profile_id = session_data["profile_id"]
    role = session_data["role"]

    async with AsyncSessionLocal() as db:
        result = await db.execute(select(Allocation).where(Allocation.id == room_id))
        allocation = result.scalar_one_or_none()

    if not allocation:
        return {"error": "Room not found."}

    # Verify membership: student_id/counselor_id are profile IDs
    if role == "student" and allocation.student_id != profile_id:
        return {"error": "Not authorized for this room."}
    if role == "counselor" and allocation.counselor_id != profile_id:
        return {"error": "Not authorized for this room."}

    # Only allow chat for active allocations
    if allocation.status not in ("ASSIGNED", "CONFIRMED"):
        return {"error": "Allocation is not active. Chat unavailable."}

    await sio.enter_room(sid, room_id)
    log.info("socket_client_joined_room", sid=sid, room=room_id)
    await sio.emit(
        "user_joined",
        {"user_id": session_data["user_id"], "role": role},
        room=room_id,
        skip_sid=sid,
    )


@sio.event
async def chat_message(sid, data):
    """
    Handle incoming chat messages, write to Postgres, and broadcast.
    sender_id is derived from the JWT session — never trusted from the client.

    Production features:
    - Client-generated client_message_id for deduplication
    - Idempotency key for preventing duplicates
    - Delivery state tracking
    - Message deduplication

    data format: {
        "room": "allocation_id",
        "content": "text",
        "client_message_id": "optional client-generated UUID",
        "idempotency_key": "optional for retry handling"
    }
    """
    room_id = data.get("room")
    content = data.get("content")
    client_message_id = data.get("client_message_id")  # For deduplication
    idempotency_key = data.get("idempotency_key")  # For retry handling

    if not room_id or not content:
        return {"error": "Invalid format. Required: room, content"}

    if not isinstance(content, str) or len(content.strip()) == 0:
        return {"error": "Content must be a non-empty string."}

    if len(content) > 5000:
        return {"error": "Message too long (max 3000 characters)."}

    # Sanitize content: strip and basic XSS prevention
    content = content.strip()
    # Remove potential script tags and event handlers
    dangerous_patterns = [
        "<script",
        "</script>",
        "javascript:",
        "onerror=",
        "onclick=",
        "onload=",
        "onmouseover=",
        "data:",
        "vbscript:",
    ]
    for pattern in dangerous_patterns:
        if pattern.lower() in content.lower():
            content = content.replace(pattern, "&lt;")

    session_data = await sio.get_session(sid)
    sender_id = session_data["user_id"]  # From JWT — never from client payload
    profile_id = session_data["profile_id"]
    role = session_data["role"]

    # Rate limiting check
    if not _check_rate_limit(sender_id):
        log.warning("socket_rate_limit_exceeded", sid=sid, user_id=sender_id)
        return {"error": "Too many messages. Please slow down."}

    try:
        async with AsyncSessionLocal() as db:
            # Check for duplicate message using idempotency key
            if idempotency_key:
                existing = await db.execute(
                    select(ChatMessage).where(
                        ChatMessage.idempotency_key == idempotency_key
                    )
                )
                existing_msg = existing.scalar_one_or_none()
                if existing_msg:
                    # Return existing message instead of creating duplicate
                    log.info(
                        "socket_message_duplicate", idempotency_key=idempotency_key
                    )
                    return {
                        "id": str(existing_msg.id),
                        "sender_id": existing_msg.sender_id,
                        "content": existing_msg.content,
                        "created_at": existing_msg.created_at.isoformat(),
                        "duplicate": True,
                    }

            # Check for duplicate using client message ID
            if client_message_id:
                existing = await db.execute(
                    select(ChatMessage).where(
                        ChatMessage.client_message_id == client_message_id
                    )
                )
                existing_msg = existing.scalar_one_or_none()
                if existing_msg:
                    log.info(
                        "socket_message_client_duplicate",
                        client_message_id=client_message_id,
                    )
                    return {
                        "id": str(existing_msg.id),
                        "sender_id": existing_msg.sender_id,
                        "content": existing_msg.content,
                        "created_at": existing_msg.created_at.isoformat(),
                        "duplicate": True,
                    }

            # Verify allocation exists and is active
            result = await db.execute(
                select(Allocation).where(Allocation.id == room_id)
            )
            allocation = result.scalar_one_or_none()
            if not allocation:
                return {"error": "Unknown room."}

            if allocation.status not in ("ASSIGNED", "CONFIRMED"):
                return {"error": "Allocation is not active. Cannot send messages."}

            # Verify membership
            if role == "student" and allocation.student_id != profile_id:
                return {"error": "Not authorized for this room."}
            if role == "counselor" and allocation.counselor_id != profile_id:
                return {"error": "Not authorized for this room."}

            now = datetime.now(timezone.utc)
            msg = ChatMessage(
                allocation_id=room_id,
                sender_id=sender_id,
                content=content,
                client_message_id=client_message_id,
                idempotency_key=idempotency_key or str(uuid.uuid4()),
                delivery_state="PERSISTED",
                created_at=now,
                updated_at=now,
            )
            db.add(msg)
            await db.commit()
            await db.refresh(msg)

            # Update presence
            _user_presence[sender_id][room_id] = time.time()

            payload = {
                "id": str(msg.id),
                "sender_id": msg.sender_id,
                "content": msg.content,
                "delivery_state": msg.delivery_state,
                "created_at": msg.created_at.isoformat(),
            }

            await sio.emit("chat_message", payload, room=room_id)
            log.info("socket_message_broadcast", room=room_id, msg_id=msg.id)
            return payload

    except Exception as exc:
        log.error("socket_message_error", error=str(exc))
        return {"error": "Internal communication error."}
