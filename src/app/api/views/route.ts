/**
 * Saved-views API — persisten via Supabase (tabel `saved_views`) saat REST
 * aktif, fallback in-memory server jika tidak.
 * Kontrak: GET ?scope= → { data: SavedView[], meta } · POST { id, name, scope, filters } → { data, meta }
 */

import { supabaseRest, supabaseRestEnabled } from "@/db/supabaseService";
import { listViews, upsertView } from "./store";
import { apiJson, apiError } from "@/lib/api/response";
import type { SavedView } from "@/lib/types/view";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const scope = searchParams.get("scope") ?? "";
  if (supabaseRestEnabled) {
    const views = await supabaseRest.listViews(scope);
    return apiJson(views, { source: "supabase-rest" });
  }
  return apiJson(listViews(scope), { source: "mock" });
}

export async function POST(req: Request) {
  const view = (await req.json()) as SavedView;
  if (!view.id || !view.name || !view.scope) {
    return apiError("id, name, scope required", 400);
  }
  if (supabaseRestEnabled) {
    const views = await supabaseRest.upsertView(view);
    return apiJson(views, { source: "supabase-rest" });
  }
  return apiJson(upsertView(view), { source: "mock" });
}
