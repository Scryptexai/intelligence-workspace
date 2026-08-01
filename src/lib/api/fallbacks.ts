/**
 * Fallback data netral (tidak import dari services — menghindari circular dep).
 * Dipakai oleh mockAdapter (mode mock) dan marketService (placeholder query).
 */
import type { MarketData } from "@/lib/types/market";

const FALLBACK_MARKET: Record<string, Omit<MarketData, "slug" | "source">> = {
  arbitrum: {
    price: 0.92,
    tvl: 3_100_000_000,
    marketCap: 3_400_000_000,
    volume24h: 180_000_000,
    priceChange24h: 2.4,
    tvlChange: 1.8,
  },
  optimism: {
    price: 1.64,
    tvl: 1_150_000_000,
    marketCap: 2_100_000_000,
    volume24h: 95_000_000,
    priceChange24h: -1.2,
    tvlChange: 0.6,
  },
};

export function marketPlaceholder(slug: string): MarketData {
  const f = FALLBACK_MARKET[slug] ?? FALLBACK_MARKET.arbitrum;
  return { slug, ...f, source: "stale", updatedAt: undefined };
}
