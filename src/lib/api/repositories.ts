/**
 * Repository facade — API publik untuk seluruh akses data.
 *
 *   DATA_SOURCE=mock     → mockAdapter (lib/data, offline)
 *   DATA_SOURCE=backend  → http client → REST API (backend/DB sungguhan)
 *
 * Backend Wajib membungkus respons dalam envelope { data, meta } agar
 * metadata (source, version, pagination) tidak hilang. Client meng-unwrap
 * otomatis — repository selalu mengembalikan data murni.
 */

import { DATA_SOURCE } from "./config";
import { mockAdapter } from "./mockAdapter";
import { ENDPOINTS } from "./endpoints";
import { apiGet, http } from "./client";
import type { ListParams, PageParams, Paginated } from "./types";
import type { Project } from "@/lib/types/project";
import type { KnowledgeItem } from "@/lib/types/knowledge";
import type { Entity, Relationship } from "@/lib/types/entity";
import type { TimelineEvent } from "@/lib/types/event";
import type { Conflict } from "@/lib/types/conflict";
import type { QAReport, BehaviorProfile } from "@/lib/types/project";
import type { MarketData } from "@/lib/types/market";
import type { SearchResult } from "@/lib/data";
import type { SavedView } from "@/lib/types/view";

const MOCK = DATA_SOURCE === "mock";

/* ------------------------------------------------------------------ */
/* project                                                             */
/* ------------------------------------------------------------------ */

export const projectRepository = {
  list(params?: ListParams): Promise<Project[]> {
    return MOCK
      ? mockAdapter.listProjects(params)
      : apiGet<Project[]>(ENDPOINTS.projects, params).then((r) => r.data);
  },
  get(slug: string): Promise<Project | undefined> {
    return MOCK
      ? mockAdapter.getProject(slug)
      : apiGet<Project>(ENDPOINTS.project(slug))
          .then((r) => r.data)
          .catch(() => undefined);
  },
};

/* ------------------------------------------------------------------ */
/* knowledge                                                           */
/* ------------------------------------------------------------------ */

export const knowledgeRepository = {
  list(slug: string, params?: ListParams): Promise<KnowledgeItem[]> {
    return MOCK
      ? mockAdapter.listKnowledge(slug, params)
      : apiGet<KnowledgeItem[]>(ENDPOINTS.knowledge(slug), params).then((r) => r.data);
  },
  /** Paginated — untuk backend dengan dataset besar. */
  listPaginated(slug: string, params?: PageParams & ListParams): Promise<Paginated<KnowledgeItem>> {
    if (MOCK) return mockAdapter.listKnowledgePaginated(slug, params);
    return apiGet<Paginated<KnowledgeItem>>(ENDPOINTS.knowledge(slug), params).then((r) => r.data);
  },
  get(slug: string, id: string): Promise<KnowledgeItem | undefined> {
    return MOCK
      ? mockAdapter.getKnowledgeItem(slug, id)
      : apiGet<KnowledgeItem>(ENDPOINTS.knowledgeItem(slug, id))
          .then((r) => r.data)
          .catch(() => undefined);
  },
};

/* ------------------------------------------------------------------ */
/* entity                                                              */
/* ------------------------------------------------------------------ */

export const entityRepository = {
  list(slug: string, params?: ListParams): Promise<Entity[]> {
    return MOCK
      ? mockAdapter.listEntities(slug, params)
      : apiGet<Entity[]>(ENDPOINTS.entities(slug), params).then((r) => r.data);
  },
  get(slug: string, id: string): Promise<Entity | undefined> {
    return MOCK
      ? mockAdapter.getEntity(slug, id)
      : apiGet<Entity>(ENDPOINTS.entities(slug), { id })
          .then((r) => r.data)
          .catch(() => undefined);
  },
  relationships(slug: string): Promise<Relationship[]> {
    return MOCK
      ? mockAdapter.listRelationships(slug)
      : apiGet<Relationship[]>(ENDPOINTS.relationships(slug)).then((r) => r.data);
  },
};

/* ------------------------------------------------------------------ */
/* event                                                               */
/* ------------------------------------------------------------------ */

export const eventRepository = {
  list(slug: string, params?: ListParams): Promise<TimelineEvent[]> {
    return MOCK
      ? mockAdapter.listEvents(slug, params)
      : apiGet<TimelineEvent[]>(ENDPOINTS.events(slug), params).then((r) => r.data);
  },
  listPaginated(slug: string, params?: PageParams & ListParams): Promise<Paginated<TimelineEvent>> {
    if (MOCK) return mockAdapter.listEventsPaginated(slug, params);
    return apiGet<Paginated<TimelineEvent>>(ENDPOINTS.events(slug), params).then((r) => r.data);
  },
};

/* ------------------------------------------------------------------ */
/* conflict                                                            */
/* ------------------------------------------------------------------ */

export const conflictRepository = {
  list(slug: string, params?: ListParams): Promise<Conflict[]> {
    return MOCK
      ? mockAdapter.listConflicts(slug, params)
      : apiGet<Conflict[]>(ENDPOINTS.conflicts(slug), params).then((r) => r.data);
  },
  listPaginated(slug: string, params?: PageParams & ListParams): Promise<Paginated<Conflict>> {
    if (MOCK) return mockAdapter.listConflictsPaginated(slug, params);
    return apiGet<Paginated<Conflict>>(ENDPOINTS.conflicts(slug), params).then((r) => r.data);
  },
  get(slug: string, id: string): Promise<Conflict | undefined> {
    return MOCK
      ? mockAdapter.getConflict(slug, id)
      : apiGet<Conflict>(ENDPOINTS.conflict(slug, id))
          .then((r) => r.data)
          .catch(() => undefined);
  },
};

/* ------------------------------------------------------------------ */
/* qa & behavior                                                       */
/* ------------------------------------------------------------------ */

export const qaRepository = {
  get(slug: string): Promise<QAReport | undefined> {
    return MOCK
      ? mockAdapter.getQa(slug)
      : apiGet<QAReport>(ENDPOINTS.qa(slug))
          .then((r) => r.data)
          .catch(() => undefined);
  },
};

export const behaviorRepository = {
  get(slug: string): Promise<BehaviorProfile | undefined> {
    return MOCK
      ? mockAdapter.getBehavior(slug)
      : apiGet<BehaviorProfile>(ENDPOINTS.behavior(slug))
          .then((r) => r.data)
          .catch(() => undefined);
  },
};

/* ------------------------------------------------------------------ */
/* market                                                              */
/* ------------------------------------------------------------------ */

export const marketRepository = {
  get(slug: string): Promise<MarketData> {
    return MOCK
      ? mockAdapter.getMarket(slug)
      : apiGet<MarketData>(ENDPOINTS.market(slug)).then((r) => r.data);
  },
};

/* ------------------------------------------------------------------ */
/* search                                                              */
/* ------------------------------------------------------------------ */

export const searchRepository = {
  query(q: string, params?: ListParams): Promise<SearchResult[]> {
    return MOCK
      ? mockAdapter.search(q, params)
      : apiGet<SearchResult[]>(ENDPOINTS.search, { ...params, q }).then((r) => r.data);
  },
};

/* ------------------------------------------------------------------ */
/* notes & views (kolaborasi)                                          */
/* ------------------------------------------------------------------ */

export const noteRepository = {
  get(scope: string, id: string): Promise<string> {
    return MOCK
      ? mockAdapter.getNote(scope, id)
      : apiGet<string>(ENDPOINTS.note(scope, id)).then((r) => r.data);
  },
  save(scope: string, id: string, text: string): Promise<void> {
    return MOCK
      ? mockAdapter.saveNote(scope, id, text)
      : http.post<void>(ENDPOINTS.notes, { scope, id, text });
  },
};

export const viewRepository = {
  list(scope: string): Promise<SavedView[]> {
    return MOCK
      ? mockAdapter.listViews(scope)
      : apiGet<SavedView[]>(ENDPOINTS.views, { scope }).then((r) => r.data);
  },
  save(view: SavedView): Promise<SavedView[]> {
    return MOCK
      ? mockAdapter.saveView(view)
      : http.post<SavedView[]>(ENDPOINTS.views, view);
  },
  remove(id: string, scope: string): Promise<SavedView[]> {
    return MOCK
      ? mockAdapter.removeView(id, scope)
      : http.delete<SavedView[]>(`${ENDPOINTS.view(id)}?scope=${encodeURIComponent(scope)}`);
  },
};
