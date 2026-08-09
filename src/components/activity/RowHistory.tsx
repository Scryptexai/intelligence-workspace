"use client";

import { History, ScrollText, TriangleAlert } from "lucide-react";
import { useActivityQuery } from "@/hooks/useActivityQuery";
import { Skeleton } from "@/components/ui/skeleton";
import { ActivityRow } from "./ActivityRow";
import { formatDateTime } from "./format";

/**
 * Row History — riwayat perubahan SATU baris (per-row audit trail).
 * Disematkan di knowledge detail page; data dari /api/activity (audit_log,
 * filter row_id). Auto-refresh 60 detik. Kosong → empty-state informatif.
 */
export function RowHistory({
  table,
  rowId,
  limit = 15,
}: {
  table: string;
  rowId: string;
  limit?: number;
}) {
  const { data, isFetching, isLoading, isError, refetch } = useActivityQuery({
    table,
    rowId,
    limit,
  });

  const entries = data ?? [];

  return (
    <section className="mt-7">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="flex items-center gap-1.5 text-[12px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
          <History className="h-3.5 w-3.5" /> Row History
        </h2>
        <span className="font-mono text-[11px] text-muted-foreground/60">
          {isFetching ? "menyegarkan…" : `${entries.length} perubahan tercatat`}
        </span>
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-[58px] w-full rounded-lg" />
          ))}
        </div>
      ) : isError ? (
        <div className="flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-4 text-[12px] text-muted-foreground">
          <TriangleAlert className="h-4 w-4 shrink-0 text-destructive" />
          <span>Riwayat baris tidak dapat dimuat.</span>
          <button
            type="button"
            onClick={() => refetch()}
            className="ml-auto rounded border border-border px-2 py-0.5 text-[11px] font-medium hover:bg-accent"
          >
            Coba lagi
          </button>
        </div>
      ) : entries.length === 0 ? (
        <div className="flex items-center gap-3 rounded-lg border border-dashed border-border bg-card/50 px-4 py-5 text-[12px] text-muted-foreground">
          <ScrollText className="h-4.5 w-4.5 shrink-0 text-muted-foreground/60" />
          <p className="leading-relaxed">
            Belum ada perubahan tercatat untuk baris{" "}
            <code className="font-mono text-foreground/80">{rowId}</code> — riwayat
            akan terisi otomatis oleh trigger audit (<code className="font-mono">cif_audit_row()</code>)
            begitu baris ini diubah setelah migrasi Phase 0 dijalankan.
          </p>
        </div>
      ) : (
        <div className="pl-1">
          {entries.map((e, i) => (
            <ActivityRow key={e.id} entry={e} last={i === entries.length - 1} />
          ))}
          {entries.length >= limit && (
            <p className="pl-5 font-mono text-[11px] text-muted-foreground/70">
              … menampilkan {limit} perubahan terbaru · terakhir{" "}
              {formatDateTime(entries[0].createdAt)}
            </p>
          )}
        </div>
      )}
    </section>
  );
}
