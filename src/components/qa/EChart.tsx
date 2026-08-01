"use client";

// Tree-shaken ECharts: only the chart types we use are bundled, slashing the
// ~1MB full import down to the modules actually needed.
import * as echarts from "echarts/core";
import {
  LineChart,
  RadarChart,
  HeatmapChart,
  PieChart,
} from "echarts/charts";
import {
  GridComponent,
  TooltipComponent,
  LegendComponent,
  VisualMapComponent,
  GraphicComponent,
  RadarComponent,
} from "echarts/components";
import { CanvasRenderer } from "echarts/renderers";
import { memo, useEffect, useRef } from "react";
import type { ComposeOption } from "echarts/core";
import type {
  LineSeriesOption,
  RadarSeriesOption,
  HeatmapSeriesOption,
  PieSeriesOption,
} from "echarts/charts";
import type {
  GridComponentOption,
  TooltipComponentOption,
  LegendComponentOption,
  VisualMapComponentOption,
  GraphicComponentOption,
} from "echarts/components";

echarts.use([
  LineChart,
  RadarChart,
  HeatmapChart,
  PieChart,
  GridComponent,
  TooltipComponent,
  LegendComponent,
  VisualMapComponent,
  GraphicComponent,
  RadarComponent,
  CanvasRenderer,
]);

export type ChartOption = ComposeOption<
  | LineSeriesOption
  | RadarSeriesOption
  | HeatmapSeriesOption
  | PieSeriesOption
  | GridComponentOption
  | TooltipComponentOption
  | LegendComponentOption
  | VisualMapComponentOption
  | GraphicComponentOption
>;

export const EChart = memo(function EChart({
  option,
  className,
  style,
}: {
  option: ChartOption;
  className?: string;
  style?: React.CSSProperties;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const chartRef = useRef<echarts.ECharts | null>(null);

  useEffect(() => {
    if (!ref.current) return;
    const chart = echarts.init(ref.current);
    chartRef.current = chart;
    chart.setOption(option);
    const ro = new ResizeObserver(() => chart.resize());
    ro.observe(ref.current);
    return () => {
      ro.disconnect();
      chart.dispose();
      chartRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    chartRef.current?.setOption(option, true);
  }, [option]);

  return <div ref={ref} className={className} style={style} />;
});
