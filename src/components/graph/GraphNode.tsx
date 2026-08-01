"use client";

import { memo, useState } from "react";
import { Handle, Position, type Node, type NodeProps } from "@xyflow/react";
import {
  AppWindow,
  Banknote,
  Brain,
  Building2,
  CalendarDays,
  Landmark,
  Layers,
  Scale,
  ShieldCheck,
  User,
  Users,
} from "lucide-react";
import type { Entity, EntityType } from "@/lib/types/entity";
import { entityBrandUrls, ENTITY_TYPE_ICON_COLOR } from "@/lib/brand";
import { cn } from "@/lib/utils/helpers";
import type { GraphNodeData } from "./utils/graphDataTransformer";

export type GraphFlowNode = Node<GraphNodeData, "graphNode">;

const TYPE_ICON: Record<EntityType, typeof Building2> = {
  Person: User,
  Company: Building2,
  Foundation: Landmark,
  Protocol: Layers,
  Investor: Banknote,
  Application: AppWindow,
  Security: ShieldCheck,
  DAO: Users,
  Government: Scale,
};

const STATUS_STRIP: Record<Entity["status"], string> = {
  Active: "bg-emerald-500",
  Dormant: "bg-slate-500",
  Contested: "bg-rose-500",
  Unknown: "bg-slate-600",
};

const STATUS_TEXT: Record<Entity["status"], string> = {
  Active: "Active",
  Dormant: "Inactive",
  Contested: "Contested",
  Unknown: "Unknown",
};

function NodeLogo({ entity, size = 26 }: { entity: Entity; size?: number }) {
  const urls = entityBrandUrls(entity.id);
  const [idx, setIdx] = useState(0);
  const failed = idx >= urls.length;
  const Icon = TYPE_ICON[entity.type];
  const color = ENTITY_TYPE_ICON_COLOR[entity.type];

  if (!failed) {
    return (
      <span className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-slate-700/60 bg-slate-800/70">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={urls[idx]}
          alt=""
          width={22}
          height={22}
          loading="lazy"
          style={{ objectFit: "contain" }}
          onError={() => setIdx((i) => i + 1)}
        />
      </span>
    );
  }

  return (
    <span
      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border"
      style={{
        backgroundColor: `${color}1c`,
        borderColor: `${color}44`,
        color,
      }}
    >
      <Icon style={{ width: 18, height: 18 }} strokeWidth={2} />
    </span>
  );
}

export const GraphNode = memo(function GraphNode({
  data,
  selected,
}: NodeProps<GraphFlowNode>) {
  const { entity, degree, faded, focused } = data;
  const Icon = TYPE_ICON[entity.type];
  const iconColor = ENTITY_TYPE_ICON_COLOR[entity.type];

  return (
    <div
      className={cn(
        "group relative w-[210px] select-none rounded-2xl border bg-[#10151d]/90 shadow-lg backdrop-blur-sm transition-all duration-200",
        faded && "pointer-events-none opacity-[0.1]",
        focused &&
          "border-cyan-400/50 shadow-[0_0_28px_rgba(34,211,238,0.22)] ring-1 ring-cyan-400/30",
        !faded &&
          (selected
            ? "border-cyan-400/80 shadow-xl shadow-cyan-500/10"
            : "border-slate-700/50"),
        !faded && "hover:scale-[1.04] hover:bg-[#151d29]/95 hover:shadow-2xl"
      )}
    >
      {/* konten */}
      <div className="flex items-center gap-2.5 p-3 pb-2.5">
        <NodeLogo entity={entity} />
        <div className="min-w-0 flex-1">
          <p className="truncate text-[13px] font-semibold text-white">
            {entity.name}
          </p>
          <span
            className="mt-0.5 inline-flex items-center gap-1 rounded px-1.5 py-px text-[9px] font-semibold uppercase tracking-wide"
            style={{ backgroundColor: `${iconColor}1f`, color: iconColor }}
          >
            <Icon style={{ width: 9, height: 9 }} />
            {entity.type}
          </span>
        </div>
        {degree > 0 && (
          <span className="shrink-0 rounded-full border border-slate-700/60 bg-slate-800/80 px-1.5 py-0.5 font-mono text-[9px] font-bold text-slate-300">
            {degree}
          </span>
        )}
      </div>

      {/* baris statistik */}
      <div className="flex items-center gap-3 px-3 pb-3 text-[10px] text-slate-500">
        <span className="flex items-center gap-1">
          <Brain className="h-3 w-3" /> {entity.relatedKnowledge.length}
        </span>
        <span className="flex items-center gap-1">
          <CalendarDays className="h-3 w-3" /> {entity.relatedEvents.length}
        </span>
        <span className="ml-auto font-mono text-[9px] uppercase tracking-wide text-slate-600">
          {STATUS_TEXT[entity.status]}
        </span>
      </div>

      {/* status glow strip */}
      <div
        className={cn(
          "absolute inset-x-0 bottom-0 h-[3px] rounded-b-2xl",
          STATUS_STRIP[entity.status]
        )}
      />

      {/* handles (invisible) */}
      <Handle type="target" position={Position.Left} className="!h-2 !w-2 !border !border-cyan-400/50 !bg-slate-800" />
      <Handle type="source" position={Position.Right} className="!h-2 !w-2 !border !border-cyan-400/50 !bg-slate-800" />
    </div>
  );
});
