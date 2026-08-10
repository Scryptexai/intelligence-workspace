"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookOpen, Boxes, ChevronRight, FileText, GitMerge, Network, ScrollText } from "lucide-react";
import { useProjectsList } from "@/hooks/useProjectQuery";
import { useKnowledgeQuery } from "@/hooks/useResourceQueries";
import { cn } from "@/lib/utils/helpers";
import { fingerprintId } from "@/lib/utils/fingerprint";
import { useActivityQuery } from "@/hooks/useActivityQuery";

/**
 * Explorer — Object Tree (gaya VS Code / Obsidian):
 *   Project > Knowledge (untuk project aktif, diperluas otomatis)
 * Navigasi hierarkis untuk multitasking. Toggle via ModeBar.
 */
export function ExplorerPanel() {
  const pathname = usePathname();
  const { data: projects } = useProjectsList();
  const list = projects ?? [];

  const slug = pathname.startsWith("/project/") ? pathname.split("/")[2] : undefined;
  const activeProject = list.find((p) => p.slug === slug);
  const { data: knowledge } = useKnowledgeQuery(slug);
  const { data: activity } = useActivityQuery({ limit: 4 });

  return (
    <aside className="cif-explorer flex w-64 shrink-0 flex-col border-r border-border bg-card/60">
      <div className="flex h-9 items-center gap-1.5 border-b border-border px-3 text-[10px] font-bold uppercase tracking-[0.16em] text-muted-foreground">
        <Boxes className="h-3 w-3 text-primary" /> Explorer
      </div>
      <div className="flex-1 overflow-y-auto p-2">
        <div className="mb-1 px-1.5 font-mono text-[10px] uppercase tracking-widest text-muted-foreground/70">
          Recent intelligence
        </div>
        <div className="mb-3 border-l border-cif-signal-cyan/30 pl-2">
          {activity?.length ? activity.map((entry) => (
            <Link key={entry.id} href={`/activity?rowId=${encodeURIComponent(entry.rowId ?? "")}`} title={`${entry.tableName} · ${entry.actorLabel}`} className="relative mb-1.5 block rounded px-1 py-0.5 text-[10.5px] text-muted-foreground hover:bg-cif-elev-2 hover:text-foreground">
              <span className="absolute -left-[7px] top-2 h-1.5 w-1.5 rounded-full bg-cif-signal-cyan" />
              <span className="block truncate font-mono text-[9px] text-cif-signal-cyan">{entry.rowId ?? entry.tableName}</span>
              <span className="block truncate">{entry.action.toLowerCase()} oleh {entry.actorLabel}</span>
            </Link>
          )) : <div className="px-1 py-1 text-[10.5px] text-muted-foreground">Belum ada aktivitas tercatat.</div>}
        </div>
        <div className="mb-1 flex items-center gap-1.5 px-1.5 font-mono text-[10px] uppercase tracking-widest text-muted-foreground/70">
          <ScrollText className="h-3 w-3" /> Workspace
        </div>
        <Link
          href="/"
          className={cn(
            "flex items-center gap-1.5 rounded px-1.5 py-1 text-[12px]",
            pathname === "/" ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-accent"
          )}
        >
          <BookOpen className="h-3 w-3" /> Projects
        </Link>

        <div className="mt-2 mb-1 px-1.5 font-mono text-[10px] uppercase tracking-widest text-muted-foreground/70">
          Project Tree
        </div>
        {list.map((p) => {
          const active = p.slug === slug;
          return (
            <div key={p.id} className="mb-0.5">
              <Link
                href={`/project/${p.slug}`}
                className={cn(
                  "flex items-center gap-1.5 rounded px-1.5 py-1 text-[12px]",
                  active ? "bg-primary/10 font-semibold text-primary" : "text-foreground/85 hover:bg-accent"
                )}
              >
                <ChevronRight
                  className={cn("h-3 w-3 shrink-0 text-muted-foreground/60", active && "rotate-90")}
                />
                <span className="h-1.5 w-1.5 shrink-0 rounded-full" style={{ backgroundColor: p.color ?? "#f59e0b" }} />
                <span className="truncate">{p.symbol || p.slug}</span>
                <span className="ml-auto font-mono text-[9.5px] text-muted-foreground/60">{p.cifScore}</span>
              </Link>

              {/* knowledge children untuk project aktif */}
              {active && (
                <div className="ml-[13px] mt-0.5 space-y-0.5 border-l border-border pl-2">
                  {knowledge?.map((k) => {
                    const kActive = pathname.includes(`/knowledge/${k.id}`);
                    return (
                      <Link
                        key={k.id}
                        href={`/project/${p.slug}/knowledge/${k.id}`}
                        className={cn(
                          "flex items-center gap-1.5 rounded px-1.5 py-0.5 text-[11.5px]",
                          kActive ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-accent hover:text-foreground"
                        )}
                        title={k.name}
                      >
                        <FileText className="h-3 w-3 shrink-0 opacity-70" />
                        <span className="truncate">{k.name}</span>
                        <span className="ml-auto shrink-0 font-mono text-[9px] text-muted-foreground/50">
                          {fingerprintId(k.id)}
                        </span>
                      </Link>
                    );
                  })}
                  {active && knowledge && knowledge.length === 0 && (
                    <div className="px-1.5 py-0.5 text-[10.5px] text-muted-foreground/60">
                      (belum ada knowledge)
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}

        <div className="mt-2 mb-1 px-1.5 font-mono text-[10px] uppercase tracking-widest text-muted-foreground/70">
          Mode
        </div>
        {[
          { href: activeProject ? `/project/${activeProject.slug}/graph` : "/compare", label: "Entity Graph", icon: Network },
          { href: activeProject ? `/project/${activeProject.slug}/conflicts` : "/activity", label: "Conflict Center", icon: GitMerge },
          { href: "/docs", label: "Documentation", icon: BookOpen },
        ].map((m) => {
          const Icon = m.icon;
          return (
            <Link
              key={m.label}
              href={m.href}
              className="flex items-center gap-1.5 rounded px-1.5 py-1 text-[12px] text-muted-foreground hover:bg-accent hover:text-foreground"
            >
              <Icon className="h-3 w-3" /> {m.label}
            </Link>
          );
        })}
      </div>
    </aside>
  );
}
