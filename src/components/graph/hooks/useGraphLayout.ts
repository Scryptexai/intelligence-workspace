"use client";

import { useCallback } from "react";
import dagre from "dagre";
import {
  forceCenter,
  forceCollide,
  forceLink,
  forceManyBody,
  forceSimulation,
  type SimulationNodeDatum,
} from "d3-force";
import type { Entity, Relationship } from "@/lib/types/entity";
import { layoutRadial } from "../utils/graphDataTransformer";

export type GraphLayoutMode = "radial" | "hierarchical" | "force";

interface SimNode extends SimulationNodeDatum {
  id: string;
  x: number;
  y: number;
}

/** Hierarchical (dagre) — bagus untuk governance/control flow. */
function layoutHierarchical(
  entities: Entity[],
  relationships: Relationship[]
): Record<string, { x: number; y: number }> {
  const ids = new Set(entities.map((e) => e.id));
  const g = new dagre.graphlib.Graph();
  g.setGraph({ rankdir: "TB", nodesep: 70, ranksep: 120, marginx: 40, marginy: 40 });
  g.setDefaultEdgeLabel(() => ({}));
  entities.forEach((e) => g.setNode(e.id, { width: 200, height: 86 }));
  relationships.forEach((r) => {
    if (ids.has(r.source) && ids.has(r.target)) g.setEdge(r.source, r.target);
  });
  dagre.layout(g);
  return Object.fromEntries(
    entities.map((e) => {
      const n = g.node(e.id);
      return [e.id, { x: (n.x ?? 0) - 100, y: (n.y ?? 0) - 43 }];
    })
  );
}

/** Force-directed (d3-force) — natural, organik. */
function layoutForce(
  entities: Entity[],
  relationships: Relationship[]
): Record<string, { x: number; y: number }> {
  const ids = new Set(entities.map((e) => e.id));
  const nodes: SimNode[] = entities.map((e) => ({
    ...e,
    id: e.id,
    x: 0,
    y: 0,
  }));
  const links = relationships
    .filter((r) => ids.has(r.source) && ids.has(r.target))
    .map((r) => ({ source: r.source, target: r.target }));

  const sim = forceSimulation<SimNode>(nodes)
    .force("charge", forceManyBody().strength(-380))
    .force(
      "link",
      forceLink<SimNode, { source: string; target: string }>(links)
        .id((d) => d.id)
        .distance(150)
        .strength(0.5)
    )
    .force("center", forceCenter(430, 330))
    .force("collide", forceCollide<SimNode>().radius(95))
    .stop();

  for (let i = 0; i < 300; i++) sim.tick();

  return Object.fromEntries(
    nodes.map((n) => [n.id, { x: n.x || 0, y: n.y || 0 }])
  );
}

/** Hook — kembalikan fungsi untuk menghitung posisi per mode layout. */
export function useGraphLayout(entities: Entity[], relationships: Relationship[]) {
  return useCallback(
    (mode: GraphLayoutMode): Record<string, { x: number; y: number }> => {
      if (mode === "radial") return layoutRadial(entities);
      if (mode === "hierarchical") return layoutHierarchical(entities, relationships);
      return layoutForce(entities, relationships);
    },
    [entities, relationships]
  );
}
