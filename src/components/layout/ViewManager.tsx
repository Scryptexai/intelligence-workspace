"use client";

import { useRouter } from "next/navigation";
import { SavedViews } from "./SavedViews";

export function ViewManager({
  scope,
  filters,
  basePath,
}: {
  scope: string;
  filters: Record<string, string>;
  basePath: string;
}) {
  const router = useRouter();

  return (
    <SavedViews
      scope={scope}
      filters={filters}
      onApply={(f) => {
        const sp = new URLSearchParams();
        for (const [k, v] of Object.entries(f)) {
          if (v && v !== "All") sp.set(k, v);
        }
        const qs = sp.toString();
        router.push(`${basePath}${qs ? `?${qs}` : ""}`);
      }}
    />
  );
}
