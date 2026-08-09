import type { ReactNode } from "react";
import Link from "next/link";
import {
  BookOpen,
  Database,
  GitBranch,
  Layers,
  Shield,
  Compass,
} from "lucide-react";

const DOCS_NAV = [
  { href: "/docs", label: "Ringkasan", icon: Compass },
  { href: "/docs/methodology", label: "Metodologi CIF", icon: Layers },
  { href: "/docs/data-sources", label: "Sumber Data", icon: Database },
  { href: "/docs/guides", label: "Panduan Penggunaan", icon: BookOpen },
  { href: "/docs/enterprise", label: "Enterprise & Roadmap", icon: GitBranch },
];

export default function DocsLayout({ children }: { children: ReactNode }) {
  return (
    <div className="mx-auto flex w-full max-w-6xl gap-6 px-4 py-8 sm:px-6">
      {/* TOC — gitbook style */}
      <aside className="hidden w-56 shrink-0 lg:block">
        <div className="sticky top-20 space-y-0.5">
          <div className="mb-2 flex items-center gap-1.5 font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
            <Shield className="h-3 w-3 text-primary" /> Documentation
          </div>
          {DOCS_NAV.map((d) => {
            const Icon = d.icon;
            return (
              <Link
                key={d.href}
                href={d.href}
                className="flex items-center gap-2 rounded-md px-2.5 py-1.5 text-[12.5px] text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
              >
                <Icon className="h-3.5 w-3.5 text-primary/70" />
                {d.label}
              </Link>
            );
          })}
          <div className="pt-3">
            <Link
              href="/about"
              className="flex items-center gap-2 rounded-md px-2.5 py-1.5 text-[12px] text-muted-foreground/70 hover:text-foreground"
            >
              Tentang CIF
            </Link>
            <Link
              href="/privacy"
              className="flex items-center gap-2 rounded-md px-2.5 py-1.5 text-[12px] text-muted-foreground/70 hover:text-foreground"
            >
              Kebijakan Privasi
            </Link>
            <Link
              href="/terms"
              className="flex items-center gap-2 rounded-md px-2.5 py-1.5 text-[12px] text-muted-foreground/70 hover:text-foreground"
            >
              Syarat &amp; Ketentuan
            </Link>
          </div>
        </div>
      </aside>

      {/* konten */}
      <div className="min-w-0 flex-1">
        <div className="mx-auto max-w-3xl">{children}</div>
      </div>
    </div>
  );
}
