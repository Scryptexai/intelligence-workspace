"use client";

import { useMemo } from "react";
import * as echarts from "echarts/core";
import { EChart, type ChartOption } from "./EChart";

export interface RadarDim {
  label: string;
  detail?: string;
}

export interface RadarSeries {
  name: string;
  color: string;
  values: number[];
}

export function RadarChart({
  dims,
  series,
  height = 380,
  footnote,
}: {
  dims: RadarDim[];
  series: RadarSeries[];
  height?: number;
  footnote?: string;
}) {
  const option = useMemo<ChartOption>(
    () => ({
      backgroundColor: "transparent",
      tooltip: {
        trigger: "item",
        backgroundColor: "#0d1219",
        borderColor: "#1b2330",
        textStyle: { color: "#dbe3ec", fontSize: 11.5 },
        formatter: (params: unknown) => {
          const p = params as {
            name?: string;
            data?: { value?: number[] };
            marker?: string;
          };
          const values = p.data?.value ?? [];
          const rows = dims
            .map((d, i) => {
              const v = values[i];
              return v === undefined
                ? null
                : `<div style="display:flex;justify-content:space-between;gap:16px"><span>${d.label}</span><b>${v}/100</b></div>`;
            })
            .filter(Boolean)
            .join("");
          const detailLine = footnote
            ? `<div style="margin-top:6px;color:#7d8ea3;font-size:10.5px;border-top:1px solid #1b2330;padding-top:6px">${footnote}</div>`
            : "";
          return `<div style="font-weight:600;margin-bottom:6px">${p.marker ?? ""}${p.name ?? ""}</div>${rows}${detailLine}`;
        },
      },
      legend: {
        data: series.map((s) => s.name),
        textStyle: { color: "#8ea0b5", fontSize: 11 },
        bottom: 0,
        icon: "circle",
        itemWidth: 8,
        itemHeight: 8,
      },
      radar: {
        indicator: dims.map((d) => ({ name: d.label, max: 100 })),
        radius: "62%",
        center: ["50%", "45%"],
        splitNumber: 4,
        axisName: { color: "#9fb0c3", fontSize: 10.5 },
        splitLine: { lineStyle: { color: "rgba(125,142,163,0.22)" } },
        splitArea: { show: false },
        axisLine: { lineStyle: { color: "rgba(125,142,163,0.22)" } },
      },
      series: [
        {
          type: "radar",
          symbol: "circle",
          symbolSize: 5,
          data: series.map((s) => ({
            name: s.name,
            value: s.values,
            lineStyle: {
              color: s.color,
              width: 2.2,
              shadowBlur: 14,
              shadowColor: `${s.color}66`,
            },
            itemStyle: { color: s.color, shadowBlur: 10, shadowColor: s.color },
            areaStyle: {
              color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                { offset: 0, color: `${s.color}66` },
                { offset: 1, color: `${s.color}08` },
              ]),
            },
          })),
        },
      ],
    }),
    [dims, series]
  );

  return <EChart option={option} style={{ height }} />;
}
