import { dbListProjects } from "@/db/dataService";
import { apiJson } from "@/lib/api/response";

export async function GET() {
  const projects = await dbListProjects();
  const data = projects.map((p) => ({
    id: p.id,
    slug: p.slug,
    name: p.name,
    symbol: p.symbol,
    tagline: p.tagline,
    status: p.status,
    cifScore: p.cifScore,
    confidence: p.confidence,
    knowledgeCount: p.knowledgeCount,
    conflictCount: p.conflictCount,
    coverage: p.coverage,
    entityCount: p.entityCount,
    eventCount: p.eventCount,
    lastUpdated: p.lastUpdated,
    lastActivityHours: p.lastActivityHours,
    color: p.color,
    accent: p.accent,
  }));
  return apiJson(data, { source: "live", cache: "public, s-maxage=60, stale-while-revalidate=300" });
}
