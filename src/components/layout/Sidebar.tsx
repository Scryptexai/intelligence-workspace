"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Activity,
  BarChart3,
  BookOpen,
  Bot,
  GitCompareArrows,
  GitMerge,
  LayoutGrid,
  Network,
  Radar,
  Settings,
  Users,
  Zap,
} from "lucide-react";
import { projects } from "@/lib/data/projects";
import { useUIStore } from "@/lib/store/ui";
import { cn } from "@/lib/utils/helpers";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

function useCurrentSlug() {
  const pathname = usePathname();
  if (pathname.startsWith("/project/")) {
    return pathname.split("/")[2] ?? projects[0].slug;
  }
  return undefined;
}

export function Sidebar() {
  const collapsed = useUIStore((s) => s.sidebarCollapsed);
  const pathname = usePathname();
  const currentSlug = useCurrentSlug();
  const base = `/project/${currentSlug ?? projects[0].slug}`;

  const workspaceNav = [
    { href: "/", label: "Projects", icon: LayoutGrid, match: (p: string) => p === "/" || p.startsWith("/project") },
    { href: "/compare", label: "Compare", icon: GitCompareArrows, match: (p: string) => p.startsWith("/compare") },
    { href: "/settings", label: "Settings", icon: Settings, match: (p: string) => p.startsWith("/settings") },
  ];

  const projectNav = [
    { href: `${base}/knowledge`, label: "Knowledge", icon: BookOpen },
    { href: `${base}/graph`, label: "Entities / Graph", icon: Network },
    { href: `${base}/timeline`, label: "Events Timeline", icon: Activity },
    { href: `${base}/conflicts`, label: "Conflict Center", icon: GitMerge },
    { href: `${base}/qa`, label: "QA Center", icon: Radar },
    { href: `${base}/copilot`, label: "AI Copilot", icon: Bot },
  ];

  const isActive = (href: string, match?: (p: string) => boolean) => {
    if (match) return match(pathname);
    if (href === pathname) return true;
    return pathname.startsWith(href + "/") || pathname === href;
  };

  return (
    <aside
      className={cn(
        "flex h-full shrink-0 flex-col border-r border-border bg-card transition-[width] duration-200 ease-in-out",
        collapsed ? "w-[60px]" : "w-64"
      )}
    >
      {/* workspace header */}
      <div
        className={cn(
          "flex h-14 items-center gap-2.5 border-b border-border px-3",
          collapsed && "justify-center px-0"
        )}
      >
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-primary/15 text-primary">
          <Zap className="h-4.5 w-4.5" strokeWidth={2.2} />
        </div>
        {!collapsed && (
          <div className="min-w-0 leading-tight">
            <div className="truncate text-[13px] font-bold tracking-wide text-foreground">
              INTELLIGENCE
            </div>
            <div className="truncate text-[10px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
              Workspace · CIF
            </div>
          </div>
        )}
      </div>

      <ScrollArea className="flex-1">
        <nav className="flex flex-col gap-0.5 p-2">
          {!collapsed && (
            <div className="px-2 pb-1 pt-3 text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
              Workspace
            </div>
          )}
          {workspaceNav.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href, item.match);
            return (
              <Tooltip key={item.href} delayDuration={200}>
                <TooltipTrigger asChild>
                  <Link
                    href={item.href}
                    className={cn(
                      "group flex h-9 items-center gap-2.5 rounded-md px-2 text-[13px] font-medium transition-colors",
                      collapsed && "justify-center px-0",
                      active
                        ? "project-accent-bg project-accent-text"
                        : "text-muted-foreground hover:bg-accent hover:text-foreground"
                    )}
                  >
                    <Icon className="h-4 w-4 shrink-0" />
                    {!collapsed && <span className="truncate">{item.label}</span>}
                  </Link>
                </TooltipTrigger>
                {collapsed && (
                  <TooltipContent side="right">{item.label}</TooltipContent>
                )}
              </Tooltip>
            );
          })}

          {!collapsed && (
            <>
              <Separator className="my-2" />
              <div className="px-2 pb-1 pt-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                Analysis
              </div>
            </>
          )}

          {projectNav.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);
            return (
              <Tooltip key={item.href} delayDuration={200}>
                <TooltipTrigger asChild>
                  <Link
                    href={item.href}
                    className={cn(
                      "group flex h-9 items-center gap-2.5 rounded-md px-2 text-[13px] font-medium transition-colors",
                      collapsed && "justify-center px-0",
                      active
                        ? "project-accent-bg project-accent-text"
                        : "text-muted-foreground hover:bg-accent hover:text-foreground"
                    )}
                  >
                    <Icon className="h-4 w-4 shrink-0" />
                    {!collapsed && <span className="truncate">{item.label}</span>}
                  </Link>
                </TooltipTrigger>
                {collapsed && (
                  <TooltipContent side="right">{item.label}</TooltipContent>
                )}
              </Tooltip>
            );
          })}

          {!collapsed && (
            <>
              <Separator className="my-2" />
              <div className="px-2 pb-1 pt-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                Projects
              </div>
            </>
          )}

          {projects.map((p) => {
            const active = pathname.startsWith(`/project/${p.slug}`);
            return (
              <Tooltip key={p.id} delayDuration={200}>
                <TooltipTrigger asChild>
                  <Link
                    href={`/project/${p.slug}`}
                    className={cn(
                      "group flex h-9 items-center gap-2.5 rounded-md px-2 text-[13px] font-medium transition-colors",
                      collapsed && "justify-center px-0",
                      active
                        ? "bg-primary/12 text-primary"
                        : "text-muted-foreground hover:bg-accent hover:text-foreground"
                    )}
                  >
                    <span
                      className="h-2 w-2 shrink-0 rounded-full"
                      style={{ backgroundColor: p.color }}
                    />
                    {!collapsed && (
                      <>
                        <span className="flex-1 truncate font-semibold">{p.symbol}</span>
                        <span className="font-mono text-[11px] text-muted-foreground">
                          {p.cifScore}
                        </span>
                      </>
                    )}
                  </Link>
                </TooltipTrigger>
                {collapsed && (
                  <TooltipContent side="right">
                    {p.name} · CIF {p.cifScore}
                  </TooltipContent>
                )}
              </Tooltip>
            );
          })}
        </nav>
      </ScrollArea>

      <div className="border-t border-border p-2">
        <div
          className={cn(
            "flex items-center gap-2 rounded-md px-2 py-1.5 text-[11px] text-muted-foreground",
            collapsed && "justify-center px-0"
          )}
        >
          <Users className="h-3.5 w-3.5 shrink-0" />
          {!collapsed && (
            <span className="truncate">
              {projects.length} projects · CIF v1.0
            </span>
          )}
        </div>
      </div>
    </aside>
  );
}
