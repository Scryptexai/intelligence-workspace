"use client";

import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { ChevronRight, GitMerge } from "lucide-react";
import { useVirtualizer } from "@tanstack/react-virtual";
import type { Conflict } from "@/lib/types/conflict";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { impactScore, ImpactBadge } from "./ConflictAnalytics";
import { cn } from "@/lib/utils/helpers";

const SEVERITY_VARIANT: Record<
  Conflict["severity"],
  "critical" | "warning" | "default" | "muted"
> = {
  Critical: "critical",
  High: "warning",
  Medium: "default",
  Low: "muted",
};

const SEVERITIES = ["All", "Critical", "High", "Medium", "Low"] as const;
const STATUSES = ["All", "Resolved", "Unresolved"] as const;

type SeverityFilter = (typeof SEVERITIES)[number];
type StatusFilter = (typeof STATUSES)[number];

/** Memoized row — only re-renders when its own conflict changes. */
const ConflictRow = memo(function ConflictRow({
  conflict,
  href,
}: {
  conflict: Conflict;
  href: string;
}) {
  const impact = impactScore(conflict);
  const resolved = conflict.status === "Resolved";
  return (
    <Link
      href={href}
      className={cn(
        "project-glow-hover group relative flex h-full flex-col overflow-hidden rounded-lg border border-border bg-card p-4 pl-5",
        // border kiri "menyala": merah (unresolved) / hijau (resolved)
        resolved ? "border-l-4 border-l-success/70" : "border-l-4 border-l-critical/70"
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <h3 className="text-[13.5px] font-semibold leading-snug text-foreground group-hover:text-primary">
          {conflict.title}
        </h3>
        <div className="flex shrink-0 flex-col items-end gap-1">
          <Badge variant={SEVERITY_VARIANT[conflict.severity]}>{conflict.severity}</Badge>
          <ImpactBadge score={impact} />
        </div>
      </div>
      {/* Diff preview: dua klaim yang berlawanan dibaca sebelum dossier dibuka. */}
      <div className={cn("mt-3 grid grid-cols-[1fr_auto_1fr] items-center gap-2 rounded-md border px-2.5 py-2 font-mono text-[11px]", resolved ? "border-success/20 bg-success/5" : "border-critical/20 bg-critical/5")}>
        <span className="truncate text-critical line-through decoration-critical/70" title={conflict.versionA.source}>{conflict.versionA.value || conflict.versionA.source}</span>
        <span className="text-muted-foreground/60">→</span>
        <span className="truncate text-success" title={conflict.versionB.source}>{conflict.versionB.value || conflict.versionB.source}</span>
      </div>
      <p className="mt-2 line-clamp-1 text-[12px] leading-relaxed text-muted-foreground">
        {conflict.description}
      </p>
      <div className="mt-2.5 flex flex-wrap items-center gap-x-2.5 gap-y-1 text-[11px] text-muted-foreground">
        <Badge variant={conflict.status === "Resolved" ? "success" : "muted"}>
          {conflict.status}
        </Badge>
        <Badge variant="secondary" className="normal-case tracking-normal">
          {conflict.category}
        </Badge>
        <span>{conflict.affectedPhase}</span>
        <span className="text-muted-foreground/50">·</span>
        <span className="font-mono">
          A: <span className="font-semibold text-rose-400/80">{conflict.versionA.source}</span>
        </span>
        <span className="text-muted-foreground/50">vs</span>
        <span className="font-mono">
          B: <span className="font-semibold text-cyan-400/80">{conflict.versionB.source}</span>
        </span>
        <span className="ml-auto flex items-center gap-1">
          {conflict.affectedKnowledge.length} knowledge
          <ChevronRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
        </span>
      </div>
      <div className="mt-auto pt-2 text-[10px] font-mono text-muted-foreground/55">
        ID: {conflict.id}
      </div>
    </Link>
  );
});

export function ConflictList({
  conflicts,
  baseHref,
  initialSeverity = "All",
  initialStatus = "All",
  onChange,
}: {
  conflicts: Conflict[];
  baseHref: string;
  initialSeverity?: SeverityFilter;
  initialStatus?: StatusFilter;
  onChange?: (f: { severity: string; status: string }) => void;
}) {
  const [severity, setSeverity] = useState<SeverityFilter>(initialSeverity);
  const [status, setStatus] = useState<StatusFilter>(initialStatus);
  const parentRef = useRef<HTMLDivElement>(null);
  // Skip onChange pada mount — mencegah loop router.replace → RSC refetch.
  const skipFirstSync = useRef(true);

  const filtered = useMemo(
    () =>
      conflicts.filter(
        (c) =>
          (severity === "All" || c.severity === severity) &&
          (status === "All" || c.status === status)
      ),
    [conflicts, severity, status]
  );

  const handleSeverity = useCallback((v: string) => {
    setSeverity(v as SeverityFilter);
  }, []);
  const handleStatus = useCallback((v: string) => {
    setStatus(v as StatusFilter);
  }, []);

  useEffect(() => {
    if (skipFirstSync.current) {
      skipFirstSync.current = false;
      return;
    }
    onChange?.({ severity, status });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [severity, status]);

  const resolved = conflicts.filter((c) => c.status === "Resolved").length;

  const rowVirtualizer = useVirtualizer({
    count: filtered.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 132,
    overscan: 6,
  });

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <div className="flex items-center gap-1.5">
          <GitMerge className="h-3.5 w-3.5 text-primary" />
          <span className="text-[11px] text-muted-foreground">
            <span className="font-mono font-semibold text-foreground">{conflicts.length}</span> conflicts
            · <span className="font-mono">{resolved}</span> resolved
          </span>
        </div>

        <div className="ml-auto flex items-center gap-2">
          <Select value={severity} onValueChange={handleSeverity}>
            <SelectTrigger className="h-8 w-32 text-[12px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {SEVERITIES.map((s) => (
                <SelectItem key={s} value={s}>
                  {s === "All" ? "Any severity" : s}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={status} onValueChange={handleStatus}>
            <SelectTrigger className="h-8 w-32 text-[12px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {STATUSES.map((s) => (
                <SelectItem key={s} value={s}>
                  {s === "All" ? "Any status" : s}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-lg border border-dashed border-border py-16 text-center">
          <p className="text-[13px] text-muted-foreground">
            No conflicts match the current filter.
          </p>
        </div>
      ) : (
        <div ref={parentRef} className="h-[600px] overflow-y-auto rounded-lg border border-border">
          <div style={{ height: rowVirtualizer.getTotalSize(), position: "relative" }}>
            {rowVirtualizer.getVirtualItems().map((vi) => {
              const c = filtered[vi.index];
              return (
                <div
                  key={c.id}
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: "100%",
                    transform: `translateY(${vi.start}px)`,
                    padding: "6px 10px",
                  }}
                >
                  <ConflictRow conflict={c} href={`${baseHref}/${c.id}`} />
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
