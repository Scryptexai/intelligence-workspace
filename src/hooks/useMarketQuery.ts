"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchMarketData, marketPlaceholder } from "@/services/marketService";

/**
 * Live market metrics (TVL, price, volume) backed by /api/market/[slug].
 * Auto-refreshes every 60s; staleTime 30s. Falls back to a deterministic
 * placeholder while loading so the UI never flashes empty.
 */
export function useMarket(slug: string) {
  return useQuery({
    queryKey: ["market", slug],
    queryFn: () => fetchMarketData(slug),
    staleTime: 30_000,
    refetchInterval: 60_000,
    retry: 1,
    placeholderData: marketPlaceholder(slug),
  });
}
