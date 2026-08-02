/**
 * ─────────────────────────────────────────────────────────────────────────────
 * BUILD SUPABASE SEED SQL (full dataset)
 * ─────────────────────────────────────────────────────────────────────────────
 * Menghasilkan `supabase/seed.sql` LENGKAP dari data riset (lib/data) —
 * semua knowledge, evidence, entities, relationships, events, conflicts,
 * QA dimensions/phases dan behavior profiles untuk dieksekusi di Supabase
 * SQL Editor (atau psql). Idempotent: setiap INSERT memakai ON CONFLICT
 * DO NOTHING sehingga aman dijalankan berulang.
 *
 *   npx tsx scripts/build-seed-sql.ts
 *
 * (Setara dengan `npx tsx src/db/seed.ts` yang memakai koneksi DB langsung,
 * tetapi tanpa perlu DATABASE_URL — cukup tempel SQL-nya di Supabase.)
 */
import { writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { getProjects } from "@/lib/data/projects";
import { getKnowledge } from "@/lib/data/knowledge";
import { getEntities } from "@/lib/data/entities";
import { getRelationships } from "@/lib/data/relationships";
import { getEvents } from "@/lib/data/events";
import { getConflicts } from "@/lib/data/conflicts";
import { qaReports } from "@/lib/data/qa";
import { behaviorProfiles } from "@/lib/data/behavior";

/* ------------------------------------------------------------------ */
/* SQL helpers                                                         */
/* ------------------------------------------------------------------ */

/** String literal aman (escape single quote). null → NULL. */
function sq(v: unknown): string {
  if (v === null || v === undefined) return "NULL";
  return `'${String(v).replace(/'/g, "''")}'`;
}

/** JSONB literal untuk array/object. null/undefined → NULL. */
function jq(v: unknown): string {
  if (v === null || v === undefined) return "NULL";
  return `'${JSON.stringify(v).replace(/'/g, "''")}'::jsonb`;
}

function num(v: unknown): string {
  return v === null || v === undefined ? "NULL" : String(v);
}

/* ------------------------------------------------------------------ */
/* Builders                                                            */
/* ------------------------------------------------------------------ */

const out: string[] = [];

out.push(`-- ============================================================
-- Intelligence Workspace — SEED DATA LENGKAP untuk Supabase
-- ============================================================
-- File ini DIGENERATE dari data riset (lib/data) oleh:
--   npx tsx scripts/build-seed-sql.ts
--
-- Cara pakai:
--   1. Jalankan migration skema dulu (buat tabel):
--      - npx drizzle-kit push   (dengan DATABASE_URL Supabase), ATAU
--      - tempel isi drizzle/0000_*.sql di Supabase SQL Editor
--   2. Tempel SELURUH isi file ini di Supabase SQL Editor → Run
--      (atau: psql "$DATABASE_URL" -f supabase/seed.sql)
--
-- Idempotent: ON CONFLICT DO NOTHING di setiap INSERT.
-- ============================================================
`);

/* projects */
const projects = getProjects();
out.push("-- Projek");
for (const p of projects) {
  out.push(`INSERT INTO projects (id, slug, name, symbol, tagline, description, color, accent, status, cif_score, confidence, knowledge_count, conflict_count, coverage, entity_count, event_count, last_updated, last_activity_hours, tags)
VALUES (${sq(p.id)}, ${sq(p.slug)}, ${sq(p.name)}, ${sq(p.symbol)}, ${sq(p.tagline)}, ${sq(p.description)}, ${sq(p.color)}, ${sq(p.accent)}, ${sq(p.status)}, ${num(p.cifScore)}, ${num(p.confidence)}, ${num(p.knowledgeCount)}, ${num(p.conflictCount)}, ${num(p.coverage)}, ${num(p.entityCount)}, ${num(p.eventCount)}, ${sq(p.lastUpdated)}, ${num(p.lastActivityHours)}, ${jq(p.tags)})
ON CONFLICT (id) DO NOTHING;`);
}

/* knowledge + evidence */
out.push("\n-- Knowledge items + evidence");
for (const p of projects) {
  for (const k of getKnowledge(p.slug)) {
    out.push(`INSERT INTO knowledge_items (id, project_slug, name, category, description, confidence, status, updated_at, author, related_knowledge, dependencies)
VALUES (${sq(k.id)}, ${sq(k.projectSlug)}, ${sq(k.name)}, ${sq(k.category)}, ${sq(k.description)}, ${num(k.confidence)}, ${sq(k.status)}, ${sq(k.updatedAt)}, ${sq(k.author)}, ${jq(k.relatedKnowledge)}, ${jq(k.dependencies)})
ON CONFLICT (id) DO NOTHING;`);
    k.evidence.forEach((e, i) => {
      out.push(`INSERT INTO evidence_items (id, knowledge_id, event_id, event_name, date, source, url, weight, note, sort_order)
VALUES (${sq(e.id)}, ${sq(k.id)}, ${sq(e.eventId)}, ${sq(e.eventName)}, ${sq(e.date)}, ${sq(e.source)}, ${sq(e.url)}, ${num(e.weight)}, ${sq(e.note)}, ${num(i)})
ON CONFLICT (id) DO NOTHING;`);
    });
  }
}

/* entities */
out.push("\n-- Entities");
for (const p of projects) {
  for (const e of getEntities(p.slug)) {
    out.push(`INSERT INTO entities (id, project_slug, name, type, status, description, founded, related_knowledge, related_events, metadata)
VALUES (${sq(e.id)}, ${sq(e.projectSlug)}, ${sq(e.name)}, ${sq(e.type)}, ${sq(e.status)}, ${sq(e.description)}, ${sq(e.founded)}, ${jq(e.relatedKnowledge)}, ${jq(e.relatedEvents)}, ${jq(e.metadata)})
ON CONFLICT (id) DO NOTHING;`);
  }
}

/* relationships */
out.push("\n-- Relationships");
for (const p of projects) {
  for (const r of getRelationships(p.slug)) {
    out.push(`INSERT INTO relationships (id, project_slug, source, target, type)
VALUES (${sq(r.id)}, ${sq(p.slug)}, ${sq(r.source)}, ${sq(r.target)}, ${sq(r.type)})
ON CONFLICT (id) DO NOTHING;`);
  }
}

/* events */
out.push("\n-- Events");
for (const p of projects) {
  for (const ev of getEvents(p.slug)) {
    out.push(`INSERT INTO events (id, project_slug, name, date, type, participants, description, result, source, url, affected_knowledge, impact)
VALUES (${sq(ev.id)}, ${sq(ev.projectSlug)}, ${sq(ev.name)}, ${sq(ev.date)}, ${sq(ev.type)}, ${jq(ev.participants)}, ${sq(ev.description)}, ${sq(ev.result)}, ${sq(ev.source)}, ${sq(ev.url)}, ${jq(ev.affectedKnowledge)}, ${sq(ev.impact)})
ON CONFLICT (id) DO NOTHING;`);
  }
}

/* conflicts */
out.push("\n-- Conflicts");
for (const p of projects) {
  for (const c of getConflicts(p.slug)) {
    out.push(`INSERT INTO conflicts (id, project_slug, category, title, description, severity, status, version_a, version_b, resolution, affected_knowledge, affected_phase, updated_at)
VALUES (${sq(c.id)}, ${sq(c.projectSlug)}, ${sq(c.category)}, ${sq(c.title)}, ${sq(c.description)}, ${sq(c.severity)}, ${sq(c.status)}, ${jq(c.versionA)}, ${jq(c.versionB)}, ${sq(c.resolution)}, ${jq(c.affectedKnowledge)}, ${sq(c.affectedPhase)}, ${sq(c.updatedAt)})
ON CONFLICT (id) DO NOTHING;`);
  }
}

/* QA dimensions + phases */
out.push("\n-- QA dimensions & phases");
for (const [slug, qa] of Object.entries(qaReports)) {
  qa.dimensions.forEach((d, i) => {
    out.push(`INSERT INTO qa_dimensions (id, project_slug, key, label, score, weight, description, sort_order)
VALUES (${sq(`${slug}-${d.key}`)}, ${sq(slug)}, ${sq(d.key)}, ${sq(d.label)}, ${num(d.score)}, ${num(d.weight)}, ${sq(d.description)}, ${num(i)})
ON CONFLICT (id) DO NOTHING;`);
  });
  qa.phases.forEach((ph, i) => {
    out.push(`INSERT INTO qa_phases (id, project_slug, name, status, score, owner, sort_order)
VALUES (${sq(`${slug}-phase-${i + 1}`)}, ${sq(slug)}, ${sq(ph.name)}, ${sq(ph.status)}, ${num(ph.score)}, ${sq(ph.owner)}, ${num(i)})
ON CONFLICT (id) DO NOTHING;`);
  });
}

/* behavior profiles */
out.push("\n-- Behavior profiles");
for (const [slug, b] of Object.entries(behaviorProfiles)) {
  out.push(`INSERT INTO behavior_profiles (project_slug, strategic_objectives, decision_patterns, risk_response, trade_offs)
VALUES (${sq(slug)}, ${jq(b.strategicObjectives)}, ${jq(b.decisionPatterns)}, ${jq(b.riskResponse)}, ${jq(b.tradeOffs)})
ON CONFLICT (project_slug) DO NOTHING;`);
}

/* ------------------------------------------------------------------ */
/* Write file                                                          */
/* ------------------------------------------------------------------ */

const target = resolve(process.cwd(), "supabase/seed.sql");
writeFileSync(target, out.join("\n") + "\n", "utf8");

const count = (needle: string) =>
  out.filter((l) => l.startsWith(`INSERT INTO ${needle}`)).length;
console.log(`✔ ${target}`);
console.log(
  [
    `  projects:        ${count("projects")}`,
    `  knowledge_items: ${count("knowledge_items")}`,
    `  evidence_items:  ${count("evidence_items")}`,
    `  entities:        ${count("entities")}`,
    `  relationships:   ${count("relationships")}`,
    `  events:          ${count("events")}`,
    `  conflicts:       ${count("conflicts")}`,
    `  qa_dimensions:   ${count("qa_dimensions")}`,
    `  qa_phases:       ${count("qa_phases")}`,
    `  behavior:        ${count("behavior_profiles")}`,
  ].join("\n")
);
