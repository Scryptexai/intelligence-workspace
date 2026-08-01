import { dbGetKnowledgeItem } from "@/db/dataService";
import { apiJson, apiError } from "@/lib/api/response";

/** GET /api/projects/[slug]/knowledge/[id] → { data: KnowledgeItem, meta } | 404 */
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ slug: string; id: string }> }
) {
  const { slug, id } = await params;
  const item = await dbGetKnowledgeItem(slug, id);
  if (!item) return apiError("knowledge not found", 404);
  return apiJson(item, { source: "live", cache: "public, s-maxage=60, stale-while-revalidate=300" });
}
