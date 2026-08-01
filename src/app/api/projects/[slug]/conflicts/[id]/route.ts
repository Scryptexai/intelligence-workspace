import { dbGetConflict } from "@/db/dataService";
import { apiJson, apiError } from "@/lib/api/response";

/** GET /api/projects/[slug]/conflicts/[id] → { data: Conflict, meta } | 404 */
export async function GET(
  _req: Request,
  { params: routeParams }: { params: Promise<{ slug: string; id: string }> }
) {
  const { slug, id } = await routeParams;
  const conflict = await dbGetConflict(slug, id);
  if (!conflict) return apiError("conflict not found", 404);
  return apiJson(conflict, { source: "live", cache: "public, s-maxage=60, stale-while-revalidate=300" });
}
