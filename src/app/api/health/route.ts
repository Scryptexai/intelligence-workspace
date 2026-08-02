import { pingDatabaseVerbose, isDbConfigured, hadSslModeParam } from "@/db";
import { pingSupabaseRest, dbStatus } from "@/db/dataService";
import { supabaseRest } from "@/db/supabaseService";
const supabaseRestEnabled = dbStatus().mode === "database" && Boolean(process.env.SUPABASE_SECRET_KEY);

export const dynamic = "force-dynamic";

/**
 * GET /api/health
 * - Supabase REST (cif_datasets) hidup → { ok:true, database:"supabase-rest" }
 * - Tanpa DATABASE_URL        → { ok:true, database:"mock" }
 * - DB dikonfigurasi & hidup   → { ok:true, database:"connected" }
 * - lainnya                    → ok:true + fallback mock (tidak pernah crash)
 */
export async function GET() {
  if (supabaseRestEnabled) {
    const restOk = await pingSupabaseRest();
    if (restOk) {
      const writeOk = await supabaseRest.pingWrite();
      return Response.json({
        ok: true,
        database: "supabase-rest",
        write: writeOk ? "enabled" : "readonly",
        note: "Data dari Supabase (tabel relasional) via PostgREST.",
      });
    }
  }
  if (!isDbConfigured()) {
    return Response.json({
      ok: true,
      database: "mock",
      note: "DATABASE_URL belum diset — data dari lib/data (mock mode).",
    });
  }
  const result = await pingDatabaseVerbose();
  if (result.ok) return Response.json({ ok: true, database: "connected" });
  return Response.json({
    ok: true,
    database: "unreachable",
    error: result.error,
    errorSource: result.errorSource,
    hadSslModeParam: hadSslModeParam(),
    note: "DB tidak terjangkau — memakai fallback mock.",
  });
}
