/**
 * Shared in-memory store untuk saved views (mock backend).
 * Backend sungguhan: tabel PostgreSQL `views` (user_id, scope, name, filters).
 */
import type { SavedView } from "@/lib/types/view";

const store = new Map<string, SavedView>();

export function listViews(scope: string): SavedView[] {
  return [...store.values()].filter((v) => v.scope === scope);
}

export function upsertView(view: SavedView): SavedView[] {
  store.set(view.id, view);
  return listViews(view.scope);
}

export function deleteView(id: string, scope: string): SavedView[] {
  store.delete(id);
  return listViews(scope);
}
