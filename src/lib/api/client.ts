/**
 * HTTP client dasar — satu-satunya titik yang menyentuh fetch.
 *
 * Fitur presisi untuk koneksi backend:
 *  - Auto-unwrap envelope { data, meta } → UI terima data murni, metadata
 *    (source/version/pagination) tidak hilang dan bisa diakses via metaRef.
 *  - Query builder (params → URLSearchParams) untuk pagination & filter.
 *  - Timeout, retry eksponensial, error normalization, auth bearer.
 *  - Correlation ID (x-request-id) untuk tracing di sisi backend.
 */

import { API_BASE_URL, getAuthToken, REQUEST_TIMEOUT_MS, isServerSide, serverApiBaseUrl } from "./config";
import { ApiError, type ApiErrorBody, type ApiMeta, type ListParams } from "./types";

export interface RequestOptions extends Omit<RequestInit, "body"> {
  body?: unknown;
  timeoutMs?: number;
  retries?: number;
  /** skip auth header (mis. login/public endpoint) */
  auth?: boolean;
}

/** Hasil fetch dengan metadata yang sudah di-unwrap. */
export interface ApiResult<T> {
  data: T;
  meta?: ApiMeta;
}

/* ------------------------------------------------------------------ */
/* Query builder                                                       */
/* ------------------------------------------------------------------ */

export function buildQuery(
  params?: ListParams | Record<string, string | number | boolean | undefined>
): string {
  if (!params) return "";
  const sp = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v === undefined || v === null || v === "") continue;
    sp.set(k, String(v));
  }
  const qs = sp.toString();
  return qs ? `?${qs}` : "";
}

function buildUrl(path: string, query?: ListParams | Record<string, unknown>): string {
  // Node's fetch (used during SSR) can't resolve a bare relative path like "/api/projects" --
  // it needs an absolute URL, unlike the browser which resolves relative to its own origin.
  const base = isServerSide ? serverApiBaseUrl() : API_BASE_URL;
  const url = /^https?:\/\//.test(path) ? path : `${base}${path.startsWith("/") ? path : `/${path}`}`;
  const qs = buildQuery(query as ListParams);
  return `${url}${qs}`;
}

async function parseError(res: Response): Promise<ApiError> {
  let body: ApiErrorBody | undefined;
  try {
    body = (await res.json()) as ApiErrorBody;
  } catch {
    /* non-JSON error body */
  }
  return new ApiError(
    body?.error ?? `Request failed with status ${res.status}`,
    res.status,
    body?.code,
    body?.details
  );
}

/** Unwrap envelope: { data, meta } → { data, meta }; bare → { data }. */
async function unwrap<T>(res: Response): Promise<ApiResult<T>> {
  const json = (await res.json()) as unknown;
  if (
    json &&
    typeof json === "object" &&
    "data" in (json as Record<string, unknown>)
  ) {
    const env = json as { data: T; meta?: ApiMeta };
    return { data: env.data, meta: env.meta };
  }
  return { data: json as T };
}

let requestSeq = 0;
function nextRequestId(): string {
  requestSeq = (requestSeq + 1) % 1_000_000;
  return `iw-${Date.now().toString(36)}-${requestSeq.toString(36)}`;
}

export async function apiFetch<T>(
  path: string,
  options: RequestOptions = {}
): Promise<ApiResult<T>> {
  const {
    body,
    timeoutMs = REQUEST_TIMEOUT_MS,
    retries = 0,
    auth = true,
    headers,
    ...rest
  } = options;

  const url = buildUrl(path);
  const finalHeaders = new Headers(headers);
  if (!finalHeaders.has("Content-Type") && body !== undefined) {
    finalHeaders.set("Content-Type", "application/json");
  }
  if (!finalHeaders.has("x-request-id")) {
    finalHeaders.set("x-request-id", nextRequestId());
  }
  if (auth) {
    const token = getAuthToken();
    if (token) finalHeaders.set("Authorization", `Bearer ${token}`);
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  let lastError: unknown;

  try {
    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        const res = await fetch(url, {
          ...rest,
          headers: finalHeaders,
          body: body !== undefined ? JSON.stringify(body) : undefined,
          signal: controller.signal,
          cache: "no-store",
        });

        if (!res.ok) throw await parseError(res);
        if (res.status === 204) return { data: undefined as T };

        // Jika backend mengembalikan array non-JSON-safe (jarang), tetap coba parse.
        return await unwrap<T>(res);
      } catch (err) {
        lastError = err;
        if (attempt < retries) {
          // exponential backoff 300ms, 600ms, 1200ms…
          await new Promise((r) => setTimeout(r, 300 * 2 ** attempt));
          continue;
        }
        throw err;
      }
    }
    throw lastError;
  } finally {
    clearTimeout(timer);
  }
}

/** GET dengan query params (ListParams) — otomatis unwrap envelope. */
export async function apiGet<T>(
  path: string,
  query?: ListParams
): Promise<ApiResult<T>> {
  // Only append the query string here -- apiFetch() calls buildUrl() itself, which already
  // prepends the base. Doing both here AND in apiFetch doubled the base (bug found live:
  // "/api/api/projects", 2026-08-02 -- surfaced only once NEXT_PUBLIC_DATA_SOURCE=backend
  // was ever actually exercised, since MOCK mode never reached this code path before).
  return apiFetch<T>(`${path}${buildQuery(query)}`, { method: "GET" });
}

/* Convenience methods — semua mengembalikan data yang sudah di-unwrap. */
export const http = {
  get: <T>(path: string, query?: ListParams) => apiGet<T>(path, query).then((r) => r.data),
  post: <T>(path: string, body?: unknown) => apiFetch<T>(path, { method: "POST", body }).then((r) => r.data),
  put: <T>(path: string, body?: unknown) => apiFetch<T>(path, { method: "PUT", body }).then((r) => r.data),
  patch: <T>(path: string, body?: unknown) => apiFetch<T>(path, { method: "PATCH", body }).then((r) => r.data),
  delete: <T>(path: string) => apiFetch<T>(path, { method: "DELETE" }).then((r) => r.data),
};
