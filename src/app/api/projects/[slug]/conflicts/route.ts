import { dbListConflicts } from "@/db/dataService";
import { apiJson } from "@/lib/api/response";
import type { ListParams } from "@/lib/api/types";

/** GET /api/projects/[slug]/conflicts?severity=&status=&page= → { data, meta } */
export async function GET(
  req: Request,
  { params: routeParams }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await routeParams;
  const { searchParams } = new URL(req.url);
  const sp: ListParams = {
    q: searchParams.get("q") ?? undefined,
    severity: searchParams.get("severity") ?? undefined,
    status: searchParams.get("status") ?? undefined,
    page: searchParams.get("page") ? Number(searchParams.get("page")) : undefined,
    pageSize: searchParams.get("pageSize") ? Number(searchParams.get("pageSize")) : undefined,
  };

  let items = await dbListConflicts(slug, sp);
  if (sp.q) {
    const q = sp.q.toLowerCase();
    items = items.filter((c) => c.title.toLowerCase().includes(q) || c.id.toLowerCase().includes(q));
  }

  const page = Math.max(1, sp.page ?? 1);
  const pageSize = sp.pageSize ?? 1000;
  const total = items.length;
  const pages = Math.max(1, Math.ceil(total / pageSize));
  const safe = Math.min(page, pages);

  return apiJson(items.slice((safe - 1) * pageSize, safe * pageSize), {
    source: "live",
    cache: "public, s-maxage=60, stale-while-revalidate=300",
    pagination: { page: safe, pageSize, total, pages },
  });
}
