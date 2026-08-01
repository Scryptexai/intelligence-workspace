"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight, Home } from "lucide-react";
import { getProjectBySlug } from "@/lib/data/projects";
import { cn } from "@/lib/utils/helpers";

const SEGMENT_LABELS: Record<string, string> = {
  knowledge: "Knowledge",
  graph: "Entity Graph",
  timeline: "Live Timeline",
  conflicts: "Conflict Center",
  qa: "QA Center",
  copilot: "AI Copilot",
};

interface Crumb {
  label: string;
  href?: string;
  mono?: boolean;
}

export function Breadcrumb() {
  const pathname = usePathname();
  const segs = pathname.split("/").filter(Boolean);

  if (segs.length === 0) return null;

  const crumbs: Crumb[] = [{ label: "Home", href: "/" }];

  if (segs[0] === "project" && segs[1]) {
    const project = getProjectBySlug(segs[1]);
    crumbs.push({
      label: project ? `${project.name} (${project.symbol})` : segs[1],
      href: `/project/${segs[1]}`,
    });
    const rest = segs.slice(2);
    for (let i = 0; i < rest.length; i++) {
      const seg = rest[i];
      const isId = /^(K-|C-|E-|OP-)/i.test(seg);
      const label = isId ? seg.toUpperCase() : SEGMENT_LABELS[seg] ?? seg;
      const href = `/project/${segs[1]}/${rest.slice(0, i + 1).join("/")}`;
      crumbs.push({ label, href: i < rest.length - 1 ? href : undefined, mono: isId });
    }
  } else if (segs[0] === "compare") {
    crumbs.push({ label: "Compare" });
  } else if (segs[0] === "settings") {
    crumbs.push({ label: "Settings" });
  }

  return (
    <nav className="flex h-10 shrink-0 items-center gap-1.5 border-b border-border bg-card px-4 text-[12px]">
      {crumbs.map((c, i) => (
        <div key={i} className="flex items-center gap-1.5">
          {i > 0 && <ChevronRight className="h-3 w-3 text-muted-foreground/60" />}
          {c.href ? (
            <Link
              href={c.href}
              className={cn(
                "rounded px-1.5 py-0.5 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground",
                i === 0 && "flex items-center gap-1"
              )}
            >
              {i === 0 && <Home className="h-3 w-3" />}
              <span className={cn(c.mono && "font-mono font-medium")}>{c.label}</span>
            </Link>
          ) : (
            <span
              className={cn(
                "rounded px-1.5 py-0.5 font-medium text-foreground",
                c.mono && "font-mono"
              )}
            >
              {c.label}
            </span>
          )}
        </div>
      ))}
    </nav>
  );
}
