import time
from datetime import datetime, timezone

from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request

from config.database import master_db
from config.password_tokens import verify_token


class AuditLogMiddleware(BaseHTTPMiddleware):
    """
    Logs every authenticated API request to the master audit_logs collection.
    Captures: user, tenant, method, path, status, latency.
    """

    SKIP_PATHS = {"/docs", "/redoc", "/openapi.json", "/health"}

    async def dispatch(self, request: Request, call_next):
        if request.url.path in self.SKIP_PATHS:
            return await call_next(request)

        start = time.perf_counter()
        response = await call_next(request)
        latency_ms = round((time.perf_counter() - start) * 1000, 2)

        # Extract user info from token (best-effort, no error if missing)
        user_email = None
        tenant_id = None
        auth = request.headers.get("Authorization", "")
        if auth.startswith("Bearer "):
            payload = verify_token(auth.split(" ", 1)[1])
            if payload:
                user_email = payload.get("sub")
                tenant_id = payload.get("hospital_id")

        log_entry = {
            "timestamp": datetime.now(timezone.utc),
            "method": request.method,
            "path": request.url.path,
            "status_code": response.status_code,
            "latency_ms": latency_ms,
            "user_email": user_email,
            "tenant_id": tenant_id,
            "client_ip": request.client.host if request.client else None,
        }

        # Fire-and-forget insert — don't block the response
        try:
            await master_db.audit_logs.insert_one(log_entry)
        except Exception:
            pass  # Audit log failure should never break the request

        return response
