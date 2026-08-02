import { dbListProjects } from "@/db/dataService";
import { apiJson } from "@/lib/api/response";

export const dynamic = "force-dynamic";

/** GET /api/projects → { data: Project[], meta } — kontrak penuh (sama dengan mockAdapter). */
export async function GET() {
  const projects = await dbListProjects();
  return apiJson(projects, { source: "live", cache: "public, s-maxage=60, stale-while-revalidate=300" });
}
