"use client";

import { useCallback } from "react";
import { useRouter } from "next/navigation";
import type { KnowledgeItem } from "@/lib/types/knowledge";
import { KnowledgeList } from "./KnowledgeList";

export function KnowledgeListWithSync({
  items,
  baseHref,
  initialQuery,
  initialStatus,
}: {
  items: KnowledgeItem[];
  baseHref: string;
  initialQuery?: string;
  initialStatus?: "All" | "Stable" | "Emerging" | "Volatile" | "Deprecated";
}) {
  const router = useRouter();

  const handleChange = useCallback(
    ({ q, status }: { q: string; status: string }) => {
      const sp = new URLSearchParams();
      if (q) sp.set("q", q);
      if (status && status !== "All") sp.set("status", status);
      const qs = sp.toString();
      const target = `${baseHref}${qs ? `?${qs}` : ""}`;
      // Guard: jangan replace kalau URL sudah sama — mencegah navigasi redundan
      // yang bisa memicu RSC refetch / reload.
      const current = window.location.pathname + window.location.search;
      if (current !== target) {
        router.replace(target, { scroll: false });
      }
    },
    [router, baseHref]
  );

  return (
    <KnowledgeList
      items={items}
      baseHref={baseHref}
      initialQuery={initialQuery}
      initialStatus={initialStatus}
      onChange={handleChange}
    />
  );
}
