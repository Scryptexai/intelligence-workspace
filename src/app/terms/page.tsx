import type { Metadata } from "next";
import Link from "next/link";
import { Scale } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "Syarat & Ketentuan",
  description:
    "Syarat dan ketentuan penggunaan Intelligence Workspace (CIF): lisensi, batasan tanggung jawab, dan aturan penggunaan layanan.",
};

const UPDATED = "2026-08-09";

export default function TermsPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
      <PageHeader
        icon={Scale}
        title="Syarat & Ketentuan"
        description={`Terakhir diperbarui: ${UPDATED} · Berlaku untuk ${SITE.url}`}
      />
      <div className="document-prose text-[13.5px] text-foreground/90">
        <Section title="1. Penerimaan Syarat">
          <p>
            Dengan mengakses {SITE.name} (&quot;Layanan&quot;), Anda menyetujui syarat berikut.
            Bila Anda tidak setuju, mohon jangan gunakan Layanan.
          </p>
        </Section>

        <Section title="2. Sifat Layanan & Bukan Nasihat Investasi">
          <p>
            Layanan menyediakan data riset dan alat analisis untuk tujuan informasi,
            edukasi, dan riset. Konten di Layanan <strong>bukan nasihat keuangan,
            investasi, hukum, atau pajak</strong>. Keputusan investasi sepenuhnya
            merupakan tanggung jawab Anda. Nilai aset kripto dapat berfluktuasi dan
            berisiko.
          </p>
        </Section>

        <Section title="3. Akun & Tanggung Jawab Pengguna">
          <ul>
            <li>Anda bertanggung jawab menjaga kerahasiaan kredensial akun Anda.</li>
            <li>Anda hanya boleh menggunakan Layanan untuk tujuan yang sah.</li>
            <li>Dilarang menyalahgunakan, merekayasa balik, atau mengotomasi akses melebihi ketentuan (termasuk melebihi batas API).</li>
          </ul>
        </Section>

        <Section title="4. Kekayaan Intelektual">
          <p>
            Perangkat lunak, desain, dan konten orisinal Layanan dilindungi hak cipta.
            Data dari sumber pihak ketiga tetap milik sumbernya masing-masing dan
            digunakan sesuai lisensi publiknya.
          </p>
        </Section>

        <Section title="5. Batasan Tanggung Jawab">
          <p>
            Layanan disediakan &quot;sebagaimana adanya&quot; (as-is) tanpa jaminan tersurat
            maupun tersirat. Sejauh diizinkan hukum, kami tidak bertanggung jawab atas
            kerugian langsung, tidak langsung, insidental, atau konsekuensial yang timbul
            dari penggunaan Layanan, termasuk keputusan investasi berdasarkan data
            yang ditampilkan.
          </p>
        </Section>

        <Section title="6. Penghentian">
          <p>
            Kami dapat menangguhkan atau menghentikan akses bila terjadi pelanggaran
            syarat, tanpa mengesampingkan hak hukum lainnya.
          </p>
        </Section>

        <Section title="7. Hukum yang Berlaku">
          <p>
            Syarat ini diatur oleh hukum yang berlaku di wilayah operasional kami, tanpa
            memperhatikan pertentangan kaidah hukum. Sengketa diselesaikan melalui
            negosiasi terlebih dahulu.
          </p>
        </Section>

        <Section title="8. Perubahan Syarat">
          <p>
            Kami dapat memperbarui syarat ini dari waktu ke waktu. Versi terbaru selalu
            tersedia di halaman ini dengan tanggal pembaruan.
          </p>
        </Section>

        <Section title="9. Kontak">
          <p>
            Pertanyaan terkait syarat:{" "}
            <a href={`mailto:${SITE.contactEmail}`} className="text-primary hover:underline">
              {SITE.contactEmail}
            </a>
            .
          </p>
        </Section>

        <p className="mt-6 text-[12px] text-muted-foreground">
          Baca juga: <Link href="/privacy" className="text-primary hover:underline">Kebijakan Privasi</Link>{" "}
          · <Link href="/about" className="text-primary hover:underline">Tentang CIF</Link>
        </p>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-6">
      <h2 className="mb-2 font-mono text-[13px] font-bold uppercase tracking-[0.12em] text-primary">
        {title}
      </h2>
      {children}
    </section>
  );
}
