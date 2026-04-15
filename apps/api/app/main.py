import structlog
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import ValidationError

from app.core.config import settings
from app.core.responses import error_response

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

log = structlog.get_logger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    log.info("stillmind_api_starting", env=settings.ENVIRONMENT)
    yield
    log.info("stillmind_api_stopping")


def create_app() -> FastAPI:
    app = FastAPI(
        title=settings.APP_NAME,
        version=settings.APP_VERSION,
        docs_url="/docs" if settings.DEBUG else None,
        redoc_url="/redoc" if settings.DEBUG else None,
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

    # ----------------------------------------------------------------
    # Global exception handlers
    # ----------------------------------------------------------------
    @app.exception_handler(ValidationError)
    async def validation_error_handler(request: Request, exc: ValidationError):
        details = [
            {"field": ".".join(str(l) for l in e["loc"]), "issue": e["msg"]}
            for e in exc.errors()
        ]
        return JSONResponse(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            content=error_response("VALIDATION_ERROR", "Request validation failed", details),
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

    # Chat & Audit
    app.include_router(chat_router, prefix=prefix)
    app.include_router(audit_router, prefix=prefix)

    # Health check
    @app.get("/health", tags=["System"])
    async def health():
        return {"status": "ok", "version": settings.APP_VERSION}

    # Mount Socket.IO to /socket.io at the root level (must happen after other routes)
    app.mount("/socket.io", socket_app)

    return app

app = create_app()
