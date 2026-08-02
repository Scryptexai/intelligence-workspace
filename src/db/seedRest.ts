/**
 * ─────────────────────────────────────────────────────────────────────────────
 * SEED VIA SUPABASE REST (PostgREST)
 * ─────────────────────────────────────────────────────────────────────────────
 * Mengisi SEMUA tabel relasional dari data riset lib/data melalui REST API —
 * tanpa koneksi pg langsung (cocok untuk serverless/Vercel/GitHub Actions).
 *
 *   - Upsert idempotent: POST + `Prefer: resolution=merge-duplicates`
 *     (sama seperti tools/sync_supabase.py di repo CIF framework).
 *   - Urutan insert menjaga FK: projects → entities → knowledge_items →
 *     evidence_items → relationships → events → conflicts → qa → behavior.
 *   - Dipakai oleh:
 *       1. `scripts/seed-rest.ts`  (CLI: npx tsx scripts/seed-rest.ts)
 *       2. `src/app/api/seed/route.ts`  (GET bootstrap / POST paksa)
 *
 * Membutuhkan env: NEXT_PUBLIC_SUPABASE_URL + SUPABASE_SECRET_KEY.
 */
import {
  getProjects,
  getKnowledge,
  getEntities,
  getRelationships,
  getEvents,
  getConflicts,
  qaReports,
  behaviorProfiles,
} from "@/lib/data";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/\/$/, "");
const SECRET_KEY = process.env.SUPABASE_SECRET_KEY;

export const restSeedEnabled = Boolean(SUPABASE_URL && SECRET_KEY);

/* ------------------------------------------------------------------ */
/* Rows (snake_case, sesuai supabase/schema.sql)                       */
/* ------------------------------------------------------------------ */

interface Row {
  [key: string]: unknown;
}

function projectRows(): Row[] {
  return getProjects().map((p) => ({
    id: p.id,
    slug: p.slug,
    name: p.name,
    symbol: p.symbol,
    tagline: p.tagline,
    description: p.description,
    color: p.color,
    accent: p.accent,
    status: p.status,
    cif_score: p.cifScore,
    confidence: p.confidence,
    knowledge_count: p.knowledgeCount,
    conflict_count: p.conflictCount,
    coverage: p.coverage,
    entity_count: p.entityCount,
    event_count: p.eventCount,
    last_updated: p.lastUpdated,
    last_activity_hours: p.lastActivityHours,
    tags: p.tags,
  }));
}

function knowledgeRows(): Row[] {
  return getProjects().flatMap((p) =>
    getKnowledge(p.slug).map((k) => ({
      id: k.id,
      project_slug: k.projectSlug,
      name: k.name,
      category: k.category,
      description: k.description,
      confidence: k.confidence,
      status: k.status,
      updated_at: k.updatedAt,
      author: k.author,
      related_knowledge: k.relatedKnowledge,
      dependencies: k.dependencies,
    }))
  );
}

function evidenceRows(): Row[] {
  return getProjects().flatMap((p) =>
    getKnowledge(p.slug).flatMap((k) =>
      k.evidence.map((e, i) => ({
        id: e.id,
        knowledge_id: k.id,
        event_id: e.eventId,
        event_name: e.eventName,
        date: e.date,
        source: e.source,
        url: e.url,
        weight: e.weight,
        note: e.note ?? null,
        sort_order: i,
      }))
    )
  );
}

function entityRows(): Row[] {
  return getProjects().flatMap((p) =>
    getEntities(p.slug).map((e) => ({
      id: e.id,
      project_slug: e.projectSlug,
      name: e.name,
      type: e.type,
      status: e.status,
      description: e.description,
      founded: e.founded ?? null,
      related_knowledge: e.relatedKnowledge,
      related_events: e.relatedEvents,
      metadata: e.metadata,
    }))
  );
}

function relationshipRows(): Row[] {
  return getProjects().flatMap((p) =>
    getRelationships(p.slug).map((r) => ({
      id: r.id,
      project_slug: p.slug,
      source: r.source,
      target: r.target,
      type: r.type,
    }))
  );
}

function eventRows(): Row[] {
  return getProjects().flatMap((p) =>
    getEvents(p.slug).map((ev) => ({
      id: ev.id,
      project_slug: ev.projectSlug,
      name: ev.name,
      date: ev.date,
      type: ev.type,
      participants: ev.participants,
      description: ev.description,
      result: ev.result,
      source: ev.source,
      url: ev.url ?? null,
      affected_knowledge: ev.affectedKnowledge,
      impact: ev.impact,
    }))
  );
}

function conflictRows(): Row[] {
  return getProjects().flatMap((p) =>
    getConflicts(p.slug).map((c) => ({
      id: c.id,
      project_slug: c.projectSlug,
      category: c.category,
      title: c.title,
      description: c.description,
      severity: c.severity,
      status: c.status,
      version_a: c.versionA,
      version_b: c.versionB,
      resolution: c.resolution ?? null,
      affected_knowledge: c.affectedKnowledge,
      affected_phase: c.affectedPhase,
      updated_at: c.updatedAt,
    }))
  );
}

function qaDimensionRows(): Row[] {
  return Object.entries(qaReports).flatMap(([slug, qa]) =>
    qa.dimensions.map((d, i) => ({
      id: `${slug}-${d.key}`,
      project_slug: slug,
      key: d.key,
      label: d.label,
      score: d.score,
      weight: d.weight,
      description: d.description,
      sort_order: i,
    }))
  );
}

function qaPhaseRows(): Row[] {
  return Object.entries(qaReports).flatMap(([slug, qa]) =>
    qa.phases.map((ph, i) => ({
      id: `${slug}-phase-${i + 1}`,
      project_slug: slug,
      name: ph.name,
      status: ph.status,
      score: ph.score,
      owner: ph.owner,
      sort_order: i,
    }))
  );
}

function behaviorRows(): Row[] {
  return Object.entries(behaviorProfiles).map(([slug, b]) => ({
    project_slug: slug,
    strategic_objectives: b.strategicObjectives,
    decision_patterns: b.decisionPatterns,
    risk_response: b.riskResponse,
    trade_offs: b.tradeOffs,
  }));
}

/** Urutan penting untuk FK: projects sebelum yang mereferensikannya. */
const TABLES: { table: string; conflict?: string; rows: () => Row[] }[] = [
  { table: "projects", rows: projectRows },
  { table: "entities", rows: entityRows },
  { table: "knowledge_items", rows: knowledgeRows },
  { table: "evidence_items", rows: evidenceRows },
  { table: "relationships", rows: relationshipRows },
  { table: "events", rows: eventRows },
  { table: "conflicts", rows: conflictRows },
  { table: "qa_dimensions", rows: qaDimensionRows },
  { table: "qa_phases", rows: qaPhaseRows },
  { table: "behavior_profiles", conflict: "project_slug", rows: behaviorRows },
];

const CHUNK = 100;

/* ------------------------------------------------------------------ */
/* HTTP                                                                */
/* ------------------------------------------------------------------ */

async function postRows(table: string, rows: Row[], conflict: string): Promise<void> {
  for (let i = 0; i < rows.length; i += CHUNK) {
    const chunk = rows.slice(i, i + CHUNK);
    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/${table}?on_conflict=${conflict}`,
      {
        method: "POST",
        headers: {
          apikey: SECRET_KEY!,
          Authorization: `Bearer ${SECRET_KEY!}`,
          "Content-Type": "application/json",
          Prefer: "resolution=merge-duplicates,return=minimal",
        },
        body: JSON.stringify(chunk),
      }
    );
    if (!res.ok && res.status !== 201) {
      const detail = await res.text().catch(() => "");
      throw new Error(`upsert ${table} gagal: HTTP ${res.status} — ${detail.slice(0, 300)}`);
    }
  }
}

/** True jika tabel `projects` masih kosong (tidak ada row sama sekali). */
export async function isProjectsEmpty(): Promise<boolean> {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/projects?select=id&limit=1`, {
    headers: { apikey: SECRET_KEY!, Authorization: `Bearer ${SECRET_KEY!}` },
    next: { revalidate: 0 },
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`check projects gagal: HTTP ${res.status}`);
  const rows = (await res.json()) as unknown[];
  return rows.length === 0;
}

export interface SeedResult {
  seeded: boolean;
  counts: Record<string, number>;
  skipped?: string;
}

/**
 * Seed semua tabel via REST.
 * - `force=false` (default): hanya jalan jika `projects` kosong (idempotent).
 * - `force=true`: upsert ulang semua baris (merging, aman diulang).
 */
export async function seedViaRest(force = false): Promise<SeedResult> {
  if (!restSeedEnabled) {
    return { seeded: false, counts: {}, skipped: "Supabase REST tidak dikonfigurasi" };
  }
  if (!force && !(await isProjectsEmpty())) {
    return { seeded: false, counts: {}, skipped: "database sudah berisi data" };
  }
  const counts: Record<string, number> = {};
  for (const { table, conflict, rows } of TABLES) {
    const data = rows();
    if (data.length > 0) await postRows(table, data, conflict ?? "id");
    counts[table] = data.length;
  }
  return { seeded: true, counts };
}
