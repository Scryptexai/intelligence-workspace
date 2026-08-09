"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useSyncExternalStore } from "react";
import { useTheme } from "next-themes";
import {
  Activity,
  BookOpen,
  Bot,
  ChevronDown,
  Columns3,
  GitCompareArrows,
  GitMerge,
  LayoutGrid,
  LayoutPanelLeft,
  Moon,
  Network,
  PanelLeft,
  PanelRight,
  Radar,
  Search,
  Settings,
  Sun,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils/helpers";
import { useUIStore, type ViewMode } from "@/lib/store/ui";
import { useWorkspacesQuery } from "@/hooks/useWorkspaceQuery";
import { DEFAULT_WORKSPACE_NAME } from "@/lib/types/workspace";
import {
  subscribeDataSource,
  getDataSourceSnapshot,
  type DataSourceSnapshot,
} from "@/lib/api/config";

/* ------------------------------------------------------------------ */
/* Konfigurasi mode tabs — kontekstual per project / workspace         */
/* ------------------------------------------------------------------ */

interface ModeTab {
  href: string;
  label: string;
  icon: typeof LayoutGrid;
}

function useCurrentSlug(): string | undefined {
  const pathname = usePathname();
  if (pathname.startsWith("/project/")) return pathname.split("/")[2];
  return undefined;
}

const SSR_SNAPSHOT: DataSourceSnapshot = { mode: "mock", server: null };

export function ModeBar() {
  const pathname = usePathname();
  const router = useRouter();
  const slug = useCurrentSlug();
  const { data: workspaces } = useWorkspacesQuery();
  const { viewMode, setViewMode, explorerOpen, inspectorOpen, toggleExplorer, toggleInspector, setSearchOpen } =
    useUIStore();
  const { resolvedTheme, setTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  const projectMode: ModeTab[] = slug
    ? [
        { href: `/project/${slug}`, label: "Overview", icon: LayoutGrid },
        { href: `/project/${slug}/knowledge`, label: "Knowledge", icon: BookOpen },
        { href: `/project/${slug}/graph`, label: "Graph", icon: Network },
        { href: `/project/${slug}/timeline`, label: "Timeline", icon: Activity },
        { href: `/project/${slug}/conflicts`, label: "Conflicts", icon: GitMerge },
        { href: `/project/${slug}/qa`, label: "QA", icon: Radar },
        { href: `/project/${slug}/copilot`, label: "Copilot", icon: Bot },
      ]
    : [];

  const workspaceMode: ModeTab[] = [
    { href: "/", label: "Projects", icon: LayoutGrid },
    { href: "/compare", label: "Compare", icon: GitCompareArrows },
    { href: "/activity", label: "Activity", icon: Activity },
    { href: "/docs", label: "Docs", icon: BookOpen },
    { href: "/settings", label: "Settings", icon: Settings },
  ];

  const tabs = slug ? projectMode : workspaceMode;
  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  const workspaceName = workspaces?.[0]?.name ?? DEFAULT_WORKSPACE_NAME;

  return (
    <header className="sticky top-0 z-40 flex h-14 shrink-0 flex-col border-b border-border bg-card/90 backdrop-blur-xl">
      <div className="flex h-14 items-center gap-2 px-3">
        {/* brand */}
        <Link href="/" className="flex shrink-0 items-center gap-2 pr-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary/15 font-mono text-[11px] font-extrabold text-primary">
            CIF
          </div>
          <span className="hidden font-mono text-[12px] font-bold tracking-[0.14em] text-foreground lg:block">
            INTELLIGENCE<span className="text-primary">_WS</span>
          </span>
        </Link>

        {/* scanning indicator */}
        <ScanStatus />

        {/* explorer / inspector toggles */}
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-muted-foreground"
          onClick={toggleExplorer}
          aria-label="Toggle explorer"
          title={explorerOpen ? "Tutup Explorer" : "Buka Explorer (Object Tree)"}
        >
          {explorerOpen ? <PanelLeft className="h-4 w-4" /> : <LayoutPanelLeft className="h-4 w-4" />}
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="hidden h-8 w-8 text-muted-foreground md:inline-flex"
          onClick={toggleInspector}
          aria-label="Toggle inspector"
          title={inspectorOpen ? "Tutup Inspector" : "Buka Inspector"}
        >
          {inspectorOpen ? <PanelRight className="h-4 w-4" /> : <PanelLeft className="h-4 w-4" />}
        </Button>

        {/* mode tabs */}
        <nav className="mx-auto flex min-w-0 items-center gap-0.5 overflow-x-auto">
          {tabs.map((t) => {
            const Icon = t.icon;
            const active = isActive(t.href);
            return (
              <Link
                key={t.href}
                href={t.href}
                className={cn(
                  "flex h-8 shrink-0 items-center gap-1.5 rounded-md px-2.5 text-[12px] font-medium transition-colors",
                  active
                    ? "bg-primary/12 text-primary"
                    : "text-muted-foreground hover:bg-accent hover:text-foreground"
                )}
              >
                <Icon className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">{t.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* workspace chip */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="hidden h-8 gap-1.5 px-2 text-[11.5px] font-medium text-muted-foreground xl:flex"
            >
              <span className="h-1.5 w-1.5 rounded-full bg-primary" />
              {workspaceName}
              <ChevronDown className="h-3 w-3" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>Workspace</DropdownMenuLabel>
            {workspaces?.map((w) => (
              <DropdownMenuItem key={w.id} className="text-[12px]">
                {w.name}
              </DropdownMenuItem>
            ))}
            {(!workspaces || workspaces.length === 0) && (
              <DropdownMenuItem disabled className="text-[11.5px] text-muted-foreground">
                Kosong — jalankan migrasi Phase 0/2
              </DropdownMenuItem>
            )}
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => router.push("/settings")} className="text-[12px]">
              Kelola workspace…
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* view mode switcher */}
        <ViewSwitcher viewMode={viewMode} onSelect={setViewMode} />

        {/* command center */}
        <Button
          variant="outline"
          size="sm"
          className="h-8 gap-1.5 border-primary/30 text-[11.5px] text-primary hover:bg-primary/10"
          onClick={() => setSearchOpen(true)}
        >
          <Search className="h-3.5 w-3.5" />
          <span className="hidden lg:inline">Command</span>
          <kbd className="rounded border border-primary/30 bg-background px-1 font-mono text-[9.5px]">
            ⌘K
          </kbd>
        </Button>

        {/* theme */}
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-muted-foreground"
          onClick={() => setTheme(isDark ? "light" : "dark")}
          aria-label="Toggle theme"
        >
          {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </Button>

        {/* user */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 gap-2 px-1.5">
              <Avatar className="h-6 w-6">
                <AvatarFallback className="bg-primary/15 font-mono text-[9px] font-bold text-primary">
                  AN
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-52">
            <DropdownMenuLabel>
              <div className="text-[12.5px] font-semibold">Intelligence Analyst</div>
              <div className="text-[11px] font-normal text-muted-foreground">
                analyst@intel.workspace
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => router.push("/settings")}>
              <Settings className="h-4 w-4" /> Preferences
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => router.push("/docs")}>
              <BookOpen className="h-4 w-4" /> Documentation
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => router.push("/about")} className="text-muted-foreground">
              Tentang CIF
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* thin accent line */}
      <div className="h-px w-full bg-gradient-to-r from-primary/60 via-primary/20 to-transparent" />
    </header>
  );
}

/* ------------------------------------------------------------------ */
/* Scan status — ● LIVE / ◌ SYNC (gaya radar militer)                  */
/* ------------------------------------------------------------------ */

function ScanStatus() {
  const snap = useSyncExternalStore(subscribeDataSource, getDataSourceSnapshot, () => SSR_SNAPSHOT);
  const live = snap.mode === "backend";
  return (
    <span
      className={cn(
        "hidden items-center gap-1.5 rounded border px-2 py-0.5 font-mono text-[9.5px] font-bold uppercase tracking-[0.18em] md:inline-flex",
        live
          ? "border-success/30 bg-success/10 text-success"
          : "border-border bg-muted/40 text-muted-foreground"
      )}
      title={live ? "Data langsung dari database (Supabase)" : "Mode data lokal — set env Supabase untuk live"}
    >
      <span className={cn("h-1.5 w-1.5 rounded-full", live ? "bg-success scan-live" : "bg-muted-foreground/60 scan-sync")} />
      {live ? "LIVE" : "SYNC"}
    </span>
  );
}

/* ------------------------------------------------------------------ */
/* View switcher — Density / Comfortable / Canvas                      */
/* ------------------------------------------------------------------ */

const VIEW_OPTIONS: { value: ViewMode; label: string; desc: string }[] = [
  { value: "density", label: "Density", desc: "Bloomberg-style · banyak data" },
  { value: "comfortable", label: "Comfortable", desc: "Spasi default" },
  { value: "canvas", label: "Canvas", desc: "Focus mode · baca dokumen" },
];

function ViewSwitcher({
  viewMode,
  onSelect,
}: {
  viewMode: ViewMode;
  onSelect: (m: ViewMode) => void;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-muted-foreground"
          aria-label="View mode"
          title="Mode tampilan"
        >
          <Columns3 className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-60">
        <DropdownMenuLabel>View mode</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {VIEW_OPTIONS.map((v) => (
          <DropdownMenuItem key={v.value} onClick={() => onSelect(v.value)}>
            <span className="flex-1">
              <div className="text-[12.5px] font-medium">{v.label}</div>
              <div className="text-[11px] text-muted-foreground">{v.desc}</div>
            </span>
            {viewMode === v.value && <span className="text-primary">✓</span>}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
