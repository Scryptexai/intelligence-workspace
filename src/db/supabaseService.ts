/**
 * ─────────────────────────────────────────────────────────────────────────────
 * SUPABASE REST DATA SERVICE (v2 — relational tables)
 * ─────────────────────────────────────────────────────────────────────────────
 * Membaca database Supabase via PostgREST (HTTPS) dari TABEL RELASIONAL
 * (schema Drizzle di src/db/schema.ts) — yang diisi oleh pipeline CIF
 * (crypto-intelligence-framework tools/sync_supabase.py) atau seed:
 *
 *   projects, knowledge_items, evidence_items, entities, relationships,
 *   events, conflicts, qa_dimensions, qa_phases, behavior_profiles, notes,
 *   saved_views, users
 *
 * Mengapa REST (bukan pg langsung): host DB direct Supabase sering IPv6-only,
 * tidak terjangkau dari serverless/Vercel/sandbox IPv4. PostgREST HTTPS bekerja
 * di mana saja. Secret key dipakai server-side (bypass RLS untuk read).
 *
 * Semua hasil dipetakan dari kolom snake_case → tipe aplikasi (src/lib/types/*).
 */
import type { Project, QAReport, BehaviorProfile } from "@/lib/types/project";
import type { KnowledgeItem } from "@/lib/types/knowledge";
import type { Entity, Relationship } from "@/lib/types/entity";
import type { TimelineEvent } from "@/lib/types/event";
import type { Conflict } from "@/lib/types/conflict";
import type { SavedView } from "@/lib/types/view";
import type { SearchResult } from "@/lib/data";
import type { ActivityAction, ActivityEntry, ActivityFilters } from "@/lib/types/activity";
import type {
  KnowledgeImpact,
  LineageRef,
} from "@/lib/types/lineage";
import { idMatches } from "@/lib/types/lineage";
import type { MemberRole, Workspace, WorkspaceMember } from "@/lib/types/workspace";
import { MEMBER_ROLES } from "@/lib/types/workspace";
import { mapWithConcurrency } from "@/lib/utils/helpers";
import {
  asConflictVersion,
  asJsonObject,
  asNullableText,
  asNumber,
  asStringArray,
  asStringRecord,
  asText,
  buildProvenance,
} from "./coerce";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/\/$/, "");
const SECRET_KEY = process.env.SUPABASE_SECRET_KEY;

export const supabaseRestEnabled = Boolean(SUPABASE_URL && SECRET_KEY);

/* ------------------------------------------------------------------ */
/* HTTP helper                                                         */
/* ------------------------------------------------------------------ */

/**
 * GET baris dari PostgREST dengan TIMEOUT wajib (AbortController).
 *
 * Tanpa timeout, satu fetch yang menggantung (jaringan lambat / Supabase
 * cold start / DNS) bisa menahan request serverless Vercel melewati batas
 * durasi fungsi (Hobby 10s) → halaman RSC jatuh ke error boundary
 * ("Something went wrong"). Timeout membuat fetch gagal cepat → fallback
 * data kosong di layer atas, halaman tetap ter-render.
 */
async function getRows<T>(path: string, timeoutMs = 5000): Promise<T[]> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
      headers: {
        apikey: SECRET_KEY!,
        Authorization: `Bearer ${SECRET_KEY!}`,
      },
      // no-store: hindari Data Cache Next.js — data bisa berubah via /api/seed
      // atau pipeline CIF; cache stale (mis. [] sebelum seed) bikin UI kosong
      // hingga 30 detik. Layer di atas (s-maxage header) tetap mengatur cache CDN.
      cache: "no-store",
      signal: controller.signal,
    });
    if (!res.ok) throw new Error(`Supabase REST ${res.status}: ${path}`);
    return (await res.json()) as T[];
  } finally {
    clearTimeout(timer);
  }
}

async function getOne<T>(path: string): Promise<T | undefined> {
  const rows = await getRows<T>(path);
  return rows[0];
}

/* ------------------------------------------------------------------ */
/* Mapper: project (projects + qa_dimensions + qa_phases + behavior)   */
/* ------------------------------------------------------------------ */

interface RawProject {
  id: string;
  slug: string;
  name: string;
  symbol: string;
  tagline: string | null;
  description: string | null;
  color: string | null;
  accent: string | null;
  status: string | null;
  cif_score: number;
  confidence: number;
  knowledge_count: number;
  conflict_count: number;
  coverage: number;
  entity_count: number;
  event_count: number;
  last_updated: string | null;
  last_activity_hours: number;
  tags: string[] | null;
}

interface RawQaDim {
  key: string;
  label: string;
  score: number;
  weight: number;
  description: string | null;
  sort_order: number;
}
interface RawQaPhase { name: string; status: string; score: number; owner: string | null; sort_order: number }
interface RawBehavior {
  strategic_objectives: string[];
  decision_patterns: string[];
  risk_response: string[];
  trade_offs: string[];
}

const QA_KEY_MAP: Record<string, string> = {
  research: "research",
  consistency: "consistency",
  evidence: "evidence",
  coverage: "coverage",
  conflict: "conflict",
  knowledge: "knowledge",
};

async function buildProject(p: RawProject): Promise<Project> {
  const slug = p.slug;
  const [dims, phases, behavior] = await Promise.all([
    getRows<RawQaDim>(`qa_dimensions?project_slug=eq.${slug}&select=*&order=sort_order`).catch(() => []),
    getRows<RawQaPhase>(`qa_phases?project_slug=eq.${slug}&select=*&order=sort_order`).catch(() => []),
    getOne<RawBehavior>(`behavior_profiles?project_slug=eq.${slug}&select=*`).catch(() => undefined),
  ]);

  const qa: QAReport = {
    total: asNumber(p.cif_score),
    dimensions: dims.map((d) => ({
      key: (QA_KEY_MAP[d.key] ?? d.key) as QAReport["dimensions"][number]["key"],
      label: asText(d.label, d.key),
      score: asNumber(d.score),
      weight: asNumber(d.weight),
      description: d.description ?? "",
    })),
    phases: phases.map((ph) => ({
      name: asText(ph.name, "Phase"),
      status: (ph.status ?? "Not Started") as QAReport["phases"][number]["status"],
      score: asNumber(ph.score),
      owner: ph.owner ?? "",
    })),
  };

  const behaviorProfile: BehaviorProfile = behavior
    ? {
        strategicObjectives: asStringArray(behavior.strategic_objectives),
        decisionPatterns: asStringArray(behavior.decision_patterns),
        riskResponse: asStringArray(behavior.risk_response),
        tradeOffs: asStringArray(behavior.trade_offs),
      }
    : { strategicObjectives: [], decisionPatterns: [], riskResponse: [], tradeOffs: [] };

  return {
    id: asText(p.id, p.slug),
    slug: p.slug,
    name: asText(p.name, p.slug),
    symbol: asText(p.symbol, p.slug.slice(0, 3).toUpperCase()),
    tagline: p.tagline ?? "",
    description: p.description ?? "",
    color: p.color ?? "#22d3ee",
    accent: p.accent ?? "#0e7490",
    status: (p.status as Project["status"]) ?? "active",
    cifScore: asNumber(p.cif_score),
    confidence: asNumber(p.confidence),
    knowledgeCount: asNumber(p.knowledge_count),
    conflictCount: asNumber(p.conflict_count),
    coverage: asNumber(p.coverage),
    entityCount: asNumber(p.entity_count),
    eventCount: asNumber(p.event_count),
    lastUpdated: p.last_updated ?? "",
    lastActivityHours: asNumber(p.last_activity_hours),
    tags: asStringArray(p.tags),
    qa,
    behavior: behaviorProfile,
  };
}

/* ------------------------------------------------------------------ */
/* Mapper: knowledge (+ evidence)                                      */
/* ------------------------------------------------------------------ */

interface RawKnowledge {
  id: string;
  project_slug: string;
  name: string;
  category: string | null;
  description: string | null;
  confidence: number;
  status: string | null;
  updated_at: string | null;
  author: string | null;
  related_knowledge: string[] | null;
  dependencies: string[] | null;
  /* kolom provenance (additive — ada setelah migrasi Phase 0) */
  workspace_id?: string | null;
  source?: string | null;
  source_url?: string | null;
  connector?: string | null;
  ingested_at?: string | null;
}

interface RawEvidence {
  id: string;
  knowledge_id: string;
  event_id: string | null;
  event_name: string;
  date: string | null;
  source: string | null;
  url: string | null;
  weight: number;
  note: string | null;
  sort_order: number;
}

async function listEvidenceMap(): Promise<Map<string, RawEvidence[]>> {
  const rows = await getRows<RawEvidence>(`evidence_items?select=*&order=sort_order`).catch(() => []);
  const map = new Map<string, RawEvidence[]>();
  for (const e of rows) {
    if (!map.has(e.knowledge_id)) map.set(e.knowledge_id, []);
    map.get(e.knowledge_id)!.push(e);
  }
  return map;
}

function mapKnowledge(k: RawKnowledge, evs: RawEvidence[]): KnowledgeItem {
  return {
    id: k.id,
    projectSlug: k.project_slug,
    name: asText(k.name, k.id),
    category: k.category ?? "",
    description: k.description ?? "",
    confidence: asNumber(k.confidence),
    status: (k.status as KnowledgeItem["status"]) ?? "Stable",
    updatedAt: k.updated_at ?? "",
    author: k.author ?? "",
    evidence: evs.map((e) => ({
      id: e.id,
      eventId: e.event_id ?? "",
      eventName: asText(e.event_name),
      date: e.date ?? "",
      source: e.source ?? "",
      url: e.url ?? "#",
      weight: asNumber(e.weight, 1),
      note: e.note ?? undefined,
    })),
    relatedKnowledge: asStringArray(k.related_knowledge),
    dependencies: asStringArray(k.dependencies),
    provenance: buildProvenance(k.source, k.source_url, k.connector, k.ingested_at),
  };
}

/* ------------------------------------------------------------------ */
/* Mapper: entity / relationship                                       */
/* ------------------------------------------------------------------ */

interface RawEntity {
  id: string;
  project_slug: string;
  name: string;
  type: string;
  status: string | null;
  description: string | null;
  founded: string | null;
  related_knowledge: string[] | null;
  related_events: string[] | null;
  metadata: Record<string, string> | null;
}

interface RawRelationship {
  id: string;
  project_slug: string;
  source: string;
  target: string;
  type: string;
}

function mapEntity(e: RawEntity): Entity {
  return {
    id: e.id,
    projectSlug: e.project_slug,
    name: asText(e.name, e.id),
    type: (e.type as Entity["type"]) ?? "Company",
    status: (e.status as Entity["status"]) ?? "Unknown",
    description: e.description ?? "",
    founded: e.founded ?? undefined,
    relatedKnowledge: asStringArray(e.related_knowledge),
    relatedEvents: asStringArray(e.related_events),
    metadata: asStringRecord(e.metadata),
  };
}

/* ------------------------------------------------------------------ */
/* Mapper: event                                                       */
/* ------------------------------------------------------------------ */

interface RawEvent {
  id: string;
  project_slug: string;
  name: string;
  date: string | null;
  type: string;
  participants: string[] | null;
  description: string | null;
  result: string | null;
  source: string | null;
  url: string | null;
  affected_knowledge: string[] | null;
  impact: string | null;
}

function mapEvent(ev: RawEvent): TimelineEvent {
  return {
    id: ev.id,
    projectSlug: ev.project_slug,
    name: asText(ev.name, ev.id),
    date: ev.date ?? "",
    type: (ev.type as TimelineEvent["type"]) ?? "Launch",
    participants: asStringArray(ev.participants),
    description: ev.description ?? "",
    result: ev.result ?? "",
    source: ev.source ?? "",
    url: ev.url ?? undefined,
    affectedKnowledge: asStringArray(ev.affected_knowledge),
    impact: (ev.impact as TimelineEvent["impact"]) ?? "Medium",
  };
}

/* ------------------------------------------------------------------ */
/* Mapper: conflict                                                    */
/* ------------------------------------------------------------------ */

interface RawConflict {
  id: string;
  project_slug: string;
  category: string | null;
  title: string;
  description: string | null;
  severity: string | null;
  status: string | null;
  version_a: { source: string; value: string; date: string; url: string; evidence: string } | null;
  version_b: { source: string; value: string; date: string; url: string; evidence: string } | null;
  resolution: string | null;
  affected_knowledge: string[] | null;
  affected_phase: string | null;
  updated_at: string | null;
}

function mapConflict(c: RawConflict): Conflict {
  const vA = asConflictVersion(c.version_a, "Version A");
  const vB = asConflictVersion(c.version_b, "Version B");
  return {
    id: c.id,
    projectSlug: c.project_slug,
    category: (c.category as Conflict["category"]) ?? "Data",
    title: asText(c.title, c.id),
    description: c.description ?? "",
    severity: (c.severity as Conflict["severity"]) ?? "Medium",
    status: (c.status as Conflict["status"]) ?? "Unresolved",
    versionA: vA,
    versionB: vB,
    resolution: c.resolution ?? undefined,
    affectedKnowledge: asStringArray(c.affected_knowledge),
    affectedPhase: c.affected_phase ?? "",
    updatedAt: c.updated_at ?? "",
  };
}

/* ------------------------------------------------------------------ */
/* Mapper: activity ledger (audit_log)                                 */
/* ------------------------------------------------------------------ */

/** Baris mentah audit_log (snake_case dari PostgREST). */
export interface RawAuditLog {
  id: number;
  table_name: string;
  row_id: string | null;
  action: string;
  old_data: unknown;
  new_data: unknown;
  changed_fields: unknown;
  actor_label: string | null;
  actor_id: string | null;
  workspace_id: string | null;
  created_at: string;
}

const ACTIVITY_ACTIONS: ActivityAction[] = ["INSERT", "UPDATE", "DELETE"];

/**
 * Nama field yang nilainya berbeda antara dua snapshot baris (old vs new).
 * Tidak pernah melempar: JSONB apa pun (objek/string/null) diterima.
 */
export function changedFieldsBetween(
  oldData: unknown,
  newData: unknown
): string[] {
  const o = asJsonObject(oldData);
  const n = asJsonObject(newData);
  if (!o && !n) return [];
  if (!o) return Object.keys(n ?? {});
  if (!n) return Object.keys(o);
  const keys = new Set([...Object.keys(o), ...Object.keys(n)]);
  const changed: string[] = [];
  for (const k of keys) {
    const a = o[k];
    const b = n[k];
    const same =
      a === b ||
      (a !== undefined && b !== undefined && JSON.stringify(a) === JSON.stringify(b));
    if (!same) changed.push(k);
  }
  return changed.sort();
}

/** Baris audit_log (snake_case) → ActivityEntry aplikasi. Tidak pernah melempar. */
export function mapActivityEntry(row: RawAuditLog): ActivityEntry {
  const action: ActivityAction = ACTIVITY_ACTIONS.includes(
    row.action as ActivityAction
  )
    ? (row.action as ActivityAction)
    : "UPDATE";
  const oldData = asJsonObject(row.old_data);
  const newData = asJsonObject(row.new_data);
  const changedFromTrigger = asStringArray(row.changed_fields);
  return {
    id: asNumber(row.id),
    tableName: asText(row.table_name, "unknown"),
    rowId: asNullableText(row.row_id),
    action,
    oldData,
    newData,
    changedFields:
      changedFromTrigger.length > 0
        ? changedFromTrigger
        : changedFieldsBetween(oldData, newData),
    actorLabel: asText(row.actor_label, "system") || "system",
    actorId: asText(row.actor_id, "system") || "system",
    workspaceId: asNullableText(row.workspace_id),
    createdAt: asText(row.created_at),
  };
}

/* ------------------------------------------------------------------ */
/* Public API                                                          */
/* ------------------------------------------------------------------ */

export const supabaseRest = {
  async listProjects(): Promise<Project[]> {
    const rows = await getRows<RawProject>(`projects?select=*`);
    // Paralel dengan concurrency terbatas — 29 project × 3 query = ~87 request
    // SEQUENTIAL bisa 15-30s (timeout serverless Vercel → error page).
    // Concurrency 12 → 3 gelombang, total ~latency jaringan sekali jalan.
    return mapWithConcurrency(rows, 12, (p) => buildProject(p));
  },

  async getProject(slug: string): Promise<Project | undefined> {
    const row = await getOne<RawProject>(`projects?slug=eq.${encodeURIComponent(slug)}&select=*`);
    if (!row) return undefined;
    return buildProject(row);
  },

  async listKnowledge(slug: string): Promise<KnowledgeItem[]> {
    const rows = await getRows<RawKnowledge>(
      `knowledge_items?project_slug=eq.${encodeURIComponent(slug)}&select=*`
    );
    const evMap = await listEvidenceMap();
    return rows.map((k) => mapKnowledge(k, evMap.get(k.id) ?? []));
  },

  async getKnowledgeItem(slug: string, id: string): Promise<KnowledgeItem | undefined> {
    const row = await getOne<RawKnowledge>(
      `knowledge_items?id=eq.${encodeURIComponent(id)}&project_slug=eq.${encodeURIComponent(slug)}&select=*`
    );
    if (!row) return undefined;
    const evs = await getRows<RawEvidence>(
      `evidence_items?knowledge_id=eq.${encodeURIComponent(id)}&select=*&order=sort_order`
    );
    return mapKnowledge(row, evs);
  },

  async listEntities(slug: string): Promise<Entity[]> {
    const rows = await getRows<RawEntity>(
      `entities?project_slug=eq.${encodeURIComponent(slug)}&select=*`
    );
    return rows.map(mapEntity);
  },

  async getEntity(slug: string, id: string): Promise<Entity | undefined> {
    const row = await getOne<RawEntity>(
      `entities?id=eq.${encodeURIComponent(id)}&project_slug=eq.${encodeURIComponent(slug)}&select=*`
    );
    return row ? mapEntity(row) : undefined;
  },

  async listRelationships(slug: string): Promise<Relationship[]> {
    const rows = await getRows<RawRelationship>(
      `relationships?project_slug=eq.${encodeURIComponent(slug)}&select=*`
    );
    return rows.map((r) => ({
      id: r.id,
      source: r.source,
      target: r.target,
      type: r.type as Relationship["type"],
    }));
  },

  async listEvents(slug: string): Promise<TimelineEvent[]> {
    const rows = await getRows<RawEvent>(
      `events?project_slug=eq.${encodeURIComponent(slug)}&select=*`
    );
    return rows.map(mapEvent);
  },

  async listConflicts(slug: string): Promise<Conflict[]> {
    const rows = await getRows<RawConflict>(
      `conflicts?project_slug=eq.${encodeURIComponent(slug)}&select=*`
    );
    return rows.map(mapConflict);
  },

  async getConflict(slug: string, id: string): Promise<Conflict | undefined> {
    const row = await getOne<RawConflict>(
      `conflicts?id=eq.${encodeURIComponent(id)}&project_slug=eq.${encodeURIComponent(slug)}&select=*`
    );
    return row ? mapConflict(row) : undefined;
  },

  async search(q: string): Promise<SearchResult[]> {
    const text = q.toLowerCase();
    const results: SearchResult[] = [];
    const push = (r: SearchResult) => {
      if (!text || r.keywords.includes(text) || r.label.toLowerCase().includes(text)) results.push(r);
    };

    const projects = await this.listProjects().catch(() => [] as Project[]);
    for (const p of projects) {
      push({
        category: "Project",
        label: p.name,
        sublabel: `${p.symbol} · CIF ${p.cifScore}`,
        href: `/project/${p.slug}`,
        keywords: `${p.name} ${p.symbol} ${p.tagline}`.toLowerCase(),
        confidence: p.confidence,
      });
    }
    await mapWithConcurrency(projects, 6, async (p) => {
      const [kn, ent, evs, cfs] = await Promise.all([
        this.listKnowledge(p.slug).catch(() => [] as KnowledgeItem[]),
        this.listEntities(p.slug).catch(() => [] as Entity[]),
        this.listEvents(p.slug).catch(() => [] as TimelineEvent[]),
        this.listConflicts(p.slug).catch(() => [] as Conflict[]),
      ]);
      kn.forEach((k) =>
        push({ category: "Knowledge", label: k.name, sublabel: `${k.id} · ${k.category} · ${k.status}`, href: `/project/${p.slug}/knowledge/${k.id}`, keywords: `${k.id} ${k.name} ${k.category} ${k.description}`.toLowerCase(), status: k.status, confidence: k.confidence, domain: k.category })
      );
      ent.forEach((e) =>
        push({ category: "Entity", label: e.name, sublabel: `${e.type} · ${e.status}`, href: `/project/${p.slug}/graph?node=${e.id}`, keywords: `${e.id} ${e.name} ${e.type} ${e.description}`.toLowerCase(), status: e.status, domain: e.type })
      );
      evs.forEach((e) =>
        push({ category: "Event", label: e.name, sublabel: `${e.id} · ${e.type} · ${e.date}`, href: `/project/${p.slug}/timeline?event=${e.id}`, keywords: `${e.id} ${e.name} ${e.type} ${e.description}`.toLowerCase(), domain: e.type })
      );
      cfs.forEach((c) =>
        push({ category: "Conflict", label: c.title, sublabel: `${c.id} · ${c.severity} · ${c.status}`, href: `/project/${p.slug}/conflicts/${c.id}`, keywords: `${c.id} ${c.title} ${c.category} ${c.description}`.toLowerCase(), status: c.status, severity: c.severity, domain: c.category })
      );
    });
    return results.slice(0, 40);
  },

  /* ------------------------------------------------------------------ */
  /* Data lineage & impact analysis (Fase 1)                             */
  /* ------------------------------------------------------------------ */

  /**
   * Impact analysis untuk satu knowledge item: siapa yang mereferensikan,
   * event/conflict mana yang menyentuh, dependensi event, dan jumlah
   * evidence. 4 query konstan (knowledge + events + conflicts + evidence)
   * lalu filter di memori — tanpa N+1. Referensi id pendek ("K-002",
   * "EV-013") dicocokkan dengan id penuh ("arbitrum-K-002") via idMatches.
   */
  async getKnowledgeImpact(slug: string, id: string): Promise<KnowledgeImpact | undefined> {
    const s = encodeURIComponent(slug);
    const [knRows, evRows, cfRows, evCountRows] = await Promise.all([
      getRows<RawKnowledge>(`knowledge_items?project_slug=eq.${s}&select=*`),
      getRows<RawEvent>(`events?project_slug=eq.${s}&select=*`),
      getRows<RawConflict>(`conflicts?project_slug=eq.${s}&select=*`),
      getRows<{ id: string }>(
        `evidence_items?knowledge_id=eq.${encodeURIComponent(id)}&select=id`
      ),
    ]);

    const item = knRows.find((k) => k.id === id);
    if (!item) return undefined;

    const referencedBy: LineageRef[] = [];
    for (const k of knRows) {
      if (k.id === id) continue;
      const rel = asStringArray(k.related_knowledge).some((r) => idMatches(r, id));
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

    const eventsTouching: LineageRef[] = evRows
      .filter((e) => asStringArray(e.affected_knowledge).some((a) => idMatches(a, id)))
      .map((e) => ({
        id: e.id,
        name: asText(e.name, e.id),
        kind: "event",
        href: `/project/${slug}/timeline?event=${e.id}`,
        meta: asText(e.type) || undefined,
      }));

    const conflictsTouching: LineageRef[] = cfRows
      .filter((c) => asStringArray(c.affected_knowledge).some((a) => idMatches(a, id)))
      .map((c) => ({
        id: c.id,
        name: asText(c.title, c.id),
        kind: "conflict",
        href: `/project/${slug}/conflicts/${c.id}`,
        meta: asText(c.status) || undefined,
      }));

    const depIds = asStringArray(item.dependencies);
    const dependencyEvents: LineageRef[] = evRows
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
      evidenceCount: evCountRows.length,
      generatedAt: new Date().toISOString(),
    };
  },

  /* ------------------------------------------------------------------ */
  /* Workspace & RBAC (Fase 2) — baca/kelola via service key             */
  /* ------------------------------------------------------------------ */

  /** Daftar workspace (REST; tabel belum ada → [] — pre-migrasi aman). */
  async listWorkspaces(): Promise<Workspace[]> {
    try {
      const rows = await getRows<{
        id: string; name: string; slug: string | null;
        description: string | null; settings: unknown; created_at: string;
      }>(`workspaces?select=*&order=created_at`);
      return rows.map((w) => ({
        id: asText(w.id),
        name: asText(w.name, w.id),
        slug: asText(w.slug),
        description: asText(w.description),
        settings: asJsonObject(w.settings) ?? {},
        createdAt: asText(w.created_at),
      }));
    } catch {
      return [];
    }
  },

  /** Daftar anggota workspace (opsional difilter per workspace). */
  async listWorkspaceMembers(workspaceId?: string): Promise<WorkspaceMember[]> {
    try {
      const cond = workspaceId ? `workspace_id=eq.${encodeURIComponent(workspaceId)}&` : "";
      const rows = await getRows<{
        workspace_id: string; user_id: string; role: string; created_at: string;
      }>(`workspace_members?${cond}select=*&order=created_at`);
      return rows.map((m) => ({
        workspaceId: asText(m.workspace_id),
        userId: asText(m.user_id),
        role: (MEMBER_ROLES as readonly string[]).includes(m.role)
          ? (m.role as MemberRole)
          : "viewer",
        createdAt: asText(m.created_at),
      }));
    } catch {
      return [];
    }
  },

  /** Tambah anggota (POST workspace_members, service key). */
  async addWorkspaceMember(workspaceId: string, userId: string, role: MemberRole): Promise<void> {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/workspace_members`, {
      method: "POST",
      headers: {
        apikey: SECRET_KEY!,
        Authorization: `Bearer ${SECRET_KEY!}`,
        "Content-Type": "application/json",
        Prefer: "return=minimal",
      },
      body: JSON.stringify({ workspace_id: workspaceId, user_id: userId, role }),
    });
    if (!res.ok && res.status !== 201) {
      throw new Error(`addWorkspaceMember gagal: HTTP ${res.status}`);
    }
  },

  /** Ubah role anggota (PATCH, service key). */
  async updateMemberRole(workspaceId: string, userId: string, role: MemberRole): Promise<void> {
    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/workspace_members?workspace_id=eq.${encodeURIComponent(workspaceId)}&user_id=eq.${encodeURIComponent(userId)}`,
      {
        method: "PATCH",
        headers: {
          apikey: SECRET_KEY!,
          Authorization: `Bearer ${SECRET_KEY!}`,
          "Content-Type": "application/json",
          Prefer: "return=minimal",
        },
        body: JSON.stringify({ role }),
      }
    );
    if (!res.ok && res.status !== 204) {
      throw new Error(`updateMemberRole gagal: HTTP ${res.status}`);
    }
  },

  /** Hapus anggota (DELETE, service key). */
  async removeWorkspaceMember(workspaceId: string, userId: string): Promise<void> {
    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/workspace_members?workspace_id=eq.${encodeURIComponent(workspaceId)}&user_id=eq.${encodeURIComponent(userId)}`,
      {
        method: "DELETE",
        headers: { apikey: SECRET_KEY!, Authorization: `Bearer ${SECRET_KEY!}` },
      }
    );
    if (!res.ok && res.status !== 204) {
      throw new Error(`removeWorkspaceMember gagal: HTTP ${res.status}`);
    }
  },

  /** Uji koneksi: query tabel `projects`. */
  async ping(): Promise<boolean> {
    try {
      await getRows<{ id: string }>("projects?select=id&limit=1");
      return true;
    } catch {
      return false;
    }
  },

  /** Test akses write (dipakai /api/config atau tooling). */
  async pingWrite(): Promise<boolean> {
    try {
      const res = await fetch(`${SUPABASE_URL}/rest/v1/notes`, {
        method: "POST",
        headers: {
          apikey: SECRET_KEY!,
          Authorization: `Bearer ${SECRET_KEY!}`,
          "Content-Type": "application/json",
          Prefer: "return=minimal",
        },
        body: JSON.stringify({
          id: `ping-${Date.now()}`,
          scope: "__ping__",
          ref_id: "__ping__",
          text: "ping",
        }),
      });
      if (!res.ok && res.status !== 201) return false;
      // cleanup
      await fetch(`${SUPABASE_URL}/rest/v1/notes?scope=eq.__ping__`, {
        method: "DELETE",
        headers: { apikey: SECRET_KEY!, Authorization: `Bearer ${SECRET_KEY!}` },
      });
      return true;
    } catch {
      return false;
    }
  },

  /* ------------------------------------------------------------------ */
  /* Notes (tabel `notes`) — persisten via Supabase                      */
  /* ------------------------------------------------------------------ */

  async getNote(scope: string, id: string): Promise<string> {
    const rows = await getRows<{ text: string }>(
      `notes?scope=eq.${encodeURIComponent(scope)}&ref_id=eq.${encodeURIComponent(id)}&select=text`
    );
    return rows[0]?.text ?? "";
  },

  async saveNote(scope: string, id: string, text: string): Promise<void> {
    const noteId = `note-${scope}-${id}`;
    if (!text.trim()) {
      await fetch(`${SUPABASE_URL}/rest/v1/notes?id=eq.${encodeURIComponent(noteId)}`, {
        method: "DELETE",
        headers: { apikey: SECRET_KEY!, Authorization: `Bearer ${SECRET_KEY!}` },
      });
      return;
    }
    const res = await fetch(`${SUPABASE_URL}/rest/v1/notes?on_conflict=id`, {
      method: "POST",
      headers: {
        apikey: SECRET_KEY!,
        Authorization: `Bearer ${SECRET_KEY!}`,
        "Content-Type": "application/json",
        Prefer: "resolution=merge-duplicates,return=minimal",
      },
      body: JSON.stringify([
        { id: noteId, scope, ref_id: id, text, updated_at: new Date().toISOString() },
      ]),
    });
    if (!res.ok && res.status !== 201) {
      throw new Error(`saveNote gagal: HTTP ${res.status}`);
    }
  },

  /* ------------------------------------------------------------------ */
  /* Saved views (tabel `saved_views`) — persisten via Supabase          */
  /* ------------------------------------------------------------------ */

  async listViews(scope: string): Promise<SavedView[]> {
    const rows = await getRows<SavedView>(
      `saved_views?scope=eq.${encodeURIComponent(scope)}&select=*&order=created_at`
    );
    return rows;
  },

  async upsertView(view: SavedView): Promise<SavedView[]> {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/saved_views?on_conflict=id`, {
      method: "POST",
      headers: {
        apikey: SECRET_KEY!,
        Authorization: `Bearer ${SECRET_KEY!}`,
        "Content-Type": "application/json",
        Prefer: "resolution=merge-duplicates,return=minimal",
      },
      body: JSON.stringify([view]),
    });
    if (!res.ok && res.status !== 201) {
      throw new Error(`upsertView gagal: HTTP ${res.status}`);
    }
    return this.listViews(view.scope);
  },

  async deleteView(id: string, scope: string): Promise<SavedView[]> {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/saved_views?id=eq.${encodeURIComponent(id)}`, {
      method: "DELETE",
      headers: { apikey: SECRET_KEY!, Authorization: `Bearer ${SECRET_KEY!}` },
    });
    if (!res.ok && res.status !== 204) {
      throw new Error(`deleteView gagal: HTTP ${res.status}`);
    }
    return this.listViews(scope);
  },

  /* ------------------------------------------------------------------ */
  /* Activity ledger (audit_log) — server-only read                      */
  /* ------------------------------------------------------------------ */

  /**
   * Baca ledger audit. Selalu baru → descending (terbaru dulu).
   * Filter opsional: tabel / aksi / row_id. Limit dijepit 1..200.
   */
  async listActivity(filters: ActivityFilters = {}, limit = 50): Promise<ActivityEntry[]> {
    const conds: string[] = [];
    if (filters.table) conds.push(`table_name=eq.${encodeURIComponent(filters.table)}`);
    if (filters.action) conds.push(`action=eq.${encodeURIComponent(filters.action)}`);
    if (filters.rowId) conds.push(`row_id=eq.${encodeURIComponent(filters.rowId)}`);
    const safeLimit = Math.min(Math.max(Math.floor(limit), 1), 200);
    const qs = conds.length > 0 ? `${conds.join("&")}&` : "";
    const rows = await getRows<RawAuditLog>(
      `audit_log?${qs}select=*&order=created_at.desc&limit=${safeLimit}`
    );
    return rows.map(mapActivityEntry);
  },
};
