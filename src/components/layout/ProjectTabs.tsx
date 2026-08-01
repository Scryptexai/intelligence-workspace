"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Activity,
  BookOpen,
  Bot,
  GitMerge,
  LayoutDashboard,
  Network,
  Radar,
} from "lucide-react";
import { cn } from "@/lib/utils/helpers";

const TABS = [
  { href: "", label: "Overview", icon: LayoutDashboard },
  { href: "/knowledge", label: "Knowledge", icon: BookOpen },
  { href: "/graph", label: "Entity Graph", icon: Network },
  { href: "/timeline", label: "Timeline", icon: Activity },
  { href: "/conflicts", label: "Conflicts", icon: GitMerge },
  { href: "/qa", label: "QA", icon: Radar },
  { href: "/copilot", label: "Copilot", icon: Bot },
];

export function ProjectTabs({ slug }: { slug: string }) {
  const pathname = usePathname();

  return (
    <div id="project-tabs" className="flex h-11 shrink-0 items-end gap-1 overflow-x-auto border-b border-border bg-card px-3">
      {TABS.map((tab) => {
        const href = `/project/${slug}${tab.href}`;
        const active =
          tab.href === ""
            ? pathname === `/project/${slug}`
            : pathname.startsWith(`/project/${slug}${tab.href}`);
        const Icon = tab.icon;
        return (
          <Link
            key={tab.href}
            href={href}
            className={cn(
              "relative flex h-full shrink-0 items-center gap-1.5 px-3 text-[12.5px] font-medium transition-colors",
              active
                ? "text-foreground"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <Icon className="h-3.5 w-3.5" />
            {tab.label}
            {active && (
              <span className="project-accent-bg absolute inset-x-2 bottom-0 h-0.5 rounded-full" />
            )}
          </Link>
        );
      })}
    </div>
  );
}
