import { dbListRelationships } from "@/db/dataService";
import { apiJson } from "@/lib/api/response";

export const dynamic = "force-dynamic";

/** GET /api/projects/[slug]/relationships → { data: Relationship[], meta } */
export async function GET(
  _req: Request,
  { params: routeParams }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await routeParams;
  return apiJson(await dbListRelationships(slug), {
    source: "live",
    cache: "public, s-maxage=60, stale-while-revalidate=300",
  });
}
