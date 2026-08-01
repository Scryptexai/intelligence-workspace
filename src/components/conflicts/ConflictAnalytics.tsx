"use client";

import { useMemo } from "react";
import dynamic from "next/dynamic";
import { AlertTriangle, CheckCircle2, ShieldAlert } from "lucide-react";
import type { Conflict } from "@/lib/types/conflict";
import { cn } from "@/lib/utils/helpers";

// ECharts donut — lazy chunk, hanya untuk halaman ini.
const DonutChart = dynamic(() => import("@/components/qa/DonutChart").then((m) => m.DonutChart), {
  loading: () => <div className="shimmer h-[180px] w-full rounded-lg" />,
});

const PHASE_COLORS = [
  "#fbbf24",
  "#f472b6",
  "#34d399",
  "#38bdf8",
  "#a78bfa",
  "#fb923c",
];

export function ConflictAnalytics({ conflicts }: { conflicts: Conflict[] }) {
  const byPhase = useMemo(() => {
    const m = new Map<string, number>();
    for (const c of conflicts) m.set(c.affectedPhase, (m.get(c.affectedPhase) ?? 0) + 1);
    return [...m.entries()]
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [conflicts]);

  const resolved = conflicts.filter((c) => c.status === "Resolved").length;
  const critical = conflicts.filter((c) => c.severity === "Critical").length;
  const open = conflicts.length - resolved;
  const avgImpact = Math.round(
    (conflicts.reduce((s, c) => s + impactScore(c), 0) / Math.max(conflicts.length, 1)) * 10
  ) / 10;

  return (
    <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
      {/* donut — breakdown per phase */}
      <div className="rounded-lg border border-border bg-card p-3">
        <div className="mb-1 flex items-center justify-between px-1">
          <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
            By Phase
          </span>
          <span className="font-mono text-[10px] text-muted-foreground">{conflicts.length} total</span>
        </div>
        <DonutChart
          items={byPhase.map((p, i) => ({ ...p, name: p.name }))}
          color={PHASE_COLORS[0]}
          centerLabel="conflicts"
          centerValue={String(conflicts.length)}
          height={170}
        />
        <div className="mt-1 flex flex-wrap justify-center gap-x-2 gap-y-0.5">
          {byPhase.map((p, i) => (
            <span key={p.name} className="flex items-center gap-1 text-[10px] text-muted-foreground">
              <span className="h-2 w-2 rounded-full" style={{ backgroundColor: PHASE_COLORS[i % PHASE_COLORS.length] }} />
              {p.name}
            </span>
          ))}
        </div>
      </div>

      {/* KPI strip */}
      <div className="grid grid-cols-2 gap-3 md:col-span-2">
        <div className="flex items-center gap-3 rounded-lg border border-border bg-card p-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-critical/10 text-critical">
            <ShieldAlert className="h-5 w-5" />
          </div>
          <div>
            <div className="font-mono text-2xl font-bold tabular-nums text-foreground">{critical}</div>
            <div className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
              Critical
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3 rounded-lg border border-border bg-card p-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-warning/10 text-warning">
            <AlertTriangle className="h-5 w-5" />
          </div>
          <div>
            <div className="font-mono text-2xl font-bold tabular-nums text-foreground">{open}</div>
            <div className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
              Open
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3 rounded-lg border border-border bg-card p-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-success/10 text-success">
            <CheckCircle2 className="h-5 w-5" />
          </div>
          <div>
            <div className="font-mono text-2xl font-bold tabular-nums text-foreground">{resolved}</div>
            <div className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
              Resolved
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3 rounded-lg border border-border bg-card p-4">
          <div
            className={cn(
              "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-foreground",
              "bg-muted"
            )}
          >
            <span className="font-mono text-[15px] font-bold">Σ</span>
          </div>
          <div>
            <div className="font-mono text-2xl font-bold tabular-nums text-foreground">{avgImpact}</div>
            <div className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
              Avg Impact (1–10)
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/** Impact score deterministic (1-10) — severity + affected knowledge + phase. */
export function impactScore(c: Conflict): number {
  const sev = c.severity === "Critical" ? 4 : c.severity === "High" ? 3 : c.severity === "Medium" ? 2 : 1;
  const k = Math.min(3, c.affectedKnowledge.length);
  const unresolved = c.status === "Unresolved" ? 1 : 0;
  return Math.min(10, sev * 2 + k + unresolved);
}

export function ImpactBadge({ score }: { score: number }) {
  const color =
    score >= 8 ? "text-critical" : score >= 5 ? "text-warning" : "text-success";
  return (
    <span className={cn("inline-flex items-center gap-1 font-mono text-[11px] font-bold tabular-nums", color)}>
      {score >= 8 ? "🔥" : score >= 5 ? "⚡" : "●"} {score}/10
    </span>
  );
}
