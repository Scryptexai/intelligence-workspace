import { seedViaRest, restSeedEnabled, isProjectsEmpty } from "@/db/seedRest";
import { apiJson, apiError } from "@/lib/api/response";

export const dynamic = "force-dynamic";

/**
 * POST /api/seed  → seed paksa (upsert idempotent)
 * GET  /api/seed  → bootstrap sekali pakai: seed HANYA jika tabel projects
 *                   masih kosong (aman dipanggil berulang, tidak menimpa data).
 *
 * Aktif hanya jika Supabase REST dikonfigurasi (NEXT_PUBLIC_SUPABASE_URL +
 * SUPABASE_SECRET_KEY). Seluruh eksekusi server-side; secret tidak bocor.
 */
export async function GET() {
  if (!restSeedEnabled) {
    return apiError("Supabase REST tidak dikonfigurasi", 503);
  }
  try {
    if (!(await isProjectsEmpty())) {
      return apiJson({ seeded: false, reason: "database sudah berisi data" }, { source: "supabase-rest" });
    }
    const result = await seedViaRest(true);
    return apiJson(result, { source: "supabase-rest" });
  } catch (e) {
    return apiError(e instanceof Error ? e.message : "seed gagal", 500);
  }
}

export async function POST() {
  if (!restSeedEnabled) {
    return apiError("Supabase REST tidak dikonfigurasi", 503);
  }
  try {
    const result = await seedViaRest(true);
    return apiJson(result, { source: "supabase-rest" });
  } catch (e) {
    return apiError(e instanceof Error ? e.message : "seed gagal", 500);
  }
}
