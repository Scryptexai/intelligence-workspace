"use client";

import { useSyncExternalStore } from "react";
import {
  subscribeDataSource,
  getDataSourceSnapshot,
  type DataSourceSnapshot,
} from "@/lib/api/config";

/**
 * Snapshot statis untuk SSR & hydration. Sengaja selalu "mock": server bisa
 * meng-auto-detect backend dari env secret yang TIDAK tersedia di bundle
 * client, sehingga memakai DATA_SOURCE server di sini akan membuat HTML
 * server berbeda dari render client (hydration mismatch). Setelah mount,
 * runtime sync (/api/config) langsung menggantinya ke "Supabase"/"Database".
 */
const SSR_SNAPSHOT: DataSourceSnapshot = { mode: "mock", server: null };
import { cn } from "@/lib/utils/helpers";

/**
 * Indikator sumber data aktif (header).
 *
 *   - "Supabase"  → server membaca dari Supabase via PostgREST (hijau, pulse)
 *   - "Database"  → server membaca dari PostgreSQL langsung (hijau, pulse)
 *   - "Live"      → backend mode (build-time) tapi status server belum tersync
 *   - "Mock data" → data riset lokal lib/data (abu-abu)
 *
 * Nilai diambil dari snapshot runtime (auto-detect /api/config) sehingga
 * badge langsung berubah tanpa reload saat koneksi Supabase terdeteksi.
 */
export function DataSourceBadge({ className }: { className?: string }) {
  const snapshot = useSyncExternalStore(
    subscribeDataSource,
    getDataSourceSnapshot,
    () => SSR_SNAPSHOT
  );

  const isBackend = snapshot.mode === "backend";

  if (!isBackend) {
    return (
      <span
        className={cn(
          "inline-flex items-center gap-1.5 rounded border border-border bg-muted/40 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground",
          className
        )}
        title="Data riset dari lib/data (mock). Atur NEXT_PUBLIC_SUPABASE_URL + SUPABASE_SECRET_KEY untuk memuat database."
      >
        <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground/60" />
        Mock data
      </span>
    );
  }

  const label =
    snapshot.server === "supabase-rest"
      ? "Supabase"
      : snapshot.server === "connected"
        ? "Database"
        : "Live";

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded border border-success/30 bg-success/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-success",
        className
      )}
      title="Data dibaca dari database (Supabase/PostgreSQL) via API server."
    >
      <span className="h-1.5 w-1.5 rounded-full bg-success animate-pulse-dot" />
      {label}
    </span>
  );
}
