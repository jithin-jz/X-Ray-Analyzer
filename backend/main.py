from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from core.settings import settings
from core.events import lifespan
from core.middleware.audit_log import AuditLogMiddleware
from core.middleware.rate_limit import RateLimitMiddleware

# Domain routers
from routes.auth.router import router as auth_router
from routes.passkey.router import router as passkey_router
from routes.tenants.router import router as tenant_router
from routes.user.router import router as user_router
from routes.patient.router import router as patient_router
from routes.scan.router import router as scan_router
from routes.ai.router import router as ai_router
from routes.rag.router import router as rag_router
from routes.billing.router import router as billing_router
from routes.admin.router import router as admin_router


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
