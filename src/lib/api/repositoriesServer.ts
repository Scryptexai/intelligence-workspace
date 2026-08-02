/**
 * Repository SERVER-ONLY — dipakai oleh Server Components (SSR/SSG).
 * Memanggil dataService langsung (Supabase REST / pg) TANPA self-HTTP fetch,
 * sehingga data terload saat build & tidak ada chain fetch internal.
 *
 * ⚠️ JANGAN import file ini dari Client Components.
 */
import {
  dbGetProject,
  dbListProjects,
  dbListKnowledge,
  dbGetKnowledgeItem,
  dbListEntities,
  dbGetEntity,
  dbListRelationships,
  dbListEvents,
  dbListConflicts,
  dbGetConflict,
  dbGetQa,
  dbGetBehavior,
  dbSearch,
} from "@/db/dataService";
import type { ListParams } from "./types";
import type { Project } from "@/lib/types/project";
import type { KnowledgeItem } from "@/lib/types/knowledge";
import type { Entity, Relationship } from "@/lib/types/entity";
import type { TimelineEvent } from "@/lib/types/event";
import type { Conflict } from "@/lib/types/conflict";
import type { QAReport, BehaviorProfile } from "@/lib/types/project";
import type { SearchResult } from "@/lib/data";

export const projectRepository = {
  list(): Promise<Project[]> {
    return dbListProjects();
  },
  get(slug: string): Promise<Project | undefined> {
    return dbGetProject(slug);
  },
};

export const knowledgeRepository = {
  list(slug: string, params?: ListParams): Promise<KnowledgeItem[]> {
    return dbListKnowledge(slug, params);
  },
  get(slug: string, id: string): Promise<KnowledgeItem | undefined> {
    return dbGetKnowledgeItem(slug, id);
  },
};

export const entityRepository = {
  list(slug: string): Promise<Entity[]> {
    return dbListEntities(slug);
  },
  get(slug: string, id: string): Promise<Entity | undefined> {
    return dbGetEntity(slug, id);
  },
  relationships(slug: string): Promise<Relationship[]> {
    return dbListRelationships(slug);
  },
};

export const eventRepository = {
  list(slug: string): Promise<TimelineEvent[]> {
    return dbListEvents(slug);
  },
};

export const conflictRepository = {
  list(slug: string, params?: ListParams): Promise<Conflict[]> {
    return dbListConflicts(slug, params);
  },
  get(slug: string, id: string): Promise<Conflict | undefined> {
    return dbGetConflict(slug, id);
  },
};

export const qaRepository = {
  get(slug: string): Promise<QAReport | undefined> {
    return dbGetQa(slug);
  },
};

export const behaviorRepository = {
  get(slug: string): Promise<BehaviorProfile | undefined> {
    return dbGetBehavior(slug);
  },
};

export const searchRepository = {
  query(q: string): Promise<SearchResult[]> {
    return dbSearch(q);
  },
};
