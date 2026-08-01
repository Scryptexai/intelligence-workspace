import type { Entity, Relationship, RelationshipType } from "@/lib/types/entity";

/* ------------------------------------------------------------------ */
/* Data model untuk node & edge React Flow                             */
/* ------------------------------------------------------------------ */

export interface GraphNodeData extends Record<string, unknown> {
  entity: Entity;
  degree: number;
  faded?: boolean;
  focused?: boolean;
}

export type EdgeCategory =
  | "funding"
  | "governance"
  | "integration"
  | "research"
  | "audit"
  | "competes";

export interface GraphEdgeData {
  relType: RelationshipType;
  label: string;
  category: EdgeCategory;
  color: string;
  animated: boolean;
  hovered?: boolean;
  faded?: boolean;
}

/* ------------------------------------------------------------------ */
/* Kategorisasi hubungan → warna (Funding=Blue, Governance=Purple,     */
/* Integration=Teal)                                                   */
/* ------------------------------------------------------------------ */

export const CATEGORY_COLOR: Record<EdgeCategory, string> = {
  funding: "#3b82f6", // biru
  governance: "#8b5cf6", // ungu
  integration: "#14b8a6", // teal
  research: "#f59e0b", // amber
  audit: "#f43f5e", // rose
  competes: "#94a3b8", // slate
};

const REL_CATEGORY: Record<RelationshipType, EdgeCategory> = {
  invested: "funding",
  founded: "integration",
  controls: "governance",
  governs: "governance",
  safeguards: "governance",
  leads: "governance",
  proposed: "governance",
  "deployed-on": "integration",
  partnered: "integration",
  research: "research",
  audited: "audit",
  "risk-assessed": "audit",
  competes: "competes",
};

/** Edge yang menampilkan "aliran" (dana/data) → animasi dash bergerak */
const ANIMATED_FLOW: RelationshipType[] = [
  "invested",
  "founded",
  "deployed-on",
  "proposed",
  "partnered",
];

export function relationshipCategory(t: RelationshipType): EdgeCategory {
  return REL_CATEGORY[t] ?? "competes";
}

export function isAnimatedFlow(t: RelationshipType): boolean {
  return ANIMATED_FLOW.includes(t);
}

export function buildEdgeData(r: Relationship): GraphEdgeData {
  const category = relationshipCategory(r.type);
  return {
    relType: r.type,
    label: r.type.replace(/-/g, " "),
    category,
    color: CATEGORY_COLOR[category],
    animated: isAnimatedFlow(r.type),
  };
}

export function buildNodeData(entity: Entity, degree: number): GraphNodeData {
  return { entity, degree };
}

export function degreeOf(relationships: Relationship[], entityId: string): number {
  return relationships.filter(
    (r) => r.source === entityId || r.target === entityId
  ).length;
}

/* ------------------------------------------------------------------ */
/* Layout: radial                                                      */
/* ------------------------------------------------------------------ */

export function layoutRadial(
  entities: Entity[]
): Record<string, { x: number; y: number }> {
  const n = Math.max(entities.length, 1);
  const r = Math.max(230, n * 46);
  return Object.fromEntries(
    entities.map((e, i) => {
      const angle = (i / n) * 2 * Math.PI - Math.PI / 2;
      return [e.id, { x: 430 + r * Math.cos(angle), y: 330 + r * Math.sin(angle) }];
    })
  );
}
