import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import {
  ArrowDownRight,
  ArrowUpRight,
  HelpCircle,
  Minus,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { LazySparkline } from "./LazySparkline";
import { cn } from "@/lib/utils/helpers";

type Tone = "primary" | "success" | "warning" | "critical" | "muted";

const TONE_STYLES: Record<Tone, string> = {
  primary: "text-primary",
  success: "text-success",
  warning: "text-warning",
  critical: "text-critical",
  muted: "text-muted-foreground",
};

interface MetricCardProps {
  label: string;
  value: string | number;
  unit?: string;
  icon: LucideIcon;
  tone?: Tone;
  sub?: string;
  spark?: number[];
  sparkColor?: string;
  trend?: number;
  invertTrend?: boolean;
  ring?: number;
  accent?: string;
  /** Drill-down target: clicking the card navigates here */
  href?: string;
  /** Contextual tooltip explaining the metric */
  info?: string;
  className?: string;
}

function TrendChip({ trend, invert }: { trend: number; invert?: boolean }) {
  const good = invert ? trend < 0 : trend > 0;
  const flat = trend === 0;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-0.5 rounded px-1 py-px font-mono text-[10px] font-semibold tabular-nums",
        flat
          ? "bg-muted text-muted-foreground"
          : good
            ? "bg-success/15 text-success"
            : "bg-critical/15 text-critical"
      )}
    >
      {flat ? (
        <Minus className="h-2.5 w-2.5" />
      ) : trend > 0 ? (
        <ArrowUpRight className="h-2.5 w-2.5" />
      ) : (
        <ArrowDownRight className="h-2.5 w-2.5" />
      )}
      {trend > 0 ? "+" : ""}
      {trend}%
    </span>
  );
}

function Ring({ value, color }: { value: number; color: string }) {
  const r = 20;
  const c = 2 * Math.PI * r;
  return (
    <svg width="56" height="56" viewBox="0 0 56 56" className="-rotate-90">
      <circle cx="28" cy="28" r={r} fill="none" stroke="var(--muted)" strokeWidth="5" />
      <circle
        cx="28"
        cy="28"
        r={r}
        fill="none"
        stroke={color}
        strokeWidth="5"
        strokeLinecap="round"
        strokeDasharray={`${(value / 100) * c} ${c}`}
        style={{ filter: `drop-shadow(0 0 4px ${color}88)` }}
      />
      <text
        x="28"
        y="32"
        textAnchor="middle"
        className="rotate-90"
        style={{
          transformOrigin: "center",
          transform: "rotate(90deg)",
          fill: "var(--foreground)",
          fontSize: 13,
          fontFamily: "ui-monospace, monospace",
          fontWeight: 700,
        }}
      >
        {value}%
      </text>
    </svg>
  );
}

export function MetricCard({
  label,
  value,
  unit,
  icon: Icon,
  tone = "primary",
  sub,
  spark,
  sparkColor,
  trend,
  invertTrend,
  ring,
  accent,
  href,
  info,
  className,
}: MetricCardProps) {
  const color = sparkColor ?? "var(--project-accent, #22d3ee)";
  const body = (
    <Card
      className={cn(
        "project-glow-hover h-full overflow-hidden",
        href && "cursor-pointer",
        className
      )}
    >
      <CardContent className="flex h-full flex-col p-3.5">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <div className="flex items-center gap-1">
              <span className="truncate text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                {label}
              </span>
              {info && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span className="inline-flex text-muted-foreground/70 hover:text-primary">
                      <HelpCircle className="h-3 w-3" />
                    </span>
                  </TooltipTrigger>
                  <TooltipContent side="top" className="max-w-[220px]">
                    {info}
                  </TooltipContent>
                </Tooltip>
              )}
            </div>
            <div className="mt-1 flex items-baseline gap-1">
              <span className="font-mono text-[22px] font-bold tabular-nums tracking-tight text-foreground">
                {value}
              </span>
              {unit && (
                <span className="text-[11px] font-medium text-muted-foreground">{unit}</span>
              )}
            </div>
            {trend !== undefined && (
              <div className="mt-1 flex items-center gap-1.5">
                <TrendChip trend={trend} invert={invertTrend} />
                <span className="text-[10px] text-muted-foreground">vs last month</span>
              </div>
            )}
          </div>
          <div
            className={cn(
              "flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-muted",
              TONE_STYLES[tone]
            )}
          >
            <Icon className="h-3.5 w-3.5" />
          </div>
        </div>

        {ring !== undefined ? (
          <div className="mt-2 flex flex-1 items-center justify-center">
            <Ring value={ring} color={accent ?? "var(--project-accent, #22d3ee)"} />
          </div>
        ) : (
          spark &&
          spark.length > 0 && (
            <div className="mt-auto pt-1.5">
              <LazySparkline data={spark} color={color} height={26} />
            </div>
          )
        )}

        {sub && !ring && (
          <div className="mt-1 truncate text-[10px] text-muted-foreground">{sub}</div>
        )}
      </CardContent>
    </Card>
  );

  if (href) {
    return (
      <Link href={href} className="block h-full" title={`Open ${label}`}>
        {body}
      </Link>
    );
  }
  return body;
}
