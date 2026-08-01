"use client";

import { useCallback, useMemo } from "react";
import type { Relationship } from "@/lib/types/entity";

/**
 * Focus Mode (Obsidian-style local graph):
 * double-click node → hanya node dalam radius `hopLevel` yang terang,
 * sisanya memudar dan tidak bisa diklik.
 */
export function useGraphFocus(
  relationships: Relationship[],
  focusedId: string | null,
  hopLevel = 2
) {
  /** Set id yang terjangkau dalam N hops (termasuk node pusat). */
  const reachable = useMemo(() => {
    const out = new Set<string>();
    if (!focusedId) return out;

    const adj = new Map<string, Set<string>>();
    for (const r of relationships) {
      if (!adj.has(r.source)) adj.set(r.source, new Set());
      if (!adj.has(r.target)) adj.set(r.target, new Set());
      adj.get(r.source)!.add(r.target);
      adj.get(r.target)!.add(r.source);
    }

    out.add(focusedId);
    let frontier = [focusedId];
    for (let hop = 0; hop < hopLevel; hop++) {
      const next: string[] = [];
      for (const id of frontier) {
        for (const n of adj.get(id) ?? []) {
          if (!out.has(n)) {
            out.add(n);
            next.push(n);
          }
        }
      }
      frontier = next;
      if (frontier.length === 0) break;
    }
    return out;
  }, [relationships, focusedId, hopLevel]);

  const isFaded = useCallback(
    (entityId: string) => (focusedId ? !reachable.has(entityId) : false),
    [focusedId, reachable]
  );

  return { reachable, isFaded };
}
