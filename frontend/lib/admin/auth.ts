"use client";

/**
 * Owner dashboard auth — JWT bearer tokens in localStorage.
 *
 * Cookies are deliberately not used: the Next.js frontend (Vercel) and the
 * Django API (Render) are cross-origin, where third-party cookies are
 * blocked by modern browsers. Contract matches docs/API.md.
 */

const ACCESS_KEY = "ml_admin_access";
const REFRESH_KEY = "ml_admin_refresh";
const USER_KEY = "ml_admin_user";

export interface AdminUser {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  is_superuser: boolean;
}

interface LoginResponse {
  access: string;
  refresh: string;
  user: AdminUser;
}

// ─── Storage helpers ──────────────────────────────────────────────────────────

export function getStoredUser(): AdminUser | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(USER_KEY);
    return raw ? (JSON.parse(raw) as AdminUser) : null;
  } catch {
    return null;
  }
}

export function clearStoredAuth(): void {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(ACCESS_KEY);
  window.localStorage.removeItem(REFRESH_KEY);
  window.localStorage.removeItem(USER_KEY);
}

// ─── Token lifecycle ──────────────────────────────────────────────────────────

function decodeJwtExp(token: string): number | null {
  try {
    const payload = token.split(".")[1];
    if (!payload) return null;
    const decoded = JSON.parse(atob(payload.replace(/-/g, "+").replace(/_/g, "/")));
    return typeof decoded.exp === "number" ? decoded.exp : null;
  } catch {
    return null;
  }
}

function getRefreshToken(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(REFRESH_KEY);
}

let refreshInFlight: Promise<string | null> | null = null;

/**
 * Returns a currently-valid access token, refreshing it if near expiry.
 * Returns null when the visitor is not (or no longer) authenticated.
 */
export async function getValidAccessToken(): Promise<string | null> {
  if (typeof window === "undefined") return null;
  const access = window.localStorage.getItem(ACCESS_KEY);
  if (!access) return null;

  const exp = decodeJwtExp(access);
  const marginSeconds = 30;
  if (exp && Date.now() / 1000 < exp - marginSeconds) return access;

  const refresh = getRefreshToken();
  if (!refresh) {
    clearStoredAuth();
    return null;
  }

  // Single-flight: concurrent callers share one refresh request
  if (!refreshInFlight) {
    refreshInFlight = (async () => {
      try {
        const apiBase =
          process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000/api/v1";
        const res = await fetch(`${apiBase}/auth/refresh/`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ refresh }),
        });
        if (!res.ok) {
          clearStoredAuth();
          return null;
        }
        const data = (await res.json()) as { access: string; refresh?: string };
        window.localStorage.setItem(ACCESS_KEY, data.access);
        if (data.refresh) {
          window.localStorage.setItem(REFRESH_KEY, data.refresh);
        }
        return data.access;
      } catch {
        return null;
      } finally {
        refreshInFlight = null;
      }
    })();
  }
  return refreshInFlight;
}

// ─── Login / logout ───────────────────────────────────────────────────────────

export async function login(
  username: string,
  password: string
): Promise<AdminUser> {
  const apiBase =
    process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000/api/v1";
  const res = await fetch(`${apiBase}/auth/login/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  });
  if (!res.ok) {
    let message = "Login failed. Check your credentials.";
    try {
      const data = await res.json();
      const detail = data.detail || data.non_field_errors?.[0] || data.message;
      if (typeof detail === "string") message = detail;
    } catch {
      /* keep default message */
    }
    throw new Error(message);
  }
  const data = (await res.json()) as LoginResponse;
  window.localStorage.setItem(ACCESS_KEY, data.access);
  window.localStorage.setItem(REFRESH_KEY, data.refresh);
  window.localStorage.setItem(USER_KEY, JSON.stringify(data.user));
  return data.user;
}

export function logout(): void {
  clearStoredAuth();
}
