import Link from "next/link";
import { ArrowDownRight, ArrowUpRight, Minus } from "lucide-react";
import type { Project } from "@/lib/types/project";
import type { KnowledgeItem } from "@/lib/types/knowledge";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils/helpers";

const METRICS: {
  key: keyof Pick<
    Project,
    | "cifScore"
    | "confidence"
    | "knowledgeCount"
    | "conflictCount"
    | "coverage"
    | "entityCount"
    | "eventCount"
  >;
  label: string;
  unit?: string;
}[] = [
  { key: "cifScore", label: "CIF Score" },
  { key: "confidence", label: "Confidence", unit: "%" },
  { key: "knowledgeCount", label: "Knowledge", unit: "items" },
  { key: "conflictCount", label: "Conflicts", unit: "open" },
  { key: "coverage", label: "Coverage", unit: "%" },
  { key: "entityCount", label: "Entities" },
  { key: "eventCount", label: "Events" },
];

export function CompareTable({
  a,
  b,
  knowledgeA,
  knowledgeB,
}: {
  a: Project;
  b: Project;
  knowledgeA: KnowledgeItem[];
  knowledgeB: KnowledgeItem[];
}) {
  const namesA = new Set(knowledgeA.map((k) => k.name));
  const namesB = new Set(knowledgeB.map((k) => k.name));
  const overlap = [...namesA].filter((n) => namesB.has(n));
  const uniqueA = knowledgeA.filter((k) => !namesB.has(k.name));
  const uniqueB = knowledgeB.filter((k) => !namesA.has(k.name));

  return (
    <div className="space-y-6">
      {/* metrics */}
      <div className="overflow-hidden rounded-lg border border-border">
        <table className="w-full text-[13px]">
          <thead>
            <tr className="border-b border-border bg-muted/50 text-left">
              <th className="px-4 py-2.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                Metric
              </th>
              <th className="px-4 py-2.5 text-right">
                <span className="font-mono text-[13px] font-bold" style={{ color: a.color }}>
                  {a.symbol}
                </span>
              </th>
              <th className="px-4 py-2.5 text-right">
                <span className="font-mono text-[13px] font-bold" style={{ color: b.color }}>
                  {b.symbol}
                </span>
              </th>
              <th className="px-4 py-2.5 text-right text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                Δ
              </th>
            </tr>
          </thead>
          <tbody>
            {METRICS.map((m, i) => {
              const va = a[m.key] ?? 0;
              const vb = b[m.key] ?? 0;
              const delta = Number((va - vb).toFixed(1));
              const better =
                m.key === "conflictCount" ? delta < 0 : delta > 0;
              return (
                <tr
                  key={m.key}
                  className={cn(
                    "border-b border-border/60 last:border-0",
                    i % 2 === 1 && "bg-muted/30"
                  )}
                >
                  <td className="px-4 py-2.5 font-medium text-foreground">
                    {m.label}
                    {m.unit && (
                      <span className="ml-1 text-[11px] text-muted-foreground">
                        ({m.unit})
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-2.5 text-right font-mono font-semibold tabular-nums text-foreground">
                    {va}
                  </td>
                  <td className="px-4 py-2.5 text-right font-mono font-semibold tabular-nums text-foreground">
                    {vb}
                  </td>
                  <td
                    className={cn(
                      "px-4 py-2.5 text-right font-mono tabular-nums",
                      delta === 0
                        ? "text-muted-foreground"
                        : better
                          ? "text-success"
                          : "text-critical"
                    )}
                  >
                    <span className="inline-flex items-center gap-0.5">
                      {delta === 0 ? (
                        <Minus className="h-3 w-3" />
                      ) : delta > 0 ? (
                        <ArrowUpRight className="h-3 w-3" />
                      ) : (
                        <ArrowDownRight className="h-3 w-3" />
                      )}
                      {Math.abs(delta)}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* knowledge comparison */}
      <div>
        <h3 className="mb-2 text-[12px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
          Knowledge Overlap
        </h3>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
          <div className="rounded-lg border border-border bg-card p-3">
            <Badge variant="success" className="mb-2">Shared · {overlap.length}</Badge>
            <ul className="space-y-1">
              {overlap.length === 0 && <li className="text-[12px] text-muted-foreground/70">—</li>}
              {overlap.map((n) => (
                <li key={n} className="truncate text-[12px] text-foreground/85">
                  {n}
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-lg border border-border bg-card p-3">
            <Badge variant="default" className="mb-2" style={{ backgroundColor: `${a.color}22`, color: a.color, borderColor: "transparent" }}>
              Unique to {a.symbol} · {uniqueA.length}
            </Badge>
            <ul className="space-y-1">
              {uniqueA.map((k) => (
                <li key={k.id}>
                  <Link
                    href={`/project/${a.slug}/knowledge/${k.id}`}
                    className="truncate text-[12px] text-foreground/85 hover:text-primary"
                  >
                    {k.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-lg border border-border bg-card p-3">
            <Badge variant="default" className="mb-2" style={{ backgroundColor: `${b.color}22`, color: b.color, borderColor: "transparent" }}>
              Unique to {b.symbol} · {uniqueB.length}
            </Badge>
            <ul className="space-y-1">
              {uniqueB.map((k) => (
                <li key={k.id}>
                  <Link
                    href={`/project/${b.slug}/knowledge/${k.id}`}
                    className="truncate text-[12px] text-foreground/85 hover:text-primary"
                  >
                    {k.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* behavior comparison */}
      <div>
        <h3 className="mb-2 text-[12px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
          Behavioral Pattern Comparison
        </h3>
        <div className="overflow-hidden rounded-lg border border-border">
          <table className="w-full text-[12.5px]">
            <thead>
              <tr className="border-b border-border bg-muted/50 text-left">
                <th className="w-36 px-4 py-2.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                  Dimension
                </th>
                <th className="px-4 py-2.5 text-[13px] font-bold" style={{ color: a.color }}>
                  {a.name}
                </th>
                <th className="px-4 py-2.5 text-[13px] font-bold" style={{ color: b.color }}>
                  {b.name}
                </th>
              </tr>
            </thead>
            <tbody>
              {(
                [
                  ["Strategic Objectives", "strategicObjectives"],
                  ["Decision Patterns", "decisionPatterns"],
                  ["Risk Response", "riskResponse"],
                  ["Trade-offs", "tradeOffs"],
                ] as const
              ).map(([label, key], i) => (
                <tr key={label} className={cn("align-top", i % 2 === 1 && "bg-muted/30")}>
                  <td className="px-4 py-3 font-semibold text-foreground">{label}</td>
                  <td className="px-4 py-3">
                    <ul className="list-inside list-disc space-y-1 text-muted-foreground">
                      {(a.behavior?.[key] ?? []).map((s) => (
                        <li key={s} className="leading-snug">{s}</li>
                      ))}
                    </ul>
                  </td>
                  <td className="px-4 py-3">
                    <ul className="list-inside list-disc space-y-1 text-muted-foreground">
                      {(b.behavior?.[key] ?? []).map((s) => (
                        <li key={s} className="leading-snug">{s}</li>
                      ))}
                    </ul>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
