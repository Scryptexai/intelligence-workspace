import { ExternalLink, GitCommitHorizontal } from "lucide-react";
import type { DataProvenance } from "@/lib/types/lineage";
import { Card, CardContent } from "@/components/ui/card";
import { formatDateTime } from "@/components/activity/format";

/**
 * Provenance Card — asal-usul satu data point: "data ini berasal dari
 * DefiLlama API pada 2026-08-07 14:23". Server component.
 * Bila kolom provenance belum terisi (data lama / migrasi Phase 0 belum
 * dijalankan) → fallback informatif, bukan error.
 */
export function ProvenanceCard({ provenance }: { provenance?: DataProvenance }) {
  const p = provenance;
  const has = p?.hasProvenance === true;

  return (
    <Card>
      <CardContent className="p-4">
        <div className="mb-3 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
          <GitCommitHorizontal className="h-3.5 w-3.5" /> Source Provenance
        </div>

        {!has ? (
          <p className="text-[11.5px] leading-relaxed text-muted-foreground">
            Asal-usul data belum tercatat — item ini diimpor sebelum migrasi{" "}
            <code className="font-mono text-[10.5px]">phase0_multitenant_audit</code>{" "}
            (kolom provenance masih kosong). Setelah pipeline mengisi{" "}
            <code className="font-mono text-[10.5px]">source / connector / ingested_at</code>,
            jejak asal-usul akan tampil di sini.
          </p>
        ) : (
          <div className="space-y-2 text-[12px]">
            <div className="flex items-start justify-between gap-2">
              <span className="shrink-0 text-muted-foreground">Source</span>
              {p!.sourceUrl ? (
                <a
                  href={p!.sourceUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 text-right font-medium text-primary hover:underline"
                >
                  {p!.source || p!.sourceUrl} <ExternalLink className="h-3 w-3" />
                </a>
              ) : (
                <span className="text-right font-medium text-foreground">{p!.source || "—"}</span>
              )}
            </div>
            <div className="flex items-center justify-between gap-2">
              <span className="shrink-0 text-muted-foreground">Connector</span>
              <span className="font-mono text-[11.5px] text-foreground">
                {p!.connector || "—"}
              </span>
            </div>
            <div className="flex items-center justify-between gap-2">
              <span className="shrink-0 text-muted-foreground">Diimpor</span>
              <span className="font-mono text-[11.5px] text-foreground">
                {p!.ingestedAt ? formatDateTime(p!.ingestedAt) : "—"}
              </span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
