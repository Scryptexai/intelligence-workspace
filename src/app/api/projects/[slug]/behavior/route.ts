import { dbGetBehavior } from "@/db/dataService";
import { apiJson, apiError } from "@/lib/api/response";

/** GET /api/projects/[slug]/behavior → { data: BehaviorProfile, meta } | 404 */
export async function GET(
  _req: Request,
  { params: routeParams }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await routeParams;
  const behavior = await dbGetBehavior(slug);
  if (!behavior) return apiError("behavior not found", 404);
  return apiJson(behavior, { source: "live", cache: "public, s-maxage=60, stale-while-revalidate=300" });
}
