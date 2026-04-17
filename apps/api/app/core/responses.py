"""Standard response envelope used across all endpoints (PRD §10.2)."""

import uuid
from datetime import datetime, timezone
from typing import Any, Optional


def _meta() -> dict:
    return {
        "request_id": str(uuid.uuid4()),
        "timestamp": datetime.now(timezone.utc).isoformat(),
    }


def success_response(
    data: Any = None,
    message: str = "Success",
    meta: Optional[dict] = None,
) -> dict:
    return {
        "success": True,
        "message": message,
        "data": data if data is not None else {},
        "meta": meta or _meta(),
    }


def error_response(
    code: str,
    message: str,
    details: Optional[list] = None,
) -> dict:
    return {
        "success": False,
        "error": {
            "code": code,
            "message": message,
            "details": details or [],
        },
        "meta": _meta(),
    }
