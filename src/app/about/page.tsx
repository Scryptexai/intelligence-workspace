import type { Metadata } from "next";
import Link from "next/link";
import { Fingerprint, GitMerge, Radar, ScrollText, ShieldCheck, Zap } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "Tentang CIF",
  description:
    "Intelligence Workspace (CIF) — platform intelijen kripto enterprise dengan knowledge berbasis bukti, konflik sumber yang dilacak, dan audit trail lengkap.",
};

const PILLARS = [
  {
    icon: Fingerprint,
    title: "Traceable Evidence",
    desc: "Setiap knowledge dikaitkan ke bukti berlabel tanggal & bobot (evidence-weighted) — bukan opini.",
  },
  {
    icon: GitMerge,
    title: "Conflict Forensics",
    desc: "Sumber yang bertentangan ditampilkan side-by-side (old vs new) dengan severity & status yang jelas.",
  },
  {
    icon: Radar,
    title: "11-Phase Methodology",
    desc: "Analisis distandarkan ke fase-fase riset CIF — dari entity, event, teknologi, finansial, token, hingga ekosistem.",
  },
  {
    icon: ScrollText,
    title: "Audit Trail",
    desc: "Setiap perubahan data tercatat otomatis (siapa, kapan, dari nilai apa ke nilai apa) via trigger Postgres.",
  },
];

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
      <PageHeader
        icon={Zap}
        title={`Tentang ${SITE.name}`}
        description="Platform intelijen untuk riset kripto yang court-grade: setiap klaim dapat dilacak ke sumbernya."
      />

      <div className="space-y-8">
        <section className="document-prose text-[14px] text-foreground/90">
          <h2 className="mb-2 font-mono text-[13px] font-bold uppercase tracking-[0.14em] text-primary">
            Apa itu CIF?
          </h2>
          <p>
            <strong>{SITE.name}</strong> ({SITE.shortName} — Crypto Intelligence Framework)
            adalah ruang kerja analisis yang dirancang untuk tim riset, fund, dan
            analis yang membutuhkan data kripto yang <em>bisa dipertanggungjawabkan</em>.
            Bukan sekadar dashboard metrik: setiap knowledge item dikaitkan ke
            bukti yang berlabel sumber, tanggal, dan bobot; sumber yang bertentangan
            dicatat sebagai conflict yang bisa dilacak; dan seluruh perubahan data
            direkam dalam audit trail append-only.
          </p>
          <p>
            Platform lahir dari kebutuhan riset fundamental protokol — treasury,
            governance, tokenomics, ekosistem — dengan standar yang sama seperti
            tim intelijen institusi: <em>traceability</em> di atas kecepatan,
            <em> verification</em> di atas narasi.
          </p>
        </section>

        <section>
          <h2 className="mb-3 font-mono text-[13px] font-bold uppercase tracking-[0.14em] text-primary">
            Empat Pilar
          </h2>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {PILLARS.map((p) => {
              const Icon = p.icon;
              return (
                <div key={p.title} className="cif-glow-amber rounded-lg border border-border bg-card p-4">
                  <div className="mb-2 flex h-8 w-8 items-center justify-center rounded-md bg-primary/12 text-primary">
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="text-[13.5px] font-semibold text-foreground">{p.title}</div>
                  <p className="mt-1 text-[12px] leading-relaxed text-muted-foreground">{p.desc}</p>
                </div>
              );
            })}
          </div>
        </section>

        <section className="document-prose text-[14px] text-foreground/90">
          <h2 className="mb-2 font-mono text-[13px] font-bold uppercase tracking-[0.14em] text-primary">
            Sumber Data
          </h2>
          <p>
            Data dikumpulkan dari sumber terbuka — termasuk agregator seperti
            DefiLlama dan Tally/Snapshot, dokumen publik proyek, forum governance,
            serta rilis GitHub. Setiap data point menyimpan <em>provenance</em>:
            nama sumber, URL, connector, dan waktu impor (lihat{" "}
            <Link href="/docs/data-sources" className="text-primary hover:underline">
              Documentation → Sumber Data
            </Link>
            ).
          </p>
        </section>

        <section className="document-prose text-[14px] text-foreground/90">
          <h2 className="mb-2 font-mono text-[13px] font-bold uppercase tracking-[0.14em] text-primary">
            Disclaimer
          </h2>
          <p>
            Konten di platform ini bersifat riset dan edukatif, <strong>bukan nasihat
            investasi</strong>. Lihat{" "}
            <Link href="/terms" className="text-primary hover:underline">Terms of Service</Link>{" "}
            dan{" "}
            <Link href="/privacy" className="text-primary hover:underline">Privacy Policy</Link>.
          </p>
        </section>

        <section className="flex items-center gap-3 rounded-lg border border-border bg-card p-4">
          <ShieldCheck className="h-5 w-5 shrink-0 text-success" />
          <div className="text-[12px] leading-relaxed text-muted-foreground">
            Pertanyaan, saran, atau laporan data:{" "}
            <a href={`mailto:${SITE.contactEmail}`} className="text-primary hover:underline">
              {SITE.contactEmail}
            </a>
          </div>
        </section>
      </div>
    </div>
  );
}
