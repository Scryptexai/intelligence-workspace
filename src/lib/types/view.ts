/** Kontrak Saved View — dipakai bersama UI, repository, mock adapter, API routes. */
export interface SavedView {
  id: string;
  name: string;
  scope: string;
  filters: Record<string, string>;
}
