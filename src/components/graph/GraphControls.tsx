"use client";

import { useState } from "react";
import { useReactFlow } from "@xyflow/react";
import {
  Focus,
  Lock,
  Minus,
  Plus,
  Search,
  Sparkles,
  Unlock,
  Wand2,
  X,
} from "lucide-react";
import type { Entity } from "@/lib/types/entity";
import { useGraphStore, type GraphLayoutMode } from "@/lib/store/graph";
import { cn } from "@/lib/utils/helpers";

const LAYOUT_OPTIONS: { mode: GraphLayoutMode; label: string; desc: string }[] = [
  { mode: "radial", label: "Radial", desc: "Sekitar pusat" },
  { mode: "hierarchical", label: "Hierarchical", desc: "Top-down (dagre)" },
  { mode: "force", label: "Force", desc: "d3-force natural" },
];

export function GraphControls({
  entities,
  onSearchSelect,
}: {
  entities: Entity[];
  onSearchSelect: (id: string) => void;
}) {
  const { zoomIn, zoomOut, fitView } = useReactFlow();
  const { locked, toggleLock, layoutMode, setLayoutMode, searchQuery, setSearchQuery } =
    useGraphStore();
  const [layoutOpen, setLayoutOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  const q = searchQuery.trim().toLowerCase();
  const matches = q
    ? entities
        .filter((e) => e.name.toLowerCase().includes(q) || e.type.toLowerCase().includes(q))
        .slice(0, 8)
    : [];

  return (
    <>
      {/* floating pill toolbar — kiri bawah */}
      <div className="absolute bottom-4 left-3 z-20 flex items-center gap-0.5 rounded-full border border-slate-700/60 bg-slate-900/90 p-1 shadow-2xl backdrop-blur">
        <button
          onClick={() => zoomIn({ duration: 200 })}
          className="flex h-8 w-8 items-center justify-center rounded-full text-slate-300 transition-colors hover:bg-slate-800 hover:text-white"
          title="Zoom in"
        >
          <Plus className="h-4 w-4" />
        </button>
        <button
          onClick={() => zoomOut({ duration: 200 })}
          className="flex h-8 w-8 items-center justify-center rounded-full text-slate-300 transition-colors hover:bg-slate-800 hover:text-white"
          title="Zoom out"
        >
          <Minus className="h-4 w-4" />
        </button>
        <span className="mx-0.5 h-5 w-px bg-slate-700/60" />
        <button
          onClick={() => fitView({ padding: 0.18, duration: 350 })}
          className="flex h-8 w-8 items-center justify-center rounded-full text-slate-300 transition-colors hover:bg-slate-800 hover:text-white"
          title="Reset view / fit to screen"
        >
          <Focus className="h-4 w-4" />
        </button>
        <button
          onClick={toggleLock}
          className={cn(
            "flex h-8 w-8 items-center justify-center rounded-full transition-colors",
            locked
              ? "bg-primary/20 text-primary"
              : "text-slate-300 hover:bg-slate-800 hover:text-white"
          )}
          title={locked ? "Layout terkunci — node tidak bisa digeser" : "Kunci layout"}
        >
          {locked ? <Lock className="h-4 w-4" /> : <Unlock className="h-4 w-4" />}
        </button>

        {/* auto-layout dropdown */}
        <div className="relative">
          <button
            onClick={() => setLayoutOpen((o) => !o)}
            className={cn(
              "flex h-8 items-center gap-1 rounded-full px-2 text-[11px] font-medium transition-colors",
              layoutOpen ? "bg-primary/20 text-primary" : "text-slate-300 hover:bg-slate-800 hover:text-white"
            )}
            title="Auto-layout"
          >
            <Wand2 className="h-3.5 w-3.5" />
            <span className="hidden md:inline">{layoutMode}</span>
          </button>
          {layoutOpen && (
            <div className="absolute bottom-11 left-0 w-44 rounded-xl border border-slate-700/60 bg-slate-900/95 p-1.5 shadow-2xl backdrop-blur">
              <div className="px-2 py-1 text-[9px] font-semibold uppercase tracking-[0.14em] text-slate-500">
                Auto-Layout
              </div>
              {LAYOUT_OPTIONS.map((o) => (
                <button
                  key={o.mode}
                  onClick={() => {
                    setLayoutMode(o.mode);
                    setLayoutOpen(false);
                  }}
                  className={cn(
                    "flex w-full items-center justify-between rounded-lg px-2 py-1.5 text-left transition-colors",
                    layoutMode === o.mode
                      ? "bg-primary/15 text-primary"
                      : "text-slate-300 hover:bg-slate-800"
                  )}
                >
                  <span>
                    <span className="block text-[12px] font-medium">{o.label}</span>
                    <span className="block text-[9.5px] text-slate-500">{o.desc}</span>
                  </span>
                  {layoutMode === o.mode && <Sparkles className="h-3 w-3" />}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* search node */}
        <div className="relative">
          <button
            onClick={() => {
              setSearchOpen((o) => !o);
              setLayoutOpen(false);
            }}
            className={cn(
              "flex h-8 w-8 items-center justify-center rounded-full transition-colors",
              searchOpen ? "bg-primary/20 text-primary" : "text-slate-300 hover:bg-slate-800 hover:text-white"
            )}
            title="Search node"
          >
            <Search className="h-4 w-4" />
          </button>
          {searchOpen && (
            <div className="absolute bottom-11 right-0 w-64 rounded-xl border border-slate-700/60 bg-slate-900/95 p-2 shadow-2xl backdrop-blur">
              <div className="flex items-center gap-2 rounded-lg border border-slate-700/70 bg-slate-800/70 px-2.5 py-1.5">
                <Search className="h-3.5 w-3.5 shrink-0 text-slate-400" />
                <input
                  autoFocus
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Cari entity…"
                  className="w-full bg-transparent text-[12px] text-white placeholder:text-slate-500 focus:outline-none"
                />
                {searchQuery && (
                  <button onClick={() => setSearchQuery("")} className="text-slate-500 hover:text-white">
                    <X className="h-3 w-3" />
                  </button>
                )}
              </div>
              <div className="mt-1.5 max-h-48 overflow-y-auto">
                {q && matches.length === 0 && (
                  <p className="px-2 py-2 text-[11px] text-slate-500">Tidak ada entity cocok.</p>
                )}
                {matches.map((e) => (
                  <button
                    key={e.id}
                    onClick={() => {
                      onSearchSelect(e.id);
                      setSearchOpen(false);
                    }}
                    className="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left transition-colors hover:bg-slate-800"
                  >
                    <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-cyan-400" />
                    <span className="min-w-0 flex-1 truncate text-[12px] text-slate-200">
                      {e.name}
                    </span>
                    <span className="text-[9px] uppercase text-slate-500">{e.type}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
