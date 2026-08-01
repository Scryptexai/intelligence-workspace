import type { NextRequest } from "next/server";
import { apiJson } from "@/lib/api/response";
import type { ApiMeta } from "@/lib/api/types";

interface ChainRow {
  name?: string;
  tvl?: number;
  tvlChange?: number;
}

interface CoinRow {
  usd?: number;
  usd_market_cap?: number;
  usd_24h_vol?: number;
  usd_24h_change?: number;
  last_updated_at?: number;
}

const COIN_IDS: Record<string, string> = {
  arbitrum: "arbitrum",
  optimism: "optimism",
};

const CHAIN_NAMES: Record<string, string[]> = {
  arbitrum: ["Arbitrum"],
  optimism: ["OP Mainnet", "Optimism"],
};

const FALLBACK: Record<
  string,
  { price: number; tvl: number; marketCap: number; volume24h: number; priceChange24h: number; tvlChange: number }
> = {
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

async function fetchJson(url: string, timeoutMs = 6000): Promise<unknown> {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const res = await fetch(url, {
      signal: ctrl.signal,
      next: { revalidate: 60 },
      headers: { Accept: "application/json", "User-Agent": "intelligence-workspace/1.0" },
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
  } finally {
    clearTimeout(timer);
  }
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const coinId = COIN_IDS[slug];
  const chainNames = CHAIN_NAMES[slug];
  const fallback = FALLBACK[slug] ?? FALLBACK.arbitrum;

  if (!coinId) return apiJson({ error: "unknown project" }, { status: 404 });

  let tvl: number | undefined;
  let tvlChange: number | undefined;
  let price: number | undefined;
  let marketCap: number | undefined;
  let volume24h: number | undefined;
  let priceChange24h: number | undefined;
  let updatedAt: string | undefined;
  let failures = 0;

  try {
    const chains = (await fetchJson("https://api.llama.fi/v2/chains")) as ChainRow[];
    const c = chains.find((x) => chainNames.includes(x.name ?? ""));
    if (c && typeof c.tvl === "number" && c.tvl > 0) {
      tvl = c.tvl;
      tvlChange = c.tvlChange;
    } else {
      failures += 1;
    }
  } catch {
    failures += 1;
  }

  try {
    const url = `https://api.coingecko.com/api/v3/simple/price?ids=${coinId}&vs_currencies=usd&include_market_cap=true&include_24hr_vol=true&include_24hr_change=true&include_last_updated_at=true`;
    const d = (await fetchJson(url)) as Record<string, CoinRow>;
    const c = d[coinId];
    if (c && typeof c.usd === "number") {
      price = c.usd;
      marketCap = c.usd_market_cap;
      volume24h = c.usd_24h_vol;
      priceChange24h = c.usd_24h_change;
      if (c.last_updated_at) updatedAt = new Date(c.last_updated_at * 1000).toISOString();
    } else {
      failures += 1;
    }
  } catch {
    failures += 1;
  }

  const source: ApiMeta["source"] = failures === 0 ? "live" : failures >= 2 ? "stale" : "degraded";

  return apiJson(
    {
      slug,
      tvl: tvl ?? fallback.tvl,
      tvlChange: tvlChange ?? fallback.tvlChange,
      price: price ?? fallback.price,
      marketCap: marketCap ?? fallback.marketCap,
      volume24h: volume24h ?? fallback.volume24h,
      priceChange24h: priceChange24h ?? fallback.priceChange24h,
      updatedAt: updatedAt ?? new Date().toISOString(),
      source,
    },
    { source, cache: "public, s-maxage=60, stale-while-revalidate=300" }
  );
}
