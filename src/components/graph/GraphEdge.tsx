"use client";

import { memo } from "react";
import {
  BaseEdge,
  EdgeLabelRenderer,
  getSmoothStepPath,
  type EdgeProps,
} from "@xyflow/react";
import type { GraphEdgeData } from "./utils/graphDataTransformer";

/**
 * Edge kustom — kurva smoothstep, warna per kategori, animasi aliran
 * (dash bergerak) untuk edge funding/integration, tooltip saat hover.
 */
export const GraphEdge = memo(function GraphEdge(props: EdgeProps) {
  const {
    id,
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition,
    data,
    selected,
    markerEnd,
  } = props;
  const d = data as GraphEdgeData | undefined;

  const [path, labelX, labelY] = getSmoothStepPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetPosition,
    targetX,
    targetY,
    borderRadius: 18,
  });

  const color = d?.color ?? "#64748b";
  const hovered = d?.hovered;
  const faded = d?.faded;
  const active = hovered || selected;

  return (
    <>
      <BaseEdge
        id={id}
        path={path}
        markerEnd={markerEnd}
        style={{
          stroke: color,
          strokeWidth: active ? 3 : 1.8,
          opacity: faded ? 0.08 : active ? 1 : 0.85,
          strokeDasharray: d?.animated ? "7 5" : undefined,
          animation: d?.animated ? "dashflow 1.1s linear infinite" : undefined,
          transition: "stroke-width .15s ease, opacity .2s ease",
        }}
      />
      {active && d && (
        <EdgeLabelRenderer>
          <div
            className="pointer-events-none z-10 whitespace-nowrap rounded-md border border-slate-600/70 bg-slate-900/95 px-2 py-1 font-mono text-[10px] font-semibold text-slate-100 shadow-lg"
            style={{
              position: "absolute",
              transform: `translate(-50%,-50%) translate(${labelX}px,${labelY}px)`,
              borderColor: `${color}88`,
            }}
          >
            {d.label}
          </div>
        </EdgeLabelRenderer>
      )}
    </>
  );
});
