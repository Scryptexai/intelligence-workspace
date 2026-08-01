"use client";

import { useMemo } from "react";
import { EChart, type ChartOption } from "./EChart";

export function DonutChart({
  items,
  color,
  centerLabel,
  centerValue,
  height = 220,
}: {
  items: { name: string; value: number }[];
  color: string;
  centerLabel: string;
  centerValue: string;
  height?: number;
}) {
  const option = useMemo<ChartOption>(
    () => ({
      animation: true,
      tooltip: {
        trigger: "item",
        formatter: "{b}: {c}% · {d}% of total",
        backgroundColor: "#0d1219",
        borderColor: "#1b2330",
        textStyle: { color: "#dbe3ec", fontSize: 11 },
      },
      legend: {
        orient: "vertical",
        right: 4,
        top: "middle",
        textStyle: { color: "#7d8ea3", fontSize: 10.5 },
        itemWidth: 8,
        itemHeight: 8,
        icon: "circle",
      },
      series: [
        {
          type: "pie",
          radius: ["58%", "82%"],
          center: ["32%", "50%"],
          avoidLabelOverlap: false,
          itemStyle: {
            borderRadius: 4,
            borderColor: "#0b0f15",
            borderWidth: 2,
          },
          label: { show: false },
          emphasis: { scaleSize: 6, itemStyle: { shadowBlur: 14, shadowColor: "rgba(34,211,238,0.35)" } },
          data: items.map((it, i) => ({
            ...it,
            itemStyle: {
              color:
                i === 0
                  ? color
                  : [
                      "#0e7490",
                      "#22d3ee",
                      "#38bdf8",
                      "#34d399",
                      "#fbbf24",
                      "#fb7185",
                    ][i % 6],
            },
          })),
        },
      ],
      graphic: [
        {
          type: "text",
          left: "32%",
          top: "38%",
          style: {
            text: centerValue,
            textAlign: "center",
            fill: "#dbe3ec",
            font: "bold 20px 'JetBrains Mono', ui-monospace, monospace",
          },
        },
        {
          type: "text",
          left: "32%",
          top: "55%",
          style: {
            text: centerLabel,
            textAlign: "center",
            fill: "#7d8ea3",
            font: "10px ui-sans-serif, system-ui, sans-serif",
          },
        },
      ],
    }),
    [items, color, centerLabel, centerValue]
  );

  return <EChart option={option} style={{ height }} />;
}
