"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { getProjectBySlug } from "@/lib/data/projects";
import { faviconSvgDataUri, projectGradient } from "@/lib/brand";
import { projects } from "@/lib/data/projects";

function currentSlug(pathname: string): string | undefined {
  if (pathname.startsWith("/project/")) return pathname.split("/")[2];
  return undefined;
}

export function DynamicFavicon() {
  const pathname = usePathname();

  useEffect(() => {
    const slug = currentSlug(pathname) ?? projects[0].slug;
    const project = getProjectBySlug(slug);
    const g = projectGradient(slug);

    let link = document.querySelector<HTMLLinkElement>('link[rel="icon"]');
    if (!link) {
      link = document.createElement("link");
      link.rel = "icon";
      document.head.appendChild(link);
    }
    link.href = faviconSvgDataUri(project?.symbol ?? "CIF", g.from, g.to);
    link.type = "image/svg+xml";

    let theme = document.querySelector<HTMLMetaElement>('meta[name="theme-color"]');
    if (!theme) {
      theme = document.createElement("meta");
      theme.name = "theme-color";
      document.head.appendChild(theme);
    }
    theme.content = g.from;
  }, [pathname]);

  return null;
}
