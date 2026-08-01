"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Activity,
  BookOpen,
  GitMerge,
  Network,
  Search,
  SearchX,
  Boxes,
  Filter,
  X,
} from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useUIStore } from "@/lib/store/ui";
import { useSearchQuery } from "@/hooks/useResourceQueries";
import { parseSearchQuery, facetDisplay } from "@/lib/search/parser";
import type { SearchCategory } from "@/lib/data";
import { cn } from "@/lib/utils/helpers";

const CATEGORY_ICON: Record<SearchCategory, typeof BookOpen> = {
  Project: Boxes,
  Knowledge: BookOpen,
  Entity: Network,
  Event: Activity,
  Conflict: GitMerge,
};

const CATEGORY_COLOR: Record<SearchCategory, string> = {
  Project: "text-cyan-400",
  Knowledge: "text-emerald-400",
  Entity: "text-violet-400",
  Event: "text-amber-400",
  Conflict: "text-rose-400",
};

function Highlight({ text, query }: { text: string; query: string }) {
  const q = query.trim().toLowerCase();
  if (!q) return <>{text}</>;
  const idx = text.toLowerCase().indexOf(q);
  if (idx === -1) return <>{text}</>;
  return (
    <>
      {text.slice(0, idx)}
      <mark className="search-hit">{text.slice(idx, idx + q.length)}</mark>
      {text.slice(idx + q.length)}
    </>
  );
}

export function CommandPalette() {
  const open = useUIStore((s) => s.searchOpen);
  const setOpen = useUIStore((s) => s.setSearchOpen);
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const listRef = useRef<HTMLDivElement>(null);

  const parsed = useMemo(() => parseSearchQuery(query), [query]);

  // Data-source agnostic: mock → adapter lokal, backend → GET /api/search
  const { data: queryResults, isFetching } = useSearchQuery(query);
  const results = queryResults ?? [];
  void isFetching;

  useEffect(() => {
    if (!open) {
      setQuery("");
      setActive(0);
    } else {
      setActive(0);
    }
  }, [open]);

  useEffect(() => {
    setActive(0);
  }, [query]);

  const go = (href: string) => {
    setOpen(false);
    router.push(href);
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((a) => Math.min(a + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((a) => Math.max(a - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      const hit = results[active];
      if (hit) go(hit.href);
    }
  };

  useEffect(() => {
    listRef.current
      ?.querySelector(`[data-active="true"]`)
      ?.scrollIntoView({ block: "nearest" });
  }, [active]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="top-[12%] translate-y-0 gap-0 overflow-hidden p-0 backdrop-blur-xl sm:max-w-xl">
        <div className="flex items-center gap-2 border-b border-border px-4">
          <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
          <Input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder='Faceted search — e.g. "type:knowledge confidence:>90 status:stable"'
            className="h-12 border-0 bg-transparent px-0 font-mono text-[12.5px] shadow-none focus-visible:ring-0"
          />
          <kbd className="rounded border border-border px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground">
            esc
          </kbd>
        </div>

        {/* active facets */}
        {parsed.facets.length > 0 && (
          <div className="flex flex-wrap items-center gap-1.5 border-b border-border bg-muted/30 px-3 py-2">
            <Filter className="h-3 w-3 text-primary" />
            {parsed.facets.map((f, i) => (
              <span
                key={i}
                className="inline-flex items-center gap-1 rounded-md border border-primary/40 bg-primary/10 px-2 py-0.5 font-mono text-[10.5px] text-primary"
              >
                {facetDisplay(f)}
                <button
                  onClick={() => {
                    const tokens = query.split(/\s+/);
                    tokens.splice(tokens.indexOf(facetDisplay(f)), 1);
                    setQuery(tokens.join(" "));
                  }}
                  className="text-primary/70 hover:text-primary"
                >
                  <X className="h-2.5 w-2.5" />
                </button>
              </span>
            ))}
            <span className="ml-auto text-[10px] text-muted-foreground">
              {results.length} matches
            </span>
          </div>
        )}

        <div ref={listRef} className="max-h-[360px] overflow-y-auto p-2">
          {query.trim() === "" ? (
            <div className="px-3 py-8 text-center">
              <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-muted text-muted-foreground">
                <Search className="h-5 w-5" />
              </div>
              <p className="text-[13px] text-muted-foreground">
                Type to search across all projects and intelligence layers.
              </p>
              <div className="mt-3 flex flex-wrap justify-center gap-1.5 font-mono text-[10.5px]">
                {["type:conflict", "type:entity", "status:volatile", "severity:critical", "confidence:>85"].map((s) => (
                  <button
                    key={s}
                    onClick={() => setQuery(s)}
                    className="rounded border border-border bg-muted/40 px-2 py-1 text-muted-foreground transition-colors hover:border-primary hover:text-primary"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          ) : results.length === 0 ? (
            <div className="flex flex-col items-center px-3 py-10">
              <SearchX className="mb-2 h-6 w-6 text-muted-foreground" />
              <p className="text-[13px] text-muted-foreground">
                No results for “{query}”
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-0.5">
              {results.map((r, i) => {
                const Icon = CATEGORY_ICON[r.category];
                return (
                  <button
                    key={`${r.category}-${r.href}`}
                    data-active={i === active}
                    onMouseEnter={() => setActive(i)}
                    onClick={() => go(r.href)}
                    className={cn(
                      "flex items-center gap-3 rounded-md px-3 py-2 text-left transition-colors",
                      i === active ? "bg-accent" : "hover:bg-accent/60"
                    )}
                  >
                    <Icon className={cn("h-4 w-4 shrink-0", CATEGORY_COLOR[r.category])} />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[13px] font-medium text-foreground">
                        <Highlight text={r.label} query={parsed.text} />
                      </span>
                      <span className="block truncate text-[11px] text-muted-foreground">
                        {r.sublabel}
                      </span>
                    </span>
                    <span className="shrink-0 rounded border border-border px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                      {r.category}
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <div className="flex items-center gap-3 border-t border-border bg-muted/40 px-4 py-2 text-[10px] text-muted-foreground">
          <span className="flex items-center gap-1">
            <kbd className="rounded border border-border px-1">↑↓</kbd> navigate
          </span>
          <span className="flex items-center gap-1">
            <kbd className="rounded border border-border px-1">↵</kbd> open
          </span>
          <span className="ml-auto font-mono">type: · status: · severity: · confidence:&gt;n</span>
        </div>
      </DialogContent>
    </Dialog>
  );
}
