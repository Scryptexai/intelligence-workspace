export type ConflictSeverity = "Critical" | "High" | "Medium" | "Low";
export type ConflictStatus = "Resolved" | "Unresolved";
export type ConflictCategory =
  | "Governance"
  | "Tokenomics"
  | "Security"
  | "Roadmap"
  | "Compliance"
  | "Data";

export interface ConflictVersion {
  source: string;
  value: string;
  date: string;
  url: string;
  evidence: string;
}

export interface Conflict {
  id: string; // C-001
  projectSlug: string;
  category: ConflictCategory;
  title: string;
  description: string;
  severity: ConflictSeverity;
  status: ConflictStatus;
  versionA: ConflictVersion;
  versionB: ConflictVersion;
  resolution?: string;
  affectedKnowledge: string[];
  affectedPhase: string;
  updatedAt: string;
}
