import { entityRepository } from "@/lib/api/repositories";
import type { Entity, Relationship } from "@/lib/types/entity";

export function fetchEntities(slug: string): Promise<Entity[]> {
  return entityRepository.list(slug);
}

export function fetchEntity(slug: string, id: string): Promise<Entity | undefined> {
  return entityRepository.get(slug, id);
}

export function fetchRelationships(slug: string): Promise<Relationship[]> {
  return entityRepository.relationships(slug);
}
