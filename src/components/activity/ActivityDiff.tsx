"use client";

import { useState } from "react";
import { ChevronDown, Minus, Plus } from "lucide-react";
import { cn } from "@/lib/utils/helpers";
import type { ActivityEntry } from "@/lib/types/activity";
import { formatValue } from "./format";

/**
 * Diff expandable old → new untuk satu entri audit.
 * Gaya git diff: field yang berubah, nilai lama (merah) → nilai baru (hijau).
 * Aman terhadap data kosong/aneh — tidak pernah melempar.
 */
export function ActivityDiff({ entry }: { entry: ActivityEntry }) {
  const [open, setOpen] = useState(false);
  const fields = entry.changedFields ?? [];

  const rows: { field: string; old: unknown; new: unknown; hasOld: boolean; hasNew: boolean }[] =
    fields.length > 0
      ? fields.map((f) => ({
          field: f,
          old: entry.oldData ? entry.oldData[f] : undefined,
          new: entry.newData ? entry.newData[f] : undefined,
          hasOld: entry.oldData !== null,
          hasNew: entry.newData !== null,
        }))
      : [];

  const noRows =
    rows.length === 0 && entry.action !== "INSERT" && entry.action !== "DELETE";

  return (
    <div className="mt-2">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[11px] font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
        aria-expanded={open}
      >
        <ChevronDown
          className={cn("h-3 w-3 transition-transform", open && "rotate-180")}
        />
        {fields.length > 0
          ? `Lihat perubahan — ${fields.length} field`
          : "Lihat detail"}
      </button>

      {open && (
        <div className="mt-1.5 overflow-hidden rounded-md border border-border bg-muted/40">
          {noRows && (
            <p className="px-3 py-2 font-mono text-[11px] text-muted-foreground">
              (tidak ada diff detail untuk entri ini)
            </p>
          )}
          {rows.map((r) => {
            const isInsert = entry.action === "INSERT" && !r.hasOld;
            const isDelete = entry.action === "DELETE" && !r.hasNew;
            return (
              <div
                key={r.field}
                className="grid grid-cols-1 gap-0 border-b border-border/60 px-3 py-1.5 last:border-0 sm:grid-cols-[130px_minmax(0,1fr)_minmax(0,1fr)]"
              >
                <div className="flex items-center gap-1 py-0.5 font-mono text-[11px] font-semibold text-foreground">
                  {isInsert ? (
                    <Plus className="h-3 w-3 text-success" />
                  ) : isDelete ? (
                    <Minus className="h-3 w-3 text-destructive" />
                  ) : null}
                  {r.field}
                </div>
                <div className="flex items-start gap-1.5 py-0.5">
                  {r.hasOld ? (
                    <>
                      <span className="shrink-0 font-mono text-[10px] text-destructive/70">OLD</span>
                      <code className="min-w-0 break-all font-mono text-[11px] text-destructive/90 line-through decoration-destructive/40">
                        {formatValue(r.old)}
                      </code>
                    </>
                  ) : (
                    <span className="font-mono text-[11px] text-muted-foreground/50">—</span>
                  )}
                </div>
                <div className="flex items-start gap-1.5 py-0.5">
                  {r.hasNew ? (
                    <>
                      <span className="shrink-0 font-mono text-[10px] text-success/80">NEW</span>
                      <code className="min-w-0 break-all font-mono text-[11px] text-success">
                        {formatValue(r.new)}
                      </code>
                    </>
                  ) : (
                    <span className="font-mono text-[11px] text-muted-foreground/50">—</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
