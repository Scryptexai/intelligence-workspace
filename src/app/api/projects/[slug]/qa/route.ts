import { dbGetQa } from "@/db/dataService";
import { apiJson, apiError } from "@/lib/api/response";

export const dynamic = "force-dynamic";

/** GET /api/projects/[slug]/qa → { data: QAReport, meta } | 404 */
export async function GET(
  _req: Request,
  { params: routeParams }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await routeParams;
  const qa = await dbGetQa(slug);
  if (!qa) return apiError("qa report not found", 404);
  return apiJson(qa, { source: "live", cache: "public, s-maxage=60, stale-while-revalidate=300" });
}
