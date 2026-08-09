import type { Metadata } from "next";
import { Layers } from "lucide-react";

export const metadata: Metadata = {
  title: "Metodologi CIF",
  description:
    "Metodologi riset CIF: 11 fase analisis, enam dimensi kualitas, dan cara menghitung CIF Score.",
};

const PHASES = [
  ["Phase 1 — Scope", "Definisi cakupan riset: masalah yang dijawab, batas proyek."],
  ["Phase 2 — Entity", "Pemetaan entitas: tim, yayasan, investor, kontributor."],
  ["Phase 3 — Event", "Kronologi peristiwa penting dengan sumber & tanggal."],
  ["Phase 4 — Technology", "Arsitektur, stack, mekanisme konsensus/rollup, keamanan teknis."],
  ["Phase 5 — Financial", "Pendanaan, treasury, model pendapatan, burn rate."],
  ["Phase 6 — Token", "Tokenomics: distribusi, vesting, utilitas, inflasi."],
  ["Phase 7 — Ecosystem", "Integrasi, partner, komunitas, aplikasi di atas protokol."],
  ["Phase 8 — Market", "Adopsi, TVL, volume, posisi naratif, kompetitor."],
  ["Phase 9 — Decision Pattern", "Pola keputusan tim/DAO yang bisa dijadikan playbook."],
  ["Phase 10 — Risk & Conflict", "Risiko sistematis + konflik antar sumber yang belum teratasi."],
  ["Phase 11 — Synthesis", "Sintesis: skor CIF, insight inti, success factor & anti-pattern."],
];

const DIMENSIONS = [
  ["Research", 25, "Kelengkapan fase riset (10/10 fase tuntas)."],
  ["Consistency", 20, "Konsistensi data antar bagian dan sumber."],
  ["Evidence", 15, "Rata-rata bobot bukti (0–100) tiap knowledge."],
  ["Coverage", 15, "Persentase cakupan data yang diharapkan."],
  ["Conflict", 15, "Skor konflik terselesaikan vs belum."],
  ["Knowledge", 10, "Rata-rata confidence knowledge item."],
];

export default function MethodologyPage() {
  return (
    <div className="document-prose">
      <h1 className="font-mono text-xl font-extrabold tracking-tight text-foreground">
        Metodologi <span className="text-primary">CIF</span>
      </h1>
      <p className="text-[14px] text-muted-foreground">
        CIF menstandarkan analisis fundamental protokol menjadi 11 fase, lalu
        menilainya dengan enam dimensi kualitas menjadi satu skor (0–100).
      </p>

      <h2 className="font-mono text-[13px] font-bold uppercase tracking-[0.14em] text-primary">
        11 Fase Analisis
      </h2>
      <div className="space-y-2">
        {PHASES.map(([phase, desc]) => (
          <div key={phase} className="flex gap-3 rounded-lg border border-border bg-card p-3">
            <span className="shrink-0 rounded border border-primary/30 bg-primary/10 px-1.5 py-0.5 font-mono text-[10px] font-bold text-primary">
              {phase.split(" — ")[0].replace("Phase ", "")}
            </span>
            <div>
              <div className="text-[12.5px] font-semibold text-foreground">
                {phase.split(" — ")[1]}
              </div>
              <div className="text-[11.5px] text-muted-foreground">{desc}</div>
            </div>
          </div>
        ))}
      </div>

      <h2 className="mt-8 font-mono text-[13px] font-bold uppercase tracking-[0.14em] text-primary">
        Enam Dimensi Kualitas
      </h2>
      <div className="overflow-hidden rounded-lg border border-border">
        <table className="w-full text-[12px]">
          <thead className="bg-muted/50 text-left font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
            <tr>
              <th className="px-3 py-2">Dimensi</th>
              <th className="px-3 py-2">Bobot</th>
              <th className="px-3 py-2">Deskripsi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {DIMENSIONS.map(([name, weight, desc]) => (
              <tr key={name}>
                <td className="px-3 py-2 font-semibold text-foreground">{name}</td>
                <td className="px-3 py-2 font-mono text-primary">{weight}%</td>
                <td className="px-3 py-2 text-muted-foreground">{desc}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h2 className="mt-8 font-mono text-[13px] font-bold uppercase tracking-[0.14em] text-primary">
        Bagaimana Data Diverifikasi
      </h2>
      <ul>
        <li>Setiap knowledge diikat ke <strong>evidence</strong> berlabel sumber, tanggal, dan bobot 1–5.</li>
        <li>Sumber yang bertentangan dicatat sebagai <strong>conflict</strong> dengan version A/B, severity, dan status.</li>
        <li>Setiap perubahan data masuk <strong>audit trail</strong> append-only (siapa, kapan, old → new).</li>
        <li>Provenance tersimpan per data point: source, source_url, connector, ingested_at.</li>
      </ul>

      <p className="mt-6 text-[12px] text-muted-foreground">
        <Layers className="mr-1 inline h-3 w-3" />
        Lihat juga:{" "}
        <a href="/docs/data-sources" className="text-primary hover:underline">Sumber Data</a> ·{" "}
        <a href="/docs/guides" className="text-primary hover:underline">Panduan Penggunaan</a>
      </p>
    </div>
  );
}
