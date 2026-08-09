/**
 * Tipe untuk Data Lineage & Impact Analysis (Fase 1 enterprise).
 *
 * Lineage menjawab: "data ini berasal dari mana?" (provenance) dan
 * "kalau saya ubah data ini, apa yang terpengaruh?" (impact analysis).
 * Sumber data: kolom provenance (workspace_id/source/source_url/connector/
 * ingested_at) + relasi antar tabel (related_knowledge, dependencies,
 * affected_knowledge, evidence_items) — dibaca dari Supabase riil.
 */

/** Asal-usul satu data point (kolom provenance, nullable — fallback di UI). */
export interface DataProvenance {
  /** Nama sumber, mis. "DefiLlama" / "CIF Research Dossier" */
  source: string;
  /** URL sumber asli */
  sourceUrl: string;
  /** Connector pipeline yang mengimpor, mis. "defillama-api" */
  connector: string;
  /** Kapan diimpor (ISO 8601) */
  ingestedAt: string;
  /** Apakah minimal satu kolom provenance terisi (untuk fallback UI) */
  hasProvenance: boolean;
}

/** Jenis node pada graf lineage / referensi impact. */
export type LineageKind = "knowledge" | "event" | "conflict" | "evidence";

/** Referensi ringkas ke satu baris yang terhubung (untuk link + label). */
export interface LineageRef {
  id: string;
  name: string;
  href: string;
  kind: LineageKind;
  /** info tambahan opsional: status/severity/date/dll. */
  meta?: string;
}

/** Hasil impact analysis untuk satu knowledge item. */
export interface KnowledgeImpact {
  knowledgeId: string;
  projectSlug: string;
  /** Knowledge lain yang mereferensikan item ini (related_knowledge / dependencies). */
  referencedBy: LineageRef[];
  /** Event yang menyebut item ini di affected_knowledge. */
  eventsTouching: LineageRef[];
  /** Conflict yang menyentuh item ini (affected_knowledge). */
  conflictsTouching: LineageRef[];
  /** Event yang menjadi dependensi item ini (dependencies). */
  dependencyEvents: LineageRef[];
  /** Jumlah evidence item yang menautkan ke knowledge ini. */
  evidenceCount: number;
  /** Waktu penghitungan (ISO). */
  generatedAt: string;
}

/** Provenance kosong (fallback saat kolom belum ada / null). */
export const EMPTY_PROVENANCE: DataProvenance = {
  source: "",
  sourceUrl: "",
  connector: "",
  ingestedAt: "",
  hasProvenance: false,
};

/**
 * Cocokkan referensi id parsial dengan id penuh — data produksi sering
 * memakai referensi pendek ("K-002", "EV-013") sementara id baris penuh
 * ("arbitrum-K-002", "arbitrum-EV-013"). Tidak pernah melempar.
 */
export function idMatches(ref: string, fullId: string): boolean {
  if (!ref || !fullId) return false;
  if (ref === fullId) return true;
  return fullId.endsWith(ref);
}
