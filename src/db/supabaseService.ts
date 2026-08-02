/**
 * ─────────────────────────────────────────────────────────────────────────────
 * SUPABASE REST DATA SERVICE — TABEL RELASIONAL
 * ─────────────────────────────────────────────────────────────────────────────
 * Membaca database Supabase via PostgREST (HTTPS) dari tabel relasional:
 *
 *   projects, knowledge_items, evidence_items, entities, relationships,
 *   events, conflicts, qa_dimensions, qa_phases, behavior_profiles
 *
 * ID di database ber-prefix slug (mis. "arbitrum-K-001") — service ini
 * men-strip prefix saat mengembalikan ke frontend (menjadi "K-001") supaya
 * konsisten dengan deep-link URL, dan menambah prefix kembali saat lookup.
 *
 * Alasan REST (bukan pg langsung): host DB direct Supabase IPv6-only,
 * tidak terjangkau dari serverless/Vercel/sandbox IPv4. PostgREST HTTPS
 * bekerja di mana saja; secret key dipakai server-side (bypass RLS).
 */
import "dotenv/config"; // pastikan env termuat saat `next start` / tsx (tanpa ini env kosong di production)
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

async function getRows<T>(table: string, query = ""): Promise<T[]> {
  const res = await fetch(
    `${SUPABASE_URL}/rest/v1/${table}${query ? `?${query}` : ""}`,
    {
      headers: {
        apikey: SECRET_KEY!,
        Authorization: `Bearer ${SECRET_KEY!}`,
      },
      cache: "no-store",
    }
  );
  if (!res.ok) throw new Error(`Supabase REST ${res.status}: ${table}`);
  return (await res.json()) as T[];
}

/* ------------------------------------------------------------------ */
/* ID prefix helpers                                                   */
/* ------------------------------------------------------------------ */

/** "arbitrum-K-001" → "K-001" */
function stripPrefix(id: string, slug: string): string {
  return id.startsWith(`${slug}-`) ? id.slice(slug.length + 1) : id;
}

/** "K-001" + "arbitrum" → "arbitrum-K-001" */
function fullId(id: string, slug: string): string {
  return id.startsWith(`${slug}-`) ? id : `${slug}-${id}`;
}

/* ------------------------------------------------------------------ */
/* Mapper: project                                                     */
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
}

interface RawQaPhase {
  name: string;
  status: string;
  score: number;
  owner: string | null;
}

interface RawBehavior {
  strategic_objectives: string[] | null;
  decision_patterns: string[] | null;
  risk_response: string[] | null;
  trade_offs: string[] | null;
}

async function buildProject(p: RawProject): Promise<Project> {
  const [dims, phases, behaviorRows] = await Promise.all([
    getRows<RawQaDim>("qa_dimensions", `project_slug=eq.${p.slug}&select=key,label,score,weight,description&order=sort_order`).catch(() => []),
    getRows<RawQaPhase>("qa_phases", `project_slug=eq.${p.slug}&select=name,status,score,owner&order=sort_order`).catch(() => []),
    getRows<RawBehavior>("behavior_profiles", `project_slug=eq.${p.slug}&select=strategic_objectives,decision_patterns,risk_response,trade_offs&limit=1`).catch(() => []),
  ]);

  const qa: QAReport = {
    total: p.cif_score ?? 0,
    dimensions: dims.map((d) => ({
      key: (d.key ?? d.label.toLowerCase()) as QAReport["dimensions"][number]["key"],
      label: d.label ?? d.key,
      score: d.score,
      weight: d.weight,
      description: d.description ?? "",
    })),
    phases: phases.map((ph) => ({
      name: ph.name,
      status: (ph.status ?? "Pending") as QAReport["phases"][number]["status"],
      score: ph.score ?? 0,
      owner: ph.owner ?? "",
    })),
  };

  const behavior: BehaviorProfile = behaviorRows[0]
    ? {
        strategicObjectives: behaviorRows[0].strategic_objectives ?? [],
        decisionPatterns: behaviorRows[0].decision_patterns ?? [],
        riskResponse: behaviorRows[0].risk_response ?? [],
        tradeOffs: behaviorRows[0].trade_offs ?? [],
      }
    : { strategicObjectives: [], decisionPatterns: [], riskResponse: [], tradeOffs: [] };

  return {
    id: p.id ?? p.slug,
    slug: p.slug,
    name: p.name,
    symbol: p.symbol,
    tagline: p.tagline ?? "",
    description: p.description ?? "",
    color: p.color ?? "#22d3ee",
    accent: p.accent ?? "#0e7490",
    status: (p.status as Project["status"]) ?? "active",
    cifScore: p.cif_score ?? 0,
    confidence: p.confidence ?? 0,
    knowledgeCount: p.knowledge_count ?? 0,
    conflictCount: p.conflict_count ?? 0,
    coverage: p.coverage ?? 0,
    entityCount: p.entity_count ?? 0,
    eventCount: p.event_count ?? 0,
    lastUpdated: p.last_updated ?? "",
    lastActivityHours: p.last_activity_hours ?? 0,
    tags: p.tags ?? [],
    qa,
    behavior,
  };
}

/* ------------------------------------------------------------------ */
/* Mapper: knowledge                                                   */
/* ------------------------------------------------------------------ */

interface RawEvidence {
  id: string;
  event_id: string | null;
  event_name: string;
  date: string | null;
  source: string | null;
  url: string | null;
  weight: number;
  note: string | null;
  sort_order: number;
}

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

async function mapKnowledge(k: RawKnowledge): Promise<KnowledgeItem> {
  const evidence = await getRows<RawEvidence>(
    "evidence_items",
    `knowledge_id=eq.${k.id}&select=*&order=sort_order`
  ).catch(() => []);

  return {
    id: stripPrefix(k.id, k.project_slug),
    projectSlug: k.project_slug,
    name: k.name,
    category: k.category ?? "",
    description: k.description ?? "",
    confidence: k.confidence ?? 0,
    status: (k.status as KnowledgeItem["status"]) ?? "Stable",
    updatedAt: k.updated_at ?? "",
    author: k.author ?? "CIF",
    evidence: evidence.map((e) => ({
      id: stripPrefix(e.id, k.project_slug),
      eventId: e.event_id ? stripPrefix(e.event_id, k.project_slug) : "",
      eventName: e.event_name ?? "",
      date: e.date ?? "",
      source: e.source ?? "",
      url: e.url ?? "#",
      weight: e.weight ?? 1,
      note: e.note ?? undefined,
    })),
    relatedKnowledge: (k.related_knowledge ?? []).map((kid) => stripPrefix(kid, k.project_slug)),
    dependencies: (k.dependencies ?? []).map((d) => stripPrefix(d, k.project_slug)),
  };
}

/* ------------------------------------------------------------------ */
/* Mapper: entity                                                      */
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

function mapEntity(e: RawEntity): Entity {
  return {
    id: stripPrefix(e.id, e.project_slug),
    projectSlug: e.project_slug,
    name: e.name,
    type: (e.type as Entity["type"]) ?? "Company",
    status: (e.status as Entity["status"]) ?? "Unknown",
    description: e.description ?? "",
    founded: e.founded ?? undefined,
    relatedKnowledge: (e.related_knowledge ?? []).map((k) => stripPrefix(k, e.project_slug)),
    relatedEvents: (e.related_events ?? []).map((ev) => stripPrefix(ev, e.project_slug)),
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
    id: stripPrefix(ev.id, ev.project_slug),
    projectSlug: ev.project_slug,
    name: ev.name,
    date: ev.date ?? "",
    type: (ev.type as TimelineEvent["type"]) ?? "Launch",
    participants: ev.participants ?? [],
    description: ev.description ?? "",
    result: ev.result ?? "",
    source: ev.source ?? "",
    url: ev.url ?? undefined,
    affectedKnowledge: (ev.affected_knowledge ?? []).map((k) => stripPrefix(k, ev.project_slug)),
    impact: (ev.impact as TimelineEvent["impact"]) ?? "Medium",
  };
}

/* ------------------------------------------------------------------ */
/* Mapper: conflict                                                    */
/* ------------------------------------------------------------------ */

interface RawVersion {
  source?: string;
  value?: string;
  date?: string;
  url?: string;
  evidence?: string;
}

interface RawConflict {
  id: string;
  project_slug: string;
  category: string | null;
  title: string;
  description: string | null;
  severity: string | null;
  status: string | null;
  version_a: RawVersion;
  version_b: RawVersion;
  resolution: string | null;
  affected_knowledge: string[] | null;
  affected_phase: string | null;
  updated_at: string | null;
}

function mapConflict(c: RawConflict): Conflict {
  return {
    id: stripPrefix(c.id, c.project_slug),
    projectSlug: c.project_slug,
    category: (c.category as Conflict["category"]) ?? "Data",
    title: c.title ?? c.description ?? `Conflict ${stripPrefix(c.id, c.project_slug)}`,
    description: c.description ?? "",
    severity: (c.severity as Conflict["severity"]) ?? "Medium",
    status: (c.status as Conflict["status"]) ?? "Unresolved",
    versionA: {
      source: c.version_a?.source ?? "Version A",
      value: c.version_a?.value ?? "",
      date: c.version_a?.date ?? "",
      url: c.version_a?.url ?? "#",
      evidence: c.version_a?.evidence ?? "",
    },
    versionB: {
      source: c.version_b?.source ?? "Version B",
      value: c.version_b?.value ?? "",
      date: c.version_b?.date ?? "",
      url: c.version_b?.url ?? "#",
      evidence: c.version_b?.evidence ?? "",
    },
    resolution: c.resolution ?? undefined,
    affectedKnowledge: (c.affected_knowledge ?? []).map((k) => stripPrefix(k, c.project_slug)),
    affectedPhase: c.affected_phase ?? "",
    updatedAt: c.updated_at ?? "",
  };
}

/* ------------------------------------------------------------------ */
/* Mapper: relationship                                                */
/* ------------------------------------------------------------------ */

interface RawRelationship {
  id: string;
  project_slug: string;
  source: string;
  target: string;
  type: string;
}

function mapRelationship(r: RawRelationship): Relationship {
  const slug = r.project_slug;
  return {
    id: stripPrefix(r.id, slug),
    source: stripPrefix(r.source, slug),
    target: stripPrefix(r.target, slug),
    type: r.type as Relationship["type"],
  };
}

/* ------------------------------------------------------------------ */
/* Public API                                                          */
/* ------------------------------------------------------------------ */

export const supabaseRest = {
  async listProjects(): Promise<Project[]> {
    const rows = await getRows<RawProject>("projects", "select=*&order=slug");
    const out: Project[] = [];
    for (const p of rows) {
      try {
        out.push(await buildProject(p));
      } catch {
        /* lewati proyek yang gagal */
      }
    }
    return out;
  },

  async getProject(slug: string): Promise<Project | undefined> {
    const rows = await getRows<RawProject>("projects", `slug=eq.${slug}&select=*&limit=1`);
    const p = rows[0];
    if (!p) return undefined;
    return buildProject(p);
  },

  async listKnowledge(slug: string): Promise<KnowledgeItem[]> {
    const rows = await getRows<RawKnowledge>(
      "knowledge_items",
      `project_slug=eq.${slug}&select=*&order=id`
    );
    const out: KnowledgeItem[] = [];
    for (const k of rows) out.push(await mapKnowledge(k));
    return out;
  },

  async getKnowledgeItem(slug: string, id: string): Promise<KnowledgeItem | undefined> {
    const rows = await getRows<RawKnowledge>(
      "knowledge_items",
      `id=eq.${fullId(id, slug)}&select=*&limit=1`
    );
    const k = rows[0];
    if (!k) return undefined;
    return mapKnowledge(k);
  },

  async listEntities(slug: string): Promise<Entity[]> {
    const rows = await getRows<RawEntity>(
      "entities",
      `project_slug=eq.${slug}&select=*&order=name`
    );
    return rows.map(mapEntity);
  },

  async getEntity(slug: string, id: string): Promise<Entity | undefined> {
    const rows = await getRows<RawEntity>(
      "entities",
      `id=eq.${fullId(id, slug)}&select=*&limit=1`
    );
    const e = rows[0];
    if (!e) return undefined;
    return mapEntity(e);
  },

  async listRelationships(slug: string): Promise<Relationship[]> {
    const rows = await getRows<RawRelationship>(
      "relationships",
      `project_slug=eq.${slug}&select=*`
    );
    return rows.map(mapRelationship);
  },

  async listEvents(slug: string): Promise<TimelineEvent[]> {
    const rows = await getRows<RawEvent>(
      "events",
      `project_slug=eq.${slug}&select=*&order=date`
    );
    return rows.map(mapEvent);
  },

  async listConflicts(slug: string): Promise<Conflict[]> {
    const rows = await getRows<RawConflict>(
      "conflicts",
      `project_slug=eq.${slug}&select=*`
    );
    return rows.map(mapConflict);
  },

  async getConflict(slug: string, id: string): Promise<Conflict | undefined> {
    const rows = await getRows<RawConflict>(
      "conflicts",
      `id=eq.${fullId(id, slug)}&select=*&limit=1`
    );
    const c = rows[0];
    if (!c) return undefined;
    return mapConflict(c);
  },

  async search(q: string): Promise<SearchResult[]> {
    const text = q.toLowerCase();
    const results: SearchResult[] = [];
    const push = (r: SearchResult) => {
      if (!text || r.keywords.includes(text) || r.label.toLowerCase().includes(text)) results.push(r);
    };

    const projects = await this.listProjects();
    for (const p of projects) {
      push({
        category: "Project",
        label: p.name,
        sublabel: `${p.symbol} · CIF ${p.cifScore}`,
        href: `/project/${p.slug}`,
        keywords: `${p.name} ${p.symbol} ${p.tagline}`.toLowerCase(),
        confidence: p.confidence,
      });
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

  async ping(): Promise<boolean> {
    try {
      await getRows<unknown>("projects", "select=id&limit=1");
      return true;
    } catch {
      return false;
    }
  },
};
