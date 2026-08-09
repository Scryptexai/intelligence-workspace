/**
 * Tipe bersama untuk Activity Ledger / Audit Trail (Phase 0 enterprise).
 *
 * Sumber kebenaran: tabel `audit_log` (Supabase), diisi otomatis oleh trigger
 * Postgres `cif_audit_row()` pada ~16 tabel inti. Aplikasi TIDAK pernah
 * menulis audit_log langsung — hanya membaca (server-only).
 */

export type ActivityAction = "INSERT" | "UPDATE" | "DELETE";

/** Satu entri ledger (satu baris audit_log). */
export interface ActivityEntry {
  /** id identity audit_log */
  id: number;
  /** Nama tabel asal, mis. "knowledge_items" */
  tableName: string;
  /** Primary key baris yang berubah, mis. "K-001" (null bila tidak ada) */
  rowId: string | null;
  action: ActivityAction;
  /** Snapshot sebelum perubahan (UPDATE/DELETE) */
  oldData: Record<string, unknown> | null;
  /** Snapshot sesudah perubahan (INSERT/UPDATE) */
  newData: Record<string, unknown> | null;
  /** Field yang berubah (dihitung trigger server / mapper, tidak pernah lempar) */
  changedFields: string[];
  /** Email/nama pelaku; "system" bila ditulis via service key / pipeline */
  actorLabel: string;
  /** UUID pelaku (sub JWT); "system" bila tidak ada JWT */
  actorId: string;
  /** Workspace tempat baris berada (kolom provenance) */
  workspaceId: string | null;
  /** Waktu kejadian (ISO 8601) */
  createdAt: string;
}

/** Filter query Activity Ledger (GET /api/activity). */
export interface ActivityFilters {
  table?: string;
  action?: ActivityAction | "";
  rowId?: string;
  limit?: number;
}

/** Whitelist tabel yang boleh difilter/dibaca — dipakai route /api/activity. */
export const ACTIVITY_TABLE_WHITELIST = [
  "behavior_profiles",
  "conflicts",
  "entities",
  "events",
  "evidence_items",
  "knowledge_items",
  "notes",
  "projects",
  "qa_dimensions",
  "qa_phases",
  "relationships",
  "saved_views",
  "users",
  "cif_patterns",
  "cif_backtests",
  "cif_decision_events",
] as const;

export type ActivityTableName = (typeof ACTIVITY_TABLE_WHITELIST)[number];

/** Label UI (Bahasa Indonesia, istilah teknis English) per tabel. */
export const ACTIVITY_TABLE_LABELS: Record<string, string> = {
  projects: "Projects",
  knowledge_items: "Knowledge Items",
  evidence_items: "Evidence Items",
  entities: "Entities",
  relationships: "Relationships",
  events: "Events",
  conflicts: "Conflicts",
  qa_dimensions: "QA Dimensions",
  qa_phases: "QA Phases",
  behavior_profiles: "Behavior Profiles",
  notes: "Notes",
  saved_views: "Saved Views",
  users: "Users",
  cif_patterns: "CIF Patterns",
  cif_backtests: "CIF Backtests",
  cif_decision_events: "CIF Decision Events",
};

/** Verba aksi untuk kalimat ledger ("menambahkan", "mengubah", "menghapus"). */
export const ACTIVITY_ACTION_LABEL: Record<ActivityAction, string> = {
  INSERT: "menambahkan",
  UPDATE: "mengubah",
  DELETE: "menghapus",
};
