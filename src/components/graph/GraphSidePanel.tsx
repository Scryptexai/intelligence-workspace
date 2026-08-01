"use client";

import Link from "next/link";
import {
  Brain,
  CalendarDays,
  ExternalLink,
  Expand,
  FileText,
  Network,
  X,
} from "lucide-react";
import type { Entity, Relationship } from "@/lib/types/entity";
import type { TimelineEvent } from "@/lib/types/event";
import type { KnowledgeItem } from "@/lib/types/knowledge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useGraphStore } from "@/lib/store/graph";
import { entityBrandUrls, ENTITY_TYPE_ICON_COLOR } from "@/lib/brand";
import { cn } from "@/lib/utils/helpers";

/* ---------------- mini graph preview (1 hop) ---------------- */

function MiniGraphPreview({
  entity,
  entities,
  relationships,
  onPick,
}: {
  entity: Entity;
  entities: Entity[];
  relationships: Relationship[];
  onPick: (id: string) => void;
}) {
  const neighbors = relationships
    .filter((r) => r.source === entity.id || r.target === entity.id)
    .map((r) => (r.source === entity.id ? r.target : r.source))
    .filter((id) => id !== entity.id)
    .filter((id, i, arr) => arr.indexOf(id) === i)
    .slice(0, 6);
  const center = { x: 150, y: 80 };
  const radius = 78;
  const n = Math.max(neighbors.length, 1);
  const pos = new Map<string, { x: number; y: number }>();
  neighbors.forEach((id, i) => {
    const a = (i / n) * 2 * Math.PI - Math.PI / 2;
    pos.set(id, { x: center.x + radius * Math.cos(a), y: center.y + radius * Math.sin(a) });
  });
  const byId = new Map(entities.map((e) => [e.id, e]));

  return (
    <div className="relative h-[190px] w-full overflow-hidden rounded-lg border border-slate-700/50 bg-slate-950/60">
      <svg className="absolute inset-0 h-full w-full">
        {neighbors.map((id) => {
          const p = pos.get(id)!;
          return (
            <line
              key={id}
              x1={center.x}
              y1={center.y}
              x2={p.x}
              y2={p.y}
              stroke="#334155"
              strokeWidth="1.2"
              strokeDasharray="4 3"
            />
          );
        })}
      </svg>
      {neighbors.map((id) => {
        const e = byId.get(id);
        const p = pos.get(id)!;
        if (!e) return null;
        const color = ENTITY_TYPE_ICON_COLOR[e.type];
        return (
          <button
            key={id}
            onClick={() => onPick(id)}
            className="absolute flex -translate-x-1/2 -translate-y-1/2 items-center gap-1 rounded-full border border-slate-700/60 bg-slate-900/95 px-2 py-1 text-[9.5px] text-slate-300 transition-colors hover:border-cyan-400/50 hover:text-white"
            style={{ left: p.x, top: p.y }}
          >
            <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: color }} />
            {e.name}
          </button>
        );
      })}
      <div className="absolute left-1/2 top-1/2 flex -translate-x-1/2 -translate-y-1/2 items-center gap-1.5 rounded-lg border border-cyan-400/40 bg-slate-900 px-2.5 py-1.5 shadow-lg">
        <span className="h-2 w-2 rounded-full bg-cyan-400" />
        <span className="max-w-[90px] truncate text-[10.5px] font-semibold text-white">
          {entity.name}
        </span>
      </div>
    </div>
  );
}

/* ---------------- main panel ---------------- */

export function GraphSidePanel({
  projectSlug,
  entities,
  relationships,
  events,
  knowledge,
  onExpand,
}: {
  projectSlug: string;
  entities: Entity[];
  relationships: Relationship[];
  events: TimelineEvent[];
  knowledge: KnowledgeItem[];
  onExpand: (id: string) => void;
}) {
  const { selectedId, setSelectedId, setFocused } = useGraphStore();
  if (!selectedId) return null;

  const entity = entities.find((e) => e.id === selectedId);
  if (!entity) return null;

  const relatedK = entity.relatedKnowledge
    .map((id) => knowledge.find((k) => k.id === id))
    .filter((k): k is KnowledgeItem => Boolean(k));
  const relatedE = entity.relatedEvents
    .map((id) => events.find((e) => e.id === id))
    .filter((e): e is TimelineEvent => Boolean(e));

  const color = ENTITY_TYPE_ICON_COLOR[entity.type];

  return (
    <div className="absolute right-3 top-3 z-20 flex max-h-[calc(100%-24px)] w-[330px] animate-fade-in flex-col overflow-hidden rounded-2xl border border-slate-700/60 bg-slate-950/90 shadow-2xl backdrop-blur">
      {/* header */}
      <div className="border-b border-slate-800 p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-3">
            <MiniLogo entity={entity} />
            <div className="min-w-0">
              <h3 className="truncate text-[15px] font-bold text-white">{entity.name}</h3>
              <div className="mt-1 flex flex-wrap items-center gap-1.5">
                <Badge
                  variant="secondary"
                  className="normal-case tracking-normal"
                  style={{ backgroundColor: `${color}1f`, color, borderColor: `${color}44` }}
                >
                  {entity.type}
                </Badge>
                <Badge
                  variant={
                    entity.status === "Active"
                      ? "success"
                      : entity.status === "Contested"
                        ? "critical"
                        : "muted"
                  }
                  className="normal-case tracking-normal"
                >
                  {entity.status}
                </Badge>
              </div>
            </div>
          </div>
          <button
            onClick={() => setSelectedId(null)}
            className="rounded p-1 text-slate-500 hover:bg-slate-800 hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <p className="mt-2.5 line-clamp-3 text-[11.5px] leading-relaxed text-slate-400">
          {entity.description}
        </p>

        {/* actions */}
        <div className="mt-3 flex items-center gap-2">
          <button
            onClick={() => {
              setFocused(entity.id);
              onExpand(entity.id);
            }}
            className="flex h-8 flex-1 items-center justify-center gap-1.5 rounded-lg bg-cyan-400/15 px-3 text-[12px] font-semibold text-cyan-300 transition-colors hover:bg-cyan-400/25"
          >
            <Expand className="h-3.5 w-3.5" /> Expand Graph
          </button>
          <Link
            href={`/project/${projectSlug}/knowledge?q=${encodeURIComponent(entity.name)}`}
            className="flex h-8 flex-1 items-center justify-center gap-1.5 rounded-lg border border-slate-700 px-3 text-[12px] font-medium text-slate-300 transition-colors hover:border-cyan-400/50 hover:text-white"
          >
            <ExternalLink className="h-3.5 w-3.5" /> Open Knowledge
          </Link>
        </div>
      </div>

      {/* tabs */}
      <div className="flex min-h-0 flex-1 flex-col overflow-y-auto">
        <Tabs defaultValue="intel" className="flex min-h-0 flex-1 flex-col">
          <TabsList className="mx-3 mt-3 grid w-auto grid-cols-3">
            <TabsTrigger value="intel" className="text-[11px]">
              <Brain className="h-3 w-3" /> Intelligence
            </TabsTrigger>
            <TabsTrigger value="timeline" className="text-[11px]">
              <CalendarDays className="h-3 w-3" /> Timeline
            </TabsTrigger>
            <TabsTrigger value="graph" className="text-[11px]">
              <Network className="h-3 w-3" /> Graph
            </TabsTrigger>
          </TabsList>

          <TabsContent value="intel" className="flex-1 space-y-2 px-4 pb-4 pt-3">
            <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500">
              Related Knowledge ({relatedK.length})
            </p>
            {relatedK.length === 0 && (
              <p className="text-[11.5px] text-slate-500">Belum ada knowledge terkait.</p>
            )}
            {relatedK.map((k) => (
              <Link
                key={k.id}
                href={`/project/${projectSlug}/knowledge/${k.id}`}
                className="group block rounded-lg border border-slate-800 bg-slate-900/60 p-2.5 transition-colors hover:border-cyan-400/40"
              >
                <div className="flex items-center gap-1.5">
                  <FileText className="h-3 w-3 text-cyan-400" />
                  <span className="truncate text-[11.5px] font-medium text-slate-200 group-hover:text-white">
                    {k.name}
                  </span>
                  <Badge
                    variant={
                      k.status === "Stable"
                        ? "success"
                        : k.status === "Volatile"
                          ? "warning"
                          : "muted"
                    }
                    className="ml-auto px-1.5 py-0 text-[8.5px]"
                  >
                    {k.status}
                  </Badge>
                </div>
                <div className="mt-1 flex items-center gap-2 font-mono text-[9.5px] text-slate-500">
                  <span>{k.confidence}% conf</span>
                  <span>·</span>
                  <span>{k.evidence.length} evidence</span>
                </div>
              </Link>
            ))}
          </TabsContent>

          <TabsContent value="timeline" className="flex-1 space-y-2 px-4 pb-4 pt-3">
            <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500">
              Involved Events ({relatedE.length})
            </p>
            {relatedE.length === 0 && (
              <p className="text-[11.5px] text-slate-500">Belum ada event terkait.</p>
            )}
            {relatedE.map((ev) => (
              <Link
                key={ev.id}
                href={`/project/${projectSlug}/timeline?event=${ev.id}`}
                className="group block rounded-lg border border-slate-800 bg-slate-900/60 p-2.5 transition-colors hover:border-cyan-400/40"
              >
                <div className="flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-amber-400" />
                  <span className="truncate text-[11.5px] font-medium text-slate-200 group-hover:text-white">
                    {ev.name}
                  </span>
                </div>
                <div className="mt-1 font-mono text-[9.5px] text-slate-500">
                  {new Date(ev.date).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })}{" "}
                  · {ev.type}
                </div>
              </Link>
            ))}
          </TabsContent>

          <TabsContent value="graph" className="flex-1 space-y-2 px-4 pb-4 pt-3">
            <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500">
              Graph Context · 1 hop
            </p>
            <MiniGraphPreview
              entity={entity}
              entities={entities}
              relationships={relationships}
              onPick={(id) => useGraphStore.getState().setSelectedId(id)}
            />
            <p className="text-[10px] leading-snug text-slate-600">
              Preview jaringan langsung di sekitar {entity.name}. Klik tetangga untuk
              berpindah. Double-click node di canvas utama untuk Focus Mode.
            </p>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

/* ---------------- mini logo ---------------- */

function MiniLogo({ entity }: { entity: Entity }) {
  const urls = entityBrandUrls(entity.id);
  const color = ENTITY_TYPE_ICON_COLOR[entity.type];
  const first = urls[0];
  return (
    <span
      className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-xl border"
      style={{
        backgroundColor: `${color}1c`,
        borderColor: `${color}44`,
      }}
    >
      {first ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={first}
          alt=""
          width={22}
          height={22}
          style={{ objectFit: "contain" }}
          onError={(e) => {
            (e.target as HTMLImageElement).style.display = "none";
          }}
        />
      ) : null}
      <span
        className="text-[11px] font-bold"
        style={{ color, display: first ? "none" : undefined }}
      >
        {entity.name.slice(0, 2).toUpperCase()}
      </span>
    </span>
  );
}
