import { dbSearch } from "@/db/dataService";
import { apiJson } from "@/lib/api/response";

export const dynamic = "force-dynamic";

/**
 * GET /api/search?q=type:knowledge confidence:>90 status:stable
 * Faceted global search — envelope { data, meta }, DB-first.
 */
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q") ?? "";
  const results = await dbSearch(q);
  return apiJson(results, { source: "live", cache: "public, s-maxage=30, stale-while-revalidate=120" });
}
