"use client";

import { cn } from "@/lib/utils/helpers";

/**
 * Data freshness indicator. `live` = green pulse, `degraded` = amber
 * partial, `stale`/fallback = amber "Data Stale" — never a crash.
 */
export function LiveBadge({
  source,
  isFetching,
  className,
}: {
  source?: "live" | "degraded" | "stale";
  isFetching?: boolean;
  className?: string;
}) {
  if (isFetching && source === "live") {
    return (
      <span className={cn("inline-flex items-center gap-1 text-[10px] font-medium text-muted-foreground", className)}>
        <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground/50" />
        syncing…
      </span>
    );
  }

  if (source === "live") {
    return (
      <span className={cn("inline-flex items-center gap-1 text-[10px] font-medium text-success", className)}>
        <span className="h-1.5 w-1.5 rounded-full bg-success animate-pulse-dot" />
        Live
      </span>
    );
  }

  if (source === "degraded") {
    return (
      <span className={cn("inline-flex items-center gap-1 text-[10px] font-medium text-warning", className)}>
        <span className="h-1.5 w-1.5 rounded-full bg-warning" />
        Partial
      </span>
    );
  }

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded border border-warning/40 bg-warning/10 px-1.5 py-0.5 text-[10px] font-semibold text-warning",
        className
      )}
      title="Upstream API unreachable — showing cached/mock values"
    >
      <span className="h-1.5 w-1.5 rounded-full bg-warning" />
      Data Stale
    </span>
  );
}
