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
      // Supabase's pooler (Supavisor) presents a cert chain Node's default trust store
      // doesn't recognize -- pg reports it as "self-signed certificate in certificate
      // chain" (verified via /api/health's diagnostic error, 2026-08-01). The connection
      // stays encrypted; only the CA chain verification is relaxed, which is Supabase's
      // own standard guidance for connecting via `pg`/node-postgres from serverless.
      ssl: { rejectUnauthorized: false },
    })
  : null;

if (isDbConfigured() && process.env.NODE_ENV !== "production") {
  globalForDb.__iwPgPool = pool ?? undefined;
}

/** Drizzle instance — null jika DB belum dikonfigurasi. */
export const db = isDbConfigured() && pool ? drizzle(pool, { schema }) : null;

/** Uji koneksi singkat — dipakai /api/health. */
export async function pingDatabase(): Promise<boolean> {
  const result = await pingDatabaseVerbose();
  return result.ok;
}

/** Sama seperti pingDatabase(), tapi menyertakan pesan error asli untuk diagnosis. */
export async function pingDatabaseVerbose(): Promise<{ ok: boolean; error?: string }> {
  if (!db || !pool) return { ok: false, error: "pool not initialized" };
  try {
    await pool.query("select 1");
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : String(err) };
  }
}

export * from "./schema";
