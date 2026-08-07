import "server-only";
/**
 * Server-only repository facade — used by Server Components / RSC pages.
 *
 * Reads the database DIRECTLY via src/db/dataService.ts (no HTTP self-fetch),
 * which fixes the Vercel bug where SSR self-fetch to an absolute URL got
 * redirected to the deployment-protection page (HTML, not JSON) and left pages
 * empty ("only entity & timeline load"). Direct DB access is also faster and
 * works identically in the sandbox and on Vercel.
 *
 * In mock mode it defers to the client-safe repositories (mockAdapter). For any
 * failure it falls back to the client-safe HTTP repository so behaviour never
 * regresses.
 *
 * `import "server-only"` guarantees this file (and its pg/drizzle dependency via
 * dataService) can never be pulled into a client bundle.
 */
import { effectiveDataSource } from "./config";
import * as R from "./repositories";
import * as db from "@/db/dataService";
import type { ListParams } from "./types";
import type { Project } from "@/lib/types/project";
import type { KnowledgeItem } from "@/lib/types/knowledge";
import type { Entity, Relationship } from "@/lib/types/entity";
import type { TimelineEvent } from "@/lib/types/event";
import type { Conflict } from "@/lib/types/conflict";
import type { QAReport, BehaviorProfile } from "@/lib/types/project";
import type { SearchResult } from "@/lib/data";

const isMock = (): boolean => effectiveDataSource() === "mock";

export const projectRepository = {
  async list(params?: ListParams): Promise<Project[]> {
    if (isMock()) return R.projectRepository.list(params);
    try {
      return await db.dbListProjects();
    } catch {
      return R.projectRepository.list(params);
    }
  },
  async get(slug: string): Promise<Project | undefined> {
    if (isMock()) return R.projectRepository.get(slug);
    try {
      return await db.dbGetProject(slug);
    } catch {
      return R.projectRepository.get(slug);
    }
  },
};

export const knowledgeRepository = {
  async list(slug: string, params?: ListParams): Promise<KnowledgeItem[]> {
    if (isMock()) return R.knowledgeRepository.list(slug, params);
    try {
      return await db.dbListKnowledge(slug, params);
    } catch {
      return R.knowledgeRepository.list(slug, params);
    }
  },
  listPaginated: R.knowledgeRepository.listPaginated,
  async get(slug: string, id: string): Promise<KnowledgeItem | undefined> {
    if (isMock()) return R.knowledgeRepository.get(slug, id);
    try {
      return await db.dbGetKnowledgeItem(slug, id);
    } catch {
      return R.knowledgeRepository.get(slug, id);
    }
  },
};

export const entityRepository = {
  async list(slug: string, params?: ListParams): Promise<Entity[]> {
    if (isMock()) return R.entityRepository.list(slug, params);
    try {
      return await db.dbListEntities(slug);
    } catch {
      return R.entityRepository.list(slug, params);
    }
  },
  async get(slug: string, id: string): Promise<Entity | undefined> {
    if (isMock()) return R.entityRepository.get(slug, id);
    try {
      return await db.dbGetEntity(slug, id);
    } catch {
      return R.entityRepository.get(slug, id);
    }
  },
  async relationships(slug: string): Promise<Relationship[]> {
    if (isMock()) return R.entityRepository.relationships(slug);
    try {
      return await db.dbListRelationships(slug);
    } catch {
      return R.entityRepository.relationships(slug);
    }
  },
};

export const eventRepository = {
  async list(slug: string, params?: ListParams): Promise<TimelineEvent[]> {
    if (isMock()) return R.eventRepository.list(slug, params);
    try {
      return await db.dbListEvents(slug);
    } catch {
      return R.eventRepository.list(slug, params);
    }
  },
  listPaginated: R.eventRepository.listPaginated,
};

export const conflictRepository = {
  async list(slug: string, params?: ListParams): Promise<Conflict[]> {
    if (isMock()) return R.conflictRepository.list(slug, params);
    try {
      return await db.dbListConflicts(slug, params);
    } catch {
      return R.conflictRepository.list(slug, params);
    }
  },
  listPaginated: R.conflictRepository.listPaginated,
  async get(slug: string, id: string): Promise<Conflict | undefined> {
    if (isMock()) return R.conflictRepository.get(slug, id);
    try {
      return await db.dbGetConflict(slug, id);
    } catch {
      return R.conflictRepository.get(slug, id);
    }
  },
};

export const qaRepository = {
  async get(slug: string): Promise<QAReport | undefined> {
    if (isMock()) return R.qaRepository.get(slug);
    try {
      return await db.dbGetQa(slug);
    } catch {
      return R.qaRepository.get(slug);
    }
  },
};

export const behaviorRepository = {
  async get(slug: string): Promise<BehaviorProfile | undefined> {
    if (isMock()) return R.behaviorRepository.get(slug);
    try {
      return await db.dbGetBehavior(slug);
    } catch {
      return R.behaviorRepository.get(slug);
    }
  },
};

export const searchRepository = {
  async query(q: string, params?: ListParams): Promise<SearchResult[]> {
    if (isMock()) return R.searchRepository.query(q, params);
    try {
      return await db.dbSearch(q);
    } catch {
      return R.searchRepository.query(q, params);
    }
  },
};

// Market/notes/views have no direct-DB shortcut here — reuse client-safe HTTP.
export const marketRepository = R.marketRepository;
export const noteRepository = R.noteRepository;
export const viewRepository = R.viewRepository;
