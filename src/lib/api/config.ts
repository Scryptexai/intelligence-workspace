/**
 * ─────────────────────────────────────────────────────────────────────────────
 * API CLIENT CONFIGURATION
 * ─────────────────────────────────────────────────────────────────────────────
 * Satu toggle untuk memilih sumber data seluruh aplikasi:
 *
 *   NEXT_PUBLIC_DATA_SOURCE=mock     → data dibaca dari lib/data (offline, tanpa backend)
 *   NEXT_PUBLIC_DATA_SOURCE=backend  → data diambil dari API backend via HTTP
 *   NEXT_PUBLIC_API_BASE_URL=…       → base URL backend (default: same-origin /api)
 *
 * Saat "backend", repository memanggil endpoint REST; saat "mock", repository
 * memakai MockAdapter (simulasi backend di memori) — kontraknya identik,
 * sehingga migrasi ke database/backend sungguhan cukup ganti env tanpa edit kode UI.
 */

export type DataSource = "mock" | "backend";

function resolveDataSource(): DataSource {
  const v = process.env.NEXT_PUBLIC_DATA_SOURCE;
  if (v === "backend") return "backend";
  return "mock";
}

/** Base URL API. Same-origin `/api` untuk mode local; ganti untuk backend eksternal. */
export const API_BASE_URL: string =
  process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, "") || "/api";

export const DATA_SOURCE: DataSource = resolveDataSource();

/** Token akses opsional (untuk backend ber-auth nanti). */
export function getAuthToken(): string | null {
  if (typeof window === "undefined") return process.env.API_TOKEN ?? null;
  try {
    return window.localStorage.getItem("iw-auth-token");
  } catch {
    return null;
  }
}

export function setAuthToken(token: string | null): void {
  if (typeof window === "undefined") return;
  try {
    if (token) window.localStorage.setItem("iw-auth-token", token);
    else window.localStorage.removeItem("iw-auth-token");
  } catch {
    /* ignore */
  }
}

export const API_VERSION = "v1";
export const REQUEST_TIMEOUT_MS = 10_000;

export const isServerSide = typeof window === "undefined";

/**
 * API_BASE_URL untuk fetch server-side (SSR): wajib URL absolut karena
 * fetch dari server tidak punya origin. Set NEXT_PUBLIC_API_BASE_URL
 * ke URL backend publik saat deployment.
 */
export function serverApiBaseUrl(): string {
  const configured = process.env.NEXT_PUBLIC_API_BASE_URL;
  if (configured) return configured.replace(/\/$/, "");
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}/api`;
  return "http://localhost:3000/api";
}
