"""Idempotency key support for safe retries (PRD §10.2)."""
import json
import hashlib
from datetime import datetime, timedelta, timezone
from typing import Optional
import redis.asyncio as redis
from app.core.config import settings

_redis_pool: Optional[redis.Redis] = None

IDEMPOTENCY_TTL_SECONDS = 86400  # 24 hours


async def get_redis() -> redis.Redis:
    global _redis_pool
    if _redis_pool is None:
        _redis_pool = redis.from_url(settings.REDIS_URL, decode_responses=True)
    return _redis_pool


async def check_idempotency(key: str, request_fingerprint: str) -> tuple[bool, Optional[dict]]:
    """
    Check if idempotency key exists and matches the request.
    Returns (is_duplicate, stored_response).
    """
    if not key:
        return False, None
    
    r = await get_redis()
    stored = await r.get(f"idempotency:{key}")
    
    if stored:
        data = json.loads(stored)
        # Verify fingerprint matches (prevents key reuse with different params)
        if data.get("fingerprint") == request_fingerprint:
            return True, data.get("response")
        else:
            # Key exists but different fingerprint = key reuse attack/conflict
            return True, None
    
    return False, None


async def store_idempotency(key: str, request_fingerprint: str, response: dict) -> None:
    """Store response for idempotency key."""
    if not key:
        return
    
    r = await get_redis()
    data = {
        "fingerprint": request_fingerprint,
        "response": response,
        "stored_at": datetime.now(timezone.utc).isoformat(),
    }
    await r.setex(
        f"idempotency:{key}",
        IDEMPOTENCY_TTL_SECONDS,
        json.dumps(data)
    )


def compute_fingerprint(user_id: str, endpoint: str, body: dict) -> str:
    """Compute request fingerprint for idempotency verification."""
    content = json.dumps({"user": user_id, "endpoint": endpoint, "body": body}, sort_keys=True)
    return hashlib.sha256(content.encode()).hexdigest()[:32]
