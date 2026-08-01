import { getProjects, getProjectBySlug } from "./projects";
import { getKnowledge, getKnowledgeItem } from "./knowledge";
import { getEntities, getEntity } from "./entities";
import { getEvents } from "./events";
import { getConflicts, getConflict } from "./conflicts";
import { getRelationships } from "./relationships";
import { qaReports } from "./qa";
import { behaviorProfiles } from "./behavior";

export type SearchCategory =
  | "Project"
  | "Knowledge"
  | "Entity"
  | "Event"
  | "Conflict";

export interface SearchResult {
  category: SearchCategory;
  label: string;
  sublabel: string;
  href: string;
  keywords: string;
  /** Facet fields for the faceted search parser */
  status?: string;
  confidence?: number;
  severity?: string;
  domain?: string;
}

export function buildSearchIndex(): SearchResult[] {
  const results: SearchResult[] = [];

  for (const p of getProjects()) {
    results.push({
      category: "Project",
      label: p.name,
      sublabel: `${p.symbol} · CIF ${p.cifScore}`,
      href: `/project/${p.slug}`,
      keywords: `${p.name} ${p.symbol} ${p.tagline}`.toLowerCase(),
      confidence: p.confidence,
    });

    for (const k of getKnowledge(p.slug)) {
      results.push({
        category: "Knowledge",
        label: k.name,
        sublabel: `${k.id} · ${k.category} · ${k.status}`,
        href: `/project/${p.slug}/knowledge/${k.id}`,
        keywords: `${k.id} ${k.name} ${k.category} ${k.description}`.toLowerCase(),
        status: k.status,
        confidence: k.confidence,
        domain: k.category,
      });
    }

    for (const e of getEntities(p.slug)) {
      results.push({
        category: "Entity",
        label: e.name,
        sublabel: `${e.type} · ${e.status}`,
        href: `/project/${p.slug}/graph?node=${e.id}`,
        keywords: `${e.id} ${e.name} ${e.type} ${e.description}`.toLowerCase(),
        status: e.status,
        domain: e.type,
      });
    }

    for (const ev of getEvents(p.slug)) {
      results.push({
        category: "Event",
        label: ev.name,
        sublabel: `${ev.id} · ${ev.type} · ${ev.date}`,
        href: `/project/${p.slug}/timeline?event=${ev.id}`,
        keywords: `${ev.id} ${ev.name} ${ev.type} ${ev.description}`.toLowerCase(),
        domain: ev.type,
      });
    }

    for (const c of getConflicts(p.slug)) {
      results.push({
        category: "Conflict",
        label: c.title,
        sublabel: `${c.id} · ${c.severity} · ${c.status}`,
        href: `/project/${p.slug}/conflicts/${c.id}`,
        keywords: `${c.id} ${c.title} ${c.category} ${c.description}`.toLowerCase(),
        status: c.status,
        severity: c.severity,
        domain: c.category,
      });
    }
  }

  return results;
}

export {
  getProjects,
  getProjectBySlug,
  getKnowledge,
  getKnowledgeItem,
  getEntities,
  getEntity,
  getEvents,
  getConflicts,
  getConflict,
  getRelationships,
  qaReports,
  behaviorProfiles,
};
