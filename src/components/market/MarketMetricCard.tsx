"use client";

import { useMemo } from "react";
import { BarChart3, TrendingUp, Wallet } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { LazySparkline } from "@/components/project/LazySparkline";
import { LiveBadge } from "./LiveBadge";
import { useMarket } from "@/hooks/useMarketQuery";
import {
  formatChange,
  formatPrice,
  formatUsdCompact,
} from "@/services/marketService";
import { projectGradient, sparklineSeries } from "@/lib/brand";
import { cn } from "@/lib/utils/helpers";

type MarketMetric = "tvl" | "price" | "volume";

const META: Record<
  MarketMetric,
  {
    label: string;
    icon: typeof Wallet;
    info: string;
    value: (d: { tvl?: number; price?: number; volume24h?: number }) => string;
    change: (d: { tvlChange?: number; priceChange24h?: number }) => number | undefined;
    seedBase: number;
  }
> = {
  tvl: {
    label: "TVL",
    icon: Wallet,
    info: "Total Value Locked on the chain — real-time dari DefiLlama API, auto-refresh 60 detik.",
    value: (d) => formatUsdCompact(d.tvl),
    change: (d) => d.tvlChange,
    seedBase: 2_500_000_000,
  },
  price: {
    label: "ARB Price",
    icon: TrendingUp,
    info: "Harga token dari CoinGecko — auto-refresh 60 detik.",
    value: (d) => formatPrice(d.price),
    change: (d) => d.priceChange24h,
    seedBase: 0.9,
  },
  volume: {
    label: "24h Volume",
    icon: BarChart3,
    info: "Volume perdagangan 24 jam dari CoinGecko — auto-refresh 60 detik.",
    value: (d) => formatUsdCompact(d.volume24h),
    change: (d) => undefined,
    seedBase: 150_000_000,
  },
};

export function MarketMetricCard({
  slug,
  metric,
  symbol,
}: {
  slug: string;
  metric: MarketMetric;
  symbol: string;
}) {
  const { data, isFetching } = useMarket(slug);
  const meta = META[metric];
  const Icon = meta.icon;
  const gradient = projectGradient(slug);

  const label = metric === "price" ? `${symbol} Price` : meta.label;
  const value = data ? meta.value(data) : "—";
  const change = data ? meta.change(data) : undefined;
  const changeGood = change === undefined ? undefined : change >= 0;

  // deterministic sparkline scaled to the live value
  const spark = useMemo(() => {
    const base = sparklineSeries(`${slug}-${metric}-live`, 16, meta.seedBase, meta.seedBase * 0.05, true);
    const last = base[base.length - 1];
    const target =
      metric === "price"
        ? data?.price ?? meta.seedBase
        : metric === "tvl"
          ? data?.tvl ?? meta.seedBase
          : data?.volume24h ?? meta.seedBase;
    return base.map((v) => Math.round((v * (target / last)) * 100) / 100);
  }, [slug, metric, data, meta.seedBase]);

  return (
    <Card className="project-glow-hover h-full overflow-hidden">
      <CardContent className="flex h-full flex-col p-3.5">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="truncate text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                {label}
              </span>
              <span
                className="inline-flex text-muted-foreground/70"
                title={meta.info}
              >
                <span className="cursor-help">?</span>
              </span>
            </div>
            <div className="mt-1 flex items-baseline gap-1">
              <span className="font-mono text-[22px] font-bold tabular-nums tracking-tight text-foreground">
                {value}
              </span>
            </div>
            <div className="mt-1 flex items-center gap-1.5">
              {change !== undefined && (
                <span
                  className={cn(
                    "inline-flex items-center gap-0.5 rounded px-1 py-px font-mono text-[10px] font-semibold tabular-nums",
                    changeGood
                      ? "bg-success/15 text-success"
                      : "bg-critical/15 text-critical"
                  )}
                >
                  {formatChange(change)}
                </span>
              )}
              <span className="text-[10px] text-muted-foreground">24h</span>
            </div>
          </div>
          <div className="flex flex-col items-end gap-1">
            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-muted text-primary">
              <Icon className="h-3.5 w-3.5" />
            </div>
            <LiveBadge source={data?.source} isFetching={isFetching} />
          </div>
        </div>

        <div className="mt-auto pt-1.5">
          <LazySparkline data={spark} color={gradient.from} height={26} />
        </div>

        <div className="mt-1 flex items-center justify-between text-[10px] text-muted-foreground">
          <span>DefiLlama · CoinGecko</span>
          {data?.updatedAt && (
            <span className="font-mono">
              {new Date(data.updatedAt).toLocaleTimeString("en-US", {
                hour: "2-digit",
                minute: "2-digit",
                hour12: false,
              })}
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
