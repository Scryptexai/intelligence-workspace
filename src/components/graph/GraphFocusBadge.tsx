"use client";

import { Crosshair, X } from "lucide-react";
import { useGraphStore } from "@/lib/store/graph";

/**
 * Badge Focus Mode — pojok kanan bawah. Muncul saat node di-double-click:
 * "Focus: <nama> (N hops) · [Reset]"
 */
export function GraphFocusBadge({ entityName }: { entityName?: string }) {
  const { focusedId, hopLevel, clearFocus } = useGraphStore();
  if (!focusedId) return null;

  return (
    <div className="absolute bottom-4 right-4 z-20 flex items-center gap-2 rounded-full border border-cyan-400/40 bg-slate-900/95 py-1.5 pl-3 pr-1.5 shadow-2xl backdrop-blur">
      <Crosshair className="h-3.5 w-3.5 text-cyan-400" />
      <span className="text-[11px] text-slate-300">
        Focus: <span className="font-semibold text-white">{entityName ?? focusedId}</span>
        <span className="ml-1 font-mono text-[10px] text-slate-500">({hopLevel} hops)</span>
      </span>
      <button
        onClick={clearFocus}
        className="flex h-6 items-center gap-1 rounded-full bg-cyan-400/15 px-2 text-[10px] font-semibold text-cyan-300 transition-colors hover:bg-cyan-400/25"
      >
        <X className="h-3 w-3" /> Reset
      </button>
    </div>
  );
}
