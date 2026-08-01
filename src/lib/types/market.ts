/** Kontrak market data — netral (dipakai services, repository, mock adapter, API). */
export interface MarketData {
  slug: string;
  tvl?: number; // USD
  tvlChange?: number; // % 24h
  price?: number; // USD
  marketCap?: number;
  volume24h?: number;
  priceChange24h?: number; // %
  updatedAt?: string;
  /** live = all upstreams OK · degraded = one upstream down · stale = all fallback */
  source: "live" | "degraded" | "stale";
}
