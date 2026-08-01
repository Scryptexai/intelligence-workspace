/**
 * Helper respons API — satu cara membungkus data dalam envelope { data, meta }.
 * Backend sungguhan nanti wajib memakai bentuk yang sama agar client
 * (auto-unwrap) tidak kehilangan metadata.
 */
import type { ApiMeta } from "./types";

export function apiJson<T>(
  data: T,
  options?: {
    status?: number;
    source?: ApiMeta["source"];
    version?: string;
    cache?: string;
    pagination?: ApiMeta["pagination"];
  }
): Response {
  const meta: ApiMeta = {
    generatedAt: new Date().toISOString(),
    source: options?.source ?? "mock",
    ...(options?.version ? { version: options.version } : {}),
    ...(options?.pagination ? { pagination: options.pagination } : {}),
  };
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (options?.cache) headers["Cache-Control"] = options.cache;
  return new Response(JSON.stringify({ data, meta }), {
    status: options?.status ?? 200,
    headers,
  });
}

export function apiError(message: string, status: number, code?: string): Response {
  return Response.json(
    { error: message, ...(code ? { code } : {}) },
    { status }
  );
}
