"use client";

import { useMemo } from "react";
import type { TimelineEvent } from "@/lib/types/event";
import { EChart, type ChartOption } from "@/components/qa/EChart";

export function EventDensityHeatmap({
  events,
  height = 190,
}: {
  events: TimelineEvent[];
  height?: number;
}) {
  const { xLabels, yLabels, data, max } = useMemo(() => {
    const buckets: Record<string, { x: string; y: string; count: number }> = {};
    const xSet = new Set<string>();
    const ySet = new Set<string>();

    for (const ev of events) {
      const d = new Date(ev.date);
      const x = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      const y = ev.type;
      xSet.add(x);
      ySet.add(y);
      const key = `${x}|${y}`;
      buckets[key] = buckets[key] ?? { x, y, count: 0 };
      buckets[key].count += 1;
    }

    const xLabels = [...xSet].sort();
    const yLabels = [...ySet];
    const out: [number, number, number][] = Object.values(buckets).map(
      (b) => [xLabels.indexOf(b.x), yLabels.indexOf(b.y), b.count]
    );
    const max = Math.max(1, ...out.map((o) => o[2]));
    return { xLabels, yLabels, data: out, max };
  }, [events]);

  const option = useMemo<ChartOption>(
    () => ({
      animation: false,
      grid: { top: 10, left: 78, right: 18, bottom: 30 },
      tooltip: {
        position: "top",
        formatter: (params: unknown) => {
          const p = params as { value?: [number, number, number] };
          const v = p.value;
          if (!v) return "";
          return `${yLabels[v[1]] ?? ""}<br/>${xLabels[v[0]] ?? ""} · <b>${v[2]}</b> event${v[2] === 1 ? "" : "s"}`;
        },
      },
      xAxis: {
        type: "category",
        data: xLabels,
        splitArea: { show: true },
        axisLabel: { color: "#7d8ea3", fontSize: 9 },
        axisLine: { lineStyle: { color: "rgba(125,142,163,0.3)" } },
      },
      yAxis: {
        type: "category",
        data: yLabels,
        splitArea: { show: true },
        axisLabel: { color: "#7d8ea3", fontSize: 9 },
        axisLine: { lineStyle: { color: "rgba(125,142,163,0.3)" } },
      },
      visualMap: {
        min: 0,
        max,
        calculable: false,
        orient: "horizontal",
        left: "center",
        bottom: 0,
        inRange: { color: ["#10151d", "#0e7490", "#22d3ee", "#fbbf24", "#fb7185"] },
        textStyle: { color: "#7d8ea3", fontSize: 9 },
        itemWidth: 8,
        itemHeight: 90,
      },
      series: [
        {
          type: "heatmap",
          data,
          label: {
            show: true,
            color: "#dbe3ec",
            fontSize: 8,
            formatter: (params: unknown) => {
              const p = params as { value?: [number, number, number] };
              const v = p.value;
              return v && v[2] > 0 ? String(v[2]) : "";
            },
          },
          itemStyle: { borderColor: "#07090d", borderWidth: 1.5, borderRadius: 2 },
          emphasis: { itemStyle: { shadowBlur: 8, shadowColor: "#22d3ee88" } },
        },
      ],
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [xLabels, yLabels, data, max]
  );

  return <EChart option={option} style={{ height }} />;
}
