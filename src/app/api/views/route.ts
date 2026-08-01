/**
 * Mock saved-views API — in-memory server store (shared module).
 * Backend sungguhan: tabel views (user_id, scope, name, filters jsonb).
 * Kontrak: GET ?scope= → { data: SavedView[], meta } · POST { id, name, scope, filters } → { data, meta }
 */

import { listViews, upsertView } from "./store";
import { apiJson, apiError } from "@/lib/api/response";
import type { SavedView } from "@/lib/types/view";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const scope = searchParams.get("scope") ?? "";
  return apiJson(listViews(scope), { source: "mock" });
}

export async function POST(req: Request) {
  const view = (await req.json()) as SavedView;
  if (!view.id || !view.name || !view.scope) {
    return apiError("id, name, scope required", 400);
  }
  return apiJson(upsertView(view), { source: "mock" });
}
