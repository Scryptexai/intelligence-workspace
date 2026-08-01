"use client";

import { useState, type ReactNode } from "react";
import { BookOpen, FileText } from "lucide-react";
import { cn } from "@/lib/utils/helpers";

/**
 * Reading Mode — toggle "Presentasi" untuk mode baca nyaman:
 * background kertas terang sementara (tanpa mengubah tema global).
 */
export function ReadingModeShell({ children }: { children: ReactNode }) {
  const [paper, setPaper] = useState(false);

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center gap-2">
        <button
          onClick={() => setPaper((p) => !p)}
          className={cn(
            "inline-flex h-8 items-center gap-1.5 rounded-md border px-3 text-[12px] font-medium transition-colors",
            paper
              ? "border-amber-500/60 bg-amber-500/10 text-amber-400"
              : "border-border bg-card text-muted-foreground hover:text-foreground"
          )}
          title="Mode baca: background kertas terang sementara"
        >
          {paper ? <BookOpen className="h-3.5 w-3.5" /> : <FileText className="h-3.5 w-3.5" />}
          {paper ? "Keluar Mode Baca" : "Presentasi"}
        </button>
      </div>

      <div className={cn("rounded-xl transition-colors duration-300", paper && "reading-paper")}>
        {children}
      </div>
    </div>
  );
}
