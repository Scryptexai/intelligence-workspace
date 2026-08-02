import { supabaseRest, supabaseRestEnabled } from "@/db/supabaseService";
import { deleteView } from "../store";
import { apiJson } from "@/lib/api/response";

/** DELETE /api/views/[id]?scope=… → { data: SavedView[], meta } */
export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { searchParams } = new URL(req.url);
  const scope = searchParams.get("scope") ?? "";
  if (supabaseRestEnabled) {
    const views = await supabaseRest.deleteView(id, scope);
    return apiJson(views, { source: "supabase-rest" });
  }
  return apiJson(deleteView(id, scope), { source: "mock" });
}
