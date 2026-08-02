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
import type { SearchResult } from "@/lib/data";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/\/$/, "");
const SECRET_KEY = process.env.SUPABASE_SECRET_KEY;

export const supabaseRestEnabled = Boolean(SUPABASE_URL && SECRET_KEY);

/* ------------------------------------------------------------------ */
/* HTTP helper                                                         */
/* ------------------------------------------------------------------ */

async function getRows<T>(path: string): Promise<T[]> {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
    headers: {
      apikey: SECRET_KEY!,
      Authorization: `Bearer ${SECRET_KEY!}`,
    },
    next: { revalidate: 30 },
  });
  if (!res.ok) throw new Error(`Supabase REST ${res.status}: ${path}`);
  return (await res.json()) as T[];
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
    total: p.cif_score,
    dimensions: dims.map((d) => ({
      key: (QA_KEY_MAP[d.key] ?? d.key) as QAReport["dimensions"][number]["key"],
      label: d.label,
      score: d.score,
      weight: d.weight,
      description: d.description ?? "",
    })),
    phases: phases.map((ph) => ({
      name: ph.name,
      status: (ph.status ?? "Not Started") as QAReport["phases"][number]["status"],
      score: ph.score,
      owner: ph.owner ?? "",
    })),
  };

  const behaviorProfile: BehaviorProfile = behavior
    ? {
        strategicObjectives: behavior.strategic_objectives ?? [],
        decisionPatterns: behavior.decision_patterns ?? [],
        riskResponse: behavior.risk_response ?? [],
        tradeOffs: behavior.trade_offs ?? [],
      }
    : { strategicObjectives: [], decisionPatterns: [], riskResponse: [], tradeOffs: [] };

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
    cifScore: p.cif_score,
    confidence: p.confidence,
    knowledgeCount: p.knowledge_count,
    conflictCount: p.conflict_count,
    coverage: p.coverage,
    entityCount: p.entity_count,
    eventCount: p.event_count,
    lastUpdated: p.last_updated ?? "",
    lastActivityHours: p.last_activity_hours,
    tags: p.tags ?? [],
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
    name: k.name,
    category: k.category ?? "",
    description: k.description ?? "",
    confidence: k.confidence,
    status: (k.status as KnowledgeItem["status"]) ?? "Stable",
    updatedAt: k.updated_at ?? "",
    author: k.author ?? "",
    evidence: evs.map((e) => ({
      id: e.id,
      eventId: e.event_id ?? "",
      eventName: e.event_name,
      date: e.date ?? "",
      source: e.source ?? "",
      url: e.url ?? "#",
      weight: e.weight,
      note: e.note ?? undefined,
    })),
    relatedKnowledge: k.related_knowledge ?? [],
    dependencies: k.dependencies ?? [],
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
    name: e.name,
    type: (e.type as Entity["type"]) ?? "Company",
    status: (e.status as Entity["status"]) ?? "Unknown",
    description: e.description ?? "",
    founded: e.founded ?? undefined,
    relatedKnowledge: e.related_knowledge ?? [],
    relatedEvents: e.related_events ?? [],
    metadata: e.metadata ?? {},
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
    name: ev.name,
    date: ev.date ?? "",
    type: (ev.type as TimelineEvent["type"]) ?? "Launch",
    participants: ev.participants ?? [],
    description: ev.description ?? "",
    result: ev.result ?? "",
    source: ev.source ?? "",
    url: ev.url ?? undefined,
    affectedKnowledge: ev.affected_knowledge ?? [],
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
  const vA = c.version_a ?? { source: "Version A", value: "", date: "", url: "#", evidence: "" };
  const vB = c.version_b ?? { source: "Version B", value: "", date: "", url: "#", evidence: "" };
  return {
    id: c.id,
    projectSlug: c.project_slug,
    category: (c.category as Conflict["category"]) ?? "Data",
    title: c.title,
    description: c.description ?? "",
    severity: (c.severity as Conflict["severity"]) ?? "Medium",
    status: (c.status as Conflict["status"]) ?? "Unresolved",
    versionA: vA,
    versionB: vB,
    resolution: c.resolution ?? undefined,
    affectedKnowledge: c.affected_knowledge ?? [],
    affectedPhase: c.affected_phase ?? "",
    updatedAt: c.updated_at ?? "",
  };
}

/* ------------------------------------------------------------------ */
/* Public API                                                          */
/* ------------------------------------------------------------------ */

export const supabaseRest = {
  async listProjects(): Promise<Project[]> {
    const rows = await getRows<RawProject>(`projects?select=*`);
    const out: Project[] = [];
    for (const p of rows) out.push(await buildProject(p));
    return out;
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
    for (const p of projects) {
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
    }
    return results.slice(0, 40);
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
};
