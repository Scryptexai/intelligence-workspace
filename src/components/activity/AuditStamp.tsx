"use client";

import { GitCommitHorizontal } from "lucide-react";
import { useActivityQuery } from "@/hooks/useActivityQuery";
import { formatRelativeTime } from "@/components/activity/format";

/**
 * Sticky audit trail — garis tipis di bawah knowledge:
 * "* Terakhir diverifikasi oleh {actor} · {waktu}" — data RIIL dari
 * audit_log (trigger Postgres). Kosong → fallback netral, bukan error.
 */
export function AuditStamp({
  table,
  rowId,
}: {
  table: string;
  rowId: string;
}) {
  const { data } = useActivityQuery({ table, rowId, limit: 1 });
  const latest = data?.[0];

  return (
    <div className="mt-6 flex items-center gap-2 border-t border-border/70 pt-3 font-mono text-[10.5px] text-muted-foreground/70">
      <GitCommitHorizontal className="h-3 w-3 text-primary/70" />
      {latest ? (
        <span>
          * Terakhir diverifikasi oleh{" "}
          <span className="text-foreground/80">
            {latest.actorLabel === "system" ? "Sistem" : latest.actorLabel}
          </span>{" "}
          · {formatRelativeTime(latest.createdAt)}
        </span>
      ) : (
        <span>* Jejak verifikasi akan tercatat di sini oleh trigger audit setelah baris ini diubah</span>
      )}
    </div>
  );
}
