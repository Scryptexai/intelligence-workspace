/**
 * ─────────────────────────────────────────────────────────────────────────────
 * SEED DATABASE
 * ─────────────────────────────────────────────────────────────────────────────
 * Mengisi seluruh tabel dari data riset mock (lib/data) ke PostgreSQL/Supabase.
 *
 *   npx tsx src/db/seed.ts
 *
 * Idempotent: aman dijalankan berulang (upsert by primary key).
 */
import { db, pool } from "./index";
import {
  projects,
  knowledgeItems,
  evidenceItems,
  entities,
  relationships,
  events,
  conflicts,
  qaDimensions,
  qaPhases,
  behaviorProfiles,
} from "./schema";
import { getProjects } from "@/lib/data/projects";
import { getKnowledge } from "@/lib/data/knowledge";
import { getEntities } from "@/lib/data/entities";
import { getRelationships } from "@/lib/data/relationships";
import { getEvents } from "@/lib/data/events";
import { getConflicts } from "@/lib/data/conflicts";
import { qaReports } from "@/lib/data/qa";
import { behaviorProfiles as behaviorMock } from "@/lib/data/behavior";

async function seed() {
  if (!db || !pool) {
    console.error("✖ DATABASE_URL belum diset. Jalankan dengan env DB terlebih dahulu.");
    process.exit(1);
  }

  console.log("⚡ Menyemai database…");
  let count = 0;

  for (const p of getProjects()) {
    await db
      .insert(projects)
      .values({
        id: p.id,
        slug: p.slug,
        name: p.name,
        symbol: p.symbol,
        tagline: p.tagline,
        description: p.description,
        color: p.color,
        accent: p.accent,
        status: p.status,
        cifScore: p.cifScore,
        confidence: p.confidence,
        knowledgeCount: p.knowledgeCount,
        conflictCount: p.conflictCount,
        coverage: p.coverage,
        entityCount: p.entityCount,
        eventCount: p.eventCount,
        lastUpdated: p.lastUpdated,
        lastActivityHours: p.lastActivityHours,
        tags: p.tags,
      })
      .onConflictDoUpdate({ target: projects.id, set: { name: p.name, cifScore: p.cifScore } });
    count++;

    // knowledge + evidence
    for (const k of getKnowledge(p.slug)) {
      await db
        .insert(knowledgeItems)
        .values({
          id: k.id,
          projectSlug: p.slug,
          name: k.name,
          category: k.category,
          description: k.description,
          confidence: k.confidence,
          status: k.status,
          updatedAt: k.updatedAt,
          author: k.author,
          relatedKnowledge: k.relatedKnowledge,
          dependencies: k.dependencies,
        })
        .onConflictDoUpdate({ target: knowledgeItems.id, set: { name: k.name } });
      for (let i = 0; i < k.evidence.length; i++) {
        const ev = k.evidence[i];
        await db
          .insert(evidenceItems)
          .values({
            id: ev.id,
            knowledgeId: k.id,
            eventId: ev.eventId,
            eventName: ev.eventName,
            date: ev.date,
            source: ev.source,
            url: ev.url,
            weight: ev.weight,
            note: ev.note ?? null,
            sortOrder: i,
          })
          .onConflictDoUpdate({ target: evidenceItems.id, set: { eventName: ev.eventName } });
      }
    }

    // entities
    for (const e of getEntities(p.slug)) {
      await db
        .insert(entities)
        .values({
          id: e.id,
          projectSlug: p.slug,
          name: e.name,
          type: e.type,
          status: e.status,
          description: e.description,
          founded: e.founded ?? null,
          relatedKnowledge: e.relatedKnowledge,
          relatedEvents: e.relatedEvents,
          metadata: e.metadata ?? {},
        })
        .onConflictDoUpdate({ target: entities.id, set: { name: e.name } });
    }

    // relationships
    for (const r of getRelationships(p.slug)) {
      await db
        .insert(relationships)
        .values({ id: r.id, projectSlug: p.slug, source: r.source, target: r.target, type: r.type })
        .onConflictDoUpdate({ target: relationships.id, set: { type: r.type } });
    }

    // events
    for (const ev of getEvents(p.slug)) {
      await db
        .insert(events)
        .values({
          id: ev.id,
          projectSlug: p.slug,
          name: ev.name,
          date: ev.date,
          type: ev.type,
          participants: ev.participants,
          description: ev.description,
          result: ev.result,
          source: ev.source,
          url: ev.url ?? null,
          affectedKnowledge: ev.affectedKnowledge,
          impact: ev.impact,
        })
        .onConflictDoUpdate({ target: events.id, set: { name: ev.name } });
    }

    // conflicts
    for (const c of getConflicts(p.slug)) {
      await db
        .insert(conflicts)
        .values({
          id: c.id,
          projectSlug: p.slug,
          category: c.category,
          title: c.title,
          description: c.description,
          severity: c.severity,
          status: c.status,
          versionA: c.versionA,
          versionB: c.versionB,
          resolution: c.resolution ?? null,
          affectedKnowledge: c.affectedKnowledge,
          affectedPhase: c.affectedPhase,
          updatedAt: c.updatedAt,
        })
        .onConflictDoUpdate({ target: conflicts.id, set: { title: c.title } });
    }

    // QA dimensions & phases
    const qa = qaReports[p.slug];
    if (qa) {
      for (let i = 0; i < qa.dimensions.length; i++) {
        const d = qa.dimensions[i];
        await db
          .insert(qaDimensions)
          .values({
            id: `${p.slug}-${d.key}`,
            projectSlug: p.slug,
            key: d.key,
            label: d.label,
            score: d.score,
            weight: d.weight,
            description: d.description,
            sortOrder: i,
          })
          .onConflictDoUpdate({ target: qaDimensions.id, set: { score: d.score } });
      }
      for (let i = 0; i < qa.phases.length; i++) {
        const ph = qa.phases[i];
        await db
          .insert(qaPhases)
          .values({
            id: `${p.slug}-phase-${i + 1}`,
            projectSlug: p.slug,
            name: ph.name,
            status: ph.status,
            score: ph.score,
            owner: ph.owner,
            sortOrder: i,
          })
          .onConflictDoUpdate({ target: qaPhases.id, set: { status: ph.status } });
      }
    }

    // behavior
    const b = behaviorMock[p.slug];
    if (b) {
      await db
        .insert(behaviorProfiles)
        .values({
          projectSlug: p.slug,
          strategicObjectives: b.strategicObjectives,
          decisionPatterns: b.decisionPatterns,
          riskResponse: b.riskResponse,
          tradeOffs: b.tradeOffs,
        })
        .onConflictDoUpdate({
          target: behaviorProfiles.projectSlug,
          set: { strategicObjectives: b.strategicObjectives },
        });
    }
  }

  console.log(`✔ Selesai — ${count} proyek + knowledge, entities, events, conflicts, QA, behavior disemai.`);
  await pool.end();
}

seed().catch((e) => {
  console.error("✖ Gagal menyemai:", e);
  process.exit(1);
});
