"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchProjectBundle, fetchProjectsList, type ProjectBundle } from "@/services/projectService";
import {
  getProjectBySlug,
  getKnowledge,
  getEntities,
  getEvents,
  getConflicts,
  getRelationships,
} from "@/lib/data";

/** Synchronous bundle used as placeholder so first paint is instant. */
function syncBundle(slug: string | undefined) {
  if (!slug) return null;
  const project = getProjectBySlug(slug);
  if (!project) return null;
  return {
    project,
    knowledge: getKnowledge(slug),
    entities: getEntities(slug),
    events: getEvents(slug),
    conflicts: getConflicts(slug),
    relationships: getRelationships(slug),
    generatedAt: new Date().toISOString(),
  };
}

export function useProjectBundle(slug: string | undefined) {
  return useQuery<ProjectBundle | null, Error>({
    queryKey: ["project-bundle", slug],
    queryFn: () => (slug ? fetchProjectBundle(slug) : Promise.resolve(null)),
    enabled: !!slug,
    staleTime: 5 * 60_000,
    placeholderData: syncBundle(slug),
  });
}

export function useProjectsList() {
  return useQuery({
    queryKey: ["projects"],
    queryFn: () => fetchProjectsList(),
    staleTime: 5 * 60_000,
  });
}
