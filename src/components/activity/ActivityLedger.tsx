"use client";

import { useMemo, useState } from "react";
import { Filter, RefreshCw, ScrollText, TriangleAlert } from "lucide-react";
import { cn } from "@/lib/utils/helpers";
import { useActivityQuery } from "@/hooks/useActivityQuery";
import {
  ACTIVITY_TABLE_LABELS,
  ACTIVITY_TABLE_WHITELIST,
  type ActivityAction,
} from "@/lib/types/activity";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ActivityRow } from "./ActivityRow";

const ACTIONS: { value: ActivityAction | "ALL"; label: string }[] = [
  { value: "ALL", label: "Semua aksi" },
  { value: "INSERT", label: "INSERT (+)" },
  { value: "UPDATE", label: "UPDATE (~)" },
  { value: "DELETE", label: "DELETE (−)" },
];

const LIMITS = [50, 100, 200];

/**
 * Activity Ledger — filter tabel/aksi + daftar entri gaya git-log.
 * Data 100% dari audit_log (trigger Postgres); kosong → empty-state informatif.
 */
export function ActivityLedger() {
  const [table, setTable] = useState<string>("ALL");
  const [action, setAction] = useState<ActivityAction | "ALL">("ALL");
  const [limit, setLimit] = useState(50);

  const filters = useMemo(
    () => ({
      table: table === "ALL" ? undefined : table,
      action: action === "ALL" ? undefined : action,
      limit,
    }),
    [table, action, limit]
  );

  const { data, isFetching, isLoading, isError, refetch } = useActivityQuery(filters);

  const entries = data ?? [];

  return (
    <div className="space-y-4">
      {/* toolbar filter */}
      <div className="flex flex-wrap items-center gap-2 rounded-lg border border-border bg-card p-2.5">
        <Filter className="h-3.5 w-3.5 text-muted-foreground" />
        <Select value={table} onValueChange={setTable}>
          <SelectTrigger className="h-8 w-[190px] text-[12px]">
            <SelectValue placeholder="Semua tabel" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">Semua tabel</SelectItem>
            {ACTIVITY_TABLE_WHITELIST.map((t) => (
              <SelectItem key={t} value={t}>
                {ACTIVITY_TABLE_LABELS[t] ?? t}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={action} onValueChange={(v) => setAction(v as ActivityAction | "ALL")}>
          <SelectTrigger className="h-8 w-[150px] text-[12px]">
            <SelectValue placeholder="Semua aksi" />
          </SelectTrigger>
          <SelectContent>
            {ACTIONS.map((a) => (
              <SelectItem key={a.value} value={a.value}>
                {a.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={String(limit)}
          onValueChange={(v) => setLimit(Number(v))}
        >
          <SelectTrigger className="h-8 w-[110px] text-[12px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {LIMITS.map((l) => (
              <SelectItem key={l} value={String(l)}>
                {l} entri
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Button
          variant="outline"
          size="sm"
          className="ml-auto h-8 gap-1.5 text-[12px]"
          onClick={() => refetch()}
          disabled={isFetching}
        >
          <RefreshCw className={cn("h-3.5 w-3.5", isFetching && "animate-spin")} />
          Segarkan
        </Button>
      </div>

      <p className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
        Auto-refresh 60 detik · data dari tabel <code className="font-mono">audit_log</code>{" "}
        (trigger <code className="font-mono">cif_audit_row()</code>)
      </p>

      {/* states */}
      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-[68px] w-full rounded-lg" />
          ))}
        </div>
      ) : isError ? (
        <div className="flex flex-col items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-10 text-center">
          <TriangleAlert className="h-6 w-6 text-destructive" />
          <p className="text-[13px] font-medium text-foreground">
            Gagal memuat Activity Ledger
          </p>
          <p className="max-w-md text-[12px] text-muted-foreground">
            Data tidak dapat dibaca dari server. Coba segarkan kembali.
          </p>
          <Button variant="outline" size="sm" onClick={() => refetch()}>
            Coba lagi
          </Button>
        </div>
      ) : entries.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-lg border border-dashed border-border bg-card/50 px-4 py-14 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
            <ScrollText className="h-6 w-6 text-muted-foreground" />
          </div>
          <div>
            <p className="text-[13.5px] font-semibold text-foreground">
              Belum ada aktivitas tercatat
            </p>
            <p className="mx-auto mt-1 max-w-md text-[12px] leading-relaxed text-muted-foreground">
              Ledger diisi otomatis oleh trigger Postgres{" "}
              <code className="font-mono">cif_audit_row()</code> setelah migrasi{" "}
              <code className="font-mono">phase0_multitenant_audit</code> dijalankan.
              Setiap INSERT/UPDATE/DELETE pada tabel inti akan muncul di sini — hingga
              ada perubahan data, ledger memang kosong.
            </p>
          </div>
          {table !== "ALL" || action !== "ALL" ? (
            <p className="text-[11px] text-muted-foreground">
              Filter aktif — coba ubah filter tabel/aksi untuk melihat entri lain.
            </p>
          ) : null}
        </div>
      ) : (
        <div>
          <div className="mb-2 flex items-center justify-between text-[11px] text-muted-foreground">
            <span>
              {entries.length} entri terbaru
              {table !== "ALL" && (
                <>
                  {" "}
                  · tabel <span className="font-mono">{table}</span>
                </>
              )}
              {action !== "ALL" && (
                <>
                  {" "}
                  · aksi <span className="font-mono">{action}</span>
                </>
              )}
            </span>
          </div>
          <div className="pl-1">
            {entries.map((e, i) => (
              <ActivityRow key={e.id} entry={e} last={i === entries.length - 1} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
