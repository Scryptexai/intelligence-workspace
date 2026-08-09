import type { Metadata } from "next";
import { CheckCircle2, GitBranch, ScrollText, ShieldCheck } from "lucide-react";

export const metadata: Metadata = {
  title: "Enterprise & Roadmap",
  description:
    "Fitur enterprise Intelligence Workspace (CIF): audit trail, RBAC & workspace, data lineage, dan roadmap fase berikutnya.",
};

const FEATURES = [
  {
    icon: ScrollText,
    title: "Audit Trail",
    desc: "Setiap INSERT/UPDATE/DELETE pada tabel inti tercatat otomatis (actor, waktu, old→new) via trigger Postgres append-only.",
  },
  {
    icon: ShieldCheck,
    title: "RBAC & Workspace",
    desc: "Multi-workspace dengan role admin/editor/viewer yang ditegakkan di level database (RLS) — bukan sekadar UI.",
  },
  {
    icon: GitBranch,
    title: "Data Lineage & Impact",
    desc: "Provenance per data point + impact analysis: kalau satu knowledge diubah, terlihat apa yang terpengaruh.",
  },
];

export default function EnterprisePage() {
  return (
    <div className="document-prose">
      <h1 className="font-mono text-xl font-extrabold tracking-tight text-foreground">
        Enterprise &amp; <span className="text-primary">Roadmap</span>
      </h1>
      <p className="text-[14px] text-muted-foreground">
        CIF dirancang sebagai fondasi platform intelijen institusional: setiap
        keputusan bisa dipertanggungjawabkan.
      </p>

      <h2 className="font-mono text-[13px] font-bold uppercase tracking-[0.14em] text-primary">
        Fitur Tersedia
      </h2>
      <div className="space-y-2">
        {FEATURES.map((f) => {
          const Icon = f.icon;
          return (
            <div key={f.title} className="flex gap-3 rounded-lg border border-border bg-card p-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-primary/12 text-primary">
                <Icon className="h-4 w-4" />
              </div>
              <div>
                <div className="flex items-center gap-2 text-[13px] font-semibold text-foreground">
                  {f.title}
                  <CheckCircle2 className="h-3.5 w-3.5 text-success" />
                </div>
                <p className="mt-0.5 text-[11.5px] leading-relaxed text-muted-foreground">{f.desc}</p>
              </div>
            </div>
          );
        })}
      </div>

      <h2 className="mt-8 font-mono text-[13px] font-bold uppercase tracking-[0.14em] text-primary">
        Roadmap
      </h2>
      <div className="overflow-hidden rounded-lg border border-border">
        <table className="w-full text-[12px]">
          <thead className="bg-muted/50 text-left font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
            <tr>
              <th className="px-3 py-2">Prioritas</th>
              <th className="px-3 py-2">Modul</th>
              <th className="px-3 py-2">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {[
              ["1", "Audit Trail & Data Lineage", "✅ Implemented"],
              ["2", "RBAC & Workspace", "✅ Implemented"],
              ["3", "Enterprise API (rate limit, webhook, metering)", "📋 Berikutnya"],
              ["4", "Pattern Detection & Forecasting", "📋"],
              ["5", "Compliance Report Generator", "📋"],
              ["6", "SSO & White-label", "📋"],
            ].map(([p, mod, st]) => (
              <tr key={p}>
                <td className="px-3 py-2 font-mono text-primary">{p}</td>
                <td className="px-3 py-2 font-medium text-foreground">{mod}</td>
                <td className="px-3 py-2">
                  <span className={st.startsWith("✅") ? "text-success" : "text-muted-foreground"}>
                    {st}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="mt-4 text-[12px] text-muted-foreground">
        Keputusan arsitektur: data-branching penuh ditunda (v1 memakai
        &quot;scenarios&quot;); OSINT dimulai dari feed gratis (Snapshot/Tally, DefiLlama,
        GitHub releases); modul Certification &amp; Training di luar scope engineering.
      </p>
    </div>
  );
}
