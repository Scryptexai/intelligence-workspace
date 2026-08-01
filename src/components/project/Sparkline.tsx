"use client";

import { useMemo } from "react";
import * as echarts from "echarts/core";
import { EChart, type ChartOption } from "@/components/qa/EChart";

export function Sparkline({
  data,
  color,
  height = 30,
  fill = true,
}: {
  data: number[];
  color: string;
  height?: number;
  fill?: boolean;
}) {
  const option = useMemo<ChartOption>(
    () => ({
      animation: false,
      grid: { top: 3, left: 2, right: 2, bottom: 2 },
      xAxis: {
        type: "category",
        show: false,
        boundaryGap: false,
        data: data.map((_, i) => i),
      },
      yAxis: { type: "value", show: false, min: "dataMin", max: "dataMax" },
      series: [
        {
          type: "line",
          data,
          smooth: true,
          symbol: "none",
          lineStyle: { color, width: 1.6 },
          areaStyle: fill
            ? {
                color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                  { offset: 0, color: `${color}55` },
                  { offset: 1, color: `${color}05` },
                ]),
              }
            : undefined,
        },
      ],
    }),
    [data, color, fill]
  );

  return <EChart option={option} style={{ height, width: "100%" }} />;
}
