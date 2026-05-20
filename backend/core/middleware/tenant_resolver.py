"""
Tenant resolver middleware.

Reads the Host header (or X-Tenant-Subdomain override for SPA dev),
resolves it to a hospital, and attaches tenant context to request.state.

Downstream code can do:

    sub = getattr(request.state, "subdomain", None)
    tenant = getattr(request.state, "tenant", None)  # full hospital doc or None
    tenant_id = getattr(request.state, "tenant_id", None)

This middleware NEVER blocks a request — it only annotates. Authorization is
still enforced by the JWT-based dependencies in core/dependencies.py.
"""

from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request

from core.database import master_db
from core.tenancy import extract_subdomain, is_valid_subdomain


class TenantResolverMiddleware(BaseHTTPMiddleware):
    SKIP_PATHS = {"/docs", "/redoc", "/openapi.json", "/health"}

    async def dispatch(self, request: Request, call_next):
        # Initialise to None so downstream code can rely on the attribute.
        request.state.subdomain = None
        request.state.tenant = None
        request.state.tenant_id = None

        if request.url.path in self.SKIP_PATHS:
            return await call_next(request)

        # 1. Try the Host header (production / real subdomains)
        host = request.headers.get("host")
        sub = extract_subdomain(host)

        # 2. Fall back to X-Tenant-Subdomain header (SPA dev convenience)
        if not sub:
            override = request.headers.get("x-tenant-subdomain", "").strip().lower()
            if override and is_valid_subdomain(override):
                sub = override

        if sub:
            request.state.subdomain = sub
            try:
                hospital = await master_db.hospitals.find_one({"subdomain": sub})
            except Exception:
                hospital = None
            if hospital:
                request.state.tenant = hospital
                request.state.tenant_id = hospital.get("hospital_id")

        return await call_next(request)
