"use client";

import { useState, type ReactNode } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils/helpers";

/**
 * Renders a brand logo from an ordered list of SVG URLs, trying each in
 * sequence. Falls back to a colored initial tile (or a custom `fallback`
 * node) when nothing loads.
 * Uses next/image (unoptimized — these are tiny hot-linked SVGs) so the
 * Image component handles layout, lazy-loading and error fallback.
 */
export function BrandLogo({
  urls = [],
  slug,
  color,
  size = 24,
  initials,
  chip = false,
  rounded = "full",
  className,
  fallback,
}: {
  urls?: string[];
  slug?: string;
  color: string;
  size?: number;
  initials?: string;
  chip?: boolean;
  rounded?: "full" | "md" | "none";
  className?: string;
  /** Node kustom saat semua URL gagal dimuat (menggantikan tile inisial). */
  fallback?: ReactNode;
}) {
  const all = [...urls];
  if (slug) all.push(`https://cdn.simpleicons.org/${slug}/${color.replace("#", "")}`);
  const [idx, setIdx] = useState(0);
  const [failedAll, setFailedAll] = useState(false);

  if (idx >= all.length || failedAll) {
    if (fallback) return <>{fallback}</>;
    return (
      <span
        className={cn(
          "flex shrink-0 select-none items-center justify-center font-bold text-white",
          className
        )}
        style={{
          width: size,
          height: size,
          backgroundColor: color,
          borderRadius: rounded === "full" ? "50%" : rounded === "md" ? 6 : 0,
          fontSize: Math.max(8, size * 0.42),
        }}
      >
        {initials ?? "?"}
      </span>
    );
  }

  return (
    <span
      className={cn(
        "flex shrink-0 items-center justify-center overflow-hidden",
        chip && "bg-white",
        className
      )}
      style={{
        width: size,
        height: size,
        borderRadius: rounded === "full" ? "50%" : rounded === "md" ? 6 : 0,
      }}
    >
      <Image
        src={all[idx]}
        alt=""
        width={size}
        height={size}
        unoptimized
        loading="lazy"
        style={{
          objectFit: "contain",
          width: chip ? size * 0.72 : size,
          height: chip ? size * 0.72 : size,
        }}
        onError={() => {
          if (idx + 1 >= all.length) setFailedAll(true);
          else setIdx(idx + 1);
        }}
      />
    </span>
  );
}
