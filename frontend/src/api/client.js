const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";
const API_URL = `${API_BASE}/api/v1`;

// ── Token helpers ───────────────────────────────────────────────────────────

export const getAccessToken = () => localStorage.getItem("access_token");
export const getRefreshToken = () => localStorage.getItem("refresh_token");

export const setTokens = (access, refresh) => {
  localStorage.setItem("access_token", access);
  if (refresh) localStorage.setItem("refresh_token", refresh);
};

export const clearTokens = () => {
  localStorage.removeItem("access_token");
  localStorage.removeItem("refresh_token");
  localStorage.removeItem("has_passkey");
};

// ── Auto-refresh logic ─────────────────────────────────────────────────────

let isRefreshing = false;
let refreshQueue = [];

const processQueue = (error, token = null) => {
  refreshQueue.forEach((p) => {
    if (error) p.reject(error);
    else p.resolve(token);
  });
  refreshQueue = [];
};

async function refreshAccessToken() {
  const refresh = getRefreshToken();
  if (!refresh) throw new Error("No refresh token");

  const res = await fetch(`${API_URL}/auth/refresh`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refresh_token: refresh }),
  });

  if (!res.ok) {
    clearTokens();
    window.location.href = "/login";
    throw new Error("Refresh failed");
  }

  const data = await res.json();
  setTokens(data.access_token, data.refresh_token);
  return data.access_token;
}

// ── Core fetch wrapper ─────────────────────────────────────────────────────

export async function apiFetch(path, options = {}) {
  const { auth = true, raw = false, ...fetchOpts } = options;

  const headers = { ...(fetchOpts.headers || {}) };

  if (auth) {
    const token = getAccessToken();
    if (token) headers["Authorization"] = `Bearer ${token}`;
  }

  // Don't set Content-Type for FormData (browser sets boundary automatically)
  if (!(fetchOpts.body instanceof FormData) && !headers["Content-Type"]) {
    headers["Content-Type"] = "application/json";
  }

  let res = await fetch(`${API_URL}${path}`, { ...fetchOpts, headers });

  // If 401 and we have a refresh token, try refreshing
  if (res.status === 401 && auth && getRefreshToken()) {
    if (!isRefreshing) {
      isRefreshing = true;
      try {
        const newToken = await refreshAccessToken();
        isRefreshing = false;
        processQueue(null, newToken);
      } catch (err) {
        isRefreshing = false;
        processQueue(err);
        throw err;
      }
    } else {
      // Queue this request until refresh completes
      const newToken = await new Promise((resolve, reject) => {
        refreshQueue.push({ resolve, reject });
      });
    }

    // Retry with new token
    headers["Authorization"] = `Bearer ${getAccessToken()}`;
    res = await fetch(`${API_URL}${path}`, { ...fetchOpts, headers });
  }

  if (raw) return res;

  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: "Request failed" }));
    throw new Error(err.detail || err.message || "Request failed");
  }

  return res.json();
}

export { API_URL };
