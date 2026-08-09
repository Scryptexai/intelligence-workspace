import type { Metadata } from "next";
import { BookOpen, Command, GitMerge, LayoutGrid, Radar, Search } from "lucide-react";

export const metadata: Metadata = {
  title: "Panduan Penggunaan",
  description:
    "Panduan penggunaan Intelligence Workspace (CIF): Command Center, Mode Bar, Explorer, knowledge, conflict, timeline, dan QA.",
};

export default function GuidesPage() {
  return (
    <div className="document-prose">
      <h1 className="font-mono text-xl font-extrabold tracking-tight text-foreground">
        Panduan <span className="text-primary">Penggunaan</span>
      </h1>
      <p className="text-[14px] text-muted-foreground">
        Cara cepat memakai platform sebagai analis: navigasi, pencarian, dan
        membaca hasil riset.
      </p>

      <Guide icon={Command} title="Command Center (⌘K)">
        <ul>
          <li>Tekan <kbd>⌘K</kbd> — layar menjadi terminal gelap dengan bar pencarian besar.</li>
          <li>Ketik <code className="font-mono">&gt;</code> untuk <strong>perintah</strong>: buka Activity Ledger, Docs, Compare, Settings, Export.</li>
          <li>Ketik <code className="font-mono">@</code> untuk <strong>mention tim</strong> — daftar anggota workspace (Enter menyalin user id).</li>
          <li>Ketik <code className="font-mono">#</code> atau langsung query facet: <code className="font-mono">type:conflict status:volatile confidence:&gt;85</code>.</li>
        </ul>
      </Guide>

      <Guide icon={LayoutGrid} title="Mode Bar & Navigasi">
        <ul>
          <li>Navigasi utama ada di <strong>atas</strong> (bukan sidebar kiri): tab mode kontekstual — Overview / Knowledge / Graph / Timeline / Conflicts / QA / Copilot saat membuka project.</li>
          <li>Di luar project: Projects / Compare / Activity / Docs / Settings.</li>
          <li>Ganti mode tampilan via ikon <strong>Columns</strong>: Density (padat ala Bloomberg), Comfortable, Canvas (fokus baca, panel otomatis menyembunyi).</li>
        </ul>
      </Guide>

      <Guide icon={Search} title="Explorer & Inspector">
        <ul>
          <li>Buka <strong>Explorer</strong> (ikon panel kiri di Mode Bar): object tree Project &gt; Knowledge untuk multitasking.</li>
          <li>Buka <strong>Inspector</strong> (ikon panel kanan): metadata item yang sedang dibuka (status, confidence, evidence, fingerprint).</li>
        </ul>
      </Guide>

      <Guide icon={BookOpen} title="Membaca Knowledge">
        <ul>
          <li>Setiap knowledge punya <strong>fingerprint</strong> pendek (mis. <code className="font-mono">#kxm2f</code>) — kode kasus yang stabil.</li>
          <li>Panel <strong>Source Provenance</strong> menunjukkan asal data (source, connector, waktu impor).</li>
          <li><strong>Impact Analysis</strong> menunjukkan knowledge/event/conflict lain yang mereferensikan item ini.</li>
          <li><strong>Row History</strong> &amp; garis <em>&quot;last verified&quot;</em> di bawah halaman menampilkan riwayat perubahan dari audit trail.</li>
        </ul>
      </Guide>

      <Guide icon={GitMerge} title="Conflict Center">
        <ul>
          <li>Konflik sumber ditampilkan side-by-side (version A vs B) dengan severity dan status.</li>
          <li>Filter berdasarkan status / severity; conflict unresolved muncul di metrik kesehatan project.</li>
        </ul>
      </Guide>

      <Guide icon={Radar} title="QA Center">
        <ul>
          <li>Enam dimensi kualitas (Research, Consistency, Evidence, Coverage, Conflict, Knowledge) dengan bobot resmi.</li>
          <li>Fase-fase riset 11 langkah dengan status Passed/Not Started.</li>
        </ul>
      </Guide>
    </div>
  );
}

function Guide({
  icon: Icon,
  title,
  children,
}: {
  icon: typeof Command;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mb-6 rounded-lg border border-border bg-card p-4">
      <h2 className="mb-2 flex items-center gap-2 font-mono text-[13px] font-bold uppercase tracking-[0.12em] text-primary">
        <Icon className="h-4 w-4" /> {title}
      </h2>
      <div className="text-[13px] leading-relaxed">{children}</div>
    </section>
  );
}
