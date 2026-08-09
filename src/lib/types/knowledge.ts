export type KnowledgeStatus = "Stable" | "Emerging" | "Volatile" | "Deprecated";

export interface Evidence {
  id: string;
  eventId: string;
  eventName: string;
  date: string; // ISO
  source: string;
  url: string;
  weight: number; // 1-5
  note?: string;
}

export interface KnowledgeItem {
  id: string; // K-001
  projectSlug: string;
  name: string;
  category: string;
  description: string;
  confidence: number; // 0-100
  status: KnowledgeStatus;
  updatedAt: string;
  author: string;
  evidence: Evidence[];
  relatedKnowledge: string[];
  dependencies: string[]; // event ids
  /** Provenance (asal-usul data) — opsional, terisi bila kolom tersedia. */
  provenance?: import("./lineage").DataProvenance;
}
