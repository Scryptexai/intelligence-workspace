import {
  dbGetProject,
  dbListKnowledge,
  dbListEntities,
  dbListEvents,
  dbListConflicts,
  dbListRelationships,
} from "@/db/dataService";
import { apiJson, apiError } from "@/lib/api/response";

/**
 * Research data (knowledge, entities, events, conflicts) disajikan sebagai
 * layer API terpusat per slug — dibaca dari DB (Supabase/Postgres) saat
 * tersedia, fallback ke mock. Respons dibungkus envelope { data, meta }.
 */
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const project = await dbGetProject(slug);
  if (!project) return apiError("project not found", 404);

  const [knowledge, entities, events, conflicts, relationships] = await Promise.all([
    dbListKnowledge(slug),
    dbListEntities(slug),
    dbListEvents(slug),
    dbListConflicts(slug),
    dbListRelationships(slug),
  ]);

  return apiJson(
    {
      project,
      knowledge,
      entities,
      events,
      conflicts,
      relationships,
    },
    { source: "live", cache: "public, s-maxage=60, stale-while-revalidate=300" }
  );
}
