"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  CalendarDays,
  ExternalLink,
  Filter,
  Flame,
  Pause,
  Play,
  X,
} from "lucide-react";
import type { EventType, TimelineEvent } from "@/lib/types/event";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { daysBetween, formatDate, formatDateShort } from "@/lib/utils/helpers";
import { EVENT_COLORS, EVENT_TYPES } from "@/lib/constants";
import { eventThumbnailUrl } from "@/lib/brand";
import { useGlobalFilters, filterEventsByRange } from "@/lib/store/globalFilters";

// ECharts heatmap is the heaviest part of the timeline — load it lazily.
const EventDensityHeatmap = dynamic(
  () => import("./EventDensityHeatmap").then((m) => m.EventDensityHeatmap),
  { loading: () => <div className="shimmer h-[170px] w-full rounded-lg" /> }
);

export { EVENT_COLORS };

type GroupBy = "Year" | "Quarter" | "Month";

function groupKey(date: string, by: GroupBy): string {
  const d = new Date(date);
  if (by === "Year") return String(d.getFullYear());
  if (by === "Quarter") return `Q${Math.floor(d.getMonth() / 3) + 1} ${d.getFullYear()}`;
  return `${d.toLocaleString("en-US", { month: "short" })} ${d.getFullYear()}`;
}

export function LiveTimeline({
  events,
  projectSlug,
  initialEventId,
}: {
  events: TimelineEvent[];
  projectSlug: string;
  initialEventId?: string;
}) {
  const router = useRouter();
  const [zoom, setZoom] = useState(6);
  const [groupBy, setGroupBy] = useState<GroupBy>("Year");
  const [filters, setFilters] = useState<Set<EventType>>(new Set());
  const [selected, setSelected] = useState<TimelineEvent | null>(null);
  const selectedRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const timeRange = useGlobalFilters((s) => s.timeRange);
  const [replaying, setReplaying] = useState(false);
  const [replayIdx, setReplayIdx] = useState(0);
  const replayTimer = useRef<ReturnType<typeof setInterval> | null>(null);

  const sorted = useMemo(() => {
    const inRange = filterEventsByRange(events, timeRange);
    return [...inRange].sort((a, b) => a.date.localeCompare(b.date));
  }, [events, timeRange]);

  const visible = useMemo(
    () => (filters.size === 0 ? sorted : sorted.filter((e) => filters.has(e.type))),
    [sorted, filters]
  );

  const lanes = useMemo(
    () => EVENT_TYPES.filter((t) => sorted.some((e) => e.type === t)),
    [sorted]
  );

  const minDate = sorted[0]?.date ?? "2020-01-01";
  const maxDate = sorted[sorted.length - 1]?.date ?? "2025-01-01";
  const totalDays = daysBetween(minDate, maxDate);
  const laneH = 52;
  const headerH = 34;
  const labelW = 104;
  const histH = 56; // layer 1: density histogram
  const innerWidth = Math.max(totalDays * zoom + labelW + 200, 900);
  const innerHeight = histH + headerH + lanes.length * laneH + 12;

  const x = (date: string) => labelW + (daysBetween(minDate, date) - 1) * zoom;

  /* ---------------- density histogram (per month) ---------------- */
  const histogram = useMemo(() => {
    const buckets = new Map<string, { count: number; date: string }>();
    for (const ev of sorted) {
      const d = new Date(ev.date);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      const cur = buckets.get(key);
      if (cur) cur.count += 1;
      else buckets.set(key, { count: 1, date: `${key}-01` });
    }
    const items = [...buckets.values()].sort((a, b) => a.date.localeCompare(b.date));
    const max = Math.max(1, ...items.map((i) => i.count));
    return { items, max };
  }, [sorted]);

  /* ---------------- replay animation ---------------- */
  const stopReplay = () => {
    if (replayTimer.current) clearInterval(replayTimer.current);
    replayTimer.current = null;
    setReplaying(false);
  };

  useEffect(() => {
    return () => stopReplay();
  }, []);

  const startReplay = () => {
    if (visible.length === 0) return;
    stopReplay();
    setReplayIdx(0);
    setReplaying(true);
    const ev = visible[0];
    setSelected(ev);
    replayTimer.current = setInterval(() => {
      setReplayIdx((i) => {
        const next = i + 1;
        if (next >= visible.length) {
          stopReplay();
          return i;
        }
        const e = visible[next];
        setSelected(e);
        // keep the cursor in view
        const sx = x(e.date);
        if (scrollRef.current) {
          const el = scrollRef.current;
          const cw = el.clientWidth;
          if (sx > el.scrollLeft + cw - 60) el.scrollLeft = sx - cw + 60;
          else if (sx < el.scrollLeft + 60) el.scrollLeft = sx - 60;
        }
        return next;
      });
    }, 900);
  };

  useEffect(() => {
    if (initialEventId) {
      const ev = sorted.find((e) => e.id === initialEventId);
      if (ev) setSelected(ev);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialEventId]);

  useEffect(() => {
    if (selected && selectedRef.current) {
      selectedRef.current.scrollIntoView({ block: "nearest", behavior: "smooth" });
    }
  }, [selected]);

  const bands = useMemo(() => {
    const out: { key: string; start: string; end: string }[] = [];
    for (const ev of sorted) {
      const key = groupKey(ev.date, groupBy);
      const last = out[out.length - 1];
      if (last && last.key === key) last.end = ev.date;
      else out.push({ key, start: ev.date, end: ev.date });
    }
    return out.map((b) => ({
      ...b,
      x: x(b.start),
      w: Math.max(x(b.end) - x(b.start) + zoom * 2, 70),
    }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sorted, groupBy, zoom, minDate]);

  const ticks = useMemo(() => {
    const out: { date: string; x: number }[] = [];
    const start = new Date(minDate);
    const end = new Date(maxDate);
    const cur = new Date(start);
    cur.setDate(1);
    while (cur <= end) {
      const iso = cur.toISOString().slice(0, 10);
      out.push({ date: iso, x: x(iso) });
      cur.setMonth(cur.getMonth() + 1);
    }
    return out;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [minDate, maxDate, zoom]);

  const toggleFilter = (t: EventType) => {
    stopReplay();
    setFilters((prev) => {
      const next = new Set(prev);
      if (next.has(t)) next.delete(t);
      else next.add(t);
      return next;
    });
  };

  const selectEvent = (ev: TimelineEvent | null) => {
    setSelected(ev);
    if (ev) {
      router.replace(`/project/${projectSlug}/timeline?event=${ev.id}`, { scroll: false });
    } else {
      router.replace(`/project/${projectSlug}/timeline`, { scroll: false });
    }
  };

  const thumb = selected ? eventThumbnailUrl(selected.id, selected.type) : undefined;
  const replayCursor = replaying && visible[Math.min(replayIdx, visible.length - 1)];
  const busiestMonth = histogram.items.reduce((a, b) => (b.count > a.count ? b : a), histogram.items[0]);

  return (
    <div className="space-y-4">
      {/* controls */}
      <div className="flex flex-wrap items-center gap-2">
        <Button
          size="sm"
          className="h-8 gap-1.5 bg-primary/15 text-primary hover:bg-primary/25"
          onClick={replaying ? stopReplay : startReplay}
          disabled={visible.length === 0}
        >
          {replaying ? (
            <Pause className="h-3.5 w-3.5" />
          ) : (
            <Play className="h-3.5 w-3.5" />
          )}
          {replaying ? "Pause Replay" : "▶ Replay History"}
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="h-8 gap-1.5 text-[12px]">
              <Filter className="h-3.5 w-3.5" />
              {filters.size === 0 ? "All types" : `${filters.size} type${filters.size > 1 ? "s" : ""}`}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-52">
            <DropdownMenuLabel>Event types (swimlanes)</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {EVENT_TYPES.map((t) => (
              <DropdownMenuCheckboxItem
                key={t}
                checked={filters.has(t)}
                onCheckedChange={() => toggleFilter(t)}
                onSelect={(e) => e.preventDefault()}
              >
                <span className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full" style={{ backgroundColor: EVENT_COLORS[t] }} />
                  {t}
                </span>
              </DropdownMenuCheckboxItem>
            ))}
            {filters.size > 0 && (
              <>
                <DropdownMenuSeparator />
                <button
                  className="w-full px-2 py-1.5 text-left text-[12px] text-primary hover:bg-accent"
                  onClick={() => setFilters(new Set())}
                >
                  Clear filters
                </button>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>

        <Select value={groupBy} onValueChange={(v) => setGroupBy(v as GroupBy)}>
          <SelectTrigger className="h-8 w-36 text-[12px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Year">Group by Year</SelectItem>
            <SelectItem value="Quarter">Group by Quarter</SelectItem>
            <SelectItem value="Month">Group by Month</SelectItem>
          </SelectContent>
        </Select>

        <div className="flex flex-1 items-center gap-2 rounded-md border border-border bg-card px-3 py-1.5">
          <CalendarDays className="h-3.5 w-3.5 text-muted-foreground" />
          <input
            type="range"
            min={2}
            max={16}
            step={0.5}
            value={zoom}
            onChange={(e) => setZoom(Number(e.target.value))}
            className="h-1 flex-1 cursor-pointer appearance-none rounded-full bg-muted accent-primary"
          />
          <span className="w-16 text-right font-mono text-[11px] text-muted-foreground">
            {zoom.toFixed(1)} px/day
          </span>
        </div>

        <Badge variant="muted" className="hidden sm:inline-flex">
          {visible.length} of {events.length} events
        </Badge>
      </div>

      {/* ============ dual-layer event stream ============ */}
      <div
        ref={scrollRef}
        className="overflow-x-auto rounded-lg border border-border bg-card"
      >
        <div className="relative" style={{ width: innerWidth, height: innerHeight }}>
          {/* Layer 1 — density histogram */}
          <div className="absolute inset-x-0 top-0 border-b border-border/70" style={{ height: histH }}>
            <div className="absolute left-0 top-0 flex h-5 w-[104px] items-center gap-1 bg-card px-2 pr-1 text-[9px] font-bold uppercase tracking-[0.12em] text-muted-foreground">
              <Flame className="h-3 w-3 text-warning" />
              Density
            </div>
            {histogram.items.map((b) => {
              const bw = Math.max(zoom * 28, 8);
              const h = Math.max(6, (b.count / histogram.max) * (histH - 18));
              return (
                <div
                  key={b.date}
                  className="absolute bottom-0 flex flex-col items-center justify-end"
                  style={{ left: x(b.date) - bw / 2, width: bw, height: histH - 4 }}
                  title={`${formatDate(b.date)} · ${b.count} event${b.count > 1 ? "s" : ""}`}
                >
                  <span className="mb-0.5 font-mono text-[8.5px] leading-none text-cyan-400/90">
                    {b.count}
                  </span>
                  <div
                    className="w-full rounded-t-sm"
                    style={{
                      height: h,
                      background: `linear-gradient(180deg, ${EVENT_COLORS.Governance}cc, #0e7490cc)`,
                      opacity: 0.9,
                    }}
                  />
                </div>
              );
            })}
          </div>

          {/* Layer 2 — grouped bands + swimlanes */}
          <div className="absolute inset-x-0" style={{ top: histH }}>
            {bands.map((b) => (
              <div
                key={b.key}
                className="absolute flex h-[26px] items-center border-b border-r border-border/70 bg-muted/40 pl-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground"
                style={{ left: b.x, width: b.w, top: 4 }}
              >
                {b.key}
              </div>
            ))}

            {lanes.map((lane, li) => {
              const top = headerH + li * laneH;
              return (
                <div key={lane}>
                  <div
                    className="absolute inset-x-0 border-b border-border/40"
                    style={{ top, height: laneH, backgroundColor: li % 2 ? "rgba(125,142,163,0.03)" : "transparent" }}
                  />
                  <div
                    className="absolute left-0 z-[6] flex items-center gap-1.5 bg-card pr-2 text-[9.5px] font-semibold uppercase tracking-wide text-muted-foreground"
                    style={{ top, height: laneH, width: labelW - 8 }}
                  >
                    <span className="h-1.5 w-1.5 shrink-0 rounded-full" style={{ backgroundColor: EVENT_COLORS[lane] }} />
                    {lane}
                  </div>
                  {visible
                    .filter((ev) => ev.type === lane)
                    .map((ev) => {
                      const isSel = selected?.id === ev.id;
                      const evThumb = eventThumbnailUrl(ev.id, ev.type);
                      return (
                        <button
                          key={ev.id}
                          onClick={() => selectEvent(isSel ? null : ev)}
                          className="group absolute z-[5]"
                          style={{ left: x(ev.date) - 7, top: top + laneH / 2 - 8 }}
                          title={ev.name}
                        >
                          <span
                            className="block h-[15px] w-[15px] rounded-full border-2 border-background transition-transform group-hover:scale-125"
                            style={{
                              backgroundColor: EVENT_COLORS[ev.type],
                              boxShadow: isSel
                                ? `0 0 0 3px ${EVENT_COLORS[ev.type]}55, 0 0 10px ${EVENT_COLORS[ev.type]}`
                                : `0 0 6px ${EVENT_COLORS[ev.type]}66`,
                            }}
                          />
                          {/* rich tooltip */}
                          <span className="pointer-events-none absolute bottom-5 left-1/2 z-20 hidden w-[240px] -translate-x-1/2 overflow-hidden rounded-lg border border-slate-600/70 bg-slate-950/95 text-left shadow-2xl backdrop-blur group-hover:block">
                            <div className="flex items-center gap-2 border-b border-slate-800 p-2">
                              {evThumb && (
                                <Image
                                  src={evThumb}
                                  alt=""
                                  width={40}
                                  height={26}
                                  unoptimized
                                  className="h-6 w-10 shrink-0 rounded object-cover"
                                />
                              )}
                              <div className="min-w-0">
                                <div className="truncate text-[11px] font-bold text-white">{ev.name}</div>
                                <div className="font-mono text-[9px] text-slate-500">
                                  {ev.id} · {formatDate(ev.date)}
                                </div>
                              </div>
                            </div>
                            <p className="line-clamp-2 px-2 py-1.5 text-[10px] leading-snug text-slate-400">
                              {ev.description}
                            </p>
                            <div className="flex flex-wrap gap-1 px-2 pb-2">
                              <span
                                className="rounded px-1 py-px font-mono text-[8.5px] font-semibold"
                                style={{ backgroundColor: `${EVENT_COLORS[ev.type]}22`, color: EVENT_COLORS[ev.type] }}
                              >
                                {ev.type}
                              </span>
                              <span className="rounded bg-slate-800 px-1 py-px font-mono text-[8.5px] text-slate-400">
                                impact {ev.impact}
                              </span>
                            </div>
                          </span>
                        </button>
                      );
                    })}
                </div>
              );
            })}

            {/* month ticks */}
            {ticks.map((t) => (
              <div key={t.date} className="absolute" style={{ left: t.x, top: headerH - 4 }}>
                <div className="h-[22px] w-px bg-border/70" />
                <div className="mt-0.5 -translate-x-1/2 whitespace-nowrap font-mono text-[9px] text-muted-foreground/80">
                  {formatDateShort(t.date)}
                </div>
              </div>
            ))}
          </div>

          {/* replay cursor */}
          {replayCursor && (
            <div
              className="pointer-events-none absolute bottom-0 top-0 z-10"
              style={{ left: x(replayCursor.date) }}
            >
              <div className="h-full w-[2px] bg-cyan-400/80 shadow-[0_0_8px_rgba(34,211,238,0.8)]" />
              <div className="absolute -top-1 left-1/2 h-2 w-2 -translate-x-1/2 rounded-full bg-cyan-400" />
            </div>
          )}
        </div>
      </div>

      {/* replay status strip */}
      {replaying && (
        <div className="flex items-center gap-2 rounded-md border border-cyan-400/30 bg-cyan-400/5 px-3 py-1.5 text-[11px] text-cyan-300">
          <span className="h-1.5 w-1.5 animate-pulse-dot rounded-full bg-cyan-400" />
          Replaying history —{" "}
          <span className="font-mono font-semibold">
            {visible[Math.min(replayIdx, visible.length - 1)]?.id ?? "…"}
          </span>
          <span className="text-cyan-400/70">
            ({Math.min(replayIdx + 1, visible.length)}/{visible.length})
          </span>
          <span className="ml-auto text-cyan-400/60">
            busiest: {busiestMonth ? formatDate(busiestMonth.date) : "—"} ({busiestMonth?.count ?? 0})
          </span>
        </div>
      )}

      {/* event density heatmap */}
      <div className="rounded-lg border border-border bg-card p-3">
        <div className="mb-1 flex items-center gap-2 px-1">
          <Flame className="h-3.5 w-3.5 text-warning" />
          <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
            Event Type Matrix
          </span>
          <span className="ml-auto text-[10px] text-muted-foreground">month × event type</span>
        </div>
        <EventDensityHeatmap events={sorted} height={170} />
      </div>

      {/* selected detail */}
      {selected ? (
        <div ref={selectedRef} className="animate-fade-in rounded-lg border border-primary/40 bg-card p-4">
          <div className="flex flex-wrap items-start gap-3">
            {thumb && (
              <Image
                src={thumb}
                alt=""
                width={112}
                height={64}
                unoptimized
                className="hidden h-16 w-28 shrink-0 rounded-md border border-border object-cover sm:block"
              />
            )}
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-mono text-[11px] font-semibold text-muted-foreground">{selected.id}</span>
                <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: EVENT_COLORS[selected.type] }} />
                <h3 className="text-[15px] font-bold text-foreground">{selected.name}</h3>
                <Badge variant="outline" className="ml-auto font-mono">{formatDate(selected.date)}</Badge>
                <button onClick={() => selectEvent(null)} className="rounded p-1 text-muted-foreground hover:bg-accent hover:text-foreground">
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
              <div className="mt-2 flex flex-wrap gap-1.5">
                <Badge variant="default" className="normal-case tracking-normal">{selected.type}</Badge>
                <Badge
                  variant={selected.impact === "High" ? "critical" : selected.impact === "Medium" ? "warning" : "muted"}
                  className="normal-case tracking-normal"
                >
                  impact: {selected.impact}
                </Badge>
                {selected.participants.slice(0, 4).map((p) => (
                  <Badge key={p} variant="secondary" className="normal-case tracking-normal">{p}</Badge>
                ))}
              </div>
              <p className="mt-3 text-[13px] leading-relaxed text-foreground/90">{selected.description}</p>
              <p className="mt-2 text-[12.5px] leading-relaxed text-muted-foreground">
                <span className="font-semibold text-success">Result:</span> {selected.result}
              </p>
            </div>
          </div>
          <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-border pt-3">
            <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">Affected knowledge</span>
            {selected.affectedKnowledge.length === 0 && <span className="text-[11px] text-muted-foreground/70">—</span>}
            {selected.affectedKnowledge.map((k) => (
              <Link
                key={k}
                href={`/project/${projectSlug}/knowledge/${k}`}
                className="rounded border border-border bg-muted px-1.5 py-0.5 font-mono text-[11px] text-foreground transition-colors hover:border-primary hover:text-primary"
              >
                {k}
              </Link>
            ))}
            <a
              href={selected.url ?? selected.source}
              target="_blank"
              rel="noreferrer"
              className="ml-auto inline-flex items-center gap-1 text-[12px] text-primary hover:underline"
            >
              {selected.source} <ExternalLink className="h-3 w-3" />
            </a>
          </div>
        </div>
      ) : (
        <div className="rounded-lg border border-dashed border-border py-6 text-center text-[12px] text-muted-foreground">
          Click an event on the timeline — or press <span className="font-mono text-primary">▶ Replay History</span> to watch the full story.
        </div>
      )}
    </div>
  );
}
