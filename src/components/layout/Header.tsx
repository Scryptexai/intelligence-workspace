"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { useRouter } from "next/navigation";
import {
  ChevronDown,
  Columns3,
  LogOut,
  Moon,
  PanelLeftClose,
  PanelLeftOpen,
  Search,
  Settings,
  Sun,
  User,
  Zap,
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
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useUIStore, type Density } from "@/lib/store/ui";
import { TimeRangePicker } from "./TimeRangePicker";

export function Header() {
  const collapsed = useUIStore((s) => s.sidebarCollapsed);
  const toggleSidebar = useUIStore((s) => s.toggleSidebar);
  const setSearchOpen = useUIStore((s) => s.setSearchOpen);
  const density = useUIStore((s) => s.density);
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const router = useRouter();

  useEffect(() => setMounted(true), []);

  const isDark = mounted && resolvedTheme === "dark";

  return (
    <header className="flex h-14 shrink-0 items-center gap-2 border-b border-border bg-card px-3">
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="text-muted-foreground"
            onClick={toggleSidebar}
            aria-label="Toggle sidebar"
          >
            {collapsed ? (
              <PanelLeftOpen className="h-4 w-4" />
            ) : (
              <PanelLeftClose className="h-4 w-4" />
            )}
          </Button>
        </TooltipTrigger>
        <TooltipContent>{collapsed ? "Expand sidebar" : "Collapse sidebar"}</TooltipContent>
      </Tooltip>

      <div className="flex items-center gap-2 pr-1">
        <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary/15 text-primary">
          <Zap className="h-4 w-4" strokeWidth={2.2} />
        </div>
        <span className="hidden text-[13px] font-bold tracking-wide md:block">
          INTELLIGENCE WORKSPACE
        </span>
      </div>

      <div className="mx-auto w-full max-w-xl px-2">
        <button
          onClick={() => setSearchOpen(true)}
          className="flex h-8 w-full items-center gap-2 rounded-md border border-border bg-muted/50 px-3 text-[13px] text-muted-foreground transition-colors hover:bg-muted"
        >
          <Search className="h-3.5 w-3.5" />
          <span className="flex-1 truncate text-left">
            Search… <span className="text-muted-foreground/60">(try type:knowledge confidence:&gt;90)</span>
          </span>
          <kbd className="hidden items-center gap-0.5 rounded border border-border bg-background px-1.5 py-0.5 font-mono text-[10px] sm:flex">
            ⌘K
          </kbd>
        </button>
      </div>

      <TimeRangePicker />

      <div className="flex items-center gap-1">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="text-muted-foreground"
              aria-label="Toggle density"
              title="Density"
            >
              <Columns3 className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-52">
            <DropdownMenuLabel>Interface density</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => useUIStore.getState().setDensity("comfortable")}
            >
              <span className="flex-1">
                <div className="text-[12.5px] font-medium">Comfortable</div>
                <div className="text-[11px] text-muted-foreground">
                  Default spacing for clarity
                </div>
              </span>
              {density === "comfortable" && <span className="text-primary">✓</span>}
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => useUIStore.getState().setDensity("compact")}
            >
              <span className="flex-1">
                <div className="text-[12.5px] font-medium">Compact</div>
                <div className="text-[11px] text-muted-foreground">
                  Bloomberg-style density
                </div>
              </span>
              {density === "compact" && <span className="text-primary">✓</span>}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="text-muted-foreground"
              onClick={() => setTheme(isDark ? "light" : "dark")}
              aria-label="Toggle theme"
            >
              {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </Button>
          </TooltipTrigger>
          <TooltipContent>{isDark ? "Switch to light" : "Switch to dark"}</TooltipContent>
        </Tooltip>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-9 gap-2 px-1.5">
              <Avatar className="h-7 w-7">
                <AvatarFallback className="bg-primary/15 text-[10px] font-semibold text-primary">
                  AN
                </AvatarFallback>
              </Avatar>
              <span className="hidden text-[12px] font-medium lg:block">Analyst</span>
              <ChevronDown className="hidden h-3.5 w-3.5 text-muted-foreground lg:block" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-52">
            <DropdownMenuLabel>
              <div className="text-[13px] font-semibold">Intelligence Analyst</div>
              <div className="text-[11px] font-normal text-muted-foreground">
                analyst@intel.workspace
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => router.push("/settings")}>
              <User className="h-4 w-4" /> Profile
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => router.push("/settings")}>
              <Settings className="h-4 w-4" /> Preferences
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-destructive focus:text-destructive">
              <LogOut className="h-4 w-4" /> Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
