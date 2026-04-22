import structlog
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, Response
from pydantic import ValidationError
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from slowapi.middleware import SlowAPIMiddleware
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.middleware.sessions import SessionMiddleware

from app.core.config import settings
from app.core.responses import error_response
from app.core.redis import redis_client

limiter = Limiter(key_func=get_remote_address, default_limits=["60/minute"])


# ---------------------------------------------------------------------------
# HSTS Middleware — Force HTTPS in production
# ---------------------------------------------------------------------------
class HSTSMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        response = await call_next(request)
        # Only add HSTS header when not in debug mode
        if not settings.DEBUG and request.url.scheme == "https":
            # HSTS: 1 year, include subdomains, preload
            response.headers["Strict-Transport-Security"] = (
                "max-age=31536000; includeSubDomains; preload"
            )
        return response


# Routers
from app.modules.auth.router import router as auth_router
from app.modules.student.router import router as student_router
from app.modules.assessment.router import router as assessment_router
from app.modules.risk_engine.router import router as risk_router
from app.modules.counselor.router import router as counselor_router
from app.modules.allocation.router import router as allocation_router
from app.modules.session.router import router as session_router
from app.modules.dashboard.router import counselor_router as dash_c_router
from app.modules.dashboard.router import student_router as dash_s_router
from app.modules.dashboard.router import admin_router as dash_a_router
from app.modules.audit.router import router as audit_router
from app.modules.chat.router import router as chat_router
from app.modules.chat.socket import socket_app
from app.modules.notifications.router import router as notifications_router
from app.modules.admin.router import router as admin_router
from app.modules.internal.router import router as internal_router

log = structlog.get_logger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    log.info("stillmind_api_starting", env=settings.ENVIRONMENT)

    # Seed RBAC permissions and roles on startup
    from app.core.database import AsyncSessionLocal
    from app.modules.auth.rbac import rbac_service

    async with AsyncSessionLocal() as db:
        try:
            await rbac_service.seed_permissions(db)
            await rbac_service.seed_roles(db)
            log.info("rbac_seeded_successfully")
        except Exception as e:
            log.warning("rbac_seeding_skipped", error=str(e))

    # Connect Redis
    await redis_client.connect()

    yield
    # Disconnect Redis
    await redis_client.disconnect()
    log.info("stillmind_api_stopping")


def create_app() -> FastAPI:
    app = FastAPI(
        title=settings.APP_NAME,
        version=settings.APP_VERSION,
        docs_url="/api/v1/docs",
        redoc_url="/api/v1/redoc",
        openapi_url="/api/v1/openapi.json",
        lifespan=lifespan,
    )

    # ----------------------------------------------------------------
    # CORS
    # ----------------------------------------------------------------
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.CORS_ORIGINS,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # Rate limiting
    app.state.limiter = limiter
    app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)
    app.add_middleware(SlowAPIMiddleware)

    # HSTS (Strict-Transport-Security) - only in production
    if not settings.DEBUG:
        app.add_middleware(HSTSMiddleware)

    # Session Middleware (Required for OAuth state)
    app.add_middleware(
        SessionMiddleware,
        secret_key=settings.SESSION_SECRET,
        https_only=not settings.DEBUG,
    )

    # ----------------------------------------------------------------
    # Global exception handlers
    # ----------------------------------------------------------------
    @app.exception_handler(ValidationError)
    async def validation_error_handler(request: Request, exc: ValidationError):
        details = [
            {"field": ".".join(str(l) for l in e["loc"]), "issue": e["msg"]}
            for e in exc.errors()
        ]
        log.error("validation_error", path=request.url.path, details=details)
        return JSONResponse(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            content=error_response(
                "VALIDATION_ERROR", "Request validation failed", details
            ),
        )

    @app.exception_handler(Exception)
    async def global_exception_handler(request: Request, exc: Exception):
        log.error("unhandled_exception", path=request.url.path, error=str(exc))
        return JSONResponse(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            content=error_response("INTERNAL_ERROR", "An unexpected error occurred"),
        )

    # ----------------------------------------------------------------
    # Routers — versioned under /api/v1 (PRD §10.1)
    # ----------------------------------------------------------------
    prefix = "/api/v1"
    app.include_router(auth_router, prefix=prefix)
    app.include_router(student_router, prefix=prefix)
    app.include_router(assessment_router, prefix=prefix)
    app.include_router(risk_router, prefix=prefix)
    app.include_router(counselor_router, prefix=prefix)
    app.include_router(allocation_router, prefix=prefix)
    app.include_router(session_router, prefix=prefix)

    # Dashboards
    app.include_router(dash_c_router, prefix=prefix)
    app.include_router(dash_s_router, prefix=prefix)
    app.include_router(dash_a_router, prefix=prefix)

    # Chat, Notifications, Admin, Internal & Audit
    app.include_router(chat_router, prefix=prefix)
    app.include_router(notifications_router, prefix=prefix)
    app.include_router(admin_router, prefix=prefix)
    app.include_router(internal_router, prefix=prefix)
    app.include_router(audit_router, prefix=prefix)

    # Health check
    @app.get("/health", tags=["System"])
    @app.get(f"{prefix}/health", tags=["System"])
    async def health():
        return {"status": "ok", "version": settings.APP_VERSION}

    # Mount Socket.IO to /socket.io at the root level (must happen after other routes)
    app.mount("/socket.io", socket_app)

    return app


app = create_app()
