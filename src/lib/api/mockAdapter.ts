/**
 * MockAdapter — mensimulasikan backend sungguhan menggunakan data riset lokal
 * (lib/data) dengan KONTRAK yang identik dengan REST API (termasuk filter &
 * pagination). Saat backend asli (PostgreSQL + CMS) siap, cukup ganti
 * NEXT_PUBLIC_DATA_SOURCE=backend dan semua repository otomatis memanggil HTTP.
 */

import {
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
  buildSearchIndex,
  qaReports,
  behaviorProfiles,
} from "@/lib/data";
import { parseSearchQuery, matchesFacets } from "@/lib/search/parser";
import { marketPlaceholder } from "./fallbacks";
import type { Project } from "@/lib/types/project";
import type { KnowledgeItem } from "@/lib/types/knowledge";
import type { Entity, Relationship } from "@/lib/types/entity";
import type { TimelineEvent } from "@/lib/types/event";
import type { Conflict } from "@/lib/types/conflict";
import type { QAReport, BehaviorProfile } from "@/lib/types/project";
import type { MarketData } from "@/lib/types/market";
import type { SearchResult } from "@/lib/data";
import type { SavedView } from "@/lib/types/view";
import type { ListParams, PageParams, Paginated } from "./types";

const now = () => new Date().toISOString();

/* ------------------------------------------------------------------ */
/* Helpers: filter + pagination (mirror backend query builder)         */
/* ------------------------------------------------------------------ */

function applyParams<T extends { id: string }>(
  items: T[],
  params?: ListParams,
  stringFields: (keyof T)[] = []
): T[] {
  if (!params) return items;
  let out = items;
  const q = params.q?.trim().toLowerCase();
  if (q) {
    out = out.filter((it) =>
      stringFields.some((f) => String(it[f] ?? "").toLowerCase().includes(q))
    );
  }
  if (params.status) out = out.filter((it) => (it as Record<string, unknown>).status === params.status);
  if (params.severity) out = out.filter((it) => (it as Record<string, unknown>).severity === params.severity);
  if (params.type) out = out.filter((it) => (it as Record<string, unknown>).type === params.type);
  if (params.category) out = out.filter((it) => (it as Record<string, unknown>).category === params.category);
  if (params.sort) {
    const dir = params.order === "desc" ? -1 : 1;
    const key = params.sort as keyof T;
    out = [...out].sort((a, b) => {
      const av = a[key];
      const bv = b[key];
      if (typeof av === "number" && typeof bv === "number") return (av - bv) * dir;
      return String(av).localeCompare(String(bv)) * dir;
    });
  }
  return out;
}

function paginate<T>(items: T[], params?: PageParams): Paginated<T> {
  const page = Math.max(1, params?.page ?? 1);
  const pageSize = params?.pageSize ?? 1000;
  const total = items.length;
  const pages = Math.max(1, Math.ceil(total / pageSize));
  const safePage = Math.min(page, pages);
  return {
    items: items.slice((safePage - 1) * pageSize, safePage * pageSize),
    page: safePage,
    pageSize,
    total,
    pages,
  };
}

/* ------------------------------------------------------------------ */
/* Notes & Views: disimpan di localStorage saat mock (seperti DB nanti) */
/* ------------------------------------------------------------------ */

const LS_NOTES = "iw-notes";
const LS_VIEWS = "iw-saved-views";

function lsGet<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function lsSet(key: string, value: unknown): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* ignore */
  }
}

/* ------------------------------------------------------------------ */

export const mockAdapter = {
  /* projects */
  listProjects(params?: ListParams): Promise<Project[]> {
    const filtered = applyParams(getProjects(), params, ["name", "symbol", "tagline"]);
    return Promise.resolve(filtered);
  },
  getProject(slug: string): Promise<Project | undefined> {
    return Promise.resolve(getProjectBySlug(slug));
  },

  /* knowledge */
  listKnowledge(slug: string, params?: ListParams): Promise<KnowledgeItem[]> {
    const filtered = applyParams(getKnowledge(slug), params, ["id", "name", "category", "description"]);
    return Promise.resolve(filtered);
  },
  listKnowledgePaginated(slug: string, params?: PageParams & ListParams): Promise<Paginated<KnowledgeItem>> {
    return Promise.resolve(paginate(getKnowledge(slug), params));
  },
  getKnowledgeItem(slug: string, id: string): Promise<KnowledgeItem | undefined> {
    return Promise.resolve(getKnowledgeItem(slug, id));
  },

  /* entities */
  listEntities(slug: string, params?: ListParams): Promise<Entity[]> {
    const filtered = applyParams(getEntities(slug), params, ["id", "name", "type", "description"]);
    return Promise.resolve(filtered);
  },
  getEntity(slug: string, id: string): Promise<Entity | undefined> {
    return Promise.resolve(getEntity(slug, id));
  },
  listRelationships(slug: string): Promise<Relationship[]> {
    return Promise.resolve(getRelationships(slug));
  },

  /* events */
  listEvents(slug: string, params?: ListParams): Promise<TimelineEvent[]> {
    const filtered = applyParams(getEvents(slug), params, ["id", "name", "type", "description"]);
    return Promise.resolve(filtered);
  },
  listEventsPaginated(slug: string, params?: PageParams & ListParams): Promise<Paginated<TimelineEvent>> {
    return Promise.resolve(paginate(getEvents(slug), params));
  },

  /* conflicts */
  listConflicts(slug: string, params?: ListParams): Promise<Conflict[]> {
    const filtered = applyParams(getConflicts(slug), params, ["id", "title", "category", "description"]);
    return Promise.resolve(filtered);
  },
  listConflictsPaginated(slug: string, params?: PageParams & ListParams): Promise<Paginated<Conflict>> {
    return Promise.resolve(paginate(getConflicts(slug), params));
  },
  getConflict(slug: string, id: string): Promise<Conflict | undefined> {
    return Promise.resolve(getConflict(slug, id));
  },

  /* QA + behavior */
  getQa(slug: string): Promise<QAReport | undefined> {
    return Promise.resolve(qaReports[slug]);
  },
  getBehavior(slug: string): Promise<BehaviorProfile | undefined> {
    return Promise.resolve(behaviorProfiles[slug]);
  },

  /* market — fallback deterministik (mode mock tidak ada jaringan) */
  getMarket(slug: string): Promise<MarketData> {
    return Promise.resolve(marketPlaceholder(slug));
  },

  /* search */
  search(q: string, params?: ListParams): Promise<SearchResult[]> {
    const parsed = parseSearchQuery(q);
    const text = parsed.text.trim().toLowerCase();
    const results = buildSearchIndex()
      .filter((r) => matchesFacets(r, parsed.facets))
      .filter((r) => {
        if (!text) return true;
        return r.keywords.includes(text) || r.label.toLowerCase().includes(text);
      });
    if (params?.q) {
      const qq = params.q.trim().toLowerCase();
      return Promise.resolve(results.filter((r) => r.label.toLowerCase().includes(qq)));
    }
    return Promise.resolve(results);
  },

  /* notes */
  listNotes(): Promise<Record<string, string>> {
    return Promise.resolve(lsGet<Record<string, string>>(LS_NOTES, {}));
  },
  getNote(scope: string, id: string): Promise<string> {
    const all = lsGet<Record<string, string>>(LS_NOTES, {});
    return Promise.resolve(all[`${scope}:${id}`] ?? "");
  },
  saveNote(scope: string, id: string, text: string): Promise<void> {
    const all = lsGet<Record<string, string>>(LS_NOTES, {});
    if (text.trim()) all[`${scope}:${id}`] = text;
    else delete all[`${scope}:${id}`];
    lsSet(LS_NOTES, all);
    return Promise.resolve();
  },

  /* saved views */
  listViews(scope: string): Promise<SavedView[]> {
    const all = lsGet<SavedView[]>(LS_VIEWS, []);
    return Promise.resolve(all.filter((v) => v.scope === scope));
  },
  saveView(view: SavedView): Promise<SavedView[]> {
    const all = lsGet<SavedView[]>(LS_VIEWS, []);
    const next = [...all.filter((v) => !(v.scope === view.scope && v.id === view.id)), view];
    lsSet(LS_VIEWS, next);
    return Promise.resolve(next.filter((v) => v.scope === view.scope));
  },
  removeView(id: string, scope: string): Promise<SavedView[]> {
    const all = lsGet<SavedView[]>(LS_VIEWS, []);
    const next = all.filter((v) => v.id !== id);
    lsSet(LS_VIEWS, next);
    return Promise.resolve(next.filter((v) => v.scope === scope));
  },

  meta() {
    return Promise.resolve({ generatedAt: now(), source: "mock" as const });
  },
};
