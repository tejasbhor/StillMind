from fastapi import APIRouter, Depends, status, Request
from sqlalchemy.ext.asyncio import AsyncSession
from slowapi import Limiter
from slowapi.util import get_remote_address

from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.modules.auth.schemas import (
    StudentRegisterRequest,
    StudentRegisterResponse,
    LoginRequest,
    LoginResponse,
    RefreshRequest,
    RefreshResponse,
    ForgotPasswordRequest,
    ResetPasswordRequest,
    MeResponse,
    UserOut,
)
from app.modules.auth.service import AuthService
from app.core.responses import success_response

router = APIRouter(prefix="/auth", tags=["Authentication"])
_svc = AuthService()
limiter = Limiter(key_func=get_remote_address)


@router.post(
    "/register/student",
    response_model=dict,
    status_code=status.HTTP_201_CREATED,
    summary="Register a new student account",
)
@limiter.limit("5/minute")
async def register_student(
    request: Request, req: StudentRegisterRequest, db: AsyncSession = Depends(get_db)
):
    result = await _svc.register_student(db, req)
    return success_response(data=result, message="Student registered successfully")


@router.post("/login", response_model=dict, summary="Authenticate any role")
@limiter.limit("10/minute")
async def login(
    request: Request, req: LoginRequest, db: AsyncSession = Depends(get_db)
):
    client_ip = _get_client_ip(request)
    result = await _svc.login(db, req, client_ip)
    return success_response(
        data={
            "access_token": result["access_token"],
            "refresh_token": result["refresh_token"],
            "token_type": "bearer",
            "user": UserOut.model_validate(result["user"]).model_dump(),
            "session_id": result.get("session_id"),  # New: session tracking
        }
    )


def _get_client_ip(request: Request) -> str:
    """Extract client IP for rate limiting."""
    forwarded = request.headers.get("X-Forwarded-For")
    if forwarded:
        return forwarded.split(",")[0].strip()
    return request.client.host if request.client else "unknown"


@router.post("/refresh", response_model=dict, summary="Rotate refresh token")
async def refresh(req: RefreshRequest, db: AsyncSession = Depends(get_db)):
    result = await _svc.refresh(db, req)
    return success_response(data={**result, "token_type": "bearer"})


@router.post("/logout", response_model=dict, summary="Revoke session")
async def logout(user=Depends(get_current_user)):
    # Invalidate session on logout
    from app.modules.auth.service import _invalidate_user_sessions
    from app.core.security import decode_token
    from jose import jwt
    from app.core.config import settings

    # Extract session from token if possible
    try:
        # Try to invalidate the user's session
        _invalidate_user_sessions(user.id)
    except Exception:
        pass

    return success_response(message="Logged out successfully")


@router.post("/forgot-password", response_model=dict)
@limiter.limit("3/minute")
async def forgot_password(
    request: Request, req: ForgotPasswordRequest, db: AsyncSession = Depends(get_db)
):
    result = await _svc.forgot_password(db, req)
    return success_response(data=result, message=result["message"])


@router.post("/reset-password", response_model=dict)
async def reset_password(req: ResetPasswordRequest, db: AsyncSession = Depends(get_db)):
    result = await _svc.reset_password(db, req)
    return success_response(data=result, message=result["message"])


@router.get("/me", response_model=dict, summary="Current user identity")
async def me(user=Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    result = await _svc.get_me(db, user)
    return success_response(data=result)
