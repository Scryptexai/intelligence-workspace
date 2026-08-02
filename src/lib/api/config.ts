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
 * AUTO-DETECT (v2.1 — Supabase "tidak terload" di frontend diperbaiki):
 *
 *   Server-side (SSR & API routes): jika NEXT_PUBLIC_DATA_SOURCE TIDAK diset
 *   secara eksplisit, mode otomatis menjadi "backend" saat Supabase REST
 *   (NEXT_PUBLIC_SUPABASE_URL + SUPABASE_SECRET_KEY) atau PostgreSQL
 *   (DATABASE_URL) terkonfigurasi — sesuai semangat "set env → baca DB".
 *
 *   Client-side: saat boot, syncDataSourceFromServer() membaca /api/config.
 *   Jika server melaporkan database terhubung, repository beralih dari mock
 *   → backend otomatis (tanpa perlu NEXT_PUBLIC_DATA_SOURCE=backend), lalu
 *   query di-refetch sehingga data Supabase langsung tampil di UI.
 *
 *   Pengguna yang menyetel NEXT_PUBLIC_DATA_SOURCE secara eksplisit (mock
 *   ATAU backend) tetap dihormati — auto-detect tidak menimpa pilihan itu.
 */

export type DataSource = "mock" | "backend";

/** Nilai eksplisit dari env (jika diset) — mock/backend; selain itu null. */
function explicitDataSource(): DataSource | null {
  const v = process.env.NEXT_PUBLIC_DATA_SOURCE;
  if (v === "backend" || v === "mock") return v;
  return null;
}

/**
 * Auto-detect server-side: backend bila Supabase REST atau DATABASE_URL
 * terkonfigurasi. Hanya dievaluasi di server — di bundle client env secret
 * tidak pernah ada (di-replace `undefined` oleh Next.js), jadi guard ini
 * sekaligus mencegah secret bocor ke browser.
 */
function serverDetectedDataSource(): DataSource | null {
  if (typeof window !== "undefined") return null;
  if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SECRET_KEY) return "backend";
  if (process.env.DATABASE_URL) return "backend";
  return null;
}

function resolveDataSource(): DataSource {
  return explicitDataSource() ?? serverDetectedDataSource() ?? "mock";
}

/** Base URL API. Same-origin `/api` untuk mode local; ganti untuk backend eksternal. */
export const API_BASE_URL: string =
  process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, "") || "/api";

/** Mode build-time (dipakai server components & sebelum runtime sync selesai). */
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

/* ------------------------------------------------------------------ */
/* Runtime data-source sync (client-side auto-detect)                  */
/* ------------------------------------------------------------------ */

/** Snapshot status untuk UI (mis. badge "Supabase" di header). */
export interface DataSourceSnapshot {
  /** Mode efektif yang sedang dipakai repository. */
  mode: DataSource;
  /** Status database yang dilaporkan /api/config ("mock"|"connected"|"supabase-rest"|"unreachable"|null). */
  server: string | null;
}

let runtimeMode: DataSource | null = null;
let serverStatus: string | null = null;
const listeners = new Set<() => void>();
let snapshotCache: DataSourceSnapshot = { mode: DATA_SOURCE, server: null };

/** Mode efektif saat ini — build-time + runtime override dari /api/config. */
export function effectiveDataSource(): DataSource {
  return runtimeMode ?? DATA_SOURCE;
}

function emitSnapshot(): void {
  snapshotCache = { mode: effectiveDataSource(), server: serverStatus };
  for (const l of listeners) l();
}

/** Untuk useSyncExternalStore (badge data source di UI). */
export function subscribeDataSource(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function getDataSourceSnapshot(): DataSourceSnapshot {
  return snapshotCache;
}

/** True bila pengguna menyetel NEXT_PUBLIC_DATA_SOURCE secara eksplisit. */
export function isExplicitDataSource(): boolean {
  return explicitDataSource() !== null;
}

/**
 * Sinkronkan mode data source dari /api/config (dipanggil sekali saat boot
 * dari Providers). Mengembalikan `true` bila mode berubah menjadi backend
 * sehingga pemanggil bisa invalidate TanStack Query — data Supabase langsung
 * termuat tanpa reload. Gagal/tidak terjangkau → tetap mock (tidak crash).
 */
export async function syncDataSourceFromServer(): Promise<boolean> {
  if (typeof window === "undefined") return false; // server sudah resolve via env
  if (isExplicitDataSource()) return false; // hormati pilihan eksplisit pengguna
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 5_000);
    const res = await fetch(`${API_BASE_URL}/config`, {
      signal: controller.signal,
      cache: "no-store",
    });
    clearTimeout(timer);
    if (!res.ok) return false;

    const json = (await res.json()) as {
      data?: { dataSource?: string; database?: string };
    };
    const data = json?.data ?? {};
    serverStatus = data.database ?? "mock";

    const backendReady =
      data.dataSource === "backend" ||
      data.database === "connected" ||
      data.database === "supabase-rest";
    const next: DataSource = backendReady ? "backend" : "mock";
    const switchedToBackend = next === "backend" && effectiveDataSource() !== "backend";
    runtimeMode = next;
    emitSnapshot();
    return switchedToBackend;
  } catch {
    return false;
  }
}
