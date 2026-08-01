import type { EntityType } from "@/lib/types/entity";

/* ------------------------------------------------------------------ */
/* Project personality                                                 */
/* ------------------------------------------------------------------ */

export const PROJECT_GRADIENTS: Record<string, { from: string; to: string }> = {
  arbitrum: { from: "#28A0F0", to: "#2D3748" },
  optimism: { from: "#FF0420", to: "#7A0C1E" },
};

export function faviconSvgDataUri(symbol: string, from: string, to: string): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${from}"/><stop offset="1" stop-color="${to}"/></linearGradient></defs><rect width="32" height="32" rx="8" fill="url(#g)"/><text x="16" y="22" font-family="Arial,Helvetica,sans-serif" font-size="15" font-weight="bold" text-anchor="middle" fill="#fff">${symbol.slice(0, 2)}</text></svg>`;
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}

export function projectGradient(slug: string) {
  return PROJECT_GRADIENTS[slug] ?? { from: "#22d3ee", to: "#0e7490" };
}

/* ------------------------------------------------------------------ */
/* Entity brand logos — ordered URL lists (tried in sequence)          */
/* ------------------------------------------------------------------ */

interface EntityBrand {
  /** Direct SVG URLs, tried in order until one loads */
  urls?: string[];
  /** Simple Icons fallback slug */
  slug?: string;
  /** Brand color used for simpleicons URL + chip bg */
  color?: string;
  /** Render logo on a white chip (for black/white brand marks) */
  chip?: boolean;
  /** Fallback tile color when nothing loads */
  fallbackColor?: string;
}

export const ENTITY_BRAND: Record<string, EntityBrand> = {
  /* DEX & DeFi */
  uniswap: {
    urls: [
      "https://proicons.com/icon/386435.svg",
      "https://upload.wikimedia.org/wikipedia/commons/e/e4/Uniswap_Logo_and_Wordmark.svg",
      "https://cryptologos.zenobank.io/logos/uniswap-uni-logo.svg",
    ],
    slug: "uniswap",
    color: "#FF007A",
    fallbackColor: "#ff007a",
  },
  aave: {
    urls: [
      "https://raw.githubusercontent.com/bgd-labs/web3-icons/main/icons/full/aave.svg",
      "https://proicons.com/icon/387119.svg",
    ],
    slug: "aave",
    color: "#B6509E",
    fallbackColor: "#b6509e",
  },
  "curve-finance": {
    urls: [
      "https://curve.finance/img/logos/crv.svg",
      "https://cryptologos.zenobank.io/logos/curve-finance-crv-logo.svg",
    ],
    color: "#0085FF",
    fallbackColor: "#0085ff",
  },
  gmx: {
    urls: ["https://proicons.com/icon/387692.svg"],
    color: "#38bdf8",
    fallbackColor: "#38bdf8",
  },

  /* CEX */
  coinbase: {
    urls: [
      "https://upload.wikimedia.org/wikipedia/commons/6/6a/Coinbase.svg",
      "https://logotyp.us/file/coinbase.svg",
    ],
    slug: "coinbase",
    color: "#0052FF",
    fallbackColor: "#0052ff",
  },
  binance: {
    urls: [
      "https://upload.wikimedia.org/wikipedia/commons/f/fc/Binance_logo.svg",
      "https://proicons.com/icon/386414.svg",
    ],
    color: "#F0B90B",
    fallbackColor: "#f0b90b",
  },
  kraken: {
    urls: ["https://proicons.com/icon/328057.svg"],
    color: "#5842E3",
    fallbackColor: "#5842e3",
  },

  /* Institutional */
  blackrock: {
    urls: ["https://logotyp.us/file/blackrock.svg"],
    color: "#000000",
    chip: true,
    fallbackColor: "#1e293b",
  },
  "franklin-templeton": {
    color: "#F97316",
    fallbackColor: "#f97316",
  },
  robinhood: {
    color: "#00C805",
    fallbackColor: "#00c805",
  },

  /* Investors */
  "pantera-capital": {
    slug: "panteracapital",
    color: "#FF6B00",
    fallbackColor: "#f97316",
  },
  polychain: {
    color: "#E6007A",
    fallbackColor: "#e6007a",
  },
  lightspeed: {
    color: "#3B5BDB",
    fallbackColor: "#3b5bdb",
  },
  "delphi-digital": { color: "#8B5CF6", fallbackColor: "#8b5cf6" },

  /* Ecosystem */
  "arbitrum-foundation": {
    urls: ["https://cryptologos.zenobank.io/logos/arbitrum-arb-logo.svg"],
    color: "#28A0F0",
    fallbackColor: "#0e7490",
  },
  "offchain-labs": { color: "#0E7490", fallbackColor: "#0e7490" },
  "op-labs": { color: "#7C3AED", fallbackColor: "#7c3aed" },
  "treasure-dao": { color: "#F472B6", fallbackColor: "#f472b6" },
  "trail-of-bits": { color: "#F43F5E", fallbackColor: "#f43f5e" },
  gauntlet: { color: "#10B981", fallbackColor: "#10b981" },
  oat: { color: "#64748B", fallbackColor: "#64748b" },
  worldcoin: {
    slug: "worldcoin",
    color: "#8B5CF6",
    fallbackColor: "#8b5cf6",
  },
  ethereum: {
    slug: "ethereum",
    color: "#8C8C8C",
    chip: true,
    fallbackColor: "#627eea",
  },
};

/** Ordered list of logo URLs for an entity id (direct + simpleicons fallback) */
export function entityBrandUrls(entityId: string): string[] {
  const b = ENTITY_BRAND[entityId];
  if (!b) return [];
  const urls = [...(b.urls ?? [])];
  if (b.slug) urls.push(`https://cdn.simpleicons.org/${b.slug}/${(b.color ?? "888888").replace("#", "")}`);
  return urls;
}

export function entityBrandMeta(entityId: string): {
  color?: string;
  chip?: boolean;
} {
  const b = ENTITY_BRAND[entityId];
  return { color: b?.color, chip: b?.chip };
}

export const ENTITY_TYPE_ICON_COLOR: Record<EntityType, string> = {
  Person: "#a78bfa",
  Company: "#38bdf8",
  Foundation: "#fbbf24",
  Protocol: "#22d3ee",
  Investor: "#34d399",
  Application: "#f472b6",
  Security: "#fb7185",
  DAO: "#f97316",
  Government: "#94a3b8",
};

/* ------------------------------------------------------------------ */
/* Ecosystem partners (marquee strip)                                  */
/* ------------------------------------------------------------------ */

export interface Partner {
  name: string;
  urls?: string[];
  slug?: string;
  color: string;
  chip?: boolean;
}

export const ECOSYSTEM_PARTNERS: Partner[] = [
  { name: "Uniswap", urls: ["https://proicons.com/icon/386435.svg", "https://cryptologos.zenobank.io/logos/uniswap-uni-logo.svg"], color: "#FF007A" },
  { name: "Aave", urls: ["https://raw.githubusercontent.com/bgd-labs/web3-icons/main/icons/full/aave.svg"], color: "#B6509E" },
  { name: "Coinbase", urls: ["https://upload.wikimedia.org/wikipedia/commons/6/6a/Coinbase.svg"], color: "#0052FF" },
  { name: "GMX", urls: ["https://proicons.com/icon/387692.svg"], color: "#38bdf8" },
  { name: "Curve Finance", urls: ["https://curve.finance/img/logos/crv.svg"], color: "#0085FF" },
  { name: "BlackRock", urls: ["https://logotyp.us/file/blackrock.svg"], color: "#1e293b", chip: true },
  { name: "Franklin Templeton", color: "#f97316" },
  { name: "Robinhood", color: "#00c805" },
  { name: "Pantera Capital", slug: "panteracapital", color: "#FF6B00" },
  { name: "Polychain", color: "#e6007a" },
  { name: "Binance", urls: ["https://upload.wikimedia.org/wikipedia/commons/f/fc/Binance_logo.svg"], color: "#F0B90B" },
  { name: "Kraken", urls: ["https://proicons.com/icon/328057.svg"], color: "#5842E3" },
  { name: "Treasure DAO", color: "#f472b6" },
  { name: "Worldcoin", slug: "worldcoin", color: "#8b5cf6" },
];

/* ------------------------------------------------------------------ */
/* Event thumbnails (stock imagery fallback = gradient tile)           */
/* ------------------------------------------------------------------ */

export const EVENT_THUMBNAILS = [
  "https://images.pexels.com/photos/38375326/pexels-photo-38375326.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=300&w=520",
  "https://images.pexels.com/photos/6770774/pexels-photo-6770774.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=300&w=520",
  "https://images.pexels.com/photos/38375327/pexels-photo-38375327.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=300&w=520",
  "https://images.pexels.com/photos/5833263/pexels-photo-5833263.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=300&w=520",
  "https://images.pexels.com/photos/20534452/pexels-photo-20534452.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=300&w=520",
  "https://images.pexels.com/photos/38412415/pexels-photo-38412415.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=300&w=520",
  "https://images.pexels.com/photos/6771874/pexels-photo-6771874.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=300&w=520",
  "https://images.pexels.com/photos/7767503/pexels-photo-7767503.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=300&w=520",
];

export function eventThumbnailUrl(eventId: string, eventType: string): string | undefined {
  if (!["Launch", "Technology", "Funding", "Integration", "Token"].includes(eventType)) {
    return undefined;
  }
  return EVENT_THUMBNAILS[hashCode(eventId) % EVENT_THUMBNAILS.length];
}

/* ------------------------------------------------------------------ */
/* Deterministic sparkline / trend mocks                               */
/* ------------------------------------------------------------------ */

export function hashCode(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = (Math.imul(31, h) + s.charCodeAt(i)) | 0;
  }
  return h >>> 0;
}

function mulberry32(seed: number) {
  return function () {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function sparklineSeries(
  seed: string,
  points = 14,
  base = 60,
  volatility = 10,
  uptrend = true
): number[] {
  const rnd = mulberry32(hashCode(seed));
  const out: number[] = [];
  let v = base * (0.8 + rnd() * 0.25);
  for (let i = 0; i < points; i++) {
    out.push(Math.round(v * 10) / 10);
    const drift = uptrend ? 1.1 : -1.1;
    v = Math.max(6, v + (rnd() - 0.44) * volatility + drift);
  }
  return out;
}

export function trendPct(series: number[]): number {
  if (series.length < 2) return 0;
  const first = series[0];
  const last = series[series.length - 1];
  if (first === 0) return 0;
  return Math.round(((last - first) / first) * 1000) / 10;
}

/* ------------------------------------------------------------------ */
/* Source reliability heuristic (conflict diff)                        */
/* ------------------------------------------------------------------ */

export type Reliability = "High" | "Medium" | "Low";

export function reliabilityOf(source: string): Reliability {
  const s = source.toLowerCase();
  if (
    s.includes("foundation") ||
    s.includes("offchain labs") ||
    s.includes("announcement") ||
    s.includes("contract") ||
    s.includes("on-chain") ||
    s.includes("tally") ||
    s.includes("snapshot") ||
    s.includes("l2beat") ||
    s.includes("etherscan")
  ) {
    return "High";
  }
  if (
    s.includes("forum") ||
    s.includes("delegate") ||
    s.includes("analyst") ||
    s.includes("researcher") ||
    s.includes("report") ||
    s.includes("community") ||
    s.includes("nansen")
  ) {
    return "Medium";
  }
  return "Low";
}
