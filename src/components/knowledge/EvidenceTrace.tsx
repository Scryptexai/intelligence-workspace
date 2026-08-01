import Link from "next/link";
import {
  ExternalLink,
  FileText,
  Folder,
  GitCommitHorizontal,
} from "lucide-react";
import type { Evidence } from "@/lib/types/knowledge";
import { formatDate } from "@/lib/utils/helpers";

export function EvidenceTrace({
  evidence,
}: {
  evidence: Evidence[];
}) {
  return (
    <div className="overflow-hidden rounded-lg border border-border font-mono text-[12px]">
      {/* explorer header */}
      <div className="flex items-center gap-2 border-b border-border bg-muted/50 px-4 py-2">
        <Folder className="h-3.5 w-3.5 text-amber-400" />
        <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
          Evidence / trace
        </span>
        <span className="ml-auto text-[10.5px] text-muted-foreground">
          {evidence.length} commits
        </span>
      </div>

      <div className="divide-y divide-border/70">
        {evidence.map((ev, i) => (
          <div
            key={ev.id}
            className="group relative pl-7 transition-colors hover:bg-accent/40"
          >
            {/* tree connector */}
            <span className="absolute left-2.5 top-0 h-full border-l border-dashed border-border/70" />
            <span className="absolute left-2.5 top-4 h-3 w-3 border-b border-l border-border/70" />

            <div className="flex gap-3 py-2.5 pr-4">
              {/* commit hash gutter */}
              <div className="w-24 shrink-0 border-r border-border/60 pr-3 text-right text-[10.5px] leading-relaxed text-muted-foreground">
                <div className="flex items-center justify-end gap-1">
                  <GitCommitHorizontal className="h-3 w-3 text-primary" />
                  ev-{String(i + 1).padStart(3, "0")}
                </div>
                <div className="text-foreground/70">{ev.eventId}</div>
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                  <FileText className="h-3.5 w-3.5 shrink-0 text-sky-400" />
                  <Link
                    href={`/project/arbitrum/timeline?event=${ev.eventId}`}
                    className="text-[12.5px] font-medium text-foreground hover:text-primary"
                  >
                    {ev.eventName}
                  </Link>
                  <span className="text-[11px] text-warning" title={`Weight ${ev.weight}/5`}>
                    {"★".repeat(ev.weight)}
                    <span className="text-muted-foreground/40">
                      {"☆".repeat(5 - ev.weight)}
                    </span>
                  </span>
                </div>
                {ev.note && (
                  <p className="mt-0.5 text-[11.5px] leading-relaxed text-muted-foreground">
                    <span className="text-muted-foreground/60">// </span>
                    {ev.note}
                  </p>
                )}
                <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-[10.5px] text-muted-foreground">
                  <span>{formatDate(ev.date)}</span>
                  <span className="text-border">|</span>
                  <span className="font-medium text-foreground/80">{ev.source}</span>
                  <a
                    href={ev.url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-primary hover:underline"
                  >
                    source <ExternalLink className="h-2.5 w-2.5" />
                  </a>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
