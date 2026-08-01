export type ProjectStatus = "active" | "watch" | "archived";

export type QADimensionKey =
  | "research"
  | "consistency"
  | "evidence"
  | "coverage"
  | "conflict"
  | "knowledge";

export interface QADimension {
  key: QADimensionKey;
  label: string;
  score: number; // 0-100
  weight: number; // % of total
  description: string;
}

export type PhaseStatus = "Passed" | "In Progress" | "Blocked" | "Not Started";

export interface QAPhase {
  name: string;
  status: PhaseStatus;
  score: number;
  owner: string;
}

export interface QAReport {
  total: number;
  dimensions: QADimension[];
  phases: QAPhase[];
}

export interface BehaviorProfile {
  strategicObjectives: string[];
  decisionPatterns: string[];
  riskResponse: string[];
  tradeOffs: string[];
}

export interface Project {
  id: string;
  slug: string;
  name: string;
  symbol: string;
  tagline: string;
  description: string;
  color: string;
  accent: string;
  status: ProjectStatus;
  cifScore: number;
  confidence: number;
  knowledgeCount: number;
  conflictCount: number;
  coverage: number;
  entityCount: number;
  eventCount: number;
  lastUpdated: string;
  lastActivityHours: number;
  tags: string[];
  qa: QAReport;
  behavior: BehaviorProfile;
}
