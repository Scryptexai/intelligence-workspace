import type { EntityType, RelationshipType } from "@/lib/types/entity";
import type { EventType } from "@/lib/types/event";

export const EVENT_COLORS: Record<EventType, string> = {
  Founding: "#a78bfa",
  Funding: "#34d399",
  Launch: "#22d3ee",
  Technology: "#38bdf8",
  Governance: "#fbbf24",
  Security: "#fb7185",
  Legal: "#f472b6",
  Integration: "#f97316",
  Token: "#4ade80",
  Market: "#94a3b8",
};

export const EVENT_TYPES = Object.keys(EVENT_COLORS) as EventType[];

export const ENTITY_COLORS: Record<EntityType, string> = {
  Person: "#a78bfa",
  Company: "#38bdf8",
  Foundation: "#fbbf24",
  Protocol: "#22d3ee",
  Investor: "#34d399",
  Application: "#f472b6",
  Security: "#fb7185",
  DAO: "#f97316",
  Government: "#94a3b8",
};

export const ENTITY_TYPES = Object.keys(ENTITY_COLORS) as EntityType[];

/* ------------------------------------------------------------------ */
/* Relationship (graph edge) styling                                   */
/* ------------------------------------------------------------------ */

export const RELATIONSHIP_COLORS: Record<RelationshipType, string> = {
  founded: "#fbbf24", // amber
  controls: "#fb7185", // rose
  governs: "#a78bfa", // violet
  safeguards: "#f43f5e", // red
  invested: "#34d399", // emerald
  leads: "#22d3ee", // cyan
  audited: "#fb923c", // orange
  "deployed-on": "#38bdf8", // sky
  proposed: "#e879f9", // fuchsia
  research: "#2dd4bf", // teal
  "risk-assessed": "#facc15", // yellow
  partnered: "#60a5fa", // blue
  competes: "#94a3b8", // slate
};

export const RELATIONSHIP_LABELS: Record<RelationshipType, string> = {
  founded: "founded",
  controls: "controls",
  governs: "governs",
  safeguards: "safeguards",
  invested: "invested in",
  leads: "led by",
  audited: "audited",
  "deployed-on": "deployed on",
  proposed: "proposed",
  research: "research on",
  "risk-assessed": "risk-assessed",
  partnered: "partnered with",
  competes: "competes with",
};

export const RELATIONSHIP_TYPES = Object.keys(RELATIONSHIP_COLORS) as RelationshipType[];
