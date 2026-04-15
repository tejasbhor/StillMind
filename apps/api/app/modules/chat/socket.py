import socketio
import structlog

log = structlog.get_logger(__name__)

# Create an Async Socket.IO server
# cors_allowed_origins="*" is for dev. In prod, you'd restrict this to your frontend URL.
sio = socketio.AsyncServer(async_mode='asgi', cors_allowed_origins='*')

# The ASGI application we'll mount in main.py
socket_app = socketio.ASGIApp(sio)

@sio.event
async def connect(sid, environ, auth):
    """
    Called when a client attempts to connect.
    `auth` is a dict with tokens. We would validate the JWT here to authenticate the student/counselor.
    """
    # For now, accept all connections.
    log.info("socket_client_connected", sid=sid)
    # Ideally, extract user_id from auth token and add them to a personal room
    # user_id = validate_token(auth.get('token'))
    # await sio.enter_room(sid, user_id)
    return True

@sio.event
async def disconnect(sid):
    log.info("socket_client_disconnected", sid=sid)

@sio.event
async def join_chat(sid, data):
    """
    Join a chat room (e.g. bounded to specific allocation ID or student ID).
    """
    room_id = data.get('room')
    if room_id:
        await sio.enter_room(sid, room_id)
        log.info("socket_client_joined_room", sid=sid, room=room_id)
        await sio.emit("message", {"event": "joined", "room": room_id}, room=room_id, skip_sid=sid)

@sio.event
async def chat_message(sid, data):
    """
    Handle incoming chat messages and broadcast to the specific room.
    data: { "room": "room_id", "content": "hello world" }
    """
    room_id = data.get('room')
    content = data.get('content')
    
    if room_id and content:
        # In a full app, we would store this message in the DB
        # e.g., db.add(ChatMessage(...))
        
        # Broadcast to everyone else in the room
        await sio.emit("chat_message", {
            "sender_sid": sid,
            "content": content,
            "timestamp": "now" # Replace with actual datetime
        }, room=room_id)
        log.info("socket_message_broadcast", room=room_id)
