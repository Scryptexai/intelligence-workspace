/**
 * ─────────────────────────────────────────────────────────────────────────────
 * Intelligence Workspace — Database Schema (Drizzle ORM / PostgreSQL)
 * ─────────────────────────────────────────────────────────────────────────────
 * Skema ini siap di-merge ke Supabase:
 *
 *   npx drizzle-kit push                # terapkan langsung (lokal / Supabase)
 *   npx drizzle-kit generate            # hasilkan SQL migration di /drizzle
 *
 * Semua tabel berkontrak 1:1 dengan tipe frontend di src/lib/types/*.
 * Kolom kompleks (array/objek) memakai JSONB agar fleksibel.
 */

import {
  pgTable,
  text,
  integer,
  doublePrecision,
  boolean,
  timestamp,
  jsonb,
  date,
  uniqueIndex,
  index,
} from "drizzle-orm/pg-core";

/* ------------------------------------------------------------------ */
/* 1. PROJECTS                                                         */
/* ------------------------------------------------------------------ */

export const projects = pgTable(
  "projects",
  {
    id: text("id").primaryKey(), // "arbitrum"
    slug: text("slug").notNull().unique(),
    name: text("name").notNull(),
    symbol: text("symbol").notNull(),
    tagline: text("tagline"),
    description: text("description"),
    color: text("color"),
    accent: text("accent"),
    status: text("status").default("active"),
    cifScore: doublePrecision("cif_score").notNull().default(0),
    confidence: integer("confidence").notNull().default(0),
    knowledgeCount: integer("knowledge_count").notNull().default(0),
    conflictCount: integer("conflict_count").notNull().default(0),
    coverage: integer("coverage").notNull().default(0),
    entityCount: integer("entity_count").notNull().default(0),
    eventCount: integer("event_count").notNull().default(0),
    lastUpdated: date("last_updated"),
    lastActivityHours: integer("last_activity_hours").notNull().default(0),
    tags: jsonb("tags").$type<string[]>().default([]),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
  },
  (t) => [uniqueIndex("projects_slug_idx").on(t.slug)]
);

/* ------------------------------------------------------------------ */
/* 2. KNOWLEDGE ITEMS                                                  */
/* ------------------------------------------------------------------ */

export const knowledgeItems = pgTable(
  "knowledge_items",
  {
    id: text("id").primaryKey(), // "K-001"
    projectSlug: text("project_slug")
      .notNull()
      .references(() => projects.slug, { onDelete: "cascade" }),
    name: text("name").notNull(),
    category: text("category"),
    description: text("description"),
    confidence: integer("confidence").notNull().default(0),
    status: text("status").default("Stable"), // Stable|Emerging|Volatile|Deprecated
    updatedAt: text("updated_at"),
    author: text("author"),
    relatedKnowledge: jsonb("related_knowledge").$type<string[]>().default([]),
    dependencies: jsonb("dependencies").$type<string[]>().default([]),
  },
  (t) => [
    index("knowledge_project_idx").on(t.projectSlug),
    index("knowledge_status_idx").on(t.status),
  ]
);

/* ------------------------------------------------------------------ */
/* 3. EVIDENCE ITEMS (Git-blame trace)                                 */
/* ------------------------------------------------------------------ */

export const evidenceItems = pgTable(
  "evidence_items",
  {
    id: text("id").primaryKey(), // "ev-001-1"
    knowledgeId: text("knowledge_id")
      .notNull()
      .references(() => knowledgeItems.id, { onDelete: "cascade" }),
    eventId: text("event_id"),
    eventName: text("event_name").notNull(),
    date: text("date"),
    source: text("source"),
    url: text("url"),
    weight: integer("weight").notNull().default(1), // 1-5
    note: text("note"),
    sortOrder: integer("sort_order").notNull().default(0),
  },
  (t) => [index("evidence_knowledge_idx").on(t.knowledgeId)]
);

/* ------------------------------------------------------------------ */
/* 4. ENTITIES                                                         */
/* ------------------------------------------------------------------ */

export const entities = pgTable(
  "entities",
  {
    id: text("id").primaryKey(), // "offchain-labs"
    projectSlug: text("project_slug")
      .notNull()
      .references(() => projects.slug, { onDelete: "cascade" }),
    name: text("name").notNull(),
    type: text("type").notNull(), // Person|Company|Foundation|Protocol|Investor|Application|Security|DAO|Government
    status: text("status").default("Active"),
    description: text("description"),
    founded: text("founded"),
    relatedKnowledge: jsonb("related_knowledge").$type<string[]>().default([]),
    relatedEvents: jsonb("related_events").$type<string[]>().default([]),
    metadata: jsonb("metadata").$type<Record<string, string>>().default({}),
  },
  (t) => [
    index("entities_project_idx").on(t.projectSlug),
    index("entities_type_idx").on(t.type),
  ]
);

/* ------------------------------------------------------------------ */
/* 5. RELATIONSHIPS (graph edges)                                      */
/* ------------------------------------------------------------------ */

export const relationships = pgTable(
  "relationships",
  {
    id: text("id").primaryKey(), // "R-001"
    projectSlug: text("project_slug")
      .notNull()
      .references(() => projects.slug, { onDelete: "cascade" }),
    source: text("source")
      .notNull()
      .references(() => entities.id, { onDelete: "cascade" }),
    target: text("target")
      .notNull()
      .references(() => entities.id, { onDelete: "cascade" }),
    type: text("type").notNull(), // founded|controls|governs|...
  },
  (t) => [
    index("rel_project_idx").on(t.projectSlug),
    index("rel_source_idx").on(t.source),
    index("rel_target_idx").on(t.target),
  ]
);

/* ------------------------------------------------------------------ */
/* 6. EVENTS (timeline)                                                */
/* ------------------------------------------------------------------ */

export const events = pgTable(
  "events",
  {
    id: text("id").primaryKey(), // "E-001"
    projectSlug: text("project_slug")
      .notNull()
      .references(() => projects.slug, { onDelete: "cascade" }),
    name: text("name").notNull(),
    date: text("date"),
    type: text("type").notNull(), // Founding|Funding|Launch|...
    participants: jsonb("participants").$type<string[]>().default([]),
    description: text("description"),
    result: text("result"),
    source: text("source"),
    url: text("url"),
    affectedKnowledge: jsonb("affected_knowledge").$type<string[]>().default([]),
    impact: text("impact").default("Medium"),
  },
  (t) => [
    index("events_project_idx").on(t.projectSlug),
    index("events_type_idx").on(t.type),
    index("events_date_idx").on(t.date),
  ]
);

/* ------------------------------------------------------------------ */
/* 7. CONFLICTS                                                        */
/* ------------------------------------------------------------------ */

export const conflicts = pgTable(
  "conflicts",
  {
    id: text("id").primaryKey(), // "C-001"
    projectSlug: text("project_slug")
      .notNull()
      .references(() => projects.slug, { onDelete: "cascade" }),
    category: text("category"),
    title: text("title").notNull(),
    description: text("description"),
    severity: text("severity").default("Medium"), // Critical|High|Medium|Low
    status: text("status").default("Unresolved"),
    versionA: jsonb("version_a")
      .$type<{ source: string; value: string; date: string; url: string; evidence: string }>()
      .notNull(),
    versionB: jsonb("version_b")
      .$type<{ source: string; value: string; date: string; url: string; evidence: string }>()
      .notNull(),
    resolution: text("resolution"),
    affectedKnowledge: jsonb("affected_knowledge").$type<string[]>().default([]),
    affectedPhase: text("affected_phase"),
    updatedAt: text("updated_at"),
  },
  (t) => [
    index("conflicts_project_idx").on(t.projectSlug),
    index("conflicts_severity_idx").on(t.severity),
    index("conflicts_status_idx").on(t.status),
  ]
);

/* ------------------------------------------------------------------ */
/* 8. QA DIMENSIONS (radar)                                            */
/* ------------------------------------------------------------------ */

export const qaDimensions = pgTable(
  "qa_dimensions",
  {
    id: text("id").primaryKey(), // "arbitrum-research"
    projectSlug: text("project_slug")
      .notNull()
      .references(() => projects.slug, { onDelete: "cascade" }),
    key: text("key").notNull(), // research|consistency|evidence|coverage|conflict|knowledge
    label: text("label").notNull(),
    score: doublePrecision("score").notNull().default(0),
    weight: doublePrecision("weight").notNull().default(0),
    description: text("description"),
    sortOrder: integer("sort_order").notNull().default(0),
  },
  (t) => [index("qa_project_idx").on(t.projectSlug)]
);

/* ------------------------------------------------------------------ */
/* 9. QA PHASES                                                        */
/* ------------------------------------------------------------------ */

export const qaPhases = pgTable(
  "qa_phases",
  {
    id: text("id").primaryKey(), // "arbitrum-phase-1"
    projectSlug: text("project_slug")
      .notNull()
      .references(() => projects.slug, { onDelete: "cascade" }),
    name: text("name").notNull(),
    status: text("status").default("Not Started"),
    score: doublePrecision("score").notNull().default(0),
    owner: text("owner"),
    sortOrder: integer("sort_order").notNull().default(0),
  },
  (t) => [index("qa_phases_project_idx").on(t.projectSlug)]
);

/* ------------------------------------------------------------------ */
/* 10. BEHAVIOR PROFILES                                               */
/* ------------------------------------------------------------------ */

export const behaviorProfiles = pgTable(
  "behavior_profiles",
  {
    projectSlug: text("project_slug")
      .primaryKey()
      .references(() => projects.slug, { onDelete: "cascade" }),
    strategicObjectives: jsonb("strategic_objectives").$type<string[]>().default([]),
    decisionPatterns: jsonb("decision_patterns").$type<string[]>().default([]),
    riskResponse: jsonb("risk_response").$type<string[]>().default([]),
    tradeOffs: jsonb("trade_offs").$type<string[]>().default([]),
  }
);

/* ------------------------------------------------------------------ */
/* 11. NOTES (private, per scope+ref)                                  */
/* ------------------------------------------------------------------ */

export const notes = pgTable(
  "notes",
  {
    id: text("id").primaryKey(), // "knowledge:K-001" | "conflicts:C-002"
    scope: text("scope").notNull(),
    refId: text("ref_id").notNull(),
    text: text("text").notNull(),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
  },
  (t) => [index("notes_scope_ref_idx").on(t.scope, t.refId)]
);

/* ------------------------------------------------------------------ */
/* 12. SAVED VIEWS                                                     */
/* ------------------------------------------------------------------ */

export const savedViews = pgTable(
  "saved_views",
  {
    id: text("id").primaryKey(), // "v-1700000000000"
    name: text("name").notNull(),
    scope: text("scope").notNull(),
    filters: jsonb("filters").$type<Record<string, string>>().default({}),
    createdAt: timestamp("created_at").defaultNow(),
  },
  (t) => [index("views_scope_idx").on(t.scope)]
);

/* ------------------------------------------------------------------ */
/* 13. USERS (opsional — auth masa depan)                              */
/* ------------------------------------------------------------------ */

export const users = pgTable(
  "users",
  {
    id: text("id").primaryKey(),
    email: text("email").notNull().unique(),
    name: text("name"),
    avatarUrl: text("avatar_url"),
    role: text("role").default("analyst"),
    createdAt: timestamp("created_at").defaultNow(),
  },
  (t) => [uniqueIndex("users_email_idx").on(t.email)]
);

/* ------------------------------------------------------------------ */
/* Tipe ekspor (supaya impor dari aplikasi lebih mudah)                */
/* ------------------------------------------------------------------ */

export type ProjectRow = typeof projects.$inferSelect;
export type KnowledgeRow = typeof knowledgeItems.$inferSelect;
export type EvidenceRow = typeof evidenceItems.$inferSelect;
export type EntityRow = typeof entities.$inferSelect;
export type RelationshipRow = typeof relationships.$inferSelect;
export type EventRow = typeof events.$inferSelect;
export type ConflictRow = typeof conflicts.$inferSelect;
export type QaDimensionRow = typeof qaDimensions.$inferSelect;
export type QaPhaseRow = typeof qaPhases.$inferSelect;
export type BehaviorRow = typeof behaviorProfiles.$inferSelect;
export type NoteRow = typeof notes.$inferSelect;
export type SavedViewRow = typeof savedViews.$inferSelect;
export type UserRow = typeof users.$inferSelect;
