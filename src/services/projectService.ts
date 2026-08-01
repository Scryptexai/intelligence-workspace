import {
  projectRepository,
  knowledgeRepository,
  entityRepository,
  eventRepository,
  conflictRepository,
} from "@/lib/api/repositories";
import type { Project } from "@/lib/types/project";
import type { KnowledgeItem } from "@/lib/types/knowledge";
import type { Entity } from "@/lib/types/entity";
import type { TimelineEvent } from "@/lib/types/event";
import type { Conflict } from "@/lib/types/conflict";
import type { Relationship } from "@/lib/types/entity";
import type { ListParams } from "@/lib/api/types";

export interface ProjectBundle {
  project: Project;
  knowledge: KnowledgeItem[];
  entities: Entity[];
  events: TimelineEvent[];
  conflicts: Conflict[];
  relationships: Relationship[];
  generatedAt: string;
}

export async function fetchProjectsList(params?: ListParams): Promise<Project[]> {
  return projectRepository.list(params);
}

export async function fetchProjectBundle(slug: string): Promise<ProjectBundle> {
  const [project, knowledge, entities, events, conflicts, relationships] =
    await Promise.all([
      projectRepository.get(slug),
      knowledgeRepository.list(slug),
      entityRepository.list(slug),
      eventRepository.list(slug),
      conflictRepository.list(slug),
      entityRepository.relationships(slug),
    ]);
  if (!project) throw new Error("Project not found");
  return {
    project,
    knowledge,
    entities,
    events,
    conflicts,
    relationships,
    generatedAt: new Date().toISOString(),
  };
}
