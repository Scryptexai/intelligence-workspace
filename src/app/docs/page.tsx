import type { Metadata } from "next";
import Link from "next/link";
import { BookOpen, Database, GitBranch, Layers } from "lucide-react";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "Dokumentasi",
  description:
    "Dokumentasi resmi Intelligence Workspace (CIF): metodologi, sumber data, panduan penggunaan, dan roadmap enterprise.",
};

export default function DocsIndexPage() {
  return (
    <div className="document-prose">
      <h1 className="font-mono text-xl font-extrabold tracking-tight text-foreground">
        Dokumentasi <span className="text-primary">{SITE.shortName}</span>
      </h1>
      <p className="text-[14px] text-muted-foreground">
        Referensi lengkap tentang cara kerja platform: dari metodologi riset
        11-fase, sumber data yang dipakai, panduan penggunaan, hingga arsitektur
        enterprise.
      </p>

      <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
        {[
          {
            href: "/docs/methodology",
            icon: Layers,
            title: "Metodologi CIF",
            desc: "Fase-fase riset, penilaian kualitas 6 dimensi, dan cara skor CIF dihitung.",
          },
          {
            href: "/docs/data-sources",
            icon: Database,
            title: "Sumber Data",
            desc: "Feed OSINT yang dipakai, provenance, dan kebijakan verifikasi.",
          },
          {
            href: "/docs/guides",
            icon: BookOpen,
            title: "Panduan Penggunaan",
            desc: "Command Center, Mode Bar, Explorer, knowledge/conflict/timeline, QA.",
          },
          {
            href: "/docs/enterprise",
            icon: GitBranch,
            title: "Enterprise & Roadmap",
            desc: "Audit trail, RBAC/workspace, lineage, dan peta jalan fase berikutnya.",
          },
        ].map((c) => {
          const Icon = c.icon;
          return (
            <Link
              key={c.href}
              href={c.href}
              className="cif-glow-amber rounded-lg border border-border bg-card p-4"
            >
              <div className="mb-2 flex h-8 w-8 items-center justify-center rounded-md bg-primary/12 text-primary">
                <Icon className="h-4 w-4" />
              </div>
              <div className="text-[13.5px] font-semibold text-foreground">{c.title}</div>
              <p className="mt-1 text-[12px] leading-relaxed text-muted-foreground">{c.desc}</p>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
