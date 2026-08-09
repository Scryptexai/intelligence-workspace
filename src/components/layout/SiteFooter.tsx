import Link from "next/link";
import { SITE, LEGAL_LINKS } from "@/lib/site";

/**
 * Footer situs — tautan trust & dokumentasi (penting untuk approval
 * Google Search Console: kebijakan privasi/terms harus mudah ditemukan).
 */
export function SiteFooter() {
  return (
    <footer className="cif-footer mt-10 px-4 py-5 sm:px-6">
      <div className="mx-auto flex max-w-5xl flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div className="flex items-center gap-2">
          <span className="flex h-5 w-5 items-center justify-center rounded bg-primary/15 font-mono text-[8px] font-extrabold text-primary">
            CIF
          </span>
          <span className="font-mono text-[10.5px] uppercase tracking-[0.16em] text-muted-foreground">
            {SITE.shortName} · {SITE.foundedYear}
          </span>
        </div>
        <nav className="flex flex-wrap items-center gap-x-4 gap-y-1">
          {LEGAL_LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="text-[11px] text-muted-foreground transition-colors hover:text-primary"
            >
              {l.label}
            </Link>
          ))}
          <a
            href={`mailto:${SITE.contactEmail}`}
            className="text-[11px] text-muted-foreground transition-colors hover:text-primary"
          >
            Kontak
          </a>
        </nav>
      </div>
      <p className="mx-auto mt-3 max-w-5xl text-[10.5px] leading-relaxed text-muted-foreground/70">
        {SITE.name} adalah platform riset intelijen kripto. Seluruh data berasal
        dari sumber terbuka dengan jejak sumber yang dapat dilacak — bukan nasihat
        investasi.
      </p>
    </footer>
  );
}
