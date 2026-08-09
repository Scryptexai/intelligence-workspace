/**
 * Repository facade (CLIENT-SAFE) — HTTP + mock only.
 *
 *   DATA_SOURCE=mock     → mockAdapter (lib/data, offline)
 *   DATA_SOURCE=backend  → http client → /api (relative in browser)
 *
 * This module is imported by client components, so it must NEVER pull in the
 * database layer (pg/drizzle). Server Components get a faster direct-DB path via
 * `@/lib/api/server` (server-only), which overrides the read methods below.
 */

import { effectiveDataSource } from "./config";
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
import type { ActivityEntry, ActivityFilters } from "@/lib/types/activity";
import type { MemberRole, Workspace, WorkspaceMember } from "@/lib/types/workspace";

/** Mode diputuskan LIVE (bukan build-time) agar auto-detect /api/config berfungsi. */
const isMockMode = (): boolean => effectiveDataSource() === "mock";

/** Bentuk bundle dari GET /projects/{slug} (lihat docs/API_CONTRACT.md). */
export interface ProjectBundle {
  project: Project;
  knowledge: unknown[];
  entities: unknown[];
  events: unknown[];
  conflicts: unknown[];
  relationships: unknown[];
}

export const projectRepository = {
  list(params?: ListParams): Promise<Project[]> {
    return isMockMode()
      ? mockAdapter.listProjects(params)
      : apiGet<Project[]>(ENDPOINTS.projects, params).then((r) => r.data);
  },
  get(slug: string): Promise<Project | undefined> {
    if (isMockMode()) return mockAdapter.getProject(slug);
    return apiGet<ProjectBundle | Project>(ENDPOINTS.project(slug))
      .then((r) => {
        const d = r.data;
        if (d && typeof d === "object" && "project" in d && d.project) {
          return (d as ProjectBundle).project;
        }
        return d as Project;
      })
      .catch(() => undefined);
  },
};

export const knowledgeRepository = {
  list(slug: string, params?: ListParams): Promise<KnowledgeItem[]> {
    return isMockMode()
      ? mockAdapter.listKnowledge(slug, params)
      : apiGet<KnowledgeItem[]>(ENDPOINTS.knowledge(slug), params).then((r) => r.data);
  },
  listPaginated(slug: string, params?: PageParams & ListParams): Promise<Paginated<KnowledgeItem>> {
    if (isMockMode()) return mockAdapter.listKnowledgePaginated(slug, params);
    return apiGet<Paginated<KnowledgeItem>>(ENDPOINTS.knowledge(slug), params).then((r) => r.data);
  },
  get(slug: string, id: string): Promise<KnowledgeItem | undefined> {
    return isMockMode()
      ? mockAdapter.getKnowledgeItem(slug, id)
      : apiGet<KnowledgeItem>(ENDPOINTS.knowledgeItem(slug, id))
          .then((r) => r.data)
          .catch(() => undefined);
  },
};

export const entityRepository = {
  list(slug: string, params?: ListParams): Promise<Entity[]> {
    return isMockMode()
      ? mockAdapter.listEntities(slug, params)
      : apiGet<Entity[]>(ENDPOINTS.entities(slug), params).then((r) => r.data);
  },
  get(slug: string, id: string): Promise<Entity | undefined> {
    return isMockMode()
      ? mockAdapter.getEntity(slug, id)
      : apiGet<Entity>(ENDPOINTS.entities(slug), { id })
          .then((r) => r.data)
          .catch(() => undefined);
  },
  relationships(slug: string): Promise<Relationship[]> {
    return isMockMode()
      ? mockAdapter.listRelationships(slug)
      : apiGet<Relationship[]>(ENDPOINTS.relationships(slug)).then((r) => r.data);
  },
};

export const eventRepository = {
  list(slug: string, params?: ListParams): Promise<TimelineEvent[]> {
    return isMockMode()
      ? mockAdapter.listEvents(slug, params)
      : apiGet<TimelineEvent[]>(ENDPOINTS.events(slug), params).then((r) => r.data);
  },
  listPaginated(slug: string, params?: PageParams & ListParams): Promise<Paginated<TimelineEvent>> {
    if (isMockMode()) return mockAdapter.listEventsPaginated(slug, params);
    return apiGet<Paginated<TimelineEvent>>(ENDPOINTS.events(slug), params).then((r) => r.data);
  },
};

export const conflictRepository = {
  list(slug: string, params?: ListParams): Promise<Conflict[]> {
    return isMockMode()
      ? mockAdapter.listConflicts(slug, params)
      : apiGet<Conflict[]>(ENDPOINTS.conflicts(slug), params).then((r) => r.data);
  },
  listPaginated(slug: string, params?: PageParams & ListParams): Promise<Paginated<Conflict>> {
    if (isMockMode()) return mockAdapter.listConflictsPaginated(slug, params);
    return apiGet<Paginated<Conflict>>(ENDPOINTS.conflicts(slug), params).then((r) => r.data);
  },
  get(slug: string, id: string): Promise<Conflict | undefined> {
    return isMockMode()
      ? mockAdapter.getConflict(slug, id)
      : apiGet<Conflict>(ENDPOINTS.conflict(slug, id))
          .then((r) => r.data)
          .catch(() => undefined);
  },
};

export const qaRepository = {
  get(slug: string): Promise<QAReport | undefined> {
    return isMockMode()
      ? mockAdapter.getQa(slug)
      : apiGet<QAReport>(ENDPOINTS.qa(slug))
          .then((r) => r.data)
          .catch(() => undefined);
  },
};

export const behaviorRepository = {
  get(slug: string): Promise<BehaviorProfile | undefined> {
    return isMockMode()
      ? mockAdapter.getBehavior(slug)
      : apiGet<BehaviorProfile>(ENDPOINTS.behavior(slug))
          .then((r) => r.data)
          .catch(() => undefined);
  },
};

export const marketRepository = {
  get(slug: string): Promise<MarketData> {
    return isMockMode()
      ? mockAdapter.getMarket(slug)
      : apiGet<MarketData>(ENDPOINTS.market(slug)).then((r) => r.data);
  },
};

export const searchRepository = {
  query(q: string, params?: ListParams): Promise<SearchResult[]> {
    return isMockMode()
      ? mockAdapter.search(q, params)
      : apiGet<SearchResult[]>(ENDPOINTS.search, { ...params, q }).then((r) => r.data);
  },
};

export const noteRepository = {
  get(scope: string, id: string): Promise<string> {
    return isMockMode()
      ? mockAdapter.getNote(scope, id)
      : apiGet<string>(ENDPOINTS.note(scope, id)).then((r) => r.data);
  },
  save(scope: string, id: string, text: string): Promise<void> {
    return isMockMode()
      ? mockAdapter.saveNote(scope, id, text)
      : http.post<void>(ENDPOINTS.notes, { scope, id, text });
  },
};

export const viewRepository = {
  list(scope: string): Promise<SavedView[]> {
    return isMockMode()
      ? mockAdapter.listViews(scope)
      : apiGet<SavedView[]>(ENDPOINTS.views, { scope }).then((r) => r.data);
  },
  save(view: SavedView): Promise<SavedView[]> {
    return isMockMode()
      ? mockAdapter.saveView(view)
      : http.post<SavedView[]>(ENDPOINTS.views, view);
  },
  remove(id: string, scope: string): Promise<SavedView[]> {
    return isMockMode()
      ? mockAdapter.removeView(id, scope)
      : http.delete<SavedView[]>(`${ENDPOINTS.view(id)}?scope=${encodeURIComponent(scope)}`);
  },
};

/**
 * Activity ledger — data riil HANYA dari /api/activity (server → audit_log).
 * Mode mock sengaja mengembalikan [] (bukan data palsu); empty-state di UI
 * adalah perilaku yang benar.
 */
export const activityRepository = {
  list(filters?: ActivityFilters): Promise<ActivityEntry[]> {
    return isMockMode()
      ? mockAdapter.listActivity(filters)
      : apiGet<ActivityEntry[]>(ENDPOINTS.activity, {
          table: filters?.table,
          action: filters?.action,
          rowId: filters?.rowId,
          limit: filters?.limit,
        }).then((r) => r.data);
  },
};

/**
 * Workspace & RBAC — data riil HANYA dari server (→ Supabase service key).
 * Mode mock: baca → [] (empty-state); tulis → tolak dengan pesan jelas
 * (bukan fake data).
 */
export const workspaceRepository = {
  listWorkspaces(): Promise<Workspace[]> {
    return isMockMode()
      ? mockAdapter.listWorkspaces()
      : apiGet<Workspace[]>(ENDPOINTS.workspaces).then((r) => r.data);
  },
  listMembers(workspaceId: string): Promise<WorkspaceMember[]> {
    return isMockMode()
      ? mockAdapter.listWorkspaceMembers(workspaceId)
      : apiGet<WorkspaceMember[]>(ENDPOINTS.workspaceMembers(workspaceId)).then((r) => r.data);
  },
  addMember(workspaceId: string, userId: string, role: MemberRole): Promise<void> {
    if (isMockMode()) return mockAdapter.addWorkspaceMember(workspaceId, userId, role);
    return http.post<void>(ENDPOINTS.workspaceMembers(workspaceId), { userId, role });
  },
  updateRole(workspaceId: string, userId: string, role: MemberRole): Promise<void> {
    if (isMockMode()) return mockAdapter.updateMemberRole(workspaceId, userId, role);
    return http.patch<void>(ENDPOINTS.workspaceMember(workspaceId, userId), { role });
  },
  removeMember(workspaceId: string, userId: string): Promise<void> {
    if (isMockMode()) return mockAdapter.removeWorkspaceMember(workspaceId, userId);
    return http.delete<void>(ENDPOINTS.workspaceMember(workspaceId, userId));
  },
};
