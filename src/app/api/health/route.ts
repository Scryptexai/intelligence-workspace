import { pingDatabase, isDbConfigured } from "@/db";

export const dynamic = "force-dynamic";

/**
 * GET /api/health — cek DB (jika dikonfigurasi). Tanpa DATABASE_URL,
 * aplikasi tetap sehat (mode mock) — bukan error.
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
  return Response.json({ ok, database: ok ? "connected" : "error" }, ok ? {} : { status: 500 });
}
