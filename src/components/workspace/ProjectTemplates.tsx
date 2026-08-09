"use client";

import { Focus } from "lucide-react";
import { PROJECT_TEMPLATES } from "@/lib/types/workspace";
import { Badge } from "@/components/ui/badge";

/**
 * Project Templates — konten produk statis (bukan data riset / mock).
 * Dua template disetujui: VC Due Diligence & Exchange Listing.
 * v1 hanya menampilkan; pemakaian template untuk scaffolding project
 * menyusul di fase berikutnya.
 */
export function ProjectTemplates() {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      {PROJECT_TEMPLATES.map((t) => (
        <div
          key={t.id}
          className="rounded-lg border border-border bg-card p-4 transition-colors hover:border-primary/40"
        >
          <div className="flex items-start gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-primary/10 text-lg">
              {t.emoji}
            </div>
            <div className="min-w-0">
              <div className="text-[13.5px] font-semibold text-foreground">{t.name}</div>
              <p className="mt-0.5 text-[11.5px] leading-relaxed text-muted-foreground">
                {t.description}
              </p>
              <div className="mt-2 flex flex-wrap gap-1.5">
                <Focus className="h-3 w-3 self-center text-muted-foreground" />
                {t.focusAreas.map((f) => (
                  <Badge key={f} variant="secondary" className="normal-case tracking-normal">
                    {f}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
