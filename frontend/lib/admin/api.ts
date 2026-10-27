"use client";

/**
 * Authenticated API client for the owner dashboard.
 *
 * `adminFetch` attaches the bearer token, transparently refreshes expired
 * tokens once, and normalises DRF error payloads into Error messages.
 */

import { getValidAccessToken } from "./auth";
import { getApiBase } from "@/lib/api";

export class UnauthorizedError extends Error {
  constructor() {
    super("Session expired. Please sign in again.");
    this.name = "UnauthorizedError";
  }
}

function extractErrorMessage(data: unknown, fallback: string): string {
  if (typeof data === "string" && data.trim()) return data;
  if (data && typeof data === "object") {
    const record = data as Record<string, unknown>;
    for (const key of ["detail", "message", "error"]) {
      const value = record[key];
      if (typeof value === "string" && value.trim()) return value;
    }
    // DRF field errors: {field: ["msg", ...]}
    for (const value of Object.values(record)) {
      if (Array.isArray(value) && typeof value[0] === "string") return value[0];
      if (typeof value === "string" && value.trim()) return value;
    }
  }
  return fallback;
}

export async function adminFetch<T = unknown>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const token = await getValidAccessToken();
  if (!token) throw new UnauthorizedError();

  const isFormData = options.body instanceof FormData;
  const headers = new Headers(options.headers);
  if (token) headers.set("Authorization", `Bearer ${token}`);
  if (!isFormData && options.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  const doFetch = () =>
    fetch(`${getApiBase()}${path}`, { ...options, headers, credentials: "omit" });

  let res = await doFetch();

  // Access token expired/invalidated mid-session — refresh once and retry
  if (res.status === 401) {
    const fresh = await getValidAccessToken();
    if (!fresh) throw new UnauthorizedError();
    headers.set("Authorization", `Bearer ${fresh}`);
    res = await doFetch();
    if (res.status === 401) throw new UnauthorizedError();
  }

  // 204 and empty bodies
  if (res.status === 204) return undefined as T;
  const text = await res.text();
  const data: unknown = text ? JSON.parse(text) : null;

  if (!res.ok) {
    throw new Error(extractErrorMessage(data, `Request failed (${res.status})`));
  }
  return data as T;
}

// ─── Convenience helpers ──────────────────────────────────────────────────────

export function adminList<T>(path: string): Promise<T[]> {
  // DRF pagination: {count, next, previous, results} — fall back to raw array
  return adminFetch<unknown>(path).then((data) => {
    if (Array.isArray(data)) return data as T[];
    if (data && typeof data === "object" && Array.isArray((data as { results?: T[] }).results)) {
      return (data as { results: T[] }).results;
    }
    return [];
  });
}

export function adminJsonBody(payload: unknown): RequestInit {
  return {
    method: "POST",
    body: JSON.stringify(payload),
  };
}
