"use client";

import dynamic from "next/dynamic";

// ECharts is only fetched once a sparkline actually needs to render —
// keeps the homepage initial bundle free of the ~600KB chart runtime.
const Sparkline = dynamic(() => import("./Sparkline").then((m) => m.Sparkline), {
  ssr: false,
  loading: () => (
    <div
      style={{ height: 30 }}
      className="w-full rounded bg-muted/40 animate-pulse"
    />
  ),
});

export function LazySparkline({
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
  return <Sparkline data={data} color={color} height={height} fill={fill} />;
}
