import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function formatDateShort(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    year: "2-digit",
    month: "short",
    day: "2-digit",
  });
}

export function formatNumber(n: number): string {
  return n.toLocaleString("en-US");
}

export function weightStars(w: number): string {
  return "★".repeat(Math.max(0, Math.min(5, w))) + "☆".repeat(Math.max(0, 5 - w));
}

/**
 * Jalankan `fn` atas semua `items` dengan concurrency terbatas.
 *
 * Dipakai untuk mem-paralelkan fetch N+1 ke Supabase (mis. per-project)
 * TANPA membuka ratusan koneksi sekaligus — mencegah timeout fungsi
 * serverless (Vercel) dan rate-limit upstream. Urutan hasil sama dengan
 * urutan input.
 */
export async function mapWithConcurrency<T, R>(
  items: T[],
  limit: number,
  fn: (item: T) => Promise<R>
): Promise<R[]> {
  const out = new Array<R>(items.length);
  let next = 0;
  const safe = Math.max(1, Math.floor(limit));
  const workers = Array.from({ length: Math.min(safe, items.length) }, async () => {
    for (;;) {
      const i = next++;
      if (i >= items.length) return;
      out[i] = await fn(items[i]);
    }
  });
  await Promise.all(workers);
  return out;
}

export function pct(n: number): string {
  return `${Math.round(n)}%`;
}

export function daysBetween(a: string, b: string): number {
  return Math.max(
    1,
    Math.round(
      (new Date(b).getTime() - new Date(a).getTime()) / 86_400_000
    ) + 1
  );
}

export function clamp(n: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, n));
}

export function truncate(s: string, n: number): string {
  return s.length > n ? `${s.slice(0, n)}…` : s;
}
