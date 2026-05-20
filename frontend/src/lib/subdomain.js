/**
 * Multi-tenant subdomain helpers.
 *
 * In dev:  abc.localhost:5173                → subdomain = "abc"
 * In prod: abc.domain.com                    → subdomain = "abc"
 *
 * The apex (no subdomain) renders the marketing/landing page and the
 * neutral signup flow. A tenant subdomain renders the tenant's login page.
 */

const BASE_DOMAIN = (import.meta.env.VITE_BASE_DOMAIN || "localhost")
  .toLowerCase()
  .trim();

const RESERVED = new Set([
  "www", "api", "app", "admin", "dashboard", "mail", "smtp", "ftp",
  "blog", "docs", "help", "support", "status", "assets", "static",
  "cdn", "auth", "login", "signup", "register", "public", "health",
]);

const SUBDOMAIN_RE = /^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/;

export function getBaseDomain() {
  return BASE_DOMAIN;
}

/**
 * Parse the current window's hostname and return the tenant subdomain,
 * or null if we're on the apex / a reserved label / not under BASE_DOMAIN.
 */
export function getCurrentSubdomain() {
  if (typeof window === "undefined") return null;
  return parseSubdomain(window.location.hostname);
}

export function parseSubdomain(hostname) {
  if (!hostname) return null;
  const host = hostname.toLowerCase();
  if (host === BASE_DOMAIN) return null;
  const suffix = `.${BASE_DOMAIN}`;
  if (!host.endsWith(suffix)) return null;
  const candidate = host.slice(0, -suffix.length);
  if (!candidate || candidate.includes(".")) return null;
  if (RESERVED.has(candidate)) return null;
  if (!SUBDOMAIN_RE.test(candidate)) return null;
  return candidate;
}

/**
 * Build a fully-qualified tenant URL.
 * e.g. buildTenantUrl("abc") → "http://abc.localhost:5173" in dev
 */
export function buildTenantUrl(subdomain, path = "/") {
  if (!subdomain) return path;
  const { protocol, port } = window.location;
  const host = port
    ? `${subdomain}.${BASE_DOMAIN}:${port}`
    : `${subdomain}.${BASE_DOMAIN}`;
  return `${protocol}//${host}${path}`;
}

/** Are we on a tenant subdomain right now? */
export function isOnTenantSubdomain() {
  return getCurrentSubdomain() !== null;
}
