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
  // Pastikan hasilnya SELALU URL absolut — fetch server tidak bisa
  // menyelesaikan path relatif seperti "/api" (Invalid URL).
  if (configured) {
    const clean = configured.replace(/\/$/, "");
    if (/^https?:\/\//.test(clean)) return clean;
    // fallback: nilai relatif ("/api") → gunakan origin lokal/produksi.
  }
  // VERCEL_URL is the ephemeral per-deployment hostname (e.g. intelligence-workspace-cf2pr...
  // .vercel.app) -- it's still behind this project's Vercel Authentication wall, so an SSR
  // self-fetch against it gets redirected to an HTML login page instead of JSON (confirmed
  // live, 2026-08-02: "Unexpected token '<'... is not valid JSON", digest 2384324333).
  // VERCEL_PROJECT_PRODUCTION_URL is Vercel's own stable production alias, set on every
  // deployment including Preview -- use it first since it isn't behind that wall.
  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}/api`;
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}/api`;
  return "http://localhost:3000/api";
}
