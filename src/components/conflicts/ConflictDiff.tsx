import Link from "next/link";
import { CheckCircle2, ExternalLink, GitMerge } from "lucide-react";
import type { Conflict } from "@/lib/types/conflict";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils/helpers";
import { reliabilityOf, type Reliability } from "@/lib/brand";
import { cn } from "@/lib/utils/helpers";

const RELIABILITY_VARIANT: Record<Reliability, "success" | "warning" | "muted"> = {
  High: "success",
  Medium: "warning",
  Low: "muted",
};

/* ------------------------------------------------------------------ */
/* Word-level diff: sorot token angka yang berbeda antar versi          */
/* ------------------------------------------------------------------ */

function numericTokens(text: string): Set<string> {
  const out = new Set<string>();
  for (const t of text.split(/\s+/)) {
    if (/\d/.test(t)) out.add(t);
  }
  return out;
}

/** Render teks dengan highlight: angka "removed" (A) / "added" (B). */
function DiffText({ text, diff, tone }: { text: string; diff: Set<string>; tone: "a" | "b" }) {
  const parts = text.split(/\s+/);
  return (
    <p className="font-mono text-[12.5px] leading-relaxed">
      {parts.map((w, i) => {
        const marked = /\d/.test(w) && diff.has(w);
        return (
          <span key={i}>
            <span
              className={cn(
                "rounded px-0.5",
                marked &&
                  (tone === "a"
                    ? "bg-red-500/25 text-red-200 line-through decoration-red-400/70"
                    : "bg-green-500/25 text-green-200")
              )}
            >
              {w}
            </span>{" "}
          </span>
        );
      })}
    </p>
  );
}

export function ConflictDiff({
  conflict,
  projectSlug,
}: {
  conflict: Conflict;
  projectSlug: string;
}) {
  const aNums = numericTokens(conflict.versionA.value);
  const bNums = numericTokens(conflict.versionB.value);
  const removedInA = new Set([...aNums].filter((n) => !bNums.has(n)));
  const addedInB = new Set([...bNums].filter((n) => !aNums.has(n)));

  return (
    <div className="space-y-4">
      {/* resolution banner */}
      {conflict.status === "Resolved" && conflict.resolution && (
        <div className="flex items-start gap-3 rounded-lg border border-success/40 bg-success/10 p-4">
          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-success" />
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-[0.12em] text-success">
              Resolution
            </div>
            <p className="mt-1 text-[13px] leading-relaxed text-foreground">{conflict.resolution}</p>
          </div>
        </div>
      )}

      {/* header bar */}
      <div className="flex items-center gap-2 rounded-lg border border-border bg-muted/50 px-4 py-2">
        <GitMerge className="h-3.5 w-3.5 text-primary" />
        <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
          Forensic Diff · Side-by-side
        </span>
        <span className="ml-auto rounded border border-border px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground">
          {conflict.id}
        </span>
      </div>

      {/* SIDE-BY-SIDE diff */}
      <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
        {/* Version A */}
        <div className="overflow-hidden rounded-lg border border-red-500/30">
          <div className="flex items-center gap-2 border-b border-red-500/30 bg-red-500/10 px-4 py-2">
            <span className="select-none font-mono text-[13px] font-bold text-red-400">−</span>
            <span className="text-[12px] font-bold text-red-300">Version A</span>
            <Badge variant="secondary" className="ml-auto normal-case tracking-normal">
              {conflict.versionA.source}
            </Badge>
            <Badge
              variant={RELIABILITY_VARIANT[reliabilityOf(conflict.versionA.source)]}
              className="normal-case tracking-normal"
            >
              {reliabilityOf(conflict.versionA.source)}
            </Badge>
          </div>
          <div className="min-h-[120px] bg-red-950/30 p-4">
            <DiffText text={conflict.versionA.value} diff={removedInA} tone="a" />
            <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-red-500/20 pt-2 text-[10.5px] text-red-200/70">
              <span className="font-mono">{formatDate(conflict.versionA.date)}</span>
              <span>·</span>
              <span>{conflict.versionA.evidence}</span>
              <a
                href={conflict.versionA.url}
                target="_blank"
                rel="noreferrer"
                className="ml-auto inline-flex items-center gap-1 text-red-300 hover:underline"
              >
                source <ExternalLink className="h-2.5 w-2.5" />
              </a>
            </div>
          </div>
        </div>

        {/* Version B */}
        <div className="overflow-hidden rounded-lg border border-green-500/30">
          <div className="flex items-center gap-2 border-b border-green-500/30 bg-green-500/10 px-4 py-2">
            <span className="select-none font-mono text-[13px] font-bold text-green-400">+</span>
            <span className="text-[12px] font-bold text-green-300">Version B</span>
            <Badge variant="secondary" className="ml-auto normal-case tracking-normal">
              {conflict.versionB.source}
            </Badge>
            <Badge
              variant={RELIABILITY_VARIANT[reliabilityOf(conflict.versionB.source)]}
              className="normal-case tracking-normal"
            >
              {reliabilityOf(conflict.versionB.source)}
            </Badge>
          </div>
          <div className="min-h-[120px] bg-green-950/30 p-4">
            <DiffText text={conflict.versionB.value} diff={addedInB} tone="b" />
            <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-green-500/20 pt-2 text-[10.5px] text-green-200/70">
              <span className="font-mono">{formatDate(conflict.versionB.date)}</span>
              <span>·</span>
              <span>{conflict.versionB.evidence}</span>
              <a
                href={conflict.versionB.url}
                target="_blank"
                rel="noreferrer"
                className="ml-auto inline-flex items-center gap-1 text-green-300 hover:underline"
              >
                source <ExternalLink className="h-2.5 w-2.5" />
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* affected knowledge */}
      <div className="rounded-lg border border-border bg-card p-4">
        <div className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
          Affected Knowledge
        </div>
        <div className="mt-2 flex flex-wrap gap-2">
          {conflict.affectedKnowledge.map((kid) => (
            <Link
              key={kid}
              href={`/project/${projectSlug}/knowledge/${kid}`}
              className="rounded-md border border-border bg-muted px-2.5 py-1 font-mono text-[12px] text-foreground transition-colors hover:border-primary hover:text-primary"
            >
              {kid}
            </Link>
          ))}
          <span className="ml-auto self-center rounded border border-border px-2 py-1 font-mono text-[11px] text-muted-foreground">
            phase: {conflict.affectedPhase}
          </span>
        </div>
      </div>
    </div>
  );
}
