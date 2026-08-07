import Link from "next/link";
import {
  Activity,
  ArrowUpRight,
  BookOpen,
  GitCompareArrows,
  GitMerge,
  Layers,
  ShieldCheck,
  Sparkles,
  TrendingUp,
} from "lucide-react";
import { projectRepository, eventRepository, conflictRepository } from "@/lib/api/server";
import type { Project } from "@/lib/types/project";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ProjectLogo } from "@/components/brand/ProjectLogo";
import { LivePriceChip } from "@/components/market/LivePriceChip";
import { LazySparkline } from "@/components/project/LazySparkline";
import { sparklineSeries, trendPct } from "@/lib/brand";
import { cn } from "@/lib/utils/helpers";
import { EVENT_COLORS } from "@/lib/constants";

/* ------------------------------------------------------------------ */
/* Health indicator                                                    */
/* ------------------------------------------------------------------ */

type Health = "good" | "warning" | "critical";

function healthOf(p: Project): Health {
  if (p.coverage < 60 || p.conflictCount >= 10) return "critical";
  if (p.conflictCount >= 5 || p.coverage < 78) return "warning";
  return "good";
}

const HEALTH_META: Record<Health, { color: string; label: string; pulse: boolean }> = {
  good: { color: "#34d399", label: "Healthy", pulse: true },
  warning: { color: "#fbbf24", label: "Warning", pulse: false },
  critical: { color: "#fb7185", label: "Critical", pulse: true },
};

/* ------------------------------------------------------------------ */
/* Activity feed                                                       */
/* ------------------------------------------------------------------ */

interface FeedItem {
  id: string;
  date: string;
  project: string;
  symbol: string;
  slug: string;
  kind: "event" | "conflict";
  text: string;
  href: string;
}

async function buildActivityFeed(projects: Project[]): Promise<FeedItem[]> {
  const items: FeedItem[] = [];
  for (const p of projects) {
    const [events, conflicts] = await Promise.all([
      eventRepository.list(p.slug),
      conflictRepository.list(p.slug),
    ]);
    for (const ev of events.slice(-3)) {
      items.push({
        id: `ev-${p.slug}-${ev.id}`,
        date: ev.date,
        project: p.name,
        symbol: p.symbol,
        slug: p.slug,
        kind: "event",
        text: `${ev.name} (${ev.type})`,
        href: `/project/${p.slug}/timeline?event=${ev.id}`,
      });
    }
    for (const c of conflicts.slice(-3)) {
      items.push({
        id: `cf-${p.slug}-${c.id}`,
        date: c.updatedAt,
        project: p.name,
        symbol: p.symbol,
        slug: p.slug,
        kind: "conflict",
        text: `${c.status === "Resolved" ? "Conflict resolved" : "Conflict open"}: ${c.title}`,
        href: `/project/${p.slug}/conflicts/${c.id}`,
      });
    }
  }
  return items.sort((a, b) => b.date.localeCompare(a.date)).slice(0, 9);
}

/* ------------------------------------------------------------------ */

export default async function HomePage() {
  const projects = await projectRepository.list();
  const feed = await buildActivityFeed(projects);

  const totalKnowledge = projects.reduce((s, p) => s + p.knowledgeCount, 0);
  const totalConflicts = projects.reduce((s, p) => s + p.conflictCount, 0);
  const totalEntities = projects.reduce((s, p) => s + p.entityCount, 0);
  const avgCif =
    Math.round((projects.reduce((s, p) => s + p.cifScore, 0) / Math.max(projects.length, 1)) * 10) / 10;

  return (
    <div className="mx-auto max-w-6xl p-4 lg:p-6">
      {/* hero */}
      <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold tracking-tight text-foreground">
              Intelligence Projects
            </h1>
            <Badge variant="success">
              <Sparkles className="h-3 w-3" /> CIF live
            </Badge>
          </div>
          <p className="mt-1 text-[13px] text-muted-foreground">
            Crypto Intelligence Framework — traceable knowledge, entity graphs and
            conflict resolution for L2 protocols.
          </p>
        </div>
        <Button asChild variant="outline" size="sm">
          <Link href="/compare" className="gap-1.5">
            <GitCompareArrows className="h-4 w-4" /> Compare projects
          </Link>
        </Button>
      </div>

      {/* ============ global metrics bar (mission control) ============ */}
      <div className="mb-6 grid grid-cols-2 gap-3 rounded-xl border border-border bg-card p-4 sm:grid-cols-4">
        {[
          { label: "Total Projects", value: projects.length, icon: Layers, color: "text-cyan-400" },
          { label: "Avg CIF Score", value: avgCif.toFixed(1), icon: Sparkles, color: "text-amber-400" },
          { label: "Knowledge Objects", value: totalKnowledge, icon: BookOpen, color: "text-emerald-400" },
          { label: "Total Conflicts", value: totalConflicts, icon: GitMerge, color: totalConflicts > 10 ? "text-rose-400" : "text-slate-300" },
        ].map((m) => (
          <div key={m.label} className="flex items-center gap-3 rounded-lg border border-white/5 bg-white/[0.03] px-3 py-2.5 dark:bg-white/[0.02]">
            <div className={cn("flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-muted", m.color)}>
              <m.icon className="h-4 w-4" />
            </div>
            <div>
              <div className="font-mono text-xl font-bold tabular-nums text-foreground">{m.value}</div>
              <div className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                {m.label}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ============ project grid + activity feed ============ */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1fr_300px]">
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
          {projects.map((p) => {
            const trend = trendPct(sparklineSeries(`${p.slug}-home`, 14, 60, 8, true));
            const spark = sparklineSeries(`${p.slug}-home-score`, 14, 70, 6, true);
            const health = healthOf(p);
            const hm = HEALTH_META[health];
            return (
              <Link key={p.id} href={`/project/${p.slug}`} className="group block">
                <Card className="project-glow-hover relative h-full overflow-hidden border border-white/10 bg-gradient-to-br from-white/[0.07] to-white/[0.02] backdrop-blur-xl dark:border-white/10 dark:from-white/[0.06] dark:to-transparent">
                  <div
                    className="pointer-events-none absolute -right-20 -top-20 h-56 w-56 rounded-full opacity-25 blur-3xl transition-opacity group-hover:opacity-50"
                    style={{ background: `radial-gradient(circle, ${p.color}, transparent 70%)` }}
                  />
                  <div
                    className="absolute inset-x-0 top-0 h-0.5"
                    style={{ background: `linear-gradient(90deg, ${p.color}, ${p.accent})` }}
                  />

                  <CardContent className="relative flex h-full flex-col p-5">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <ProjectLogo symbol={p.symbol} slug={p.slug} size={46} />
                        <div>
                          <div className="flex items-center gap-2">
                            <h2 className="text-[16px] font-bold tracking-tight text-foreground">
                              {p.name}
                            </h2>
                            <Badge variant="muted">{p.status}</Badge>
                          </div>
                          <p className="text-[11.5px] text-muted-foreground">{p.tagline}</p>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-1.5">
                        {/* health indicator */}
                        <span
                          className={cn(
                            "flex h-3 w-3 rounded-full",
                            hm.pulse && "animate-pulse-dot"
                          )}
                          style={{ backgroundColor: hm.color, boxShadow: `0 0 8px ${hm.color}88` }}
                          title={`Health: ${hm.label}`}
                        />
                        <div className="text-right">
                          <div className="font-mono text-[28px] font-bold leading-none tabular-nums" style={{ color: p.color }}>
                            {p.cifScore}
                          </div>
                          <div className="mt-0.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                            CIF Score
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="mt-3 flex flex-wrap items-center gap-2">
                      <span className="inline-flex items-center gap-1 rounded-md bg-success/15 px-2 py-0.5 font-mono text-[11px] font-semibold text-success">
                        <TrendingUp className="h-3 w-3" /> +{Math.abs(trend)}% knowledge
                      </span>
                      <LivePriceChip slug={p.slug} symbol={p.symbol} />
                      <span className="text-[11px] text-muted-foreground">
                        updated {p.lastActivityHours}h ago
                      </span>
                    </div>

                    <p className="mt-3 line-clamp-2 text-[12.5px] leading-relaxed text-muted-foreground">
                      {p.description}
                    </p>

                    <div className="mt-4 grid grid-cols-3 gap-2">
                      {[
                        { label: "Confidence", value: `${p.confidence}%` },
                        { label: "Knowledge", value: p.knowledgeCount },
                        { label: "Conflicts", value: p.conflictCount },
                        { label: "Coverage", value: `${p.coverage}%` },
                        { label: "Entities", value: p.entityCount },
                        { label: "Events", value: p.eventCount },
                      ].map((m) => (
                        <div
                          key={m.label}
                          className="rounded-md border border-white/10 bg-white/[0.04] px-2.5 py-2 dark:border-white/10 dark:bg-white/[0.03]"
                        >
                          <div className="text-[9.5px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">
                            {m.label}
                          </div>
                          <div className="font-mono text-[15px] font-bold tabular-nums text-foreground">
                            {m.value}
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="mt-4 flex items-center gap-3">
                      <div className="h-8 w-24 shrink-0">
                        <LazySparkline data={spark} color={p.color} height={32} />
                      </div>
                      <Progress value={p.confidence} className="flex-1 [&>div]:bg-success" />
                      <span className="text-[11px] text-muted-foreground">confidence</span>
                    </div>

                    <div className="mt-4 flex items-center gap-4 border-t border-white/10 pt-3 dark:border-white/10">
                      <span className="flex items-center gap-1.5 text-[10px] font-medium" style={{ color: hm.color }}>
                        <span className={cn("h-1.5 w-1.5 rounded-full", hm.pulse && "animate-pulse-dot")} style={{ backgroundColor: hm.color }} />
                        {hm.label}
                      </span>
                      <span className="ml-auto flex items-center gap-1 text-[12px] font-medium text-primary">
                        Open workspace
                        <ArrowUpRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>

        {/* ============ recent activity feed ============ */}
        <aside>
          <div className="sticky top-4 rounded-xl border border-border bg-card p-4">
            <div className="mb-3 flex items-center gap-2">
              <Activity className="h-3.5 w-3.5 text-primary" />
              <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                Recent Activity
              </span>
              <span className="ml-auto flex h-1.5 w-1.5 rounded-full bg-success animate-pulse-dot" />
            </div>
            <div className="relative space-y-3 pl-4">
              <span className="absolute left-[5px] top-1.5 bottom-1.5 w-px bg-border" />
              {feed.map((f) => (
                <Link key={f.id} href={f.href} className="group relative block">
                  <span
                    className={cn(
                      "absolute -left-4 top-1 h-2.5 w-2.5 rounded-full border-2 border-background",
                      f.kind === "event" ? "bg-amber-400" : f.text.startsWith("Conflict resolved") ? "bg-emerald-400" : "bg-rose-400"
                    )}
                  />
                  <div className="flex items-baseline justify-between gap-2">
                    <span className="font-mono text-[10px] font-semibold" style={{ color: projects.find((x) => x.slug === f.slug)?.color ?? "#22d3ee" }}>
                      {f.symbol}
                    </span>
                    <span className="font-mono text-[9.5px] text-muted-foreground/70">
                      {new Date(f.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                    </span>
                  </div>
                  <p className="mt-0.5 line-clamp-2 text-[11.5px] leading-snug text-foreground/85 transition-colors group-hover:text-primary">
                    {f.text}
                  </p>
                </Link>
              ))}
            </div>
          </div>
        </aside>
      </div>

      {/* platform summary */}
      <div className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-3">
        {[
          {
            icon: BookOpen,
            title: "Traceable Knowledge",
            desc: "Every claim linked to dated, weighted evidence — Git blame for intelligence.",
          },
          {
            icon: GitMerge,
            title: "Conflict Resolution",
            desc: "Contradictory sources resolved in side-by-side forensic diffs.",
          },
          {
            icon: ShieldCheck,
            title: "CIF Scoring",
            desc: "Six-dimension quality scoring across research, evidence and coverage.",
          },
        ].map((f) => (
          <div key={f.title} className="flex gap-3 rounded-lg border border-white/10 bg-card/60 p-4 backdrop-blur">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-primary/12 text-primary">
              <f.icon className="h-4 w-4" />
            </div>
            <div>
              <div className="text-[13px] font-semibold text-foreground">{f.title}</div>
              <p className="mt-0.5 text-[11.5px] leading-relaxed text-muted-foreground">{f.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* EVENT_COLORS referenced for type dot colors in feed rendering */
void EVENT_COLORS;
