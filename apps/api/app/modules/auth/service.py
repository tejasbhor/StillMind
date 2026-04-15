import uuid
from datetime import timedelta
from typing import Optional
from fastapi import HTTPException, status
from jose import JWTError
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.core.security import (
    hash_password, verify_password,
    create_access_token, create_refresh_token, decode_token,
)
from app.core.config import settings
from app.models.user import User
from app.models.student_profile import StudentProfile
from app.models.counselor_profile import CounselorProfile
from app.modules.auth.schemas import (
    StudentRegisterRequest, LoginRequest, RefreshRequest,
)


class AuthService:

    # ------------------------------------------------------------------
    # Register student
    # ------------------------------------------------------------------
    async def register_student(
        self, db: AsyncSession, req: StudentRegisterRequest
    ) -> dict:
        # Check duplicate email
        existing = await db.execute(select(User).where(User.email == req.email))
        if existing.scalar_one_or_none():
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Email already registered",
            )

        user_id = str(uuid.uuid4())
        profile_id = str(uuid.uuid4())

        user = User(
            id=user_id,
            role="student",
            email=req.email,
            password_hash=hash_password(req.password),
        )
        profile = StudentProfile(
            id=profile_id,
            user_id=user_id,
            full_name=req.full_name,
            college_id=req.college_id,
            phone=req.phone,
            profile_status="PENDING_CONSENT",
        )

        db.add(user)
        db.add(profile)
        await db.commit()

        return {
            "user_id": user_id,
            "role": "student",
            "profile_status": "PENDING_CONSENT",
        }

    # ------------------------------------------------------------------
    # Login (all roles)
    # ------------------------------------------------------------------
    async def login(self, db: AsyncSession, req: LoginRequest) -> dict:
        result = await db.execute(select(User).where(User.email == req.email))
        user = result.scalar_one_or_none()

        if not user or not verify_password(req.password, user.password_hash):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid credentials",
            )
        if user.status != "ACTIVE":
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Account is inactive",
            )

        token_data = {"sub": user.id, "role": user.role}
        access_token = create_access_token(token_data)
        refresh_token = create_refresh_token(token_data)

        return {
            "access_token": access_token,
            "refresh_token": refresh_token,
            "user": user,
        }

    # ------------------------------------------------------------------
    # Refresh token — rotate on use
    # ------------------------------------------------------------------
    async def refresh(self, db: AsyncSession, req: RefreshRequest) -> dict:
        try:
            payload = decode_token(req.refresh_token)
            if payload.get("type") != "refresh":
                raise ValueError
            user_id: str = payload.get("sub")
        except (JWTError, ValueError):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid or expired refresh token",
            )

        result = await db.execute(select(User).where(User.id == user_id))
        user = result.scalar_one_or_none()
        if not user or user.status != "ACTIVE":
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found")

        token_data = {"sub": user.id, "role": user.role}
        return {
            "access_token": create_access_token(token_data),
            "refresh_token": create_refresh_token(token_data),
        }

    # ------------------------------------------------------------------
    # /auth/me
    # ------------------------------------------------------------------
    async def get_me(self, db: AsyncSession, user: User) -> dict:
        profile_status = None
        profile_complete = True

        if user.role == "student":
            result = await db.execute(
                select(StudentProfile).where(StudentProfile.user_id == user.id)
            )
            profile = result.scalar_one_or_none()
            if profile:
                profile_status = profile.profile_status
                profile_complete = profile.profile_status == "ACTIVE"
            else:
                profile_complete = False

        return {
            "id": user.id,
            "email": user.email,
            "role": user.role,
            "status": user.status,
            "profile_complete": profile_complete,
            "profile_status": profile_status,
        }
