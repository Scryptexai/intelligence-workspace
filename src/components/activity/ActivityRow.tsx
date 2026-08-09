"use client";

import { Activity as ActivityIcon } from "lucide-react";
import { cn } from "@/lib/utils/helpers";
import type { ActivityAction, ActivityEntry } from "@/lib/types/activity";
import { ActivityDiff } from "./ActivityDiff";
import { actionLabel, formatDateTime, formatRelativeTime, tableLabel } from "./format";

/** Warna rail + badge per aksi (INSERT/UPDATE/DELETE). */
const ACTION_STYLE: Record<
  ActivityAction,
  { dot: string; badge: string; label: string }
> = {
  INSERT: {
    dot: "bg-success shadow-[0_0_6px_rgba(5,150,105,.5)]",
    badge: "border-success/40 bg-success/10 text-success",
    label: "+",
  },
  UPDATE: {
    dot: "bg-warning shadow-[0_0_6px_rgba(217,119,6,.5)]",
    badge: "border-warning/40 bg-warning/10 text-warning",
    label: "~",
  },
  DELETE: {
    dot: "bg-destructive shadow-[0_0_6px_rgba(225,29,72,.5)]",
    badge: "border-destructive/40 bg-destructive/10 text-destructive",
    label: "−",
  },
};

/**
 * Satu entri ledger — gaya git-log:
 *   [~] knowledge_items K-001 · Budi mengubah · 5 mnt lalu
 *       └─ diff expandable old → new
 */
export function ActivityRow({ entry, last = false }: { entry: ActivityEntry; last?: boolean }) {
  const style = ACTION_STYLE[entry.action] ?? ACTION_STYLE.UPDATE;
  const who = entry.actorLabel === "system" ? "Sistem" : entry.actorLabel;

  return (
    <div className="relative flex gap-3">
      {/* rail git-log */}
      <div className="flex w-4 shrink-0 flex-col items-center">
        <span className={cn("mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full", style.dot)} />
        {!last && <span className="w-px flex-1 bg-border/80" />}
      </div>

      <div className="min-w-0 flex-1 pb-3.5">
        <div className="rounded-lg border border-border bg-card px-3 py-2.5 transition-colors hover:border-border/80">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <span
              className={cn(
                "inline-flex h-5 w-6 items-center justify-center rounded border font-mono text-[12px] font-bold leading-none",
                style.badge
              )}
              title={actionLabel(entry.action)}
            >
              {style.label}
            </span>
            <span className="text-[12.5px] font-semibold text-foreground">
              {tableLabel(entry.tableName)}
            </span>
            {entry.rowId && (
              <span className="rounded border border-border bg-muted px-1.5 py-px font-mono text-[11px] text-foreground/90">
                {entry.rowId}
              </span>
            )}
            <span className="text-[12px] text-muted-foreground">
              <span className="font-medium text-foreground/80">{who}</span>{" "}
              {actionLabel(entry.action)}
            </span>
            <span
              className="ml-auto inline-flex items-center gap-1 font-mono text-[11px] text-muted-foreground"
              title={formatDateTime(entry.createdAt)}
            >
              <ActivityIcon className="h-3 w-3" />
              {formatRelativeTime(entry.createdAt)}
            </span>
          </div>
          <ActivityDiff entry={entry} />
        </div>
      </div>
    </div>
  );
}
