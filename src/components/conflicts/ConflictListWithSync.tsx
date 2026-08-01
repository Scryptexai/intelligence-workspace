"use client";

import { useCallback } from "react";
import { useRouter } from "next/navigation";
import type { Conflict } from "@/lib/types/conflict";
import { ConflictList } from "./ConflictList";

export function ConflictListWithSync({
  conflicts,
  baseHref,
  initialSeverity,
  initialStatus,
}: {
  conflicts: Conflict[];
  baseHref: string;
  initialSeverity?: "All" | "Critical" | "High" | "Medium" | "Low";
  initialStatus?: "All" | "Resolved" | "Unresolved";
}) {
  const router = useRouter();

  const handleChange = useCallback(
    ({ severity, status }: { severity: string; status: string }) => {
      const sp = new URLSearchParams();
      if (severity && severity !== "All") sp.set("severity", severity);
      if (status && status !== "All") sp.set("status", status);
      const qs = sp.toString();
      const target = `${baseHref}${qs ? `?${qs}` : ""}`;
      // Guard: skip jika URL tidak berubah — mencegah loop navigasi.
      const current = window.location.pathname + window.location.search;
      if (current !== target) {
        router.replace(target, { scroll: false });
      }
    },
    [router, baseHref]
  );

  return (
    <ConflictList
      conflicts={conflicts}
      baseHref={baseHref}
      initialSeverity={initialSeverity}
      initialStatus={initialStatus}
      onChange={handleChange}
    />
  );
}
