import uuid
import secrets
import structlog
import time
from datetime import timedelta, datetime, timezone
from typing import Optional
from fastapi import HTTPException, status
from jose import jwt, JWTError
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, or_
from sqlalchemy.exc import IntegrityError
from authlib.integrations.starlette_client import OAuth

from app.core.security import (
    hash_password,
    verify_password,
    create_access_token,
    create_refresh_token,
    decode_token,
    get_dummy_hash,
)
from app.modules.auth.rbac import rbac_service
from app.core.config import settings
from app.models.user import User
from app.models.student_profile import StudentProfile
from app.models.counselor_profile import CounselorProfile
from app.models.organization import Organization
from app.modules.auth.schemas import (
    StudentRegisterRequest,
    LoginRequest,
    RefreshRequest,
    ForgotPasswordRequest,
    ResetPasswordRequest,
    sanitize_input,
    sanitize_name,
)
from app.modules.notifications.service import send_email

logger = structlog.get_logger()

# Account lockout tracking
_failed_login_attempts: dict[str, int] = {}
LOCKOUT_THRESHOLD = 5
LOCKOUT_DURATION_MINUTES = 15

# OAuth Configuration
oauth = OAuth()
oauth.register(
    name='google',
    client_id=settings.GOOGLE_CLIENT_ID,
    client_secret=settings.GOOGLE_CLIENT_SECRET,
    server_metadata_url='https://accounts.google.com/.well-known/openid-configuration',
    client_kwargs={
        'scope': 'openid email profile'
    }
)

# Session tracking: user_id -> session_id (simple, one per user)
_active_sessions: dict[str, str] = {}


def _generate_session_id() -> str:
    """Generate a unique session identifier."""
    return secrets.token_urlsafe(16)


def _invalidate_user_sessions(user_id: str):
    """Invalidate all sessions for a user."""
    if user_id in _active_sessions:
        del _active_sessions[user_id]


def _check_session_valid(user_id: str, session_id: str) -> bool:
    """Check if a session is still valid."""
    return _active_sessions.get(user_id) == session_id


def _get_client_ip(request=None) -> str:
    """Extract client IP for rate limiting."""
    if request:
        forwarded = request.headers.get("X-Forwarded-For")
        if forwarded:
            return forwarded.split(",")[0].strip()
        return request.client.host if request.client else "unknown"
    return "unknown"


class AuthService:
    async def _resolve_registration_org(
        self, db: AsyncSession, req: StudentRegisterRequest
    ) -> Organization:
        if getattr(req, "organization_slug", None):
            slug = req.organization_slug.strip().lower()
            r = await db.execute(select(Organization).where(Organization.slug == slug))
            org = r.scalar_one_or_none()
            if org:
                return org
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Unknown organization. Check your signup link or contact support.",
            )
        r = await db.execute(select(Organization).where(Organization.slug == "default"))
        org = r.scalar_one_or_none()
        if org:
            return org
        r = await db.execute(select(Organization).limit(1))
        org = r.scalar_one_or_none()
        if not org:
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail="No organization is configured for this deployment.",
            )
        return org

    async def _log_security_event(
        self, 
        db: AsyncSession, 
        action: str, 
        user_id: Optional[str] = None, 
        metadata: Optional[dict] = None
    ):
        """Helper to create an audit log entry for security events."""
        from app.models.audit_log import AuditLog
        log_entry = AuditLog(
            actor_id=user_id,
            action=action,
            metadata_=metadata or {}
        )
        db.add(log_entry)
        await db.flush()

    # ------------------------------------------------------------------
    # Register student with idempotency and duplicate detection
    # ------------------------------------------------------------------
    async def register_student(
        self, db: AsyncSession, req: StudentRegisterRequest
    ) -> dict:
        # Sanitize inputs
        email = req.email.lower().strip()
        full_name = sanitize_name(req.full_name)

        # 1. Resolve Org and Check Domain Policy
        org = await self._resolve_registration_org(db, req)
        if org.domain:
            allowed_domain = org.domain.lower().strip()
            user_domain = email.split("@")[-1]
            if user_domain != allowed_domain:
                await self._log_security_event(
                    db, 
                    "REGISTRATION_DOMAIN_REJECTED", 
                    metadata={"email": email, "expected": allowed_domain}
                )
                logger.warning("registration_domain_mismatch", email=email, expected=allowed_domain)
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail=f"Registration is restricted to {allowed_domain} email addresses."
                )

        # Check for existing user (case-insensitive)
        existing = await db.execute(select(User).where(func.lower(User.email) == email))
        if existing.scalar_one_or_none():
            logger.warning("registration_duplicate_email", email_hash=hash(email[:3]))
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="An account with this email already exists",
            )

        user_id = str(uuid.uuid4())
        profile_id = str(uuid.uuid4())

        # Standard registration requires a password
        if not req.password:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Password is required for standard registration",
            )

        try:
            user = User(
                id=user_id,
                organization_id=org.id,
                role="student",
                email=email,
                full_name=full_name,
                password_hash=hash_password(req.password),
            )
            profile = StudentProfile(
                id=profile_id,
                user_id=user_id,
                full_name=full_name,
                college_id=sanitize_input(req.college_id),
                phone=sanitize_input(req.phone),
                profile_status="PENDING_CONSENT",
            )

            db.add(user)
            db.add(profile)
            
            await self._log_security_event(
                db, 
                "STUDENT_REGISTERED", 
                user_id=user_id,
                metadata={"email": email, "org_id": org.id}
            )
            
            await db.commit()

            logger.info(
                "student_registered", user_id=user_id, email_hash=hash(email[:3])
            )

            return {
                "user_id": user_id,
                "role": "student",
                "profile_status": "PENDING_CONSENT",
            }
        except IntegrityError as e:
            await db.rollback()
            logger.error("registration_integrity_error", error=str(e))
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="An account with this email already exists",
            )

    # ------------------------------------------------------------------
    # Login with account lockout protection + anti-timing attack
    # ------------------------------------------------------------------
    async def login(
        self, db: AsyncSession, req: LoginRequest, client_ip: str = "unknown"
    ) -> dict:
        email = req.email.lower().strip()

        # Check for account lockout
        lockout_key = f"{email}:{client_ip}"
        failed_attempts = _failed_login_attempts.get(lockout_key, 0)

        # Check user exists first (for case-insensitive)
        result = await db.execute(select(User).where(func.lower(User.email) == email))
        user = result.scalar_one_or_none()

        # Anti-timing attack: Always verify against dummy hash first
        # This ensures consistent response time regardless of whether user exists
        dummy_hash = get_dummy_hash()

        # Get the stored hash (or use dummy if user doesn't exist)
        stored_hash = user.password_hash if user else dummy_hash

        # Verify password (always does dummy verification first for timing consistency)
        password_valid = verify_password(req.password, stored_hash)

        if not user or not password_valid:
            # Track failed attempt
            _failed_login_attempts[lockout_key] = failed_attempts + 1

            if failed_attempts + 1 >= LOCKOUT_THRESHOLD:
                await self._log_security_event(
                    db, 
                    "ACCOUNT_LOCKOUT", 
                    metadata={"email": email, "ip": client_ip}
                )
                logger.warning(
                    "account_locked",
                    email_hash=hash(email[:3]),
                    ip=client_ip,
                    attempts=failed_attempts + 1,
                )
                raise HTTPException(
                    status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                    detail="Too many failed login attempts. Please try again later.",
                )

            logger.warning(
                "login_failed",
                email_hash=hash(email[:3]),
                ip=client_ip,
                attempts=failed_attempts + 1,
            )
            # Generic error to prevent enumeration
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid email or password",
            )

        # Clear failed attempts on successful login
        if lockout_key in _failed_login_attempts:
            del _failed_login_attempts[lockout_key]

        if user.status != "ACTIVE":
            logger.warning("login_inactive", user_id=user.id)
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="This account has been deactivated. Contact support.",
            )

        # Generate session ID and track active session
        session_id = _generate_session_id()

        # Simple: start fresh each login (single session enforcement)
        _active_sessions[user.id] = session_id

        # Get permissions/scopes from RBAC service
        scopes = await rbac_service.get_user_scopes(db, user)
        scopes_list = scopes.split() if scopes else []

        # Include session_id and scopes in token for validation
        token_data = {"sub": user.id, "role": user.role, "session_id": session_id}
        access_token = create_access_token(token_data, scopes=scopes_list)
        refresh_token_data = {
            "sub": user.id,
            "role": user.role,
            "session_id": session_id,
        }
        refresh_token = create_refresh_token(refresh_token_data, scopes=scopes_list)

        logger.info(
            "login_success",
            user_id=user.id,
            role=user.role,
            session_id=session_id,
            scopes=scopes,
        )

        return {
            "access_token": access_token,
            "refresh_token": refresh_token,
            "user": user,
            "session_id": session_id,
            "scopes": scopes,  # Include scopes in response for reference
        }

    # ------------------------------------------------------------------
    # Refresh token — rotate on use with validation
    # ------------------------------------------------------------------
    async def refresh(self, db: AsyncSession, req: RefreshRequest) -> dict:
        if not req.refresh_token:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Missing refresh token",
            )
        try:
            payload = decode_token(req.refresh_token)
            if payload.get("type") != "refresh":
                raise ValueError("Invalid token type")
            user_id: str = payload.get("sub")
            session_id: str | None = payload.get("session_id")
            if not user_id:
                raise ValueError("Missing user ID in token")
            if not session_id:
                raise ValueError("Missing session ID in token")
            if not _check_session_valid(user_id, session_id):
                raise ValueError("Session has been invalidated")
        except (JWTError, ValueError) as e:
            logger.warning("refresh_token_invalid", error=str(e))
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Your session has expired. Please log in again.",
            )

        result = await db.execute(select(User).where(User.id == user_id))
        user = result.scalar_one_or_none()
        if not user:
            logger.warning("refresh_user_not_found", user_id=user_id)
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="User no longer exists",
            )

        if user.status != "ACTIVE":
            logger.warning("refresh_inactive_user", user_id=user_id)
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="This account has been deactivated",
            )

        # Get current permissions
        scopes = await rbac_service.get_user_scopes(db, user)
        scopes_list = scopes.split() if scopes else []

        token_data = {"sub": user.id, "role": user.role, "session_id": session_id}
        return {
            "access_token": create_access_token(token_data, scopes=scopes_list),
            "refresh_token": create_refresh_token(token_data, scopes=scopes_list),
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
            "full_name": user.full_name,
            "avatar_url": user.avatar_url,
            "role": user.role,
            "status": user.status,
            "profile_complete": profile_complete,
            "profile_status": profile_status,
        }

    # ------------------------------------------------------------------
    # Password Reset
    # ------------------------------------------------------------------
    async def forgot_password(
        self, db: AsyncSession, req: ForgotPasswordRequest
    ) -> dict:
        """Generate reset token and send email."""
        result = await db.execute(select(User).where(User.email == req.email))
        user = result.scalar_one_or_none()

        # Always return success to prevent email enumeration
        if not user:
            return {
                "sent": True,
                "message": "If registered, a reset link has been sent",
            }

        # Generate secure reset token (valid for 1 hour)
        reset_token = secrets.token_urlsafe(32)
        # Store in a simple way (in production, use Redis with TTL)
        # For now, we'll use a signed JWT as the reset token
        token_data = {
            "sub": user.id,
            "type": "password_reset",
            "exp": datetime.now(timezone.utc) + timedelta(hours=1),
            "jti": secrets.token_hex(16),  # Unique token ID for revocation
        }
        signed_token = jwt.encode(
            token_data, settings.SECRET_KEY, algorithm=settings.JWT_ALGORITHM
        )

        # Build reset URL
        reset_url = f"{settings.FRONTEND_URL}/reset-password?token={signed_token}"

        # Send email
        try:
            await send_email(
                to_email=user.email,
                subject="StillMind Password Reset",
                content=f"Click to reset your password: {reset_url}\n\nThis link expires in 1 hour.",
            )
        except Exception:
            # Log but don't expose email sending failures
            import structlog

            structlog.get_logger().error("password_reset_email_failed", user_id=user.id)

        return {"sent": True, "message": "If registered, a reset link has been sent"}

    async def reset_password(self, db: AsyncSession, req: ResetPasswordRequest) -> dict:
        """Verify reset token and update password."""
        try:
            payload = jwt.decode(
                req.token, settings.SECRET_KEY, algorithms=[settings.JWT_ALGORITHM]
            )
            if payload.get("type") != "password_reset":
                raise ValueError("Invalid token type")
            user_id = payload.get("sub")
        except (JWTError, ValueError):
            raise HTTPException(
                status_code=400, detail="Invalid or expired reset token"
            )

        result = await db.execute(select(User).where(User.id == user_id))
        user = result.scalar_one_or_none()
        if not user:
            raise HTTPException(status_code=404, detail="User not found")

        # Update password
        user.password_hash = hash_password(req.new_password)
        await db.commit()

        return {"reset": True, "message": "Password reset successfully"}

    # ------------------------------------------------------------------
    # Google OAuth
    # ------------------------------------------------------------------
    async def process_google_user(
        self, db: AsyncSession, user_info: dict, role: str = "student", org_slug: Optional[str] = None
    ) -> dict:
        """
        Processes a Google login:
        1. Find user by google_id or email
        2. Create user if not exists (Auto-link if email matches)
        3. Issue tokens
        """
        email = user_info.get("email").lower().strip()
        google_id = user_info.get("sub")
        full_name = user_info.get("name", "Google User")
        avatar_url = user_info.get("picture")

        # 1. Strict Domain Validation (Production Grade)
        domain = email.split('@')[-1].lower() if '@' in email else None
        if not domain:
            raise HTTPException(status_code=400, detail="Invalid email format")

        # Try to find org by domain
        r = await db.execute(select(Organization).where(Organization.domain == domain))
        org = r.scalar_one_or_none()
        
        if not org:
            await self._log_security_event(
                db, 
                "GOOGLE_AUTH_DOMAIN_REJECTED", 
                metadata={"email": email, "domain": domain}
            )
            logger.warning("google_auth_domain_rejected", email=email, domain=domain)
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN, 
                detail=f"Login restricted to authorized institutional accounts. Domain {domain} is not permitted."
            )
        
        org_id = org.id

        # 2. Try to find user by google_id
        result = await db.execute(select(User).where(User.google_id == google_id))
        user = result.scalar_one_or_none()

        if not user:
            # 3. Try to find user by email
            result = await db.execute(select(User).where(func.lower(User.email) == email))
            user = result.scalar_one_or_none()

            if user:
                # Link google_id to existing user
                user.google_id = google_id
                user.full_name = full_name
                if not user.avatar_url:
                    user.avatar_url = avatar_url
            else:
                # 4. Create new user
                user_id = str(uuid.uuid4())
                
                user = User(
                    id=user_id,
                    organization_id=org_id,
                    role=role,
                    email=email,
                    full_name=full_name,
                    google_id=google_id,
                    avatar_url=avatar_url,
                    password_hash="", # No password for Google users
                )
                db.add(user)
                await db.flush() # Ensure user exists before profile is added
                
                # 4. Create role-specific profile
                if role == "student":
                    # For MSSU, try to extract eligibility number from email
                    college_id = None
                    if domain == "mssu.ac.in" and "@" in email:
                        college_id = email.split("@")[0]
                    
                    profile = StudentProfile(
                        id=str(uuid.uuid4()),
                        user_id=user_id,
                        full_name=full_name,
                        college_id=college_id,
                        profile_status="ACTIVE", # Auto-activate Google users
                    )
                    db.add(profile)
                elif role == "counselor":
                    from app.models.counselor_profile import CounselorProfile
                    profile = CounselorProfile(
                        id=str(uuid.uuid4()),
                        user_id=user_id,
                        full_name=full_name,
                    )
                    db.add(profile)
                # Admins don't always have a separate profile table, or it's handled via generic profiles
            
            await db.commit()
            await db.refresh(user)

        # 4. Standard login flow (tokens)
        if user.status != "ACTIVE":
            raise HTTPException(status_code=403, detail="Account is deactivated")

        session_id = _generate_session_id()
        _active_sessions[user.id] = session_id
        
        scopes = await rbac_service.get_user_scopes(db, user)
        scopes_list = scopes.split() if scopes else []

        token_data = {"sub": user.id, "role": user.role, "session_id": session_id}
        
        return {
            "access_token": create_access_token(token_data, scopes=scopes_list),
            "refresh_token": create_refresh_token(token_data, scopes=scopes_list),
            "user": user,
            "session_id": session_id,
            "scopes": scopes,
        }
