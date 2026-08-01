"use client";

import { useQuery } from "@tanstack/react-query";
import {
  knowledgeRepository,
  entityRepository,
  eventRepository,
  conflictRepository,
  qaRepository,
  searchRepository,
} from "@/lib/api";
import {
  getKnowledge,
  getEntities,
  getEvents,
  getConflicts,
  qaReports,
  buildSearchIndex,
} from "@/lib/data";
import { parseSearchQuery, matchesFacets } from "@/lib/search/parser";

/* ---------- per-project resource queries ---------- */

export function useKnowledgeQuery(slug: string | undefined) {
  return useQuery({
    queryKey: ["knowledge", slug],
    queryFn: () => knowledgeRepository.list(slug!),
    enabled: !!slug,
    staleTime: 5 * 60_000,
    placeholderData: slug ? getKnowledge(slug) : undefined,
  });
}

export function useEntitiesQuery(slug: string | undefined) {
  return useQuery({
    queryKey: ["entities", slug],
    queryFn: () => entityRepository.list(slug!),
    enabled: !!slug,
    staleTime: 5 * 60_000,
    placeholderData: slug ? getEntities(slug) : undefined,
  });
}

export function useEventsQuery(slug: string | undefined) {
  return useQuery({
    queryKey: ["events", slug],
    queryFn: () => eventRepository.list(slug!),
    enabled: !!slug,
    staleTime: 5 * 60_000,
    placeholderData: slug ? getEvents(slug) : undefined,
  });
}

export function useConflictsQuery(slug: string | undefined) {
  return useQuery({
    queryKey: ["conflicts", slug],
    queryFn: () => conflictRepository.list(slug!),
    enabled: !!slug,
    staleTime: 5 * 60_000,
    placeholderData: slug ? getConflicts(slug) : undefined,
  });
}

export function useQaQuery(slug: string | undefined) {
  return useQuery({
    queryKey: ["qa", slug],
    queryFn: () => qaRepository.get(slug!),
    enabled: !!slug,
    staleTime: 5 * 60_000,
    placeholderData: slug ? qaReports[slug] : undefined,
  });
}

/* ---------- global search (faceted) ---------- */

export function useSearchQuery(query: string) {
  return useQuery({
    queryKey: ["search", query],
    queryFn: () => searchRepository.query(query),
    enabled: query.trim().length > 0,
    staleTime: 30_000,
    placeholderData: query.trim()
      ? (() => {
          const parsed = parseSearchQuery(query);
          const text = parsed.text.trim().toLowerCase();
          return buildSearchIndex()
            .filter((r) => matchesFacets(r, parsed.facets))
            .filter((r) => !text || r.keywords.includes(text) || r.label.toLowerCase().includes(text))
            .slice(0, 40);
        })()
      : undefined,
  });
}
