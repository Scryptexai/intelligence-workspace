/**
 * ─────────────────────────────────────────────────────────────────────────────
 * SUPABASE REST DATA SERVICE
 * ─────────────────────────────────────────────────────────────────────────────
 * Membaca database Supabase melalui PostgREST (HTTPS) dari tabel GENERIC
 * `cif_datasets` — format yang dipakai oleh database Anda:
 *
 *   cif_datasets(project_slug, kind, payload jsonb)
 *
 *   kind: "project" | "knowledge" | "entities" | "events" | "conflicts"
 *   plus `__index__` berisi: kind="projects" (daftar proyek),
 *                            kind="relationships" (daftar edge graph)
 *
 * Alasan REST (bukan pg langsung): host DB direct Supabase sering IPv6-only
 * (tidak terjangkau dari serverless/Vercel/sandbox IPv4). PostgREST HTTPS
 * bekerja di mana saja, dan secret key dipakai server-side untuk bypass RLS.
 *
 * Seluruh hasil dipetakan ke tipe aplikasi (src/lib/types/*).
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

async function getTable<T>(path: string): Promise<T> {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
    headers: {
      apikey: SECRET_KEY!,
      Authorization: `Bearer ${SECRET_KEY!}`,
    },
    next: { revalidate: 60 },
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`Supabase REST ${res.status}: ${path}`);
  return (await res.json()) as T;
}

/** Ambil payload dari satu baris cif_datasets. */
async function fetchKind(projectSlug: string, kind: string): Promise<unknown> {
  const rows = await getTable<{ payload: unknown }[]>(
    `cif_datasets?project_slug=eq.${encodeURIComponent(projectSlug)}&kind=eq.${encodeURIComponent(kind)}&select=payload&limit=1`
  );
  return rows[0]?.payload;
}

/* ------------------------------------------------------------------ */
/* Mapper: project                                                     */
/* ------------------------------------------------------------------ */

interface RawQaItem { name: string; value: number; weight: number }
interface RawPhase { phase: string; status: string; progress: number }

interface RawProject {
  id: string;
  name: string;
  symbol: string;
  description: string;
  category?: string;
  cifScore: number;
  confidence: number;
  coverage: number;
  entityCount: number;
  eventCount: number;
  knowledgeCount: number;
  conflictCount: number;
  lastUpdated?: string;
  accentFrom?: string;
  accentTo?: string;
  accentSolid?: string;
  qa?: RawQaItem[];
  phases?: RawPhase[];
  behavior?: Record<string, unknown>;
  trends?: Record<string, { data: number[]; delta: number }>;
}

function mapProject(p: RawProject): Project {
  const qa: QAReport = {
    total: p.cifScore,
    dimensions: (p.qa ?? []).map((d, i) => ({
      key: (d.name.toLowerCase().replace(/[^a-z]+/g, "") || `dim-${i}`) as QAReport["dimensions"][number]["key"],
      label: d.name,
      score: d.value,
      weight: Math.round((d.weight ?? 0) * 100),
      description: "",
    })),
    phases: (p.phases ?? []).map((ph) => ({
      name: ph.phase,
      status: (ph.status ?? "Pending") as QAReport["phases"][number]["status"],
      score: ph.progress ?? 0,
      owner: "",
    })),
  };

  const behavior: BehaviorProfile = {
    strategicObjectives: (p.behavior?.strategicObjectives as string[]) ?? [],
    decisionPatterns: (p.behavior?.decisionPatterns as string[]) ?? [],
    riskResponse: (p.behavior?.riskResponse as string[]) ?? [],
    tradeOffs: (p.behavior?.tradeOffs as string[]) ?? [],
  };

  return {
    id: p.id,
    slug: p.id,
    name: p.name,
    symbol: p.symbol,
    tagline: p.category ?? "",
    description: p.description ?? "",
    color: p.accentFrom ?? "#22d3ee",
    accent: p.accentTo ?? "#0e7490",
    status: "active",
    cifScore: p.cifScore ?? 0,
    confidence: p.confidence ?? 0,
    knowledgeCount: p.knowledgeCount ?? 0,
    conflictCount: p.conflictCount ?? 0,
    coverage: p.coverage ?? 0,
    entityCount: p.entityCount ?? 0,
    eventCount: p.eventCount ?? 0,
    lastUpdated: p.lastUpdated ?? "",
    lastActivityHours: 0,
    tags: [],
    qa,
    behavior,
  };
}

/* ------------------------------------------------------------------ */
/* Mapper: knowledge                                                   */
/* ------------------------------------------------------------------ */

interface RawEvidence {
  date?: string;
  source?: string;
  weight?: number;
  eventId?: string;
  excerpt?: string;
  eventName?: string;
  sourceUrl?: string;
}

interface RawKnowledge {
  id: string;
  name: string;
  status?: string;
  category?: string;
  confidence?: number;
  description?: string;
  updatedAt?: string;
  dependencies?: string[];
  relatedKnowledge?: string[];
  projectId: string;
  evidence?: RawEvidence[];
}

function mapKnowledge(k: RawKnowledge): KnowledgeItem {
  return {
    id: k.id,
    projectSlug: k.projectId,
    name: k.name,
    category: k.category ?? "",
    description: k.description ?? "",
    confidence: k.confidence ?? 0,
    status: (k.status as KnowledgeItem["status"]) ?? "Stable",
    updatedAt: k.updatedAt ?? "",
    author: "",
    evidence: (k.evidence ?? []).map((e, i) => ({
      id: `ev-${k.id}-${i + 1}`,
      eventId: e.eventId ?? "",
      eventName: e.eventName ?? "",
      date: e.date ?? "",
      source: e.source ?? "",
      url: e.sourceUrl ?? "#",
      weight: e.weight ?? 1,
      note: e.excerpt,
    })),
    relatedKnowledge: k.relatedKnowledge ?? [],
    dependencies: k.dependencies ?? [],
  };
}

/* ------------------------------------------------------------------ */
/* Mapper: entity                                                      */
/* ------------------------------------------------------------------ */

interface RawEntity {
  id: string;
  name: string;
  type: string;
  status?: string;
  description?: string;
  relatedEvents?: string[];
  relatedKnowledge?: string[];
  projectId: string;
  x?: number;
  y?: number;
  founded?: string;
  metadata?: Record<string, string>;
}

function mapEntity(e: RawEntity): Entity {
  return {
    id: e.id,
    projectSlug: e.projectId,
    name: e.name,
    type: (e.type as Entity["type"]) ?? "Company",
    status: (e.status as Entity["status"]) ?? "Unknown",
    description: e.description ?? "",
    founded: e.founded,
    relatedKnowledge: e.relatedKnowledge ?? [],
    relatedEvents: e.relatedEvents ?? [],
    metadata: { ...(e.metadata ?? {}), x: String(e.x ?? 0), y: String(e.y ?? 0) },
  };
}

/* ------------------------------------------------------------------ */
/* Mapper: event                                                       */
/* ------------------------------------------------------------------ */

interface RawEvent {
  id: string;
  name: string;
  date?: string;
  type: string;
  description?: string;
  result?: string;
  source?: string;
  sourceUrl?: string;
  participants?: string[];
  affectedKnowledge?: string[];
  projectId: string;
  impact?: string;
}

function mapEvent(ev: RawEvent): TimelineEvent {
  return {
    id: ev.id,
    projectSlug: ev.projectId,
    name: ev.name,
    date: ev.date ?? "",
    type: (ev.type as TimelineEvent["type"]) ?? "Launch",
    participants: ev.participants ?? [],
    description: ev.description ?? "",
    result: ev.result ?? "",
    source: ev.source ?? "",
    url: ev.sourceUrl ?? undefined,
    affectedKnowledge: ev.affectedKnowledge ?? [],
    impact: (ev.impact as TimelineEvent["impact"]) ?? "Medium",
  };
}

/* ------------------------------------------------------------------ */
/* Mapper: conflict                                                    */
/* ------------------------------------------------------------------ */

interface RawVersion {
  url?: string;
  date?: string;
  value: string;
  source: string;
  evidence?: string;
  reliability?: string;
}

interface RawConflict {
  id: string;
  status?: string;
  category?: string;
  severity?: string;
  versionA: RawVersion;
  versionB: RawVersion;
  projectId: string;
  resolution?: string;
  description?: string;
  affectedPhase?: string;
  affectedKnowledge?: string[];
}

function mapConflict(c: RawConflict): Conflict {
  return {
    id: c.id,
    projectSlug: c.projectId,
    category: (c.category as Conflict["category"]) ?? "Data",
    title: c.description ?? `Conflict ${c.id}`,
    description:
      `${c.versionA?.source ?? "A"}: ${c.versionA?.value ?? "…"} — vs — ${c.versionB?.source ?? "B"}: ${c.versionB?.value ?? "…"}`,
    severity: (c.severity as Conflict["severity"]) ?? "Medium",
    status: (c.status as Conflict["status"]) ?? "Unresolved",
    versionA: {
      source: c.versionA?.source ?? "Version A",
      value: c.versionA?.value ?? "",
      date: c.versionA?.date ?? "",
      url: c.versionA?.url ?? "#",
      evidence: c.versionA?.evidence ?? "",
    },
    versionB: {
      source: c.versionB?.source ?? "Version B",
      value: c.versionB?.value ?? "",
      date: c.versionB?.date ?? "",
      url: c.versionB?.url ?? "#",
      evidence: c.versionB?.evidence ?? "",
    },
    resolution: c.resolution ?? undefined,
    affectedKnowledge: c.affectedKnowledge ?? [],
    affectedPhase: c.affectedPhase ?? "",
    updatedAt: "",
  };
}

/* ------------------------------------------------------------------ */
/* Mapper: relationship                                                */
/* ------------------------------------------------------------------ */

interface RawRelationship {
  id: string;
  type: string;
  source: string;
  target: string;
}

function mapRelationship(r: RawRelationship): Relationship {
  return { id: r.id, source: r.source, target: r.target, type: r.type as Relationship["type"] };
}

/* ------------------------------------------------------------------ */
/* Public API                                                          */
/* ------------------------------------------------------------------ */

export const supabaseRest = {
  async listProjects(): Promise<Project[]> {
    const payload = (await fetchKind("__index__", "projects")) as RawProject[] | null;
    if (!Array.isArray(payload)) return [];
    return payload.map(mapProject);
  },

  async getProject(slug: string): Promise<Project | undefined> {
    const payload = (await fetchKind(slug, "project")) as RawProject | null;
    if (!payload || typeof payload !== "object") return undefined;
    return mapProject(payload);
  },

  async listKnowledge(slug: string): Promise<KnowledgeItem[]> {
    const payload = (await fetchKind(slug, "knowledge")) as RawKnowledge[] | null;
    if (!Array.isArray(payload)) return [];
    return payload.map(mapKnowledge);
  },

  async getKnowledgeItem(slug: string, id: string): Promise<KnowledgeItem | undefined> {
    const items = await this.listKnowledge(slug);
    return items.find((k) => k.id === id);
  },

  async listEntities(slug: string): Promise<Entity[]> {
    const payload = (await fetchKind(slug, "entities")) as RawEntity[] | null;
    if (!Array.isArray(payload)) return [];
    return payload.map(mapEntity);
  },

  async getEntity(slug: string, id: string): Promise<Entity | undefined> {
    const items = await this.listEntities(slug);
    return items.find((e) => e.id === id);
  },

  async listRelationships(slug: string): Promise<Relationship[]> {
    // relationships disimpan sekali di __index__
    const payload = (await fetchKind("__index__", "relationships")) as RawRelationship[] | null;
    if (!Array.isArray(payload)) return [];
    return payload.map(mapRelationship);
  },

  async listEvents(slug: string): Promise<TimelineEvent[]> {
    const payload = (await fetchKind(slug, "events")) as RawEvent[] | null;
    if (!Array.isArray(payload)) return [];
    return payload.map(mapEvent);
  },

  async listConflicts(slug: string): Promise<Conflict[]> {
    const payload = (await fetchKind(slug, "conflicts")) as RawConflict[] | null;
    if (!Array.isArray(payload)) return [];
    return payload.map(mapConflict);
  },

  async getConflict(slug: string, id: string): Promise<Conflict | undefined> {
    const items = await this.listConflicts(slug);
    return items.find((c) => c.id === id);
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

  async ping(): Promise<boolean> {
    try {
      await getTable<unknown[]>("cif_datasets?select=id&limit=1");
      return true;
    } catch {
      return false;
    }
  },
};
