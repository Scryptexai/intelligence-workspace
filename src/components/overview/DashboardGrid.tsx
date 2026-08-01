"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ResponsiveGridLayout, useContainerWidth } from "react-grid-layout";
import type { Layout } from "react-grid-layout";
import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";
import {
  Activity,
  ArrowRight,
  BookOpen,
  Bot,
  GitMerge,
  GripVertical,
  Layers,
  Network,
  Radar,
  ShieldCheck,
  TrendingUp,
  Users,
} from "lucide-react";
import { useProjectBundle } from "@/hooks/useProjectQuery";
import { MetricCard } from "@/components/project/MetricCard";
import { KnowledgeCard } from "@/components/project/KnowledgeCard";
import { EcosystemPartners } from "@/components/brand/EcosystemPartners";
import { MarketMetricCard } from "@/components/market/MarketMetricCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EVENT_COLORS } from "@/lib/constants";
import {
  useGlobalFilters,
  filterEventsByRange,
  filterKnowledgeByRange,
} from "@/lib/store/globalFilters";
import { sparklineSeries, trendPct, projectGradient } from "@/lib/brand";

const DEFAULT_LAYOUT: Layout = [
  { i: "metric-cif", x: 0, y: 0, w: 2, h: 3 },
  { i: "metric-confidence", x: 2, y: 0, w: 2, h: 3 },
  { i: "metric-knowledge", x: 4, y: 0, w: 2, h: 3 },
  { i: "metric-conflicts", x: 6, y: 0, w: 2, h: 3 },
  { i: "metric-coverage", x: 8, y: 0, w: 2, h: 3 },
  { i: "metric-entities", x: 10, y: 0, w: 2, h: 3 },
  { i: "market-tvl", x: 0, y: 3, w: 4, h: 3 },
  { i: "market-price", x: 4, y: 3, w: 4, h: 3 },
  { i: "market-volume", x: 8, y: 3, w: 4, h: 3 },
  { i: "partners", x: 0, y: 6, w: 12, h: 2 },
  { i: "knowledge", x: 0, y: 8, w: 7, h: 11 },
  { i: "quicklinks", x: 7, y: 8, w: 5, h: 6 },
  { i: "signals", x: 7, y: 14, w: 5, h: 5 },
];

interface MetricSpec {
  i: string;
  label: string;
  value: string | number;
  unit?: string;
  icon: typeof TrendingUp;
  tone: "primary" | "success" | "warning" | "critical" | "muted";
  sub?: string;
  ring?: number;
  series: number[];
  trend: number;
  href?: string;
  info?: string;
}

export function DashboardGrid({ slug }: { slug: string }) {
  const { data } = useProjectBundle(slug);
  const [mounted, setMounted] = useState(false);
  const [layout, setLayout] = useState<Layout>(DEFAULT_LAYOUT);
  const { width, containerRef, mounted: widthMounted } = useContainerWidth();
  const timeRange = useGlobalFilters((s) => s.timeRange);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(`iw-layout-${slug}-v2`);
      if (saved) {
        const parsed = JSON.parse(saved) as Layout;
        if (Array.isArray(parsed) && parsed.length > 0) setLayout(parsed);
      }
    } catch {
      /* ignore */
    }
  }, [slug]);

  const project = data?.project;
  const gradient = projectGradient(slug);

  const metrics = useMemo<MetricSpec[]>(() => {
    if (!project) return [];
    const mk = (key: string, base: number, vol: number, up: boolean) => {
      const series = sparklineSeries(`${slug}-${key}`, 14, base, vol, up);
      return { series, trend: trendPct(series) };
    };
    const base = `/project/${slug}`;
    return [
      {
        i: "metric-cif",
        label: "CIF Score",
        value: project.cifScore,
        icon: TrendingUp,
        tone: "primary",
        sub: "weighted 6-dimension",
        href: `${base}/qa`,
        info: "CIF Score adalah gabungan dari 6 dimensi berkualitas (Research, Consistency, Evidence, Coverage, Conflict, Knowledge) yang diberi bobot — lihat QA Center untuk breakdown.",
        ...mk("cif", 82, 4, true),
      },
      {
        i: "metric-confidence",
        label: "Confidence",
        value: project.confidence,
        unit: "%",
        icon: ShieldCheck,
        tone: "success",
        sub: "aggregate certainty",
        href: `${base}/qa`,
        info: "Confidence mengukur tingkat kepastian agregat dari seluruh knowledge, berdasarkan kekuatan evidence dan konsistensi sumber.",
        ...mk("conf", project.confidence, 3, true),
      },
      {
        i: "metric-knowledge",
        label: "Knowledge",
        value: project.knowledgeCount,
        icon: BookOpen,
        tone: "primary",
        sub: "published items",
        href: `${base}/knowledge`,
        info: "Jumlah knowledge yang dipublikasikan. Klik untuk membuka Knowledge Ledger — setiap item dapat dilacak ke evidence-nya.",
        ...mk("know", 8, 2.5, true),
      },
      {
        i: "metric-conflicts",
        label: "Conflicts",
        value: project.conflictCount,
        icon: GitMerge,
        tone: project.conflictCount > 5 ? "critical" : "warning",
        sub: "open in ledger",
        href: `${base}/conflicts`,
        info: "Konflik adalah klaim yang saling bertentangan antar sumber, ditampilkan dalam format diff ala Git. Klik untuk membuka Conflict Center.",
        ...mk("conflict", 6, 3, false),
      },
      {
        i: "metric-coverage",
        label: "Coverage",
        value: project.coverage,
        unit: "%",
        icon: Layers,
        tone: "warning",
        ring: project.coverage,
        href: `${base}/qa`,
        info: "Coverage mengukur seberapa besar permukaan intelligence (entity, event, conflict) yang sudah tercakup oleh knowledge.",
        ...mk("cov", project.coverage, 3, true),
      },
      {
        i: "metric-entities",
        label: "Entities",
        value: project.entityCount,
        icon: Users,
        tone: "muted",
        sub: "tracked actors",
        href: `${base}/graph`,
        info: "Jumlah entity yang dilacak (perusahaan, DAO, investor, aplikasi, dll). Klik untuk membuka Entity Graph.",
        ...mk("ent", 14, 2, true),
      },
    ];
  }, [project, slug]);

  if (!project) return null;

  const eventsInRange = filterEventsByRange(data?.events ?? [], timeRange);
  const knowledgeInRange = filterKnowledgeByRange(data?.knowledge ?? [], timeRange);

  const recentEvents = [...eventsInRange]
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 6);

  const quickLinks = [
    { href: `/project/${slug}/knowledge`, label: "Knowledge", icon: BookOpen, desc: `${project.knowledgeCount} items · traceable` },
    { href: `/project/${slug}/graph`, label: "Entity Graph", icon: Network, desc: `${project.entityCount} entities` },
    { href: `/project/${slug}/timeline`, label: "Live Timeline", icon: Activity, desc: `${project.eventCount} events` },
    { href: `/project/${slug}/conflicts`, label: "Conflict Center", icon: GitMerge, desc: `${project.conflictCount} conflicts` },
    { href: `/project/${slug}/qa`, label: "QA Center", icon: Radar, desc: "6-dimension CIF" },
    { href: `/project/${slug}/copilot`, label: "AI Copilot", icon: Bot, desc: "Ask grounded" },
  ];

  if (!mounted || !widthMounted) {
    return (
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
        {metrics.map((m) => (
          <div key={m.i} className="shimmer h-[120px] rounded-lg border border-border" />
        ))}
      </div>
    );
  }

  return (
    <div ref={containerRef}>
    <ResponsiveGridLayout
      width={width}
      layouts={{ lg: layout }}
      breakpoints={{ lg: 1200, md: 768, sm: 0 }}
      cols={{ lg: 12, md: 6, sm: 2 }}
      rowHeight={26}
      margin={[10, 10]}
      containerPadding={[0, 0]}
      dragConfig={{ enabled: true, handle: ".drag-handle", threshold: 3 }}
      resizeConfig={{ enabled: false }}
      onLayoutChange={(next) => {
        setLayout(next);
        try {
          localStorage.setItem(`iw-layout-${slug}-v2`, JSON.stringify(next));
        } catch {
          /* ignore */
        }
      }}
    >
      {metrics.map((m) => (
        <div key={m.i} data-metric={m.i}>
          <MetricCard
            label={m.label}
            value={m.value}
            unit={m.unit}
            icon={m.icon}
            tone={m.tone}
            sub={m.sub}
            spark={m.series}
            sparkColor={gradient.from}
            trend={m.trend}
            invertTrend={m.i === "metric-conflicts"}
            ring={m.ring}
            accent={gradient.from}
            href={m.href}
            info={m.info}
          />
        </div>
      ))}

      {/* live market metrics — DefiLlama + CoinGecko via /api/market/[slug] */}
      <div key="market-tvl" data-market="tvl">
        <MarketMetricCard slug={slug} metric="tvl" symbol={project.symbol} />
      </div>
      <div key="market-price" data-market="price">
        <MarketMetricCard slug={slug} metric="price" symbol={project.symbol} />
      </div>
      <div key="market-volume" data-market="volume">
        <MarketMetricCard slug={slug} metric="volume" symbol={project.symbol} />
      </div>

      <div key="partners">
        <EcosystemPartners />
      </div>

      <div key="knowledge" data-widget="knowledge" className="h-full overflow-hidden rounded-lg border border-border bg-card">
        <CardHeader className="drag-handle cursor-grab select-none p-3 pb-2 active:cursor-grabbing">
          <CardTitle className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
            <GripVertical className="h-3 w-3 text-muted-foreground/50" />
            Knowledge Summary
            {timeRange !== "all" && (
              <Badge variant="secondary" className="normal-case tracking-normal">
                {knowledgeInRange.length} in range
              </Badge>
            )}
            <Link
              href={`/project/${slug}/knowledge`}
              className="ml-auto flex items-center gap-1 normal-case tracking-normal text-primary hover:underline"
            >
              View all <ArrowRight className="h-3 w-3" />
            </Link>
          </CardTitle>
        </CardHeader>
        <CardContent
          className="grid grid-cols-1 gap-3 overflow-y-auto p-3 pt-1 lg:grid-cols-2"
          style={{ maxHeight: "calc(100% - 44px)" }}
        >
          {knowledgeInRange.slice(0, 6).map((k) => (
            <KnowledgeCard key={k.id} item={k} href={`/project/${slug}/knowledge/${k.id}`} />
          ))}
        </CardContent>
      </div>

      <div key="quicklinks" className="h-full overflow-hidden rounded-lg border border-border bg-card">
        <CardHeader className="drag-handle cursor-grab select-none p-3 pb-2 active:cursor-grabbing">
          <CardTitle className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
            <GripVertical className="h-3 w-3 text-muted-foreground/50" />
            Quick Links
          </CardTitle>
        </CardHeader>
        <CardContent
          className="grid grid-cols-2 gap-2 overflow-y-auto p-3 pt-1"
          style={{ maxHeight: "calc(100% - 44px)" }}
        >
          {quickLinks.map((q) => (
            <Link
              key={q.href}
              href={q.href}
              className="project-glow-hover flex flex-col gap-1 rounded-md border border-border/70 bg-muted/30 p-2.5"
            >
              <q.icon className="h-3.5 w-3.5 text-primary" />
              <span className="text-[11.5px] font-semibold leading-tight text-foreground">{q.label}</span>
              <span className="text-[10px] leading-tight text-muted-foreground">{q.desc}</span>
            </Link>
          ))}
        </CardContent>
      </div>

      <div key="signals" data-widget="signals" className="h-full overflow-hidden rounded-lg border border-border bg-card">
        <CardHeader className="drag-handle cursor-grab select-none p-3 pb-2 active:cursor-grabbing">
          <CardTitle className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
            <GripVertical className="h-3 w-3 text-muted-foreground/50" />
            <span className="h-1.5 w-1.5 rounded-full bg-success animate-pulse-dot" />
            Recent Signals
          </CardTitle>
        </CardHeader>
        <CardContent
          className="space-y-0.5 overflow-y-auto p-3 pt-1"
          style={{ maxHeight: "calc(100% - 44px)" }}
        >
          {recentEvents.map((ev) => (
            <Link
              key={ev.id}
              href={`/project/${slug}/timeline?event=${ev.id}`}
              className="flex items-center gap-2 rounded px-1.5 py-1 transition-colors hover:bg-accent/60"
            >
              <span className="h-2 w-2 shrink-0 rounded-full" style={{ backgroundColor: EVENT_COLORS[ev.type] }} />
              <span className="min-w-0 flex-1 truncate text-[11.5px] text-foreground/90">{ev.name}</span>
              <span className="shrink-0 font-mono text-[10px] text-muted-foreground">
                {new Date(ev.date).toLocaleDateString("en-US", { month: "short", year: "numeric" })}
              </span>
            </Link>
          ))}
        </CardContent>
      </div>
    </ResponsiveGridLayout>
    </div>
  );
}
