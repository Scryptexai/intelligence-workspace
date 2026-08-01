export type EventType =
  | "Founding"
  | "Funding"
  | "Launch"
  | "Technology"
  | "Governance"
  | "Security"
  | "Legal"
  | "Integration"
  | "Token"
  | "Market";

export type EventImpact = "High" | "Medium" | "Low";

export interface TimelineEvent {
  id: string; // E-001
  projectSlug: string;
  name: string;
  date: string; // ISO
  type: EventType;
  participants: string[];
  description: string;
  result: string;
  source: string;
  url?: string;
  affectedKnowledge: string[];
  impact: EventImpact;
}
