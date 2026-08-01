import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./schema";

/**
 * Koneksi PostgreSQL yang resilient:
 * - Jika DATABASE_URL TIDAK ada → `db` = null, aplikasi tetap jalan (mock).
 * - Jika ada → pool global (di-cache saat dev) agar hot-reload aman.
 */
const databaseUrl = process.env.DATABASE_URL;

export const isDbConfigured = (): boolean => Boolean(databaseUrl);

const globalForDb = globalThis as typeof globalThis & {
  __iwPgPool?: Pool;
};

export const pool: Pool | null = isDbConfigured()
  ? globalForDb.__iwPgPool ??
    new Pool({
      connectionString: databaseUrl,
      max: 10,
      idleTimeoutMillis: 30_000,
    })
  : null;

if (isDbConfigured() && process.env.NODE_ENV !== "production") {
  globalForDb.__iwPgPool = pool ?? undefined;
}

/** Drizzle instance — null jika DB belum dikonfigurasi. */
export const db = isDbConfigured() && pool ? drizzle(pool, { schema }) : null;

/** Uji koneksi singkat — dipakai /api/health. */
export async function pingDatabase(): Promise<boolean> {
  if (!db || !pool) return false;
  try {
    await pool.query("select 1");
    return true;
  } catch {
    return false;
  }
}

export * from "./schema";
