/**
 * ─────────────────────────────────────────────────────────────────────────────
 * SERVER DATA SERVICE
 * ─────────────────────────────────────────────────────────────────────────────
 * Satu pintu baca data di sisi server (dipakai API routes).
 *
 *  - Jika DATABASE_URL tersedia (Supabase/Postgres) → baca dari DATABASE.
 *  - Jika tidak / query gagal → fallback otomatis ke lib/data (mock).
 *
 * UI tidak pernah berubah: mode mock & backend memakai kontrak identik.
 */
import { and, asc, desc, eq, like, or, sql } from "drizzle-orm";
import { db, isDbConfigured } from "./index";
import {
  projects as projectsTable,
  knowledgeItems,
  evidenceItems,
  entities as entitiesTable,
  relationships as relationshipsTable,
  events as eventsTable,
  conflicts as conflictsTable,
  qaDimensions,
  qaPhases,
  behaviorProfiles,
  auditLog as auditLogTable,
  workspaces as workspacesTable,
  workspaceMembers as workspaceMembersTable,
} from "./schema";
import {
  getProjects as getMockProjects,
  getProjectBySlug as getMockProject,
  getKnowledge as getMockKnowledge,
  getKnowledgeItem as getMockKnowledgeItem,
  getEntities as getMockEntities,
  getEntity as getMockEntity,
  getEvents as getMockEvents,
  getConflicts as getMockConflicts,
  getConflict as getMockConflict,
  getRelationships as getMockRelationships,
  buildSearchIndex,
  qaReports,
  behaviorProfiles as behaviorMock,
} from "@/lib/data";
import type { Project, QAReport, BehaviorProfile } from "@/lib/types/project";
import type { KnowledgeItem } from "@/lib/types/knowledge";
import type { Entity, Relationship } from "@/lib/types/entity";
import type { TimelineEvent } from "@/lib/types/event";
import type { Conflict } from "@/lib/types/conflict";
import type { SearchResult } from "@/lib/data";
import type { ListParams } from "@/lib/api/types";
import type { ActivityAction, ActivityEntry, ActivityFilters } from "@/lib/types/activity";
import type { KnowledgeImpact, LineageRef } from "@/lib/types/lineage";
import { idMatches } from "@/lib/types/lineage";
import type { MemberRole, Workspace, WorkspaceMember } from "@/lib/types/workspace";
import { MEMBER_ROLES } from "@/lib/types/workspace";
import { supabaseRest, supabaseRestEnabled, changedFieldsBetween } from "./supabaseService";
import {
  asConflictVersion,
  asJsonObject,
  asStringArray,
  asStringRecord,
  asText,
  buildProvenance,
} from "./coerce";

const ACTIVITY_ACTIONS: ActivityAction[] = ["INSERT", "UPDATE", "DELETE"];

/** Baris audit_log via pg (camelCase) → ActivityEntry. Tidak pernah melempar. */
function pgRowToActivity(row: typeof auditLogTable.$inferSelect): ActivityEntry {
  const oldData = asJsonObject(row.oldData);
  const newData = asJsonObject(row.newData);
  return {
    id: Number(row.id),
    tableName: asText(row.tableName, "unknown"),
    rowId: row.rowId ?? null,
    action: ACTIVITY_ACTIONS.includes(row.action as ActivityAction)
      ? (row.action as ActivityAction)
      : "UPDATE",
    oldData,
    newData,
    changedFields:
      Array.isArray(row.changedFields) && row.changedFields.length > 0
        ? row.changedFields
        : changedFieldsBetween(oldData, newData),
    actorLabel: asText(row.actorLabel, "system") || "system",
    actorId: asText(row.actorId, "system") || "system",
    workspaceId: row.workspaceId ?? null,
    createdAt: row.createdAt ? new Date(row.createdAt).toISOString() : "",
  };
}

const DB = isDbConfigured();
/** Prioritas sumber: Supabase REST (cif_datasets) → pg pool → mock. */
const REST = supabaseRestEnabled;

/* ══════════════════════════════════════════════════════════════════ */
/* Mapper: DB row (snake_case) → tipe aplikasi (camelCase)            */
/* ══════════════════════════════════════════════════════════════════ */

async function assembleProject(slug: string): Promise<Project | undefined> {
  if (!db) return getMockProject(slug);
  const row = await db.select().from(projectsTable).where(eq(projectsTable.slug, slug)).limit(1);
  const p = row[0];
  if (!p) return undefined;

  const [dims, phases, behavior, qaMock] = await Promise.all([
    db
      .select()
      .from(qaDimensions)
      .where(eq(qaDimensions.projectSlug, slug))
      .orderBy(asc(qaDimensions.sortOrder)),
    db
      .select()
      .from(qaPhases)
      .where(eq(qaPhases.projectSlug, slug))
      .orderBy(asc(qaPhases.sortOrder)),
    db
      .select()
      .from(behaviorProfiles)
      .where(eq(behaviorProfiles.projectSlug, slug))
      .limit(1),
    Promise.resolve(qaReports[slug]),
  ]);

  const qa: QAReport =
    dims.length > 0
      ? {
          total: p.cifScore,
          dimensions: dims.map((d) => ({
            key: d.key as QAReport["dimensions"][number]["key"],
            label: d.label,
            score: d.score,
            weight: d.weight,
            description: d.description ?? "",
          })),
          phases: phases.map((ph) => ({
            name: ph.name,
            status: ph.status as QAReport["phases"][number]["status"],
            score: ph.score,
            owner: ph.owner ?? "",
          })),
        }
      : (qaMock ?? { total: p.cifScore, dimensions: [], phases: [] });

  const beh: BehaviorProfile | undefined = behavior[0]
    ? {
        strategicObjectives: asStringArray(behavior[0].strategicObjectives),
        decisionPatterns: asStringArray(behavior[0].decisionPatterns),
        riskResponse: asStringArray(behavior[0].riskResponse),
        tradeOffs: asStringArray(behavior[0].tradeOffs),
      }
    : behaviorMock[slug];

  return {
    id: p.id,
    slug: p.slug,
    name: p.name,
    symbol: p.symbol,
    tagline: p.tagline ?? "",
    description: p.description ?? "",
    color: p.color ?? "#22d3ee",
    accent: p.accent ?? "#0e7490",
    status: (p.status as Project["status"]) ?? "active",
    cifScore: p.cifScore,
    confidence: p.confidence,
    knowledgeCount: p.knowledgeCount,
    conflictCount: p.conflictCount,
    coverage: p.coverage,
    entityCount: p.entityCount,
    eventCount: p.eventCount,
    lastUpdated: p.lastUpdated ?? "",
    lastActivityHours: p.lastActivityHours,
    tags: asStringArray(p.tags),
    qa,
    behavior: beh ?? { strategicObjectives: [], decisionPatterns: [], riskResponse: [], tradeOffs: [] },
  };
}

/* ══════════════════════════════════════════════════════════════════ */
/* Projects                                                           */
/* ══════════════════════════════════════════════════════════════════ */

export async function dbListProjects(): Promise<Project[]> {
  if (REST) {
    try {
      return await supabaseRest.listProjects();
    } catch {
      /* lanjut ke pg/mock */
    }
  }
  if (!db) return getMockProjects();
  try {
    const rows = await db.select().from(projectsTable).orderBy(asc(projectsTable.createdAt));
    return rows.map((p) => ({
      id: p.id,
      slug: p.slug,
      name: p.name,
      symbol: p.symbol,
      tagline: p.tagline ?? "",
      description: p.description ?? "",
      color: p.color ?? "#22d3ee",
      accent: p.accent ?? "#0e7490",
      status: (p.status as Project["status"]) ?? "active",
      cifScore: p.cifScore,
      confidence: p.confidence,
      knowledgeCount: p.knowledgeCount,
      conflictCount: p.conflictCount,
      coverage: p.coverage,
      entityCount: p.entityCount,
      eventCount: p.eventCount,
      lastUpdated: p.lastUpdated ?? "",
      lastActivityHours: p.lastActivityHours,
      tags: asStringArray(p.tags),
      qa: qaReports[p.slug] ?? { total: p.cifScore, dimensions: [], phases: [] },
      behavior: behaviorMock[p.slug] ?? {
        strategicObjectives: [],
        decisionPatterns: [],
        riskResponse: [],
        tradeOffs: [],
      },
    }));
  } catch {
    return getMockProjects();
  }
}

export async function dbGetProject(slug: string): Promise<Project | undefined> {
  if (REST) {
    try {
      const p = await supabaseRest.getProject(slug);
      if (p) return p;
    } catch {
      /* lanjut */
    }
  }
  try {
    return await assembleProject(slug);
  } catch {
    return getMockProject(slug);
  }
}

/* ══════════════════════════════════════════════════════════════════ */
/* Knowledge                                                          */
/* ══════════════════════════════════════════════════════════════════ */

export async function dbListKnowledge(slug: string, params?: ListParams): Promise<KnowledgeItem[]> {
  if (REST) {
    try {
      let items = await supabaseRest.listKnowledge(slug);
      if (params?.status) items = items.filter((k) => k.status === params.status);
      if (params?.q) {
        const q = params.q.toLowerCase();
        items = items.filter((k) => k.name.toLowerCase().includes(q) || k.id.toLowerCase().includes(q));
      }
      return items;
    } catch {
      /* lanjut */
    }
  }
  if (!db) {
    let items = getMockKnowledge(slug);
    if (params?.status) items = items.filter((k) => k.status === params.status);
    if (params?.q) {
      const q = params.q.toLowerCase();
      items = items.filter((k) => k.name.toLowerCase().includes(q) || k.id.toLowerCase().includes(q));
    }
    return items;
  }
  try {
    const conds = [eq(knowledgeItems.projectSlug, slug)];
    if (params?.status) conds.push(eq(knowledgeItems.status, params.status));
    if (params?.q) {
      const q = `%${params.q.toLowerCase()}%`;
      conds.push(
        or(
          like(sql`lower(${knowledgeItems.name})`, q),
          like(sql`lower(${knowledgeItems.id})`, q)
        )!
      );
    }
    const rows = await db.select().from(knowledgeItems).where(and(...conds));
    const out: KnowledgeItem[] = [];
    for (const row of rows) {
      out.push(await rowToKnowledge(row));
    }
    return out;
  } catch {
    return getMockKnowledge(slug);
  }
}

async function rowToKnowledge(row: (typeof knowledgeItems.$inferSelect)): Promise<KnowledgeItem> {
  const evs = db
    ? await db
        .select()
        .from(evidenceItems)
        .where(eq(evidenceItems.knowledgeId, row.id))
        .orderBy(asc(evidenceItems.sortOrder))
    : [];
  return {
    id: row.id,
    projectSlug: row.projectSlug,
    name: row.name,
    category: row.category ?? "",
    description: row.description ?? "",
    confidence: row.confidence,
    status: (row.status as KnowledgeItem["status"]) ?? "Stable",
    updatedAt: row.updatedAt ?? "",
    author: row.author ?? "",
    evidence: evs.map((e) => ({
      id: e.id,
      eventId: e.eventId ?? "",
      eventName: e.eventName,
      date: e.date ?? "",
      source: e.source ?? "",
      url: e.url ?? "#",
      weight: e.weight,
      note: e.note ?? undefined,
    })),
    relatedKnowledge: asStringArray(row.relatedKnowledge),
    dependencies: asStringArray(row.dependencies),
  };
}

export async function dbGetKnowledgeItem(
  slug: string,
  id: string
): Promise<KnowledgeItem | undefined> {
  if (REST) {
    try {
      const item = await supabaseRest.getKnowledgeItem(slug, id);
      if (item) return item;
    } catch {
      /* lanjut */
    }
  }
  if (!db) return getMockKnowledgeItem(slug, id);
  try {
    const rows = await db
      .select()
      .from(knowledgeItems)
      .where(and(eq(knowledgeItems.id, id), eq(knowledgeItems.projectSlug, slug)))
      .limit(1);
    const row = rows[0];
    if (!row) return undefined;
    return await rowToKnowledge(row);
  } catch {
    return getMockKnowledgeItem(slug, id);
  }
}

/* ══════════════════════════════════════════════════════════════════ */
/* Data lineage & impact analysis (Fase 1)                            */
/* ══════════════════════════════════════════════════════════════════ */

/**
 * Impact analysis untuk satu knowledge item. Prioritas sumber: Supabase REST
 * → pg (DATABASE_URL) → undefined (halaman fallback ke empty-state).
 * Referensi id pendek ("K-002", "EV-013") dicocokkan dengan id penuh
 * ("arbitrum-K-002") — data produksi memakai id pendek pada
 * related_knowledge/dependencies/affected_knowledge.
 */
export async function dbGetKnowledgeImpact(
  slug: string,
  id: string
): Promise<KnowledgeImpact | undefined> {
  if (REST) {
    try {
      const r = await supabaseRest.getKnowledgeImpact(slug, id);
      if (r) return r;
    } catch {
      /* lanjut ke pg */
    }
  }
  if (!db) return undefined;
  try {
    const [kn, evs, cfs, evRows] = await Promise.all([
      db.select().from(knowledgeItems).where(eq(knowledgeItems.projectSlug, slug)),
      db.select().from(eventsTable).where(eq(eventsTable.projectSlug, slug)),
      db.select().from(conflictsTable).where(eq(conflictsTable.projectSlug, slug)),
      db.select({ id: evidenceItems.id }).from(evidenceItems).where(eq(evidenceItems.knowledgeId, id)),
    ]);
    const item = kn.find((k) => k.id === id);
    if (!item) return undefined;

    const referencedBy: LineageRef[] = [];
    for (const k of kn) {
      if (k.id === id) continue;
      const rel = asStringArray(k.relatedKnowledge).some((r) => idMatches(r, id));
      const dep = asStringArray(k.dependencies).some((d) => idMatches(d, id));
      if (rel || dep) {
        referencedBy.push({
          id: k.id,
          name: asText(k.name, k.id),
          kind: "knowledge",
          href: `/project/${slug}/knowledge/${k.id}`,
          meta: asText(k.category) || undefined,
        });
      }
    }

    const eventsTouching: LineageRef[] = evs
      .filter((e) => asStringArray(e.affectedKnowledge).some((a) => idMatches(a, id)))
      .map((e) => ({
        id: e.id,
        name: asText(e.name, e.id),
        kind: "event",
        href: `/project/${slug}/timeline?event=${e.id}`,
        meta: asText(e.type) || undefined,
      }));

    const conflictsTouching: LineageRef[] = cfs
      .filter((c) => asStringArray(c.affectedKnowledge).some((a) => idMatches(a, id)))
      .map((c) => ({
        id: c.id,
        name: asText(c.title, c.id),
        kind: "conflict",
        href: `/project/${slug}/conflicts/${c.id}`,
        meta: asText(c.status) || undefined,
      }));

    const depIds = asStringArray(item.dependencies);
    const dependencyEvents: LineageRef[] = evs
      .filter((e) => depIds.some((d) => idMatches(d, e.id)))
      .map((e) => ({
        id: e.id,
        name: asText(e.name, e.id),
        kind: "event",
        href: `/project/${slug}/timeline?event=${e.id}`,
        meta: asText(e.type) || undefined,
      }));

    return {
      knowledgeId: id,
      projectSlug: slug,
      referencedBy,
      eventsTouching,
      conflictsTouching,
      dependencyEvents,
      evidenceCount: evRows.length,
      generatedAt: new Date().toISOString(),
    };
  } catch {
    return undefined;
  }
}

/* ══════════════════════════════════════════════════════════════════ */
/* Entities & relationships                                           */
/* ══════════════════════════════════════════════════════════════════ */

export async function dbListEntities(slug: string): Promise<Entity[]> {
  if (REST) {
    try {
      return await supabaseRest.listEntities(slug);
    } catch {
      /* lanjut */
    }
  }
  if (!db) return getMockEntities(slug);
  try {
    const rows = await db
      .select()
      .from(entitiesTable)
      .where(eq(entitiesTable.projectSlug, slug))
      .orderBy(asc(entitiesTable.name));
    return rows.map((e) => ({
      id: e.id,
      projectSlug: e.projectSlug,
      name: e.name,
      type: e.type as Entity["type"],
      status: (e.status as Entity["status"]) ?? "Unknown",
      description: e.description ?? "",
      founded: e.founded ?? undefined,
      relatedKnowledge: asStringArray(e.relatedKnowledge),
      relatedEvents: asStringArray(e.relatedEvents),
      metadata: asStringRecord(e.metadata),
    }));
  } catch {
    return getMockEntities(slug);
  }
}

export async function dbGetEntity(slug: string, id: string): Promise<Entity | undefined> {
  if (REST) {
    try {
      const e = await supabaseRest.getEntity(slug, id);
      if (e) return e;
    } catch {
      /* lanjut */
    }
  }
  if (!db) return getMockEntity(slug, id);
  try {
    const rows = await db
      .select()
      .from(entitiesTable)
      .where(and(eq(entitiesTable.id, id), eq(entitiesTable.projectSlug, slug)))
      .limit(1);
    const e = rows[0];
    if (!e) return undefined;
    return {
      id: e.id,
      projectSlug: e.projectSlug,
      name: e.name,
      type: e.type as Entity["type"],
      status: (e.status as Entity["status"]) ?? "Unknown",
      description: e.description ?? "",
      founded: e.founded ?? undefined,
      relatedKnowledge: asStringArray(e.relatedKnowledge),
      relatedEvents: asStringArray(e.relatedEvents),
      metadata: asStringRecord(e.metadata),
    };
  } catch {
    return getMockEntity(slug, id);
  }
}

export async function dbListRelationships(slug: string): Promise<Relationship[]> {
  if (REST) {
    try {
      return await supabaseRest.listRelationships(slug);
    } catch {
      /* lanjut */
    }
  }
  if (!db) return getMockRelationships(slug);
  try {
    const rows = await db
      .select()
      .from(relationshipsTable)
      .where(eq(relationshipsTable.projectSlug, slug));
    return rows.map((r) => ({
      id: r.id,
      source: r.source,
      target: r.target,
      type: r.type as Relationship["type"],
    }));
  } catch {
    return getMockRelationships(slug);
  }
}

/* ══════════════════════════════════════════════════════════════════ */
/* Events                                                             */
/* ══════════════════════════════════════════════════════════════════ */

export async function dbListEvents(slug: string): Promise<TimelineEvent[]> {
  if (REST) {
    try {
      return await supabaseRest.listEvents(slug);
    } catch {
      /* lanjut */
    }
  }
  if (!db) return getMockEvents(slug);
  try {
    const rows = await db
      .select()
      .from(eventsTable)
      .where(eq(eventsTable.projectSlug, slug))
      .orderBy(asc(eventsTable.date));
    return rows.map((e) => ({
      id: e.id,
      projectSlug: e.projectSlug,
      name: e.name,
      date: e.date ?? "",
      type: e.type as TimelineEvent["type"],
      participants: asStringArray(e.participants),
      description: e.description ?? "",
      result: e.result ?? "",
      source: e.source ?? "",
      url: e.url ?? undefined,
      affectedKnowledge: asStringArray(e.affectedKnowledge),
      impact: (e.impact as TimelineEvent["impact"]) ?? "Medium",
    }));
  } catch {
    return getMockEvents(slug);
  }
}

/* ══════════════════════════════════════════════════════════════════ */
/* Conflicts                                                          */
/* ══════════════════════════════════════════════════════════════════ */

export async function dbListConflicts(slug: string, params?: ListParams): Promise<Conflict[]> {
  if (REST) {
    try {
      let items = await supabaseRest.listConflicts(slug);
      if (params?.severity) items = items.filter((c) => c.severity === params.severity);
      if (params?.status) items = items.filter((c) => c.status === params.status);
      return items;
    } catch {
      /* lanjut */
    }
  }
  if (!db) {
    let items = getMockConflicts(slug);
    if (params?.severity) items = items.filter((c) => c.severity === params.severity);
    if (params?.status) items = items.filter((c) => c.status === params.status);
    return items;
  }
  try {
    const conds = [eq(conflictsTable.projectSlug, slug)];
    if (params?.severity) conds.push(eq(conflictsTable.severity, params.severity));
    if (params?.status) conds.push(eq(conflictsTable.status, params.status));
    const rows = await db.select().from(conflictsTable).where(and(...conds));
    return rows.map((c) => ({
      id: c.id,
      projectSlug: c.projectSlug,
      category: (c.category ?? "Data") as Conflict["category"],
      title: c.title,
      description: c.description ?? "",
      severity: (c.severity as Conflict["severity"]) ?? "Medium",
      status: (c.status as Conflict["status"]) ?? "Unresolved",
      versionA: asConflictVersion(c.versionA, "Version A"),
      versionB: asConflictVersion(c.versionB, "Version B"),
      resolution: c.resolution ?? undefined,
      affectedKnowledge: asStringArray(c.affectedKnowledge),
      affectedPhase: c.affectedPhase ?? "",
      updatedAt: c.updatedAt ?? "",
    }));
  } catch {
    return getMockConflicts(slug);
  }
}

export async function dbGetConflict(
  slug: string,
  id: string
): Promise<Conflict | undefined> {
  if (REST) {
    try {
      const c = await supabaseRest.getConflict(slug, id);
      if (c) return c;
    } catch {
      /* lanjut */
    }
  }
  if (!db) return getMockConflict(slug, id);
  try {
    const rows = await db
      .select()
      .from(conflictsTable)
      .where(and(eq(conflictsTable.id, id), eq(conflictsTable.projectSlug, slug)))
      .limit(1);
    const c = rows[0];
    if (!c) return undefined;
    return {
      id: c.id,
      projectSlug: c.projectSlug,
      category: (c.category ?? "Data") as Conflict["category"],
      title: c.title,
      description: c.description ?? "",
      severity: (c.severity as Conflict["severity"]) ?? "Medium",
      status: (c.status as Conflict["status"]) ?? "Unresolved",
      versionA: asConflictVersion(c.versionA, "Version A"),
      versionB: asConflictVersion(c.versionB, "Version B"),
      resolution: c.resolution ?? undefined,
      affectedKnowledge: asStringArray(c.affectedKnowledge),
      affectedPhase: c.affectedPhase ?? "",
      updatedAt: c.updatedAt ?? "",
    };
  } catch {
    return getMockConflict(slug, id);
  }
}

/* ══════════════════════════════════════════════════════════════════ */
/* QA & behavior                                                      */
/* ══════════════════════════════════════════════════════════════════ */

export async function dbGetQa(slug: string): Promise<QAReport | undefined> {
  const project = await dbGetProject(slug);
  return project?.qa;
}

export async function dbGetBehavior(slug: string): Promise<BehaviorProfile | undefined> {
  if (REST) {
    try {
      const p = await supabaseRest.getProject(slug);
      if (p) return p.behavior;
    } catch {
      /* lanjut */
    }
  }
  if (!db) return behaviorMock[slug];
  try {
    const rows = await db
      .select()
      .from(behaviorProfiles)
      .where(eq(behaviorProfiles.projectSlug, slug))
      .limit(1);
    const b = rows[0];
    if (!b) return behaviorMock[slug];
    return {
      strategicObjectives: asStringArray(b.strategicObjectives),
      decisionPatterns: asStringArray(b.decisionPatterns),
      riskResponse: asStringArray(b.riskResponse),
      tradeOffs: asStringArray(b.tradeOffs),
    };
  } catch {
    return behaviorMock[slug];
  }
}

/* ══════════════════════════════════════════════════════════════════ */
/* Activity ledger (audit_log)                                        */
/* ══════════════════════════════════════════════════════════════════ */

/**
 * Baca ledger audit (terbaru dulu). Prioritas sumber sama dengan data lain:
 * Supabase REST → pg (DATABASE_URL) → kosong (bukan mock — audit hanya berisi
 * data riil dari trigger Postgres). Filter: table/action/rowId + limit.
 */
export async function dbListActivity(
  filters: ActivityFilters = {},
  limit = 50
): Promise<ActivityEntry[]> {
  if (REST) {
    try {
      return await supabaseRest.listActivity(filters, limit);
    } catch {
      /* lanjut ke pg / kosong */
    }
  }
  if (!db) return [];
  try {
    const conds = [];
    if (filters.table) conds.push(eq(auditLogTable.tableName, filters.table));
    if (filters.action) conds.push(eq(auditLogTable.action, filters.action));
    if (filters.rowId) conds.push(eq(auditLogTable.rowId, filters.rowId));
    const rows = await db
      .select()
      .from(auditLogTable)
      .where(conds.length > 0 ? and(...conds) : undefined)
      .orderBy(desc(auditLogTable.createdAt))
      .limit(Math.min(Math.max(Math.floor(limit), 1), 200));
    return rows.map(pgRowToActivity);
  } catch {
    return [];
  }
}

/* ══════════════════════════════════════════════════════════════════ */
/* Workspace & RBAC (Fase 2)                                          */
/* ══════════════════════════════════════════════════════════════════ */

/** Daftar workspace — REST → pg → [] (tabel pre-migrasi aman). */
export async function dbListWorkspaces(): Promise<Workspace[]> {
  if (REST) {
    try {
      return await supabaseRest.listWorkspaces();
    } catch {
      /* lanjut ke pg */
    }
  }
  if (!db) return [];
  try {
    const rows = await db.select().from(workspacesTable).orderBy(asc(workspacesTable.createdAt));
    return rows.map((w) => ({
      id: w.id,
      name: asText(w.name, w.id),
      slug: asText(w.slug),
      description: asText(w.description),
      settings: asJsonObject(w.settings) ?? {},
      createdAt: w.createdAt ? new Date(w.createdAt).toISOString() : "",
    }));
  } catch {
    return [];
  }
}

/** Daftar anggota workspace — REST → pg → []. */
export async function dbListWorkspaceMembers(workspaceId?: string): Promise<WorkspaceMember[]> {
  if (REST) {
    try {
      return await supabaseRest.listWorkspaceMembers(workspaceId);
    } catch {
      /* lanjut ke pg */
    }
  }
  if (!db) return [];
  try {
    const rows = workspaceId
      ? await db
          .select()
          .from(workspaceMembersTable)
          .where(eq(workspaceMembersTable.workspaceId, workspaceId))
          .orderBy(asc(workspaceMembersTable.createdAt))
      : await db.select().from(workspaceMembersTable).orderBy(asc(workspaceMembersTable.createdAt));
    return rows.map((m) => ({
      workspaceId: m.workspaceId,
      userId: m.userId,
      role: (MEMBER_ROLES as readonly string[]).includes(m.role)
        ? (m.role as MemberRole)
        : "viewer",
      createdAt: m.createdAt ? new Date(m.createdAt).toISOString() : "",
    }));
  } catch {
    return [];
  }
}

/** Tambah anggota — REST (service key); tanpa DB → error jelas (bukan fake). */
export async function dbAddWorkspaceMember(
  workspaceId: string,
  userId: string,
  role: MemberRole
): Promise<void> {
  if (REST) return supabaseRest.addWorkspaceMember(workspaceId, userId, role);
  throw new Error("Workspace memerlukan Supabase — tambah anggota tidak tersedia tanpa koneksi DB.");
}

/** Ubah role anggota — REST; tanpa DB → error jelas. */
export async function dbUpdateMemberRole(
  workspaceId: string,
  userId: string,
  role: MemberRole
): Promise<void> {
  if (REST) return supabaseRest.updateMemberRole(workspaceId, userId, role);
  throw new Error("Workspace memerlukan Supabase — ubah role tidak tersedia tanpa koneksi DB.");
}

/** Hapus anggota — REST; tanpa DB → error jelas. */
export async function dbRemoveWorkspaceMember(
  workspaceId: string,
  userId: string
): Promise<void> {
  if (REST) return supabaseRest.removeWorkspaceMember(workspaceId, userId);
  throw new Error("Workspace memerlukan Supabase — hapus anggota tidak tersedia tanpa koneksi DB.");
}

/* ══════════════════════════════════════════════════════════════════ */
/* Search                                                             */
/* ══════════════════════════════════════════════════════════════════ */

export async function dbSearch(q: string): Promise<SearchResult[]> {
  if (REST) {
    try {
      return await supabaseRest.search(q);
    } catch {
      /* lanjut */
    }
  }
  if (!db) return buildSearchIndex().filter((r) => !q || r.keywords.includes(q.toLowerCase()));
  try {
    const text = q.toLowerCase();
    const [proj, kn, ent, evs, cfs] = await Promise.all([
      dbListProjects(),
      dbListKnowledge("arbitrum"),
      dbListEntities("arbitrum"),
      dbListEvents("arbitrum"),
      dbListConflicts("arbitrum"),
    ]);
    const results: SearchResult[] = [];
    const push = (r: SearchResult) => {
      if (!text || r.keywords.includes(text) || r.label.toLowerCase().includes(text)) results.push(r);
    };
    proj.forEach((p) =>
      push({ category: "Project", label: p.name, sublabel: `${p.symbol} · CIF ${p.cifScore}`, href: `/project/${p.slug}`, keywords: `${p.name} ${p.symbol} ${p.tagline}`.toLowerCase() })
    );
    kn.forEach((k) =>
      push({ category: "Knowledge", label: k.name, sublabel: `${k.id} · ${k.category} · ${k.status}`, href: `/project/${k.projectSlug}/knowledge/${k.id}`, keywords: `${k.id} ${k.name} ${k.category} ${k.description}`.toLowerCase(), status: k.status, confidence: k.confidence, domain: k.category })
    );
    ent.forEach((e) =>
      push({ category: "Entity", label: e.name, sublabel: `${e.type} · ${e.status}`, href: `/project/${e.projectSlug}/graph?node=${e.id}`, keywords: `${e.id} ${e.name} ${e.type} ${e.description}`.toLowerCase(), status: e.status, domain: e.type })
    );
    evs.forEach((e) =>
      push({ category: "Event", label: e.name, sublabel: `${e.id} · ${e.type} · ${e.date}`, href: `/project/${e.projectSlug}/timeline?event=${e.id}`, keywords: `${e.id} ${e.name} ${e.type} ${e.description}`.toLowerCase(), domain: e.type })
    );
    cfs.forEach((c) =>
      push({ category: "Conflict", label: c.title, sublabel: `${c.id} · ${c.severity} · ${c.status}`, href: `/project/${c.projectSlug}/conflicts/${c.id}`, keywords: `${c.id} ${c.title} ${c.category} ${c.description}`.toLowerCase(), status: c.status, severity: c.severity, domain: c.category })
    );
    return results.slice(0, 40);
  } catch {
    return buildSearchIndex().filter((r) => !q || r.keywords.includes(q.toLowerCase())).slice(0, 40);
  }
}

/* Keterangan koneksi untuk /api/config */
export const dbStatus = (): { connected: boolean; mode: "database" | "mock" } => {
  if (REST) return { connected: true, mode: "database" };
  return DB ? { connected: true, mode: "database" } : { connected: false, mode: "mock" };
};

/* Uji koneksi Supabase REST (untuk /api/health) */
export async function pingSupabaseRest(): Promise<boolean> {
  if (!supabaseRestEnabled) return false;
  return supabaseRest.ping();
}
