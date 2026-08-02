/**
 * Shared API contract types — dipakai bersama oleh client, mock adapter,
 * API routes, dan backend sungguhan nanti.
 */
import type { DataSource } from "./config";

export interface ApiErrorBody {
  error: string;
  code?: string;
  details?: unknown;
}

/** Error ter-normalisasi dari semua kegagalan jaringan/HTTP. */
export class ApiError extends Error {
  status: number;
  code?: string;
  details?: unknown;

  constructor(message: string, status: number, code?: string, details?: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

/** Metadata respons — dipakai backend untuk memberi tahu sinkronisasi data. */
export interface ApiMeta {
  generatedAt: string;
  source: "live" | "degraded" | "stale" | "mock" | "supabase-rest";
  cached?: boolean;
  /** Etag/version untuk deteksi konflik & revalidation */
  version?: string;
  /** Info pagination (hanya jika endpoint paginated) */
  pagination?: { page: number; pageSize: number; total: number; pages: number };
}

/**
 * Envelope respons STANDAR backend. Client otomatis membuka `data` —
 * jadi backend WAJIB membungkus respons dengan envelope ini untuk presisi
 * tanpa kehilangan metadata (source, version, pagination).
 */
export interface ApiEnvelope<T> {
  data: T;
  meta: ApiMeta;
}

/** Dukungan dua bentuk: envelope penuh atau bare data (untuk mock/legacy). */
export type ApiResponse<T> = ApiEnvelope<T> | T;

/* ------------------------------------------------------------------ */
/* Query params untuk filtering & pagination                           */
/* ------------------------------------------------------------------ */

export interface PageParams {
  page?: number;
  pageSize?: number;
}

export interface ListParams extends PageParams {
  q?: string;
  status?: string;
  severity?: string;
  type?: string;
  category?: string;
  sort?: string;
  order?: "asc" | "desc";
  /** filter tambahan bebas (untuk backend query builder) */
  [key: string]: string | number | boolean | undefined;
}

export interface Paginated<T> {
  items: T[];
  page: number;
  pageSize: number;
  total: number;
  pages: number;
}

export interface ProjectBundleMeta {
  generatedAt: string;
  source: "mock" | "live";
}

/** Status kesehatan API + konfigurasi (untuk /api/config). */
export interface ApiConfigInfo {
  dataSource: DataSource;
  version: string;
  database: "connected" | "mock";
  projectCount: number;
  endpoints: string[];
}

export type { DataSource } from "./config";
