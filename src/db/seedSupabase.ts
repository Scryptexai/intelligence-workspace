/**
 * ─────────────────────────────────────────────────────────────────────────────
 * SEED SUPABASE (PostgREST) — isi tabel yang MASIH KOSONG
 * ─────────────────────────────────────────────────────────────────────────────
 *   npx tsx src/db/seedSupabase.ts
 *
 * Membaca mock data (lib/data) dan mengisi tabel Supabase yang kosong
 * TANPA menimpa data yang sudah ada (data user dilindungi).
 *
 * Yang diisi bila kosong:
 *   - project optimism (jika belum ada)
 *   - knowledge_items + evidence_items (per slug, bila kosong)
 *   - entities, events, conflicts, relationships (bila kosong)
 *   - qa_dimensions, qa_phases, behavior_profiles (upsert)
 *   - update kolom counts di projects (knowledge_count, entity_count, …)
 */
import { getProjects } from "@/lib/data/projects";
import { getKnowledge } from "@/lib/data/knowledge";
import { getEntities } from "@/lib/data/entities";
import { getEvents } from "@/lib/data/events";
import { getConflicts } from "@/lib/data/conflicts";
import { getRelationships } from "@/lib/data/relationships";
import { qaReports } from "@/lib/data/qa";
import { behaviorProfiles as behaviorMock } from "@/lib/data/behavior";

const SUPABASE_URL = (process.env.NEXT_PUBLIC_SUPABASE_URL ?? "").replace(/\/$/, "");
const SECRET = process.env.SUPABASE_SECRET_KEY ?? "";

if (!SUPABASE_URL || !SECRET) {
  console.error("✖ Butuh NEXT_PUBLIC_SUPABASE_URL dan SUPABASE_SECRET_KEY di env.");
  process.exit(1);
}

/* ------------------------------------------------------------------ */
/* HTTP helper                                                         */
/* ------------------------------------------------------------------ */

async function api<T = unknown>(
  method: "GET" | "POST" | "PATCH",
  table: string,
  body?: unknown,
  extraHeaders: Record<string, string> = {}
): Promise<T> {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}`, {
    method,
    headers: {
      apikey: SECRET,
      Authorization: `Bearer ${SECRET}`,
      "Content-Type": "application/json",
      ...extraHeaders,
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
    cache: "no-store",
  });
  if (!res.ok) {
    const t = await res.text().catch(() => "");
    throw new Error(`${method} ${table} ${res.status}: ${t.slice(0, 200)}`);
  }
  const text = await res.text();
  if (!text || res.status === 204) return undefined as T;
  return JSON.parse(text) as T;
}

async function countRows(table: string, where = "", select = "id"): Promise<number> {
  const qs = where ? `?${where}&select=${select}` : `?select=${select}`;
  try {
    const rows = await api<unknown[]>("GET", `${table}${qs}`, undefined);
    return rows.length;
  } catch {
    return 0;
  }
}

/** Upsert dengan on_conflict=id */
async function upsert(table: string, rows: unknown[]): Promise<void> {
  if (!rows.length) return;
  await api("POST", `${table}?on_conflict=id`, rows, {
    Prefer: "resolution=merge-duplicates",
  }).catch((e) => console.warn(`  ⚠ upsert ${table}: ${e.message.slice(0, 120)}`));
}

async function insertIfEmpty(table: string, where: string, rows: unknown[]): Promise<boolean> {
  const existing = await countRows(table, where);
  if (existing > 0) {
    console.log(`  • ${table}: sudah ada ${existing} — dilewati`);
    return false;
  }
  await upsert(table, rows);
  console.log(`  • ${table}: diisi ${rows.length} baris`);
  return true;
}

/* ------------------------------------------------------------------ */
/* Mapper mock → DB (snake_case + prefix id)                           */
/* ------------------------------------------------------------------ */

const prefix = (slug: string, id: string) => (id.startsWith(`${slug}-`) ? id : `${slug}-${id}`);

function mapProject(p: ReturnType<typeof getProjects>[number]) {
  return {
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
  };
}

function mapKnowledge(slug: string, k: ReturnType<typeof getKnowledge>[number]) {
  return {
    id: prefix(slug, k.id),
    project_slug: slug,
    name: k.name,
    category: k.category,
    description: k.description,
    confidence: k.confidence,
    status: k.status,
    updated_at: k.updatedAt,
    author: k.author,
    related_knowledge: k.relatedKnowledge.map((x) => prefix(slug, x)),
    dependencies: k.dependencies.map((x) => prefix(slug, x)),
  };
}

function mapEvidence(slug: string, knowledgeId: string, ev: { id: string; eventId: string; eventName: string; date: string; source: string; url: string; weight: number; note?: string }, idx: number) {
  return {
    id: `${prefix(slug, knowledgeId)}-ev${idx + 1}`,
    knowledge_id: prefix(slug, knowledgeId),
    event_id: ev.eventId ? prefix(slug, ev.eventId) : null,
    event_name: ev.eventName,
    date: ev.date,
    source: ev.source,
    url: ev.url,
    weight: ev.weight,
    note: ev.note ?? null,
    sort_order: idx,
  };
}

function mapEntity(slug: string, e: ReturnType<typeof getEntities>[number]) {
  return {
    id: prefix(slug, e.id),
    project_slug: slug,
    name: e.name,
    type: e.type,
    status: e.status,
    description: e.description,
    founded: e.founded ?? null,
    related_knowledge: e.relatedKnowledge.map((x) => prefix(slug, x)),
    related_events: e.relatedEvents.map((x) => prefix(slug, x)),
    metadata: e.metadata ?? {},
  };
}

function mapEvent(slug: string, ev: ReturnType<typeof getEvents>[number]) {
  return {
    id: prefix(slug, ev.id),
    project_slug: slug,
    name: ev.name,
    date: ev.date,
    type: ev.type,
    participants: ev.participants,
    description: ev.description,
    result: ev.result,
    source: ev.source,
    url: ev.url ?? null,
    affected_knowledge: ev.affectedKnowledge.map((x) => prefix(slug, x)),
    impact: ev.impact,
  };
}

function mapConflict(slug: string, c: ReturnType<typeof getConflicts>[number]) {
  return {
    id: prefix(slug, c.id),
    project_slug: slug,
    category: c.category,
    title: c.title,
    description: c.description,
    severity: c.severity,
    status: c.status,
    version_a: c.versionA,
    version_b: c.versionB,
    resolution: c.resolution ?? null,
    affected_knowledge: c.affectedKnowledge.map((x) => prefix(slug, x)),
    affected_phase: c.affectedPhase,
    updated_at: c.updatedAt,
  };
}

function mapRelationship(slug: string, r: ReturnType<typeof getRelationships>[number]) {
  return {
    id: prefix(slug, r.id),
    project_slug: slug,
    source: prefix(slug, r.source),
    target: prefix(slug, r.target),
    type: r.type,
  };
}

/* ------------------------------------------------------------------ */
/* MAIN                                                                */
/* ------------------------------------------------------------------ */

async function main() {
  console.log("⚡ Seeding Supabase (isi tabel kosong saja)…\n");
  const projects = getProjects();

  for (const p of projects) {
    const slug = p.slug;
    console.log(`── ${p.name} (${slug}) ──`);

    // 1. project — upsert (jangan timpa field yang sudah diisi user)
    const existingProjects = await api<{ id: string }[]>("GET", "projects", undefined, {
      Prefer: "count=exact",
    }).catch(() => []);
    if (existingProjects.some((x) => x.id === slug)) {
      console.log("  • project: sudah ada — hanya update count kosong");
      await api("PATCH", `projects?slug=eq.${slug}`, {
        ...(p.confidence ? { confidence: p.confidence } : {}),
        ...(p.cifScore ? { cif_score: p.cifScore } : {}),
      });
    } else {
      await api("POST", "projects?on_conflict=id", [mapProject(p)], {
        Prefer: "resolution=merge-duplicates",
      });
      console.log("  • project: dibuat");
    }

    // 2. knowledge + evidence
    const kn = getKnowledge(slug);
    if (kn.length > 0) {
      const inserted = await insertIfEmpty(
        "knowledge_items",
        `project_slug=eq.${slug}`,
        kn.map((k) => mapKnowledge(slug, k))
      );
      if (inserted) {
        const evs = kn.flatMap((k) => k.evidence.map((e, i) => mapEvidence(slug, k.id, e, i)));
        await upsert("evidence_items", evs);
        console.log(`  • evidence_items: ${evs.length} baris`);
      }
    }

    // 3. entities
    const ent = getEntities(slug);
    if (ent.length > 0) await insertIfEmpty("entities", `project_slug=eq.${slug}`, ent.map((e) => mapEntity(slug, e)));

    // 4. events
    const evs = getEvents(slug);
    if (evs.length > 0) await insertIfEmpty("events", `project_slug=eq.${slug}`, evs.map((e) => mapEvent(slug, e)));

    // 5. conflicts
    const cfs = getConflicts(slug);
    if (cfs.length > 0) await insertIfEmpty("conflicts", `project_slug=eq.${slug}`, cfs.map((c) => mapConflict(slug, c)));

    // 6. relationships — hanya jika semua entity mock ada (FK valid)
    //    (data user untuk arbitrum punya ID entity berbeda → dilewati)
    const rels = getRelationships(slug);
    if (rels.length > 0) {
      const relsExisting = await countRows("relationships", `project_slug=eq.${slug}`);
      if (relsExisting === 0) {
        const entRows = await api<{ id: string }[]>("GET", `entities?project_slug=eq.${slug}&select=id`).catch(() => []);
        const entIds = new Set(entRows.map((e) => e.id));
        const validRels = rels.filter((r) => entIds.has(prefix(slug, r.source)) && entIds.has(prefix(slug, r.target)));
        if (validRels.length === rels.length) {
          await upsert("relationships", validRels.map((r) => mapRelationship(slug, r)));
          console.log(`  • relationships: diisi ${validRels.length} baris`);
        } else {
          console.log(`  • relationships: dilewati (${rels.length - validRels.length} entity mock tidak ada di DB)`);
        }
      } else {
        console.log(`  • relationships: sudah ada ${relsExisting} — dilewati`);
      }
    }

    // 7. QA — upsert (qa user sudah ada → isi yang kurang saja)
    const qa = qaReports[slug];
    if (qa) {
      const dimsExisting = await countRows("qa_dimensions", `project_slug=eq.${slug}`);
      if (dimsExisting === 0) {
        await api("POST", "qa_dimensions?on_conflict=id", qa.dimensions.map((d, i) => ({
          id: `${slug}-${d.key}`,
          project_slug: slug,
          key: d.key,
          label: d.label,
          score: d.score,
          weight: d.weight,
          description: d.description,
          sort_order: i,
        })), { Prefer: "resolution=merge-duplicates" });
      }
      const phasesExisting = await countRows("qa_phases", `project_slug=eq.${slug}`);
      if (phasesExisting === 0) {
        await api("POST", "qa_phases?on_conflict=id", qa.phases.map((ph, i) => ({
          id: `${slug}-phase-${i + 1}`,
          project_slug: slug,
          name: ph.name,
          status: ph.status,
          score: ph.score,
          owner: ph.owner,
          sort_order: i,
        })), { Prefer: "resolution=merge-duplicates" });
      }
      console.log(`  • qa_dimensions: ${dimsExisting} · qa_phases: ${phasesExisting} (sudah ada, dilewati)`);
    }

    // 8. behavior — kolom PK = project_slug (tanpa on_conflict=id)
    const bh = behaviorMock[slug];
    if (bh) {
      const existingBh = await countRows("behavior_profiles", `project_slug=eq.${slug}`, "project_slug");
      if (existingBh === 0) {
        await api("POST", "behavior_profiles", [
          {
            project_slug: slug,
            strategic_objectives: bh.strategicObjectives,
            decision_patterns: bh.decisionPatterns,
            risk_response: bh.riskResponse,
            trade_offs: bh.tradeOffs,
          },
        ]);
        console.log("  • behavior_profiles: diisi");
      } else {
        console.log("  • behavior_profiles: sudah ada — dilewati");
      }
    }

    // 9. update counts
    const [kc, ec, evc, cc, rc] = await Promise.all([
      countRows("knowledge_items", `project_slug=eq.${slug}`),
      countRows("entities", `project_slug=eq.${slug}`),
      countRows("events", `project_slug=eq.${slug}`),
      countRows("conflicts", `project_slug=eq.${slug}`),
      countRows("relationships", `project_slug=eq.${slug}`),
    ]);
    await api("PATCH", `projects?slug=eq.${slug}`, {
      knowledge_count: kc,
      entity_count: ec,
      event_count: evc,
      conflict_count: cc,
    });
    console.log(`  ✓ counts diperbarui: K${kc} E${ec} Ev${evc} C${cc} R${rc}\n`);
  }

  console.log("✔ Selesai — tabel kosong sudah diisi dari mock data.");
}

main().catch((e) => {
  console.error("✖ Gagal:", e.message);
  process.exit(1);
});
