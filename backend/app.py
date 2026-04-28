from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from config.settings import settings
from config.startup import lifespan
from config.middleware.request_logger import AuditLogMiddleware
from config.middleware.rate_limiter import RateLimitMiddleware

# Domain routers
from routes.auth.endpoints import router as auth_router
from routes.passkey.endpoints import router as passkey_router
from routes.hospitals.endpoints import router as tenant_router
from routes.user.endpoints import router as user_router
from routes.patient.endpoints import router as patient_router
from routes.scan.endpoints import router as scan_router
from routes.xray_analysis.endpoints import router as ai_router
from routes.knowledge_base.endpoints import router as rag_router
from routes.billing.endpoints import router as billing_router
from routes.admin.endpoints import router as admin_router


def create_app() -> FastAPI:
    app = FastAPI(
        title=settings.APP_NAME,
        version=settings.API_VERSION,
        lifespan=lifespan,
    )

    # ── Middleware (order matters: last added = first executed) ───────────
    app.add_middleware(
        CORSMiddleware,
        allow_origins=[settings.ORIGIN],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )
    app.add_middleware(RateLimitMiddleware)
    app.add_middleware(AuditLogMiddleware)

    # ── API v1 Routers ──────────────────────────────────────────────────
    api_prefix = f"/api/{settings.API_VERSION}"

    app.include_router(auth_router, prefix=api_prefix)
    app.include_router(passkey_router, prefix=api_prefix)
    app.include_router(tenant_router, prefix=api_prefix)
    app.include_router(user_router, prefix=api_prefix)
    app.include_router(patient_router, prefix=api_prefix)
    app.include_router(scan_router, prefix=api_prefix)
    app.include_router(ai_router, prefix=api_prefix)
    app.include_router(rag_router, prefix=api_prefix)
    app.include_router(billing_router, prefix=api_prefix)
    app.include_router(admin_router, prefix=api_prefix)

    # ── Health Check ────────────────────────────────────────────────────
    @app.get("/health")
    async def health():
        return {"status": "ok", "version": settings.API_VERSION}

    return app


app = create_app()
