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
  return apiJson(deleteView(id, scope), { source: "mock" });
}
