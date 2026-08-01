"use client";

import type { EntityType } from "@/lib/types/entity";
import { useGraphStore } from "@/lib/store/graph";
import { cn } from "@/lib/utils/helpers";

/**
 * Pill filter tipe node — di atas graph. Saat dipilih, node lain hilang
 * dan graph otomatis auto-layout ulang.
 */
export function GraphFilters({
  types,
  counts,
}: {
  types: EntityType[];
  counts: Record<EntityType, number>;
}) {
  const { typeFilter, setTypeFilter } = useGraphStore();

  const pill = (active: boolean) =>
    cn(
      "flex h-7 items-center gap-1.5 rounded-full border px-3 text-[11px] font-medium transition-all",
      active
        ? "border-primary/60 bg-primary/15 text-primary"
        : "border-slate-700/60 bg-slate-900/70 text-slate-400 hover:border-slate-500/60 hover:text-slate-200"
    );

  return (
    <div className="absolute left-3 top-3 z-20 flex flex-wrap items-center gap-1.5">
      <button className={pill(typeFilter === "All")} onClick={() => setTypeFilter("All")}>
        All
        <span className="font-mono text-[9px] opacity-70">
          {Object.values(counts).reduce((a, b) => a + b, 0)}
        </span>
      </button>
      {types.map((t) => (
        <button
          key={t}
          className={pill(typeFilter === t)}
          onClick={() => setTypeFilter(typeFilter === t ? "All" : t)}
        >
          {t}
          <span className="font-mono text-[9px] opacity-70">{counts[t]}</span>
        </button>
      ))}
    </div>
  );
}
