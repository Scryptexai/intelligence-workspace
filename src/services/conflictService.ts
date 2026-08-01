import { conflictRepository } from "@/lib/api/repositories";
import type { Conflict } from "@/lib/types/conflict";

export function fetchConflicts(slug: string): Promise<Conflict[]> {
  return conflictRepository.list(slug);
}

export function fetchConflict(slug: string, id: string): Promise<Conflict | undefined> {
  return conflictRepository.get(slug, id);
}
