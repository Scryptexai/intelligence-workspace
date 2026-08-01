"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { getProjectBySlug } from "@/lib/data/projects";
import { projectGradient } from "@/lib/brand";
import { projects } from "@/lib/data/projects";

export function ProjectTheme() {
  const pathname = usePathname();

  useEffect(() => {
    const slug = pathname.startsWith("/project/")
      ? pathname.split("/")[2]
      : projects[0].slug;
    const project = getProjectBySlug(slug);
    const g = projectGradient(slug);
    const root = document.documentElement;
    root.style.setProperty("--project-accent", project?.color ?? g.from);
    root.style.setProperty("--project-accent-2", project?.accent ?? g.to);
    root.setAttribute("data-project", slug);
  }, [pathname]);

  return null;
}
