"use client";

import { useMarket } from "@/hooks/useMarketQuery";
import { formatChange, formatPrice } from "@/services/marketService";
import { cn } from "@/lib/utils/helpers";

export function LivePriceChip({
  slug,
  symbol,
  className,
}: {
  slug: string;
  symbol: string;
  className?: string;
}) {
  const { data } = useMarket(slug);
  if (!data) return null;

  const ch = data.priceChange24h;
  const live = data.source !== "stale";

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-md border border-border/70 bg-card/70 px-2 py-1 font-mono text-[11px]",
        className
      )}
      title={
        live
          ? `Live dari CoinGecko · ${data.source === "degraded" ? "sebagian data fallback" : "data real-time"}`
          : "Data Stale — API upstream tidak terjangkau, menampilkan nilai cache"
      }
    >
      <span
        className={cn(
          "h-1.5 w-1.5 rounded-full",
          live ? "bg-success animate-pulse-dot" : "bg-warning"
        )}
      />
      <span className="text-foreground/90">{symbol}</span>
      <span className="tabular-nums text-foreground">{formatPrice(data.price)}</span>
      {ch !== undefined && (
        <span
          className={cn(
            "tabular-nums",
            ch >= 0 ? "text-success" : "text-critical"
          )}
        >
          {formatChange(ch)}
        </span>
      )}
    </span>
  );
}
