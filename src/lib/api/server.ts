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
 * FALLBACK POLICY (2026-08-09): jika pembacaan DB langsung melempar, fallback
 * ke data KOSONG yang bertipe benar (bukan mock, bukan HTTP self-fetch).
 * Alasannya:
 *  - Self-fetch HTTP ke /api absolut di belakang Vercel Authentication pasti
 *    dialihkan ke halaman login HTML → JSON.parse melempar → render RSC crash
 *    dengan error digest (halaman "Failed to load project intelligence").
 *  - Data mock menyesatkan — pengguna ingin hanya data asli Supabase.
 * Fallback kosong membuat halaman tetap ter-render (empty state) tanpa crash;
 * begitu DB sehat, data real langsung tampil.
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
import type { ActivityEntry, ActivityFilters } from "@/lib/types/activity";
import type { KnowledgeImpact } from "@/lib/types/lineage";
import type { MemberRole, Workspace, WorkspaceMember } from "@/lib/types/workspace";
import type { SearchResult } from "@/lib/data";

const isMock = (): boolean => effectiveDataSource() === "mock";

export const projectRepository = {
  async list(params?: ListParams): Promise<Project[]> {
    if (isMock()) return R.projectRepository.list(params);
    try {
      return await db.dbListProjects();
    } catch {
      return [];
    }
  },
  async get(slug: string): Promise<Project | undefined> {
    if (isMock()) return R.projectRepository.get(slug);
    try {
      return await db.dbGetProject(slug);
    } catch {
      return undefined;
    }
  },
};

export const knowledgeRepository = {
  async list(slug: string, params?: ListParams): Promise<KnowledgeItem[]> {
    if (isMock()) return R.knowledgeRepository.list(slug, params);
    try {
      return await db.dbListKnowledge(slug, params);
    } catch {
      return [];
    }
  },
  listPaginated: R.knowledgeRepository.listPaginated,
  async get(slug: string, id: string): Promise<KnowledgeItem | undefined> {
    if (isMock()) return R.knowledgeRepository.get(slug, id);
    try {
      return await db.dbGetKnowledgeItem(slug, id);
    } catch {
      return undefined;
    }
  },
};

export const entityRepository = {
  async list(slug: string, params?: ListParams): Promise<Entity[]> {
    if (isMock()) return R.entityRepository.list(slug, params);
    try {
      return await db.dbListEntities(slug);
    } catch {
      return [];
    }
  },
  async get(slug: string, id: string): Promise<Entity | undefined> {
    if (isMock()) return R.entityRepository.get(slug, id);
    try {
      return await db.dbGetEntity(slug, id);
    } catch {
      return undefined;
    }
  },
  async relationships(slug: string): Promise<Relationship[]> {
    if (isMock()) return R.entityRepository.relationships(slug);
    try {
      return await db.dbListRelationships(slug);
    } catch {
      return [];
    }
  },
};

export const eventRepository = {
  async list(slug: string, params?: ListParams): Promise<TimelineEvent[]> {
    if (isMock()) return R.eventRepository.list(slug, params);
    try {
      return await db.dbListEvents(slug);
    } catch {
      return [];
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
      return [];
    }
  },
  listPaginated: R.conflictRepository.listPaginated,
  async get(slug: string, id: string): Promise<Conflict | undefined> {
    if (isMock()) return R.conflictRepository.get(slug, id);
    try {
      return await db.dbGetConflict(slug, id);
    } catch {
      return undefined;
    }
  },
};

export const qaRepository = {
  async get(slug: string): Promise<QAReport | undefined> {
    if (isMock()) return R.qaRepository.get(slug);
    try {
      return await db.dbGetQa(slug);
    } catch {
      return undefined;
    }
  },
};

export const behaviorRepository = {
  async get(slug: string): Promise<BehaviorProfile | undefined> {
    if (isMock()) return R.behaviorRepository.get(slug);
    try {
      return await db.dbGetBehavior(slug);
    } catch {
      return undefined;
    }
  },
};

export const searchRepository = {
  async query(q: string, params?: ListParams): Promise<SearchResult[]> {
    if (isMock()) return R.searchRepository.query(q, params);
    try {
      return await db.dbSearch(q);
    } catch {
      return [];
    }
  },
};

export const activityRepository = {
  /**
   * Ledger audit — baca LANGSUNG dari DB (audit_log via supabaseService /
   * dataService), bukan HTTP self-fetch. Data kosong → [] (empty-state).
   */
  async list(filters?: ActivityFilters): Promise<ActivityEntry[]> {
    if (isMock()) return R.activityRepository.list(filters);
    try {
      return await db.dbListActivity(filters);
    } catch {
      return [];
    }
  },
};

export const lineageRepository = {
  /**
   * Impact analysis untuk satu knowledge item — baca LANGSUNG dari DB
   * (tanpa HTTP self-fetch). Tidak ditemukan / gagal → undefined (UI
   * menampilkan empty-state yang informatif, bukan error).
   */
  async getImpact(slug: string, id: string): Promise<KnowledgeImpact | undefined> {
    if (isMock()) return undefined;
    try {
      return await db.dbGetKnowledgeImpact(slug, id);
    } catch {
      return undefined;
    }
  },
};

export const workspaceRepository = {
  /**
   * Workspace & RBAC — baca LANGSUNG dari DB (workspaces/workspace_members
   * via supabaseService/dataService). Baca gagal → [] (empty-state);
   * tulis tanpa DB → error jelas (bukan fake data).
   */
  async list(): Promise<Workspace[]> {
    if (isMock()) return R.workspaceRepository.listWorkspaces();
    try {
      return await db.dbListWorkspaces();
    } catch {
      return [];
    }
  },
  async members(workspaceId: string): Promise<WorkspaceMember[]> {
    if (isMock()) return R.workspaceRepository.listMembers(workspaceId);
    try {
      return await db.dbListWorkspaceMembers(workspaceId);
    } catch {
      return [];
    }
  },
  async addMember(workspaceId: string, userId: string, role: MemberRole): Promise<void> {
    if (isMock()) return R.workspaceRepository.addMember(workspaceId, userId, role);
    return db.dbAddWorkspaceMember(workspaceId, userId, role);
  },
  async updateRole(workspaceId: string, userId: string, role: MemberRole): Promise<void> {
    if (isMock()) return R.workspaceRepository.updateRole(workspaceId, userId, role);
    return db.dbUpdateMemberRole(workspaceId, userId, role);
  },
  async removeMember(workspaceId: string, userId: string): Promise<void> {
    if (isMock()) return R.workspaceRepository.removeMember(workspaceId, userId);
    return db.dbRemoveWorkspaceMember(workspaceId, userId);
  },
};

// Market/notes/views have no direct-DB shortcut here — reuse client-safe HTTP.
export const marketRepository = R.marketRepository;
export const noteRepository = R.noteRepository;
export const viewRepository = R.viewRepository;
