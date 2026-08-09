import type { Metadata } from "next";
import { Database, ExternalLink } from "lucide-react";

export const metadata: Metadata = {
  title: "Sumber Data",
  description:
    "Sumber data CIF: feed OSINT gratis (DefiLlama, Tally/Snapshot, GitHub releases), provenance, dan kebijakan verifikasi.",
};

const FEEDS = [
  {
    name: "DefiLlama",
    url: "https://defillama.com",
    type: "TVL & metrik on-chain",
    desc: "Total value locked per chain/protokol, riwayat TVL, dan data DeFi agregat.",
  },
  {
    name: "Tally / Snapshot",
    url: "https://tally.xyz",
    type: "Governance on-chain",
    desc: "Proposal governance, hasil vote, dan partisipasi DAO.",
  },
  {
    name: "GitHub Releases",
    url: "https://github.com",
    type: "Rilis teknis",
    desc: "Rilis versi perangkat lunak, changelog, dan aktivitas pengembangan.",
  },
  {
    name: "Dokumen & Forum Publik",
    url: "https://forum.arbitrum.foundation",
    type: "Naratif primer",
    desc: "Whitepaper, dokumentasi resmi, forum governance, dan pengumuman yayasan.",
  },
  {
    name: "Berita & Analis",
    url: "https://www.theblock.co",
    type: "Sekunder",
    desc: "Laporan pihak ketiga (The Block, Messari, dll) — selalu diverifikasi silang.",
  },
];

export default function DataSourcesPage() {
  return (
    <div className="document-prose">
      <h1 className="font-mono text-xl font-extrabold tracking-tight text-foreground">
        Sumber <span className="text-primary">Data</span>
      </h1>
      <p className="text-[14px] text-muted-foreground">
        Kebijakan OSINT CIF: mulai dari feed gratis dan dapat diaudit publik —
        bukan API berbayar/proprietary — agar setiap klaim bisa diperiksa ulang
        oleh siapa pun.
      </p>

      <h2 className="font-mono text-[13px] font-bold uppercase tracking-[0.14em] text-primary">
        Feed Utama
      </h2>
      <div className="space-y-2">
        {FEEDS.map((f) => (
          <div key={f.name} className="flex gap-3 rounded-lg border border-border bg-card p-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-teal-500/12 text-teal-400">
              <Database className="h-4 w-4" />
            </div>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[13px] font-semibold text-foreground">{f.name}</span>
                <span className="rounded border border-teal-500/30 bg-teal-500/10 px-1.5 py-px font-mono text-[9.5px] text-teal-400">
                  {f.type}
                </span>
                <a
                  href={f.url}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-0.5 text-[10.5px] text-muted-foreground hover:text-primary"
                >
                  {f.url.replace("https://", "")} <ExternalLink className="h-2.5 w-2.5" />
                </a>
              </div>
              <p className="mt-0.5 text-[11.5px] leading-relaxed text-muted-foreground">{f.desc}</p>
            </div>
          </div>
        ))}
      </div>

      <h2 className="mt-8 font-mono text-[13px] font-bold uppercase tracking-[0.14em] text-primary">
        Provenance & Verifikasi
      </h2>
      <ul>
        <li>
          Setiap data point menyimpan <strong>provenance</strong>: nama sumber, URL,
          connector, dan waktu impor (<code className="font-mono">ingested_at</code>).
        </li>
        <li>
          Data diimpor oleh pipeline otomatis; kolom provenance diisi oleh connector
          masing-masing feed.
        </li>
        <li>
          Konflik antar sumber ditampilkan apa adanya (bukan "dirapikan") — dengan
          version A/B, tanggal, dan severity — agar analis bisa menilai sendiri.
        </li>
        <li>
          Skor keandalan sumber (reliability heuristic) menandai sumber primer resmi
          (foundation, on-chain, Tally, L2BEAT) lebih tinggi.
        </li>
      </ul>

      <h2 className="mt-8 font-mono text-[13px] font-bold uppercase tracking-[0.14em] text-primary">
        Batasan
      </h2>
      <ul>
        <li>Feed sosial (X/Twitter) belum diintegrasikan — sesuai kebijakan OSINT bertahap.</li>
        <li>Data pihak ketiga dapat terlambat atau tidak lengkap; selalu cek tanggal pada evidence.</li>
        <li>Skor CIF adalah alat bantu riset, bukan jaminan akurasi masa depan.</li>
      </ul>
    </div>
  );
}
