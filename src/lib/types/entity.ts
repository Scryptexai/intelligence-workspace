export type EntityType =
  | "Person"
  | "Company"
  | "Foundation"
  | "Protocol"
  | "Investor"
  | "Application"
  | "Security"
  | "DAO"
  | "Government";

export type EntityStatus = "Active" | "Dormant" | "Contested" | "Unknown";

export interface Entity {
  id: string;
  projectSlug: string;
  name: string;
  type: EntityType;
  status: EntityStatus;
  description: string;
  founded?: string;
  relatedKnowledge: string[];
  relatedEvents: string[];
  metadata?: Record<string, string>;
}

export type RelationshipType =
  | "founded"
  | "controls"
  | "governs"
  | "safeguards"
  | "invested"
  | "leads"
  | "audited"
  | "deployed-on"
  | "proposed"
  | "research"
  | "risk-assessed"
  | "partnered"
  | "competes";

export interface Relationship {
  id: string;
  source: string; // entity id
  target: string; // entity id
  type: RelationshipType;
}
