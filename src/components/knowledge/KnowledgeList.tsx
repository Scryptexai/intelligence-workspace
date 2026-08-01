"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Search, SlidersHorizontal } from "lucide-react";
import { useVirtualizer } from "@tanstack/react-virtual";
import type { KnowledgeItem } from "@/lib/types/knowledge";
import { KnowledgeCard } from "@/components/project/KnowledgeCard";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useUIStore } from "@/lib/store/ui";
import { useGlobalFilters, filterKnowledgeByRange } from "@/lib/store/globalFilters";
import { cn } from "@/lib/utils/helpers";

const STATUS_FILTERS = ["All", "Stable", "Emerging", "Volatile", "Deprecated"] as const;

export function KnowledgeList({
  items,
  baseHref,
  initialQuery = "",
  initialStatus = "All",
  onChange,
}: {
  items: KnowledgeItem[];
  baseHref: string;
  initialQuery?: string;
  initialStatus?: (typeof STATUS_FILTERS)[number];
  onChange?: (f: { q: string; status: string }) => void;
}) {
  const [query, setQuery] = useState(initialQuery);
  const [status, setStatus] = useState<(typeof STATUS_FILTERS)[number]>(initialStatus);
  const density = useUIStore((s) => s.density);
  const timeRange = useGlobalFilters((s) => s.timeRange);
  const parentRef = useRef<HTMLDivElement>(null);
  // Skip onChange pada mount pertama — mencegah router.replace di awal render
  // yang bisa memicu RSC refetch → loop reload tak terbatas.
  const skipFirstSync = useRef(true);

  const inRange = useMemo(() => filterKnowledgeByRange(items, timeRange), [items, timeRange]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return inRange.filter((k) => {
      const matchesQuery =
        !q ||
        k.name.toLowerCase().includes(q) ||
        k.id.toLowerCase().includes(q) ||
        k.category.toLowerCase().includes(q) ||
        k.description.toLowerCase().includes(q);
      const matchesStatus = status === "All" || k.status === status;
      return matchesQuery && matchesStatus;
    });
  }, [inRange, query, status]);

  // URL sync — hanya saat user BENAR-BENAR mengubah filter (bukan mount).
  useEffect(() => {
    if (skipFirstSync.current) {
      skipFirstSync.current = false;
      return;
    }
    onChange?.({ q: query, status });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query, status]);

  const virtualize = filtered.length > 40;
  const rowVirtualizer = useVirtualizer({
    count: virtualize ? filtered.length : 0,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 108,
    overscan: 6,
  });

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative min-w-0 flex-1 basis-64">
          <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Filter knowledge by name, id, category…"
            className="pl-8"
          />
        </div>
        <div className="flex items-center gap-1.5">
          <SlidersHorizontal className="h-3.5 w-3.5 text-muted-foreground" />
          {STATUS_FILTERS.map((s) => (
            <button
              key={s}
              onClick={() => setStatus(s)}
              className={cn(
                "rounded-md px-2.5 py-1 text-[11px] font-medium transition-colors",
                status === s
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:bg-accent hover:text-foreground"
              )}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
        <span>
          Showing <span className="font-mono font-semibold text-foreground">{filtered.length}</span> of{" "}
          {inRange.length} in range
          {timeRange !== "all" && <span className="text-primary"> · {timeRange === "3y" ? "3y" : "1y"}</span>}
        </span>
        <Badge variant="muted" className="ml-auto hidden sm:inline-flex">
          CIF Knowledge Ledger
        </Badge>
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-lg border border-dashed border-border py-16 text-center">
          <p className="text-[13px] text-muted-foreground">
            No knowledge matches the current filter{timeRange !== "all" ? " within the selected time range" : ""}.
          </p>
        </div>
      ) : virtualize ? (
        <div
          ref={parentRef}
          className="h-[560px] overflow-y-auto rounded-lg border border-border"
        >
          <div
            style={{ height: rowVirtualizer.getTotalSize(), position: "relative" }}
          >
            {rowVirtualizer.getVirtualItems().map((vi) => {
              const k = filtered[vi.index];
              return (
                <div
                  key={k.id}
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: "100%",
                    transform: `translateY(${vi.start}px)`,
                    padding: "6px 10px",
                  }}
                >
                  <KnowledgeCard item={k} href={`${baseHref}/${k.id}`} />
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div
          className={cn(
            "grid grid-cols-1 gap-3",
            density === "compact"
              ? "md:grid-cols-2 xl:grid-cols-4"
              : "md:grid-cols-2 xl:grid-cols-3"
          )}
        >
          {filtered.map((k) => (
            <KnowledgeCard key={k.id} item={k} href={`${baseHref}/${k.id}`} />
          ))}
        </div>
      )}
    </div>
  );
}
