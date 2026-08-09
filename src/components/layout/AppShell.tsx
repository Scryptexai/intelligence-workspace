"use client";

import { usePathname, useRouter } from "next/navigation";
import { useHotkeys } from "react-hotkeys-hook";
import type { ReactNode } from "react";
import { ModeBar } from "./ModeBar";
import { ExplorerPanel } from "./ExplorerPanel";
import { InspectorPanel } from "./InspectorPanel";
import { Breadcrumb } from "./Breadcrumb";
import { CommandPalette } from "./CommandPalette";
import { PageTransition } from "./PageTransition";
import { DynamicFavicon } from "./DynamicFavicon";
import { ProjectTheme } from "./ProjectTheme";
import { SiteFooter } from "./SiteFooter";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useUIStore } from "@/lib/store/ui";
import { projects } from "@/lib/data/projects";
import { cn } from "@/lib/utils/helpers";

function currentSlug(pathname: string): string {
  if (pathname.startsWith("/project/")) {
    const s = pathname.split("/")[2];
    if (s) return s;
  }
  return projects[0].slug;
}

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const setSearchOpen = useUIStore((s) => s.setSearchOpen);
  const density = useUIStore((s) => s.density);
  const viewMode = useUIStore((s) => s.viewMode);
  const explorerOpen = useUIStore((s) => s.explorerOpen);
  const inspectorOpen = useUIStore((s) => s.inspectorOpen);
  const slug = currentSlug(pathname);

  useHotkeys("mod+k", (e) => {
    e.preventDefault();
    setSearchOpen(true);
  });
  useHotkeys("mod+shift+e", (e) => {
    e.preventDefault();
    useUIStore.getState().toggleExplorer();
  });
  useHotkeys("mod+1", () => router.push(`/project/${slug}/knowledge`));
  useHotkeys("mod+2", () => router.push(`/project/${slug}/graph`));
  useHotkeys("mod+3", () => router.push(`/project/${slug}/timeline`));
  useHotkeys("mod+4", () => router.push(`/project/${slug}/conflicts`));
  useHotkeys("mod+5", () => router.push(`/project/${slug}/qa`));

  const isCanvas = viewMode === "canvas";

  return (
    <TooltipProvider delayDuration={300}>
      <div
        className="cif-grid-bg flex h-screen w-full overflow-hidden bg-background text-foreground"
        data-density={density}
        data-canvas={isCanvas}
      >
        <ProjectTheme />
        <DynamicFavicon />
        <div className="flex min-w-0 flex-1 flex-col">
          <ModeBar />
          <div className="flex min-h-0 flex-1">
            {/* Explorer (Object Tree) — toggleable */}
            {explorerOpen && !isCanvas && <ExplorerPanel />}

            {/* main canvas */}
            <main className="cif-main min-h-0 min-w-0 flex-1 overflow-y-auto">
              <Breadcrumb />
              <div className={cn("cif-pad", density === "compact" ? "p-3" : "p-4 lg:p-6")}>
                <PageTransition>{children}</PageTransition>
              </div>
              <SiteFooter />
            </main>

            {/* Inspector — toggleable */}
            {inspectorOpen && !isCanvas && <InspectorPanel />}
          </div>
        </div>
        <CommandPalette />
      </div>
    </TooltipProvider>
  );
}
