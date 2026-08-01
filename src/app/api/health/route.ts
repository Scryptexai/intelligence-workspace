import { pingDatabase, isDbConfigured } from "@/db";

export const dynamic = "force-dynamic";

/**
 * GET /api/health
 * - Tanpa DATABASE_URL        → { ok:true, database:"mock" } (mode data riset lokal)
 * - DB dikonfigurasi & hidup   → { ok:true, database:"connected" }
 * - DB dikonfigurasi tapi tak terjangkau → { ok:true, database:"unreachable" }
 *   (aplikasi tetap jalan via fallback mock — tidak pernah crash)
 */
export async function GET() {
  if (!isDbConfigured()) {
    return Response.json({
      ok: true,
      database: "mock",
      note: "DATABASE_URL belum diset — data dari lib/data (mock mode).",
    });
  }
  const ok = await pingDatabase();
  if (ok) return Response.json({ ok: true, database: "connected" });
  return Response.json({
    ok: true,
    database: "unreachable",
    note: "DATABASE_URL diset tapi tidak terjangkau — memakai fallback mock. Pastikan IPv6/pooler tersedia.",
  });
}
