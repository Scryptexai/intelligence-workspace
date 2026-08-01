"use client";

import { usePathname, useRouter } from "next/navigation";
import { useHotkeys } from "react-hotkeys-hook";
import type { ReactNode } from "react";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";
import { Breadcrumb } from "./Breadcrumb";
import { CommandPalette } from "./CommandPalette";
import { PageTransition } from "./PageTransition";
import { DynamicFavicon } from "./DynamicFavicon";
import { ProjectTheme } from "./ProjectTheme";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useUIStore } from "@/lib/store/ui";
import { projects } from "@/lib/data/projects";

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
  const slug = currentSlug(pathname);

  useHotkeys("mod+k", (e) => {
    e.preventDefault();
    setSearchOpen(true);
  });

  useHotkeys("mod+1", () => router.push(`/project/${slug}/knowledge`));
  useHotkeys("mod+2", () => router.push(`/project/${slug}/graph`));
  useHotkeys("mod+3", () => router.push(`/project/${slug}/timeline`));
  useHotkeys("mod+4", () => router.push(`/project/${slug}/conflicts`));
  useHotkeys("mod+5", () => router.push(`/project/${slug}/qa`));

  return (
    <TooltipProvider delayDuration={300}>
      <div
        className="flex h-screen w-full overflow-hidden bg-background text-foreground"
        data-density={density}
      >
        <ProjectTheme />
        <DynamicFavicon />
        <Sidebar />
        <div className="flex min-w-0 flex-1 flex-col">
          <Header />
          <Breadcrumb />
          <main className="min-h-0 flex-1 overflow-y-auto">
            <PageTransition>{children}</PageTransition>
          </main>
        </div>
        <CommandPalette />
      </div>
    </TooltipProvider>
  );
}
