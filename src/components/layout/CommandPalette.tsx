"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Activity,
  AtSign,
  BookOpen,
  FileDown,
  GitCompareArrows,
  GitMerge,
  Hash,
  Network,
  Search,
  SearchX,
  Boxes,
  Settings,
  Terminal,
  X,
  Copy,
} from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useUIStore } from "@/lib/store/ui";
import { useSearchQuery } from "@/hooks/useResourceQueries";
import { useWorkspaceMembersQuery } from "@/hooks/useWorkspaceQuery";
import { parseSearchQuery, facetDisplay } from "@/lib/search/parser";
import { DEFAULT_WORKSPACE_ID, type MemberRole } from "@/lib/types/workspace";
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
  Project: "text-amber-400",
  Knowledge: "text-lime-400",
  Entity: "text-teal-400",
  Event: "text-amber-400",
  Conflict: "text-rose-400",
};

/* ------------------------------------------------------------------ */
/* Komando (prefix ">") — aksi & navigasi cepat                        */
/* ------------------------------------------------------------------ */

interface Command {
  label: string;
  hint: string;
  icon: typeof Terminal;
  href?: string;
}

const COMMANDS: Command[] = [
  { label: "Export project report", hint: "Buka ringkasan project → ekspor PDF/Markdown", icon: FileDown, href: "/" },
  { label: "Activity Ledger", hint: "Audit trail seluruh perubahan data", icon: Activity, href: "/activity" },
  { label: "Documentation", hint: "Metodologi CIF, sumber data, panduan", icon: BookOpen, href: "/docs" },
  { label: "Compare projects", hint: "Bandingkan metrik antar project", icon: GitCompareArrows, href: "/compare" },
  { label: "Settings & Workspace", hint: "Tema, workspace, anggota (RBAC)", icon: Settings, href: "/settings" },
  { label: "Privacy Policy", hint: "Kebijakan privasi & perlindungan data", icon: BookOpen, href: "/privacy" },
];

const ROLE_STYLE: Record<MemberRole, string> = {
  admin: "text-primary",
  editor: "text-warning",
  viewer: "text-muted-foreground",
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

  const trimmed = query.trim();
  const mode: "command" | "mention" | "search" = trimmed.startsWith(">")
    ? "command"
    : trimmed.startsWith("@")
      ? "mention"
      : "search";
  const body = trimmed.startsWith(">") || trimmed.startsWith("@") ? trimmed.slice(1).trim() : trimmed;

  const parsed = useMemo(() => parseSearchQuery(mode === "search" ? query : ""), [query, mode]);
  const { data: queryResults } = useSearchQuery(mode === "search" ? query : "");
  const results = queryResults ?? [];

  // mention: anggota workspace (real-only)
  const { data: members } = useWorkspaceMembersQuery(DEFAULT_WORKSPACE_ID);
  const mentionList = (members ?? []).filter((m) => !body || m.userId.toLowerCase().includes(body.toLowerCase()));

  const commands = COMMANDS.filter((c) => !body || c.label.toLowerCase().includes(body.toLowerCase()));

  const listLen =
    mode === "command" ? commands.length : mode === "mention" ? mentionList.length : results.length;

  // Reset state saat dialog ditutup (pakai onOpenChange, bukan effect).
  const close = () => {
    setOpen(false);
    setQuery("");
    setActive(0);
  };

  const changeQuery = (v: string) => {
    setQuery(v);
    setActive(0);
  };

  const go = (href: string) => {
    setOpen(false);
    router.push(href);
  };

  const copy = (text: string) => {
    if (navigator.clipboard) navigator.clipboard.writeText(text).catch(() => undefined);
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((a) => Math.min(a + 1, Math.max(listLen - 1, 0)));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((a) => Math.max(a - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (mode === "command") {
        const c = commands[active];
        if (c?.href) go(c.href);
      } else if (mode === "mention") {
        const m = mentionList[active];
        if (m) copy(m.userId);
      } else {
        const hit = results[active];
        if (hit) go(hit.href);
      }
    }
  };

  useEffect(() => {
    listRef.current?.querySelector(`[data-active="true"]`)?.scrollIntoView({ block: "nearest" });
  }, [active, mode]);

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        if (!o) close();
        else setOpen(true);
      }}
    >
      <DialogContent className="cif-cmd-overlay inset-0 h-full max-w-none translate-y-0 gap-0 border-0 p-0 sm:max-w-none sm:rounded-none">
        <div className="mx-auto flex h-full w-full max-w-2xl flex-col px-4 pt-[12vh]">
          {/* bar input */}
          <div className="flex items-center gap-2 rounded-t-xl border border-border/60 border-b-0 bg-card px-4">
            {mode === "command" ? (
              <span className="font-mono text-[15px] font-bold text-cif-signal-cyan">&gt;_</span>
            ) : mode === "mention" ? (
              <AtSign className="h-4 w-4 shrink-0 text-primary" />
            ) : (
              <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
            )}
            <Input
              autoFocus
              value={query}
              onChange={(e) => changeQuery(e.target.value)}
              onKeyDown={onKeyDown}
              placeholder='Ketik  ">" perintah · "@" mention tim · "#" filter · atau cari…'
              className="h-14 border-0 bg-transparent px-0 font-mono text-[13px] shadow-none focus-visible:ring-0"
            />
            <kbd className="rounded border border-border px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground">
              esc
            </kbd>
          </div>

          {/* facet chips (mode search) */}
          {mode === "search" && parsed.facets.length > 0 && (
            <div className="flex flex-wrap items-center gap-1.5 border-x border-border bg-muted/30 px-3 py-2">
              <Hash className="h-3 w-3 text-primary" />
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
              <span className="ml-auto text-[10px] text-muted-foreground">{results.length} matches</span>
            </div>
          )}

          {/* daftar hasil */}
          <div
            ref={listRef}
            className="max-h-[52vh] overflow-y-auto rounded-b-xl border border-border bg-card p-2"
          >
            {mode === "command" && (
              <div className="flex flex-col gap-0.5">
                <div className="px-2 pb-1 pt-1 font-mono text-[9.5px] uppercase tracking-[0.2em] text-muted-foreground/70">
                  Aksi
                </div>
                {commands.length === 0 ? (
                  <Empty text={`Tidak ada perintah untuk “${body}”`} />
                ) : (
                  commands.map((c, i) => {
                    const Icon = c.icon;
                    return (
                      <button
                        key={c.label}
                        data-active={i === active}
                        onMouseEnter={() => setActive(i)}
                        onClick={() => c.href && go(c.href)}
                        className={cn(
                          "flex items-center gap-3 rounded-md px-3 py-2 text-left transition-colors",
                          i === active ? "bg-primary/10" : "hover:bg-accent/60"
                        )}
                      >
                        <Icon className="h-4 w-4 shrink-0 text-primary" />
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-[13px] font-medium text-foreground">
                            {c.label}
                          </span>
                          <span className="block truncate text-[11px] text-muted-foreground">{c.hint}</span>
                        </span>
                      </button>
                    );
                  })
                )}
              </div>
            )}

            {mode === "mention" && (
              <div className="flex flex-col gap-0.5">
                <div className="px-2 pb-1 pt-1 font-mono text-[9.5px] uppercase tracking-[0.2em] text-muted-foreground/70">
                  Anggota workspace · Enter = salin user id
                </div>
                {mentionList.length === 0 ? (
                  <Empty text="Tidak ada anggota cocok (data dari workspace_members)" />
                ) : (
                  mentionList.map((m, i) => (
                    <button
                      key={m.userId}
                      data-active={i === active}
                      onMouseEnter={() => setActive(i)}
                      onClick={() => copy(m.userId)}
                      className={cn(
                        "flex items-center gap-3 rounded-md px-3 py-2 text-left transition-colors",
                        i === active ? "bg-primary/10" : "hover:bg-accent/60"
                      )}
                    >
                      <AtSign className="h-4 w-4 shrink-0 text-primary" />
                      <span className="min-w-0 flex-1 truncate font-mono text-[12px] text-foreground">
                        {m.userId}
                      </span>
                      <span className={cn("rounded border border-border px-1.5 py-0.5 text-[9.5px] font-bold uppercase", ROLE_STYLE[m.role])}>
                        {m.role}
                      </span>
                      <Copy className="h-3 w-3 shrink-0 text-muted-foreground/60" />
                    </button>
                  ))
                )}
              </div>
            )}

            {mode === "search" &&
              (query.trim() === "" ? (
                <div className="px-3 py-8 text-center">
                  <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-muted text-muted-foreground">
                    <Search className="h-5 w-5" />
                  </div>
                  <p className="text-[13px] text-muted-foreground">
                    Cari di seluruh project &amp; lapisan intelijen.
                  </p>
                  <div className="mt-3 flex flex-wrap justify-center gap-1.5 font-mono text-[10.5px]">
                    {["> export", "@ team", "type:conflict", "status:volatile", "confidence:>85"].map((s) => (
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
                <Empty text={`Tidak ada hasil untuk “${query}”`} />
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
                          i === active ? "bg-primary/10" : "hover:bg-accent/60"
                        )}
                      >
                        <span className={cn("h-2 w-2 shrink-0 rounded-full bg-current shadow-[0_0_10px_currentColor]", CATEGORY_COLOR[r.category])} />
                        <Icon className={cn("h-4 w-4 shrink-0", CATEGORY_COLOR[r.category])} />
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-[13px] font-medium text-foreground">
                            <Highlight text={r.label} query={parsed.text} />
                          </span>
                          <span className="block truncate text-[11px] text-muted-foreground">{r.sublabel}</span>
                        </span>
                        <span className="shrink-0 rounded border border-border px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                          {r.category}
                        </span>
                      </button>
                    );
                  })}
                </div>
              ))}
          </div>

          {/* footer hint */}
          <div className="mt-3 flex items-center gap-3 rounded-md border border-border/60 bg-card/70 px-4 py-2 font-mono text-[10px] text-muted-foreground">
            <span className="flex items-center gap-1"><Terminal className="h-3 w-3 text-primary" /> &gt; perintah</span>
            <span className="flex items-center gap-1"><AtSign className="h-3 w-3 text-primary" /> @ tim</span>
            <span className="flex items-center gap-1"><Hash className="h-3 w-3 text-primary" /> # filter</span>
            <span className="ml-auto flex items-center gap-2">
              <kbd className="rounded border border-border px-1">↑↓</kbd> pilih
              <kbd className="rounded border border-border px-1">↵</kbd> buka
            </span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function Empty({ text }: { text: string }) {
  return (
    <div className="flex flex-col items-center px-3 py-8">
      <SearchX className="mb-2 h-5 w-5 text-muted-foreground" />
      <p className="text-[12.5px] text-muted-foreground">{text}</p>
    </div>
  );
}
