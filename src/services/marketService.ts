import { marketRepository } from "@/lib/api/repositories";
import { marketPlaceholder } from "@/lib/api/fallbacks";
import type { MarketData } from "@/lib/types/market";

export type { MarketData } from "@/lib/types/market";

export function fetchMarketData(slug: string): Promise<MarketData> {
  return marketRepository.get(slug);
}

/* ---------------- formatting ---------------- */

export function formatUsdCompact(n?: number): string {
  if (n == null || isNaN(n)) return "—";
  if (Math.abs(n) >= 1e12) return `$${(n / 1e12).toFixed(2)}T`;
  if (Math.abs(n) >= 1e9) return `$${(n / 1e9).toFixed(2)}B`;
  if (Math.abs(n) >= 1e6) return `$${(n / 1e6).toFixed(1)}M`;
  if (Math.abs(n) >= 1e3) return `$${(n / 1e3).toFixed(0)}K`;
  return `$${n.toFixed(0)}`;
}

export function formatPrice(n?: number): string {
  if (n == null || isNaN(n)) return "—";
  if (n < 0.01) return `$${n.toFixed(6)}`;
  if (n < 1) return `$${n.toFixed(4)}`;
  if (n < 100) return `$${n.toFixed(2)}`;
  return `$${n.toLocaleString("en-US", { maximumFractionDigits: 0 })}`;
}

export function formatChange(n?: number): string {
  if (n == null || isNaN(n)) return "—";
  return `${n >= 0 ? "▲" : "▼"} ${Math.abs(n).toFixed(1)}%`;
}

export { marketPlaceholder };
