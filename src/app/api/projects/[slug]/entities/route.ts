import { dbListEntities, dbGetEntity } from "@/db/dataService";
import { apiJson, apiError } from "@/lib/api/response";
import type { ListParams } from "@/lib/api/types";

export const dynamic = "force-dynamic";

/** GET /api/projects/[slug]/entities[?id=&type=&q=] → { data, meta } */
export async function GET(
  req: Request,
  { params: routeParams }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await routeParams;
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");

  if (id) {
    const entity = await dbGetEntity(slug, id);
    if (!entity) return apiError("entity not found", 404);
    return apiJson(entity, { source: "live" });
  }

  const sp: ListParams = {
    q: searchParams.get("q") ?? undefined,
    type: searchParams.get("type") ?? undefined,
  };
  let items = await dbListEntities(slug);
  if (sp.type) items = items.filter((e) => e.type === sp.type);
  if (sp.q) {
    const q = sp.q.toLowerCase();
    items = items.filter((e) => e.name.toLowerCase().includes(q) || e.id.toLowerCase().includes(q));
  }

  return apiJson(items, { source: "live", cache: "public, s-maxage=60, stale-while-revalidate=300" });
}
