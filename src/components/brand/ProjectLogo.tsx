"use client";

import { projectGradient, projectBrandUrls, projectBrandColor } from "@/lib/brand";
import { BrandLogo } from "./BrandLogo";
import { cn } from "@/lib/utils/helpers";

/**
 * Monogram gradient (tampilan lama) — dipakai sebagai fallback terakhir
 * bila slug tidak dikenal DAN semua URL logo gagal dimuat.
 */
function ProjectMonogram({
  symbol,
  slug,
  size,
  radius,
  className,
}: {
  symbol: string;
  slug: string;
  size: number;
  radius: number;
  className?: string;
}) {
  const g = projectGradient(slug);
  const id = `pg-${slug}`;
  const text = (symbol || slug || "?").slice(0, 3).toUpperCase();
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      className={className}
      role="img"
      aria-label={`${symbol || slug} logo`}
    >
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={g.from} />
          <stop offset="100%" stopColor={g.to} />
        </linearGradient>
      </defs>
      <rect
        x="1"
        y="1"
        width="46"
        height="46"
        rx={radius}
        fill={`url(#${id})`}
        stroke="rgba(255,255,255,0.18)"
      />
      <text
        x="24"
        y="31"
        textAnchor="middle"
        fontFamily="'JetBrains Mono', ui-monospace, monospace"
        fontSize="19"
        fontWeight="800"
        fill="#fff"
      >
        {text}
      </text>
      <circle cx="40" cy="8" r="2.5" fill="#fff" opacity="0.55" />
    </svg>
  );
}

/**
 * Logo project RESMI: mencoba daftar logo brand asli ({@link projectBrandUrls})
 * berurutan — cryptologos/brand kit → ikon chain DefiLlama → monogram
 * gradient sebagai fallback. Slug yang belum terdaftar tetap mendapat kandidat
 * ikon DefiLlama, jadi project baru di Supabase otomatis menampilkan logo
 * real-nya bila tersedia.
 */
export function ProjectLogo({
  symbol,
  slug,
  size = 44,
  radius = 12,
  className,
}: {
  symbol: string;
  slug: string;
  size?: number;
  radius?: number;
  className?: string;
}) {
  const label = symbol || slug || "?";
  return (
    <BrandLogo
      urls={projectBrandUrls(slug)}
      color={projectBrandColor(slug)}
      size={size}
      rounded="md"
      initials={label.slice(0, 3).toUpperCase()}
      className={cn("border border-border/60 bg-card shadow-sm", className)}
      fallback={
        <ProjectMonogram
          symbol={label}
          slug={slug}
          size={size}
          radius={radius}
          className={className}
        />
      }
    />
  );
}
