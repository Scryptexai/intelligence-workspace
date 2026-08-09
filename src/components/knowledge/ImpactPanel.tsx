import Link from "next/link";
import { GitMerge, GitCommitHorizontal, ScrollText, SearchX, Share2 } from "lucide-react";
import type { KnowledgeImpact, LineageRef } from "@/lib/types/lineage";
import { cn } from "@/lib/utils/helpers";

/**
 * Impact Analysis — "Kalau knowledge ini diubah, apa yang terpengaruh?"
 * Server component: data dari lineageRepository (langsung DB, tanpa HTTP
 * self-fetch). Semua kategori kosong → empty-state informatif, bukan error.
 */
export function ImpactPanel({
  impact,
}: {
  impact?: KnowledgeImpact;
}) {
  const refs = impact?.referencedBy ?? [];
  const events = impact?.eventsTouching ?? [];
  const conflicts = impact?.conflictsTouching ?? [];
  const deps = impact?.dependencyEvents ?? [];
  const evCount = impact?.evidenceCount ?? 0;

  const total = refs.length + events.length + conflicts.length + deps.length + evCount;
  const empty = total === 0;

  const sections: { title: string; items: LineageRef[]; icon: typeof Share2 }[] = [
    { title: "Knowledge yang mereferensikan", items: refs, icon: Share2 },
    { title: "Event yang menyentuh", items: events, icon: GitCommitHorizontal },
    { title: "Conflict yang terkait", items: conflicts, icon: GitMerge },
    { title: "Event dependensi (raw data)", items: deps, icon: ScrollText },
  ];

  return (
    <section className="mt-7">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="flex items-center gap-1.5 text-[12px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
          <Share2 className="h-3.5 w-3.5" /> Impact Analysis
        </h2>
        <span className="font-mono text-[11px] text-muted-foreground/60">
          {empty ? "tidak ada relasi tercatat" : `${total} relasi terdeteksi`}
        </span>
      </div>

      {empty ? (
        <div className="flex items-center gap-3 rounded-lg border border-dashed border-border bg-card/50 px-4 py-5 text-[12px] text-muted-foreground">
          <SearchX className="h-4.5 w-4.5 shrink-0 text-muted-foreground/60" />
          <p className="leading-relaxed">
            Belum ada relasi terbalik yang tercatat untuk item ini — tidak ada knowledge
            lain, event, atau conflict yang mereferensikannya. Setelah data dihubungkan
            (related_knowledge / affected_knowledge / dependencies), dampak perubahan
            akan muncul di sini.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {/* stat bar */}
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {[
              { label: "Knowledge", value: refs.length },
              { label: "Event", value: events.length + deps.length },
              { label: "Conflict", value: conflicts.length },
              { label: "Evidence", value: evCount },
            ].map((s) => (
              <div
                key={s.label}
                className="rounded-lg border border-border bg-card px-3 py-2"
              >
                <div className="font-mono text-lg font-bold tabular-nums text-foreground">
                  {s.value}
                </div>
                <div className="text-[10px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">
                  {s.label}
                </div>
              </div>
            ))}
          </div>

          {sections.map((sec) => {
            const Icon = sec.icon;
            if (sec.items.length === 0) return null;
            return (
              <div key={sec.title} className="rounded-lg border border-border bg-card p-3">
                <div className="mb-2 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">
                  <Icon className="h-3 w-3" /> {sec.title}
                  <span className="font-mono text-[10px] text-muted-foreground/60">
                    {sec.items.length}
                  </span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {sec.items.map((r) => (
                    <Link
                      key={`${r.kind}-${r.id}`}
                      href={r.href}
                      className={cn(
                        "group inline-flex max-w-full items-center gap-1.5 rounded-md border border-border bg-muted/50 px-2 py-1 text-[11.5px] text-foreground transition-colors hover:border-primary/50 hover:text-primary",
                        r.kind === "conflict" && "border-destructive/25 hover:border-destructive/50"
                      )}
                    >
                      <span className="font-mono text-[10px] text-muted-foreground/80">{r.id}</span>
                      <span className="truncate">{r.name}</span>
                      {r.meta && (
                        <span className="rounded bg-muted px-1 py-px font-mono text-[9.5px] text-muted-foreground">
                          {r.meta}
                        </span>
                      )}
                    </Link>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
