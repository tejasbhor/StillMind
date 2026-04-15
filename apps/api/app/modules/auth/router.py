from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.modules.auth.schemas import (
    StudentRegisterRequest, StudentRegisterResponse,
    LoginRequest, LoginResponse,
    RefreshRequest, RefreshResponse,
    ForgotPasswordRequest, ResetPasswordRequest,
    MeResponse, UserOut,
)
from app.modules.auth.service import AuthService
from app.core.responses import success_response

router = APIRouter(prefix="/auth", tags=["Authentication"])
_svc = AuthService()


@router.post(
    "/register/student",
    response_model=dict,
    status_code=status.HTTP_201_CREATED,
    summary="Register a new student account",
)
async def register_student(req: StudentRegisterRequest, db: AsyncSession = Depends(get_db)):
    result = await _svc.register_student(db, req)
    return success_response(data=result, message="Student registered successfully")


@router.post("/login", response_model=dict, summary="Authenticate any role")
async def login(req: LoginRequest, db: AsyncSession = Depends(get_db)):
    result = await _svc.login(db, req)
    return success_response(
        data={
            "access_token": result["access_token"],
            "refresh_token": result["refresh_token"],
            "token_type": "bearer",
            "user": UserOut.model_validate(result["user"]).model_dump(),
        }
    )


@router.post("/refresh", response_model=dict, summary="Rotate refresh token")
async def refresh(req: RefreshRequest, db: AsyncSession = Depends(get_db)):
    result = await _svc.refresh(db, req)
    return success_response(data={**result, "token_type": "bearer"})


@router.post("/logout", response_model=dict, summary="Revoke session")
async def logout(user=Depends(get_current_user)):
    # Stateless JWT — client discards tokens; future: add to revocation list
    return success_response(message="Logged out successfully")


@router.post("/forgot-password", response_model=dict)
async def forgot_password(req: ForgotPasswordRequest, db: AsyncSession = Depends(get_db)):
    # Stub: send reset email. Full implementation in Phase 6.
    return success_response(message="If this email is registered, a reset link has been sent")


@router.post("/reset-password", response_model=dict)
async def reset_password(req: ResetPasswordRequest, db: AsyncSession = Depends(get_db)):
    # Stub: verify token and reset password. Full implementation in Phase 6.
    return success_response(message="Password reset successfully")


@router.get("/me", response_model=dict, summary="Current user identity")
async def me(user=Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    result = await _svc.get_me(db, user)
    return success_response(data=result)
