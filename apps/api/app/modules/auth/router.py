from typing import Optional
from fastapi import APIRouter, Depends, status, Request, Response, Cookie
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
    RegisterVerifyRequest,
    RegistrationInitiatedResponse,
    MeResponse,
    UserOut,
)
from app.modules.auth.service import AuthService, oauth
from app.core.responses import success_response
from app.core.config import settings

router = APIRouter(prefix="/auth", tags=["Authentication"])
_svc = AuthService()
limiter = Limiter(key_func=get_remote_address)
REFRESH_COOKIE_NAME = "sm_refresh_token"


def _is_secure_cookie() -> bool:
    return settings.ENVIRONMENT.lower() in {"production", "staging"}


def _set_refresh_cookie(response: Response, refresh_token: str):
    response.set_cookie(
        key=REFRESH_COOKIE_NAME,
        value=refresh_token,
        httponly=True,
        secure=_is_secure_cookie(),
        samesite="lax",
        max_age=settings.REFRESH_TOKEN_EXPIRE_DAYS * 24 * 60 * 60,
        path="/api/v1/auth",
    )


def _clear_refresh_cookie(response: Response):
    response.delete_cookie(
        key=REFRESH_COOKIE_NAME,
        path="/api/v1/auth",
        samesite="lax",
        secure=_is_secure_cookie(),
    )


@router.post(
    "/register/student/initiate",
    response_model=dict,
    status_code=status.HTTP_200_OK,
    summary="Initiate student registration (sends code)",
)
@limiter.limit("5/minute")
async def initiate_student_registration(
    request: Request, req: StudentRegisterRequest, db: AsyncSession = Depends(get_db)
):
    result = await _svc.initiate_student_registration(db, req)
    return success_response(data=result, message=result["message"])


@router.post(
    "/register/student/verify",
    response_model=dict,
    status_code=status.HTTP_201_CREATED,
    summary="Verify student registration and create account",
)
@limiter.limit("5/minute")
async def verify_student_registration(
    request: Request, req: RegisterVerifyRequest, db: AsyncSession = Depends(get_db)
):
    result = await _svc.verify_student_registration(db, req.email, req.code)
    return success_response(data=result, message="Account created successfully")


@router.post("/login", response_model=dict, summary="Authenticate any role")
@limiter.limit("10/minute")
async def login(
    request: Request, response: Response, req: LoginRequest, db: AsyncSession = Depends(get_db)
):
    client_ip = _get_client_ip(request)
    result = await _svc.login(db, req, client_ip)
    _set_refresh_cookie(response, result["refresh_token"])
    return success_response(
        data={
            "access_token": result["access_token"],
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
async def refresh(
    request: Request,
    response: Response,
    req: RefreshRequest,
    db: AsyncSession = Depends(get_db),
    refresh_cookie: str | None = Cookie(default=None, alias=REFRESH_COOKIE_NAME),
):
    effective_req = req.model_copy()
    if not effective_req.refresh_token:
        effective_req.refresh_token = refresh_cookie

    result = await _svc.refresh(db, effective_req)
    _set_refresh_cookie(response, result["refresh_token"])
    return success_response(
        data={"access_token": result["access_token"], "token_type": "bearer"}
    )


@router.post("/logout", response_model=dict, summary="Revoke session")
async def logout(response: Response, user=Depends(get_current_user)):
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

    _clear_refresh_cookie(response)
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

# ------------------------------------------------------------------
# Google OAuth
# ------------------------------------------------------------------
@router.get("/login/google", summary="Initiate Google OAuth flow")
async def login_google(request: Request, role: str = "student", org: Optional[str] = None):
    """Redirect user to Google login page."""
    # Store context in session for the callback
    request.session["oauth_role"] = role
    if org:
        request.session["oauth_org"] = org
        
    redirect_uri = settings.GOOGLE_CALLBACK_URL
    return await oauth.google.authorize_redirect(request, redirect_uri)


@router.get("/google/callback", summary="Google OAuth callback")
async def google_callback(
    request: Request, response: Response, db: AsyncSession = Depends(get_db)
):
    """Handle Google redirect and issue tokens."""
    try:
        token = await oauth.google.authorize_access_token(request)
        user_info = token.get("userinfo")
        if not user_info:
            raise ValueError("No userinfo in token")
            
        # Retrieve stored context
        role = request.session.pop("oauth_role", "student")
        org_slug = request.session.pop("oauth_org", None)
            
        result = await _svc.process_google_user(db, user_info, role=role, org_slug=org_slug)
        
        # Set refresh token in cookie
        _set_refresh_cookie(response, result["refresh_token"])
        
        # In production, you might want to redirect to frontend with tokens in URL
        # or handle it via a secure postMessage. 
        # For simplicity in this API response, we'll return the data.
        # However, since this is a GET request from a browser redirect, 
        # usually we redirect back to the frontend.
        
        frontend_redirect_url = f"{settings.FRONTEND_URL}/auth/callback?access_token={result['access_token']}&refresh_token={result['refresh_token']}"
        from fastapi.responses import RedirectResponse
        return RedirectResponse(url=frontend_redirect_url)
        
    except Exception as e:
        from app.core.responses import error_response
        from fastapi.responses import JSONResponse
        return JSONResponse(
            status_code=status.HTTP_401_UNAUTHORIZED,
            content=error_response("AUTH_FAILED", f"Google authentication failed: {str(e)}")
        )
