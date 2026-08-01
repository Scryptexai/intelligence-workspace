"use client";

import { AlertTriangle, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ProjectError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 rounded-lg border border-border bg-card p-10 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-destructive/10 text-destructive">
        <AlertTriangle className="h-6 w-6" />
      </div>
      <div>
        <h1 className="text-[15px] font-bold text-foreground">
          Failed to load project intelligence
        </h1>
        <p className="mt-1 max-w-sm text-[12.5px] text-muted-foreground">
          The research data for this project could not be loaded. This may be a
          temporary issue with the data source.
          {error?.digest && (
            <span className="mt-1 block font-mono text-[10.5px] text-muted-foreground/70">
              digest: {error.digest}
            </span>
          )}
        </p>
      </div>
      <Button size="sm" onClick={reset} className="gap-1.5">
        <RotateCcw className="h-3.5 w-3.5" /> Retry
      </Button>
    </div>
  );
}
