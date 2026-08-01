import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { KnowledgeItem } from "@/lib/types/knowledge";
import type { TimelineEvent } from "@/lib/types/event";

export type TimeRange = "all" | "3y" | "1y";

interface GlobalFiltersState {
  timeRange: TimeRange;
  setTimeRange: (r: TimeRange) => void;
}

export const useGlobalFilters = create<GlobalFiltersState>()(
  persist(
    (set) => ({
      timeRange: "all",
      setTimeRange: (timeRange) => set({ timeRange }),
    }),
    { name: "iw-global-filters" }
  )
);

/** Fixed mock "today" keeps filtering deterministic across sessions. */
export const MOCK_NOW = "2026-03-01";

export function rangeCutoff(range: TimeRange): string | null {
  if (range === "3y") return "2023-03-01";
  if (range === "1y") return "2025-03-01";
  return null;
}

export function rangeLabel(range: TimeRange): string {
  switch (range) {
    case "all":
      return "All Time";
    case "3y":
      return "Last 3 Years";
    case "1y":
      return "Last Year";
  }
}

export function filterEventsByRange(
  events: TimelineEvent[],
  range: TimeRange
): TimelineEvent[] {
  const cutoff = rangeCutoff(range);
  return cutoff ? events.filter((e) => e.date >= cutoff) : events;
}

export function filterKnowledgeByRange(
  knowledge: KnowledgeItem[],
  range: TimeRange
): KnowledgeItem[] {
  const cutoff = rangeCutoff(range);
  return cutoff ? knowledge.filter((k) => k.updatedAt >= cutoff) : knowledge;
}
