import type { MetadataRoute } from "next";
import { SITE } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = SITE.url;
  const staticRoutes = [
    "",
    "/compare",
    "/activity",
    "/about",
    "/privacy",
    "/terms",
    "/docs",
    "/docs/methodology",
    "/docs/data-sources",
    "/docs/guides",
    "/docs/enterprise",
    "/settings",
  ];
  return staticRoutes.map((r) => ({
    url: `${base}${r}`,
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: r === "" ? 1 : 0.7,
  }));
}
