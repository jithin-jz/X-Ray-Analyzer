"""
Multi-tenancy helpers — subdomain slugify, parsing, validation.

A "subdomain" here is the lowercase DNS label that identifies a tenant inside
BASE_DOMAIN. e.g. for BASE_DOMAIN=domain.com:
    abc.domain.com         → subdomain = "abc"
    st-marys.domain.com    → subdomain = "st-marys"
"""

from __future__ import annotations

import re
import unicodedata
from typing import Optional

from core.settings import settings

# DNS label rules (RFC 1035, slightly relaxed to ASCII-lower):
#   - 1..63 chars
#   - [a-z0-9-]
#   - must start and end with alphanumeric
SUBDOMAIN_RE = re.compile(r"^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$")
MAX_SUBDOMAIN_LEN = 32  # we cap shorter than DNS max for readability


def slugify(name: str) -> str:
    """
    Convert a human hospital name to a DNS-safe lowercase slug.

    "St. Mary's Hospital!"  →  "st-marys-hospital"
    "ABC Clinic 123"        →  "abc-clinic-123"
    """
    if not name:
        return ""

    # Normalize unicode → ASCII (drop accents)
    normalized = unicodedata.normalize("NFKD", name)
    ascii_only = normalized.encode("ascii", "ignore").decode("ascii")

    # Lowercase, replace non-alphanumeric with hyphens
    lowered = ascii_only.lower()
    hyphenated = re.sub(r"[^a-z0-9]+", "-", lowered)

    # Collapse multiple hyphens, strip leading/trailing hyphens
    collapsed = re.sub(r"-+", "-", hyphenated).strip("-")

    return collapsed[:MAX_SUBDOMAIN_LEN].rstrip("-")


def is_valid_subdomain(sub: str) -> bool:
    """Return True iff `sub` is a syntactically valid DNS label."""
    if not sub:
        return False
    if len(sub) > MAX_SUBDOMAIN_LEN:
        return False
    return bool(SUBDOMAIN_RE.match(sub))


def is_reserved(sub: str) -> bool:
    """Return True iff this subdomain is on the reserved list."""
    return sub.lower() in settings.reserved_subdomains_set


def extract_subdomain(host: Optional[str]) -> Optional[str]:
    """
    Extract the tenant subdomain from a Host header.

    "abc.domain.com:8000"  →  "abc"   (when BASE_DOMAIN=domain.com)
    "domain.com"           →  None    (apex)
    "www.domain.com"       →  None    (reserved → not a tenant)
    "abc.localhost:5173"   →  "abc"
    "localhost"            →  None
    """
    if not host:
        return None

    # Strip port and normalize
    host_only = host.split(":", 1)[0].strip().lower()
    base = settings.BASE_DOMAIN.strip().lower()

    if not host_only or not base:
        return None

    # Direct match → apex, no subdomain
    if host_only == base:
        return None

    # Must end with .{BASE_DOMAIN}
    suffix = f".{base}"
    if not host_only.endswith(suffix):
        return None

    candidate = host_only[: -len(suffix)]
    # Guard against multi-label subdomains for now (e.g. a.b.domain.com)
    if not candidate or "." in candidate:
        return None

    if is_reserved(candidate):
        return None
    if not is_valid_subdomain(candidate):
        return None

    return candidate


def build_tenant_url(subdomain: str) -> str:
    """Build the user-facing URL for a tenant: e.g. https://abc.domain.com"""
    scheme = settings.TENANT_URL_SCHEME or "https"
    port = settings.TENANT_URL_PORT.strip()
    host = f"{subdomain}.{settings.BASE_DOMAIN}"
    if port:
        host = f"{host}:{port}"
    return f"{scheme}://{host}"
