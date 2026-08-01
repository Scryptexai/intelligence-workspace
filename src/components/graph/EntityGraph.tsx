"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Background,
  BackgroundVariant,
  Controls,
  MarkerType,
  MiniMap,
  ReactFlow,
  ReactFlowProvider,
  useReactFlow,
  type Edge,
  type Node,
  type NodeProps,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowDownLeft, ArrowUpRight, Focus, LayoutGrid, Network as NetworkIcon, Orbit, Unplug, X } from "lucide-react";
import type { Entity, EntityType, Relationship, RelationshipType } from "@/lib/types/entity";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ENTITY_COLORS,
  ENTITY_TYPES,
  RELATIONSHIP_COLORS,
  RELATIONSHIP_LABELS,
} from "@/lib/constants";
import { EntityLogo } from "@/components/brand/EntityLogo";
import { cn } from "@/lib/utils/helpers";

type LayoutMode = "radial" | "cluster" | "layered";

type EntityFlowNode = Node<{ entity: Entity; degree?: number }, "entity">;
type ClusterFlowNode = Node<{ type: EntityType; count: number }, "cluster">;

/* ------------------------------------------------------------------ */
/* Nodes                                                               */
/* ------------------------------------------------------------------ */

function ClusterNode({ data, selected }: NodeProps<ClusterFlowNode>) {
  const color = ENTITY_COLORS[data.type];
  return (
    <div
      className={cn(
        "flex items-center gap-2 rounded-full border-2 border-dashed bg-card/90 px-3.5 py-2 shadow-lg backdrop-blur transition-all hover:scale-105",
        selected ? "border-primary ring-2 ring-primary/30" : "border-border"
      )}
      style={{ borderColor: color }}
    >
      <span
        className="flex h-5 w-5 items-center justify-center rounded-full"
        style={{ backgroundColor: `${color}22`, color }}
      >
        <LayersIcon size={12} />
      </span>
      <span className="text-[12px] font-bold text-foreground">{data.type}</span>
      <span
        className="rounded-full px-1.5 py-0.5 font-mono text-[10px] font-semibold"
        style={{ backgroundColor: `${color}1a`, color }}
      >
        {data.count}
      </span>
    </div>
  );
}

function LayersIcon({ size = 12 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2 2 7l10 5 10-5-10-5z" />
      <path d="m2 17 10 5 10-5" />
      <path d="m2 12 10 5 10-5" />
    </svg>
  );
}

function EntityNode({ data, selected }: NodeProps<EntityFlowNode>) {
  const { entity } = data;
  const color = ENTITY_COLORS[entity.type];
  return (
    <div
      className={cn(
        "flex items-center gap-2 rounded-lg border bg-card px-2.5 py-1.5 shadow-md transition-all",
        selected
          ? "border-primary ring-2 ring-primary/30 shadow-primary/20"
          : "border-border hover:border-primary/40"
      )}
    >
      <EntityLogo entity={entity} size={22} />
      <div className="min-w-0">
        <div className="max-w-[150px] truncate text-[12px] font-semibold text-foreground">
          {entity.name}
        </div>
        <div className="flex items-center gap-1.5">
          <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: color }} />
          <span className="text-[9px] font-medium uppercase tracking-wide text-muted-foreground">
            {entity.type}
          </span>
          {typeof (data as { degree?: number }).degree === "number" && (
            <span
              className="rounded px-1 font-mono text-[9px] font-bold"
              style={{ backgroundColor: `${color}1a`, color }}
              title="Jumlah koneksi"
            >
              {(data as { degree?: number }).degree}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

const nodeTypes = { entity: EntityNode, cluster: ClusterNode };

/* ------------------------------------------------------------------ */
/* Layouts                                                             */
/* ------------------------------------------------------------------ */

function layoutRadial(entities: Entity[]): Record<string, { x: number; y: number }> {
  const n = Math.max(entities.length, 1);
  const r = Math.max(240, n * 44);
  return Object.fromEntries(
    entities.map((e, i) => {
      const angle = (i / n) * 2 * Math.PI - Math.PI / 2;
      return [e.id, { x: 420 + r * Math.cos(angle), y: 320 + r * Math.sin(angle) }];
    })
  );
}

function layoutCluster(entities: Entity[]): Record<string, { x: number; y: number }> {
  const groups = new Map<EntityType, Entity[]>();
  for (const e of entities) {
    if (!groups.has(e.type)) groups.set(e.type, []);
    groups.get(e.type)!.push(e);
  }
  const out: Record<string, { x: number; y: number }> = {};
  const types = [...groups.keys()];
  const cols = 3;
  let idx = 0;
  for (const t of types) {
    const col = idx % cols;
    const row = Math.floor(idx / cols);
    const members = groups.get(t)!;
    const cx = 220 + col * 340;
    const cy = 180 + row * 320;
    members.forEach((m, i) => {
      const angle = (i / members.length) * 2 * Math.PI - Math.PI / 2;
      const r = Math.min(90, 40 + members.length * 8);
      out[m.id] = { x: cx + r * Math.cos(angle), y: cy + r * Math.sin(angle) };
    });
    idx += 1;
  }
  return out;
}

function layoutLayered(
  entities: Entity[],
  relationships: Relationship[]
): Record<string, { x: number; y: number }> {
  const byId = new Map(entities.map((e) => [e.id, e]));
  const incoming = new Map<string, string[]>();
  const children = new Map<string, string[]>();
  for (const r of relationships) {
    if (!byId.has(r.source) || !byId.has(r.target)) continue;
    if (!children.has(r.source)) children.set(r.source, []);
    children.get(r.source)!.push(r.target);
    if (!incoming.has(r.target)) incoming.set(r.target, []);
    incoming.get(r.target)!.push(r.source);
  }
  const depth = new Map<string, number>();
  const queue: string[] = [];
  for (const e of entities) {
    if (!(incoming.get(e.id)?.length ?? 0)) {
      depth.set(e.id, 0);
      queue.push(e.id);
    }
  }
  for (const e of entities) {
    if (!depth.has(e.id)) {
      depth.set(e.id, 0);
      queue.push(e.id);
    }
  }
  while (queue.length) {
    const id = queue.shift()!;
    const d = depth.get(id) ?? 0;
    for (const c of children.get(id) ?? []) {
      if ((depth.get(c) ?? 0) <= d) {
        depth.set(c, d + 1);
        queue.push(c);
      }
    }
  }
  const byDepth = new Map<number, string[]>();
  for (const [id, d] of depth) {
    if (!byDepth.has(d)) byDepth.set(d, []);
    byDepth.get(d)!.push(id);
  }
  const out: Record<string, { x: number; y: number }> = {};
  for (const [d, ids] of byDepth) {
    ids.forEach((id, i) => {
      out[id] = {
        x: 160 + d * 300,
        y: 120 + i * 92 - (ids.length * 46) + 300,
      };
    });
  }
  return out;
}

/* ------------------------------------------------------------------ */
/* Edge helpers                                                        */
/* ------------------------------------------------------------------ */

function buildEdge(
  id: string,
  source: string,
  target: string,
  relType: RelationshipType,
  opts: { animated?: boolean; dimmed?: boolean; highlighted?: boolean }
): Edge {
  const color = RELATIONSHIP_COLORS[relType];
  const dim = opts.dimmed;
  return {
    id,
    source,
    target,
    type: "smoothstep",
    label: RELATIONSHIP_LABELS[relType],
    animated: opts.animated,
    style: {
      stroke: color,
      strokeWidth: opts.highlighted ? 3 : 1.6,
      opacity: dim ? 0.12 : 0.9,
      transition: "opacity 0.2s ease, stroke-width 0.2s ease",
    },
    labelStyle: {
      fill: color,
      fontSize: 9.5,
      fontWeight: 700,
      fontFamily: "ui-monospace, monospace",
    },
    labelBgStyle: {
      fill: "rgba(11,15,21,0.92)",
      fillOpacity: 1,
      stroke: `${color}66`,
      strokeWidth: 1,
    },
    labelBgPadding: [5, 2.5] as [number, number],
    labelBgBorderRadius: 8,
    markerEnd: {
      type: MarkerType.ArrowClosed,
      color,
      width: 16,
      height: 16,
    },
  };
}

function relationshipCount(
  relationships: Relationship[],
  entityId: string
): number {
  return relationships.filter(
    (r) => r.source === entityId || r.target === entityId
  ).length;
}

/* ------------------------------------------------------------------ */
/* Main component                                                      */
/* ------------------------------------------------------------------ */

function GraphInner({
  entities,
  relationships,
  projectSlug,
  initialEntityId,
}: {
  entities: Entity[];
  relationships: Relationship[];
  projectSlug: string;
  initialEntityId?: string;
}) {
  const router = useRouter();
  const [typeFilter, setTypeFilter] = useState<"All" | EntityType>("All");
  const [layoutMode, setLayoutMode] = useState<LayoutMode>("radial");
  const [clustering, setClustering] = useState(true);
  const [expanded, setExpanded] = useState<Set<string>>(() => {
    if (initialEntityId) {
      const e = entities.find((x) => x.id === initialEntityId);
      return e ? new Set([e.type]) : new Set();
    }
    return new Set();
  });
  const [selectedId, setSelectedId] = useState<string | null>(initialEntityId ?? null);
  const { fitView, setNodes } = useReactFlow();

  useEffect(() => {
    if (initialEntityId) {
      setSelectedId(initialEntityId);
      const e = entities.find((x) => x.id === initialEntityId);
      if (e) setExpanded((prev) => new Set(prev).add(e.type));
    }
  }, [initialEntityId, projectSlug, entities]);

  const visible = useMemo(
    () =>
      typeFilter === "All"
        ? entities
        : entities.filter((e) => e.type === typeFilter),
    [entities, typeFilter]
  );

  const applyLayout = useCallback(
    (mode: LayoutMode) => {
      setLayoutMode(mode);
      const pos =
        mode === "radial"
          ? layoutRadial(visible)
          : mode === "cluster"
            ? layoutCluster(visible)
            : layoutLayered(visible, relationships);
      setNodes(
        visible.map((e) => ({
          id: e.id,
          type: "entity" as const,
          position: pos[e.id] ?? { x: 100, y: 100 },
          data: { entity: e, degree: relationshipCount(relationships, e.id) },
        }))
      );
      setTimeout(() => fitView({ padding: 0.18, duration: 400 }), 80);
    },
    [visible, relationships, setNodes, fitView]
  );

  const positions = useMemo(() => layoutRadial(visible), [visible]);

  /* ------------------ nodes & edges (with clustering) ------------------ */

  const { nodes, edges } = useMemo(() => {
    const baseNode = (e: Entity): EntityFlowNode => ({
      id: e.id,
      type: "entity" as const,
      position: positions[e.id],
      data: { entity: e, degree: relationshipCount(relationships, e.id) },
    });

    if (!clustering) {
      const edgeList: Edge[] = [];
      const seen = new Set<string>();
      for (const r of relationships) {
        if (!positions[r.source] || !positions[r.target]) continue;
        const key = `${r.source}|${r.target}`;
        if (seen.has(key)) continue;
        seen.add(key);
        edgeList.push(
          buildEdge(r.id, r.source, r.target, r.type, {
            highlighted: selectedId === r.source || selectedId === r.target,
            dimmed: !!selectedId && selectedId !== r.source && selectedId !== r.target,
          })
        );
      }
      return { nodes: visible.map(baseNode), edges: edgeList };
    }

    const collapsedTypes = ENTITY_TYPES.filter((t) => !expanded.has(t));
    const memberOfExpanded = visible.filter((e) => expanded.has(e.type));
    const byType = (t: EntityType) => visible.filter((e) => e.type === t);

    const clusters = collapsedTypes
      .map((t) => ({ t, members: byType(t) }))
      .filter((c) => c.members.length > 0);
    const clusterPos = Object.fromEntries(
      clusters.map((c, i) => [
        `cluster-${c.t}`,
        (() => {
          const angle = (i / Math.max(clusters.length, 1)) * 2 * Math.PI - Math.PI / 2;
          const r = Math.max(200, clusters.length * 70);
          return { x: 420 + r * Math.cos(angle), y: 320 + r * Math.sin(angle) };
        })(),
      ])
    );

    const memberPos: Record<string, { x: number; y: number }> = {};
    const rad = 210;
    memberOfExpanded.forEach((e, i) => {
      const angle = (i / Math.max(memberOfExpanded.length, 1)) * 2 * Math.PI - Math.PI / 2;
      memberPos[e.id] = { x: 420 + rad * Math.cos(angle), y: 320 + rad * Math.sin(angle) };
    });

    const clusterNodes: ClusterFlowNode[] = clusters.map(({ t }) => ({
      id: `cluster-${t}`,
      type: "cluster" as const,
      position: clusterPos[`cluster-${t}`],
      data: { type: t, count: byType(t).length },
    }));
    const memberNodes: EntityFlowNode[] = memberOfExpanded.map((e) => ({
      ...baseNode(e),
      position: memberPos[e.id],
    }));

    const edgeList: Edge[] = [];
    const seen = new Set<string>();
    const addEdge = (source: string, target: string, relType: RelationshipType, kind: string) => {
      const key = `${source}|${target}|${kind}`;
      if (seen.has(key) || source === target) return;
      seen.add(key);
      const touchesSelected =
        !!selectedId &&
        (source === selectedId ||
          target === selectedId ||
          source === `cluster-${selectedId?.toLowerCase()}`);
      edgeList.push(
        buildEdge(`e-${key}`, source, target, relType, {
          animated: kind === "cc" ? false : touchesSelected,
          highlighted: touchesSelected,
          dimmed: !!selectedId && !touchesSelected,
        })
      );
    };

    for (const r of relationships) {
      const s = visible.find((e) => e.id === r.source);
      const t = visible.find((e) => e.id === r.target);
      if (!s || !t) continue;
      const sExpanded = expanded.has(s.type);
      const tExpanded = expanded.has(t.type);
      if (sExpanded && tExpanded) addEdge(s.id, t.id, r.type, "both");
      else if (sExpanded) addEdge(s.id, `cluster-${t.type}`, r.type, "s");
      else if (tExpanded) addEdge(`cluster-${s.type}`, t.id, r.type, "t");
      else addEdge(`cluster-${s.type}`, `cluster-${t.type}`, r.type, "cc");
    }

    return { nodes: [...clusterNodes, ...memberNodes], edges: edgeList };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible, relationships, positions, clustering, expanded, selectedId]);

  useEffect(() => {
    const t = setTimeout(() => fitView({ padding: 0.18, duration: 350 }), 60);
    return () => clearTimeout(t);
  }, [typeFilter, clustering, expanded, fitView]);

  const selected = selectedId ? entities.find((e) => e.id === selectedId) : undefined;

  /* relationships involving the selected entity (for side panel) */
  const selectedRels = useMemo(() => {
    if (!selected) return { out: [] as Relationship[], inc: [] as Relationship[] };
    return {
      out: relationships.filter((r) => r.source === selected.id),
      inc: relationships.filter((r) => r.target === selected.id),
    };
  }, [selected, relationships]);

  const entityById = useMemo(() => new Map(entities.map((e) => [e.id, e])), [entities]);

  return (
    <div className="relative h-full w-full">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        onNodeClick={(_, node) => {
          const d = node.data as { entity?: Entity; type?: EntityType };
          if (node.type === "cluster" && d.type) {
            setExpanded((prev) => new Set(prev).add(d.type as string));
            setSelectedId(null);
          } else if (d.entity) {
            setSelectedId(d.entity.id);
            router.replace(`/project/${projectSlug}/graph?node=${d.entity.id}`, {
              scroll: false,
            });
          }
        }}
        onPaneClick={() => {
          setSelectedId(null);
          router.replace(`/project/${projectSlug}/graph`, { scroll: false });
        }}
        fitView
        fitViewOptions={{ padding: 0.18 }}
        minZoom={0.2}
        maxZoom={2.5}
        onlyRenderVisibleElements
        proOptions={{ hideAttribution: true }}
      >
        <Background variant={BackgroundVariant.Dots} gap={22} size={1.2} color="#232f40" />
        <Controls className="!border-border !bg-card" />
        <MiniMap
          pannable
          zoomable
          nodeColor={(n) => {
            const e = (n.data as { entity?: Entity }).entity;
            return e ? ENTITY_COLORS[e.type] : "#334155";
          }}
          maskColor="rgba(7,9,13,0.7)"
          className="!bg-card"
        />
      </ReactFlow>

      {/* toolbar */}
      <div className="absolute left-3 top-3 z-10 flex flex-wrap items-center gap-2">
        <Select
          value={typeFilter}
          onValueChange={(v) => setTypeFilter(v as "All" | EntityType)}
        >
          <SelectTrigger className="h-8 w-44 bg-card/95 text-[12px] backdrop-blur">
            <SelectValue placeholder="Entity type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="All">All types ({entities.length})</SelectItem>
            {ENTITY_TYPES.map((t) => (
              <SelectItem key={t} value={t}>
                {t} ({entities.filter((e) => e.type === t).length})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <div className="flex items-center gap-0.5 rounded-md border border-border bg-card/95 p-0.5 backdrop-blur">
          {(
            [
              { mode: "radial", icon: Orbit, label: "Radial" },
              { mode: "cluster", icon: LayoutGrid, label: "Cluster" },
              { mode: "layered", icon: NetworkIcon, label: "Layered" },
            ] as const
          ).map((l) => (
            <button
              key={l.mode}
              onClick={() => applyLayout(l.mode)}
              title={`Auto-layout: ${l.label}`}
              className={cn(
                "flex h-7 items-center gap-1 rounded px-2 text-[11px] font-medium transition-colors",
                layoutMode === l.mode
                  ? "project-accent-bg project-accent-text"
                  : "text-muted-foreground hover:bg-accent hover:text-foreground"
              )}
            >
              <l.icon className="h-3 w-3" />
              {l.label}
            </button>
          ))}
        </div>

        <Button
          variant={clustering ? "default" : "outline"}
          size="sm"
          className="h-8 bg-card/95 text-[12px] backdrop-blur"
          onClick={() => {
            setClustering((c) => !c);
            setTimeout(() => fitView({ padding: 0.18, duration: 400 }), 120);
          }}
          title="Group entities by type into clusters"
        >
          <Unplug className="h-3.5 w-3.5" />
          {clustering ? "Clustered" : "Expand all"}
        </Button>
        {clustering && expanded.size > 0 && (
          <Button
            variant="outline"
            size="sm"
            className="h-8 bg-card/95 text-[12px] backdrop-blur"
            onClick={() => setExpanded(new Set())}
          >
            Collapse
          </Button>
        )}
        <Button
          variant="outline"
          size="sm"
          className="h-8 bg-card/95 text-[12px] backdrop-blur"
          onClick={() => fitView({ padding: 0.18, duration: 350 })}
        >
          <Focus className="h-3.5 w-3.5" /> Fit
        </Button>
      </div>

      {/* entity type legend (top-right, below panel) */}
      <div className="absolute right-3 top-3 z-[5] flex max-w-[240px] flex-wrap gap-x-3 gap-y-1 rounded-md border border-border bg-card/90 p-2.5 backdrop-blur">
        {ENTITY_TYPES.map((t) => (
          <span key={t} className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
            <span className="h-2 w-2 rounded-full" style={{ backgroundColor: ENTITY_COLORS[t] }} />
            {t}
          </span>
        ))}
      </div>

      {/* relationship legend (bottom-left) */}
      <div className="absolute bottom-3 left-3 z-10 max-w-[300px] rounded-md border border-border bg-card/95 p-2.5 backdrop-blur">
        <div className="mb-1.5 text-[9.5px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
          Relationship Legend
        </div>
        <div className="flex flex-wrap gap-x-3 gap-y-1">
          {Object.entries(RELATIONSHIP_COLORS).map(([k, c]) => (
            <span key={k} className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
              <span
                className="h-[2px] w-4 rounded-full"
                style={{ backgroundColor: c, boxShadow: `0 0 4px ${c}88` }}
              />
              {RELATIONSHIP_LABELS[k as RelationshipType]}
            </span>
          ))}
        </div>
      </div>

      {/* side panel */}
      {selected && (
        <div className="absolute right-3 top-[104px] z-10 flex max-h-[calc(100%-130px)] w-[320px] animate-fade-in flex-col overflow-hidden rounded-lg border border-border bg-card/95 shadow-xl backdrop-blur">
          <div className="overflow-y-auto p-4">
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2">
                <EntityLogo entity={selected} size={30} />
                <h3 className="text-[14px] font-bold leading-tight text-foreground">
                  {selected.name}
                </h3>
              </div>
              <button
                onClick={() => setSelectedId(null)}
                className="rounded p-1 text-muted-foreground hover:bg-accent hover:text-foreground"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
            <div className="mt-2 flex flex-wrap gap-1.5">
              <Badge variant="default" className="normal-case tracking-normal">
                {selected.type}
              </Badge>
              <Badge
                variant={
                  selected.status === "Active"
                    ? "success"
                    : selected.status === "Contested"
                      ? "warning"
                      : "muted"
                }
                className="normal-case tracking-normal"
              >
                {selected.status}
              </Badge>
              {selected.founded && (
                <Badge variant="secondary" className="normal-case tracking-normal">
                  est. {selected.founded}
                </Badge>
              )}
              <Badge variant="muted" className="normal-case tracking-normal">
                {selectedRels.out.length + selectedRels.inc.length} connections
              </Badge>
            </div>
            <p className="mt-2.5 text-[12px] leading-relaxed text-muted-foreground">
              {selected.description}
            </p>
            {selected.metadata && (
              <dl className="mt-2.5 space-y-1 text-[11px]">
                {Object.entries(selected.metadata).map(([k, v]) => (
                  <div key={k} className="flex justify-between gap-2">
                    <dt className="text-muted-foreground">{k}</dt>
                    <dd className="font-mono text-foreground/80">{v}</dd>
                  </div>
                ))}
              </dl>
            )}

            {/* relationships breakdown */}
            {(selectedRels.out.length > 0 || selectedRels.inc.length > 0) && (
              <div className="mt-3 space-y-1 border-t border-border pt-2.5">
                <div className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                  Relationships
                </div>
                {selectedRels.out.map((r) => {
                  const other = entityById.get(r.target);
                  return (
                    <div key={r.id} className="flex items-center gap-1.5 py-0.5">
                      <ArrowUpRight className="h-3 w-3 shrink-0 text-success" />
                      <span
                        className="rounded px-1.5 py-px font-mono text-[9.5px] font-semibold"
                        style={{
                          backgroundColor: `${RELATIONSHIP_COLORS[r.type]}1c`,
                          color: RELATIONSHIP_COLORS[r.type],
                        }}
                      >
                        {RELATIONSHIP_LABELS[r.type]}
                      </span>
                      <span className="min-w-0 flex-1 truncate text-[11.5px] text-foreground/90">
                        {other?.name ?? r.target}
                      </span>
                      {other && (
                        <button
                          onClick={() => {
                            setSelectedId(other.id);
                            router.replace(`/project/${projectSlug}/graph?node=${other.id}`, {
                              scroll: false,
                            });
                          }}
                          className="rounded px-1 font-mono text-[10px] text-primary hover:underline"
                        >
                          →
                        </button>
                      )}
                    </div>
                  );
                })}
                {selectedRels.inc.map((r) => {
                  const other = entityById.get(r.source);
                  return (
                    <div key={r.id} className="flex items-center gap-1.5 py-0.5">
                      <ArrowDownLeft className="h-3 w-3 shrink-0 text-warning" />
                      <span
                        className="rounded px-1.5 py-px font-mono text-[9.5px] font-semibold"
                        style={{
                          backgroundColor: `${RELATIONSHIP_COLORS[r.type]}1c`,
                          color: RELATIONSHIP_COLORS[r.type],
                        }}
                      >
                        {RELATIONSHIP_LABELS[r.type]}
                      </span>
                      <span className="min-w-0 flex-1 truncate text-[11.5px] text-foreground/90">
                        {other?.name ?? r.source}
                      </span>
                      {other && (
                        <button
                          onClick={() => {
                            setSelectedId(other.id);
                            router.replace(`/project/${projectSlug}/graph?node=${other.id}`, {
                              scroll: false,
                            });
                          }}
                          className="rounded px-1 font-mono text-[10px] text-primary hover:underline"
                        >
                          ←
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            <div className="mt-3 space-y-2 border-t border-border pt-2.5">
              <div>
                <div className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                  Related Knowledge
                </div>
                <div className="mt-1.5 flex flex-wrap gap-1.5">
                  {selected.relatedKnowledge.length === 0 && (
                    <span className="text-[11px] text-muted-foreground/70">—</span>
                  )}
                  {selected.relatedKnowledge.map((k) => (
                    <Link
                      key={k}
                      href={`/project/${projectSlug}/knowledge/${k}`}
                      className="rounded border border-border bg-muted px-1.5 py-0.5 font-mono text-[11px] text-foreground transition-colors hover:border-primary hover:text-primary"
                    >
                      {k}
                    </Link>
                  ))}
                </div>
              </div>
              <div>
                <div className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                  Related Events
                </div>
                <div className="mt-1.5 flex flex-wrap gap-1.5">
                  {selected.relatedEvents.length === 0 && (
                    <span className="text-[11px] text-muted-foreground/70">—</span>
                  )}
                  {selected.relatedEvents.map((e) => (
                    <Link
                      key={e}
                      href={`/project/${projectSlug}/timeline?event=${e}`}
                      className="rounded border border-border bg-muted px-1.5 py-0.5 font-mono text-[11px] text-foreground transition-colors hover:border-primary hover:text-primary"
                    >
                      {e}
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export function EntityGraph(props: {
  entities: Entity[];
  relationships: Relationship[];
  projectSlug: string;
  initialEntityId?: string;
}) {
  return (
    <ReactFlowProvider>
      <GraphInner {...props} />
    </ReactFlowProvider>
  );
}
