"use client";

import { useEffect } from "react";
import { AlertTriangle, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Application error:", error);
  }, [error]);

  return (
    <div className="flex h-full flex-col items-center justify-center gap-4 p-8 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-destructive/10 text-destructive">
        <AlertTriangle className="h-8 w-8" />
      </div>
      <div>
        <h1 className="text-lg font-bold text-foreground">Something went wrong</h1>
        <p className="mt-1 max-w-sm text-[13px] text-muted-foreground">
          An unexpected error occurred while rendering this page. Your data is
          safe — try reloading the view.
        </p>
        {error?.digest && (
          <p className="mt-2 font-mono text-[11px] text-muted-foreground/70">
            error digest: {error.digest}
          </p>
        )}
      </div>
      <Button size="sm" onClick={reset} className="gap-1.5">
        <RotateCcw className="h-3.5 w-3.5" /> Try again
      </Button>
    </div>
  );
}
