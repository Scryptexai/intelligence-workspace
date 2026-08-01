"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Background,
  BackgroundVariant,
  Controls,
  MiniMap,
  ReactFlow,
  ReactFlowProvider,
  useReactFlow,
  type Edge,
  type Node,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import type { Entity, Relationship } from "@/lib/types/entity";
import type { TimelineEvent } from "@/lib/types/event";
import type { KnowledgeItem } from "@/lib/types/knowledge";
import { useGraphStore } from "@/lib/store/graph";
import { ENTITY_TYPE_ICON_COLOR } from "@/lib/brand";
import {
  buildEdgeData,
  buildNodeData,
  degreeOf,
} from "./utils/graphDataTransformer";
import { useGraphFocus } from "./hooks/useGraphFocus";
import { useGraphLayout } from "./hooks/useGraphLayout";
import { GraphNode, type GraphFlowNode } from "./GraphNode";
import { GraphEdge } from "./GraphEdge";
import { GraphControls } from "./GraphControls";
import { GraphFilters } from "./GraphFilters";
import { GraphFocusBadge } from "./GraphFocusBadge";
import { GraphSidePanel } from "./GraphSidePanel";

const nodeTypes = { graphNode: GraphNode };
const edgeTypes = { graphEdge: GraphEdge };

function GraphV2Inner({
  entities,
  relationships,
  events,
  knowledge,
  projectSlug,
  initialEntityId,
}: {
  entities: Entity[];
  relationships: Relationship[];
  events: TimelineEvent[];
  knowledge: KnowledgeItem[];
  projectSlug: string;
  initialEntityId?: string;
}) {
  const router = useRouter();
  const { setCenter, fitView } = useReactFlow();

  const {
    selectedId,
    focusedId,
    hopLevel,
    layoutMode,
    locked,
    typeFilter,
    setSelectedId,
    setFocused,
    clearFocus,
  } = useGraphStore();

  const [positions, setPositions] = useState<Record<string, { x: number; y: number }>>({});
  const [hoveredEdgeId, setHoveredEdgeId] = useState<string | null>(null);
  const paneLastClick = useRef(0);

  /* ---------------- visible entities (filter) ---------------- */
  const visible = useMemo(
    () =>
      typeFilter === "All"
        ? entities
        : entities.filter((e) => e.type === typeFilter),
    [entities, typeFilter]
  );

  /* ---------------- layout ---------------- */
  const computeLayout = useGraphLayout(visible, relationships);

  useEffect(() => {
    const pos = computeLayout(layoutMode);
    setPositions(pos);
    const t = setTimeout(() => fitView({ padding: 0.16, duration: 300 }), 40);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [computeLayout, layoutMode]);

  /* ---------------- initial selection ---------------- */
  useEffect(() => {
    if (initialEntityId) setSelectedId(initialEntityId);
  }, [initialEntityId, setSelectedId]);

  /* ---------------- focus (2 hops) ---------------- */
  const { reachable } = useGraphFocus(relationships, focusedId, hopLevel);
  const isFaded = useCallback(
    (id: string) => (focusedId ? !reachable.has(id) : false),
    [focusedId, reachable]
  );

  /* ---------------- nodes ---------------- */
  const nodes = useMemo<Node[]>(
    () =>
      visible.map((e) => ({
        id: e.id,
        type: "graphNode",
        position: positions[e.id] ?? { x: 0, y: 0 },
        data: buildNodeData(e, degreeOf(relationships, e.id)),
        selected: selectedId === e.id,
        draggable: !locked,
        className: "graph-node",
      })),
    [visible, positions, relationships, selectedId, locked]
  );

  const nodesWithFocus = useMemo<Node[]>(
    () =>
      nodes.map((n) => {
        const d = n.data as { entity: Entity; faded?: boolean; focused?: boolean };
        return {
          ...n,
          data: { ...d, faded: isFaded(n.id), focused: focusedId === n.id },
        };
      }),
    [nodes, isFaded, focusedId]
  );

  /* ---------------- edges ---------------- */
  const visibleIds = useMemo(() => new Set(visible.map((e) => e.id)), [visible]);

  const edges = useMemo<Edge[]>(
    () =>
      relationships
        .filter((r) => visibleIds.has(r.source) && visibleIds.has(r.target))
        .map((r) => ({
          id: r.id,
          source: r.source,
          target: r.target,
          type: "graphEdge",
          markerEnd: {
            type: "arrowclosed" as const,
            color: buildEdgeData(r).color,
          },
          data: {
            ...buildEdgeData(r),
            hovered: hoveredEdgeId === r.id,
            faded: focusedId
              ? !reachable.has(r.source) && !reachable.has(r.target)
              : false,
          },
          selected: hoveredEdgeId === r.id,
        })),
    [relationships, visibleIds, hoveredEdgeId, focusedId, reachable]
  );

  /* ---------------- handlers ---------------- */
  const handleNodeClick = useCallback(
    (_: unknown, node: Node) => {
      const d = node.data as { faded?: boolean; entity?: Entity };
      if (d?.faded) return; // focus mode: node di luar radius tidak bisa diklik
      setSelectedId(node.id);
      router.replace(`/project/${projectSlug}/graph?node=${node.id}`, {
        scroll: false,
      });
    },
    [setSelectedId, router, projectSlug]
  );

  const handleNodeDoubleClick = useCallback(
    (_: unknown, node: Node) => {
      const d = node.data as { faded?: boolean };
      if (d?.faded) return;
      if (focusedId === node.id) clearFocus();
      else setFocused(node.id, 2);
    },
    [focusedId, clearFocus, setFocused]
  );

  /** React Flow v12 tidak punya onPaneDoubleClick — deteksi manual 2 klik. */
  const handlePaneClick = useCallback(() => {
    const now = Date.now();
    const double = now - paneLastClick.current < 280;
    paneLastClick.current = now;
    if (double) {
      clearFocus();
      setSelectedId(null);
    } else {
      setSelectedId(null);
    }
  }, [clearFocus, setSelectedId]);

  const handleSearchSelect = useCallback(
    (id: string) => {
      setSelectedId(id);
      const p = positions[id];
      if (p) setCenter(p.x, p.y, { zoom: 1.1, duration: 500 });
    },
    [setSelectedId, positions, setCenter]
  );

  const handleExpand = useCallback(
    (id: string) => {
      const p = positions[id];
      if (p) setCenter(p.x, p.y, { zoom: 0.9, duration: 400 });
    },
    [positions, setCenter]
  );

  /* ---------------- type counts for filters ---------------- */
  const typeCounts = useMemo(() => {
    const c = {} as Record<Entity["type"], number>;
    for (const e of entities) c[e.type] = (c[e.type] ?? 0) + 1;
    return c;
  }, [entities]);
  const presentTypes = useMemo(
    () => [...new Set(entities.map((e) => e.type))] as Entity["type"][],
    [entities]
  );

  const focusedEntity = focusedId
    ? entities.find((e) => e.id === focusedId)
    : undefined;

  return (
    <div className="relative h-full w-full">
      <ReactFlow
        nodes={nodesWithFocus}
        edges={edges}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        onNodeClick={handleNodeClick}
        onNodeDoubleClick={handleNodeDoubleClick}
        onPaneClick={handlePaneClick}
        onEdgeMouseEnter={(_, e) => setHoveredEdgeId(e.id)}
        onEdgeMouseLeave={() => setHoveredEdgeId(null)}
        nodesDraggable={!locked}
        nodesConnectable={false}
        elementsSelectable
        minZoom={0.15}
        maxZoom={2.5}
        onlyRenderVisibleElements
        proOptions={{ hideAttribution: true }}
      >
        <Background variant={BackgroundVariant.Dots} gap={24} size={1.3} color="#1e2a3a" />
        <Controls className="!border-slate-700/60 !bg-slate-900/80" />
        <MiniMap
          pannable
          zoomable
          nodeColor={(n) => {
            const e = (n.data as { entity?: Entity }).entity;
            if (!e) return "#334155";
            return ENTITY_TYPE_ICON_COLOR[e.type];
          }}
          nodeStrokeColor={() => "#22d3ee"}
          maskColor="rgba(7,9,13,0.75)"
          className="!border-slate-700/60 !bg-slate-950/90"
        />
      </ReactFlow>

      {/* overlay UI */}
      <GraphFilters types={presentTypes} counts={typeCounts} />
      <GraphControls entities={entities} onSearchSelect={handleSearchSelect} />
      <GraphFocusBadge entityName={focusedEntity?.name} />
      <GraphSidePanel
        projectSlug={projectSlug}
        entities={entities}
        relationships={relationships}
        events={events}
        knowledge={knowledge}
        onExpand={handleExpand}
      />

      {/* hint footer */}
      <div className="pointer-events-none absolute bottom-4 left-1/2 z-10 hidden -translate-x-1/2 rounded-full border border-slate-800 bg-slate-950/70 px-3 py-1 text-[10px] text-slate-500 backdrop-blur lg:block">
        Double-click node = Focus Mode · Double-click canvas = reset
      </div>
    </div>
  );
}

export function EntityGraphV2(props: {
  entities: Entity[];
  relationships: Relationship[];
  events: TimelineEvent[];
  knowledge: KnowledgeItem[];
  projectSlug: string;
  initialEntityId?: string;
}) {
  return (
    <ReactFlowProvider>
      <GraphV2Inner {...props} />
    </ReactFlowProvider>
  );
}
