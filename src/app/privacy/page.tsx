import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader } from "@/components/layout/PageHeader";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "Kebijakan Privasi",
  description:
    "Kebijakan privasi Intelligence Workspace (CIF): data yang dikumpulkan, penggunaan, penyimpanan, cookie, dan hak Anda.",
};

const UPDATED = "2026-08-09";

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
      <PageHeader
        icon={Shield}
        title="Kebijakan Privasi"
        description={`Terakhir diperbarui: ${UPDATED} · Berlaku untuk ${SITE.url}`}
      />
      <div className="document-prose text-[13.5px] text-foreground/90">
        <Section title="1. Pengantar">
          <p>
            {SITE.name} (&quot;kami&quot;) menghormati privasi Anda. Kebijakan ini menjelaskan
            bagaimana kami mengumpulkan, menggunakan, menyimpan, dan melindungi data
            ketika Anda mengakses situs dan layanan kami.
          </p>
        </Section>

        <Section title="2. Data yang Kami Kumpulkan">
          <p>Kami meminimalkan pengumpulan data pribadi. Data yang mungkin dikumpulkan:</p>
          <ul>
            <li><strong>Data akun</strong> — alamat email dan nama bila Anda membuat akun (fitur kolaborasi).</li>
            <li><strong>Data penggunaan</strong> — halaman yang dikunjungi, pencarian, dan interaksi, untuk memperbaiki produk.</li>
            <li><strong>Data teknis</strong> — tipe browser, sistem operasi, alamat IP anonim, waktu akses.</li>
          </ul>
          <p>
            Catatan: data riset yang ditampilkan (knowledge, events, conflicts, skor CIF)
            adalah <strong>data publik dari sumber terbuka</strong> dan bukan data pribadi Anda.
          </p>
        </Section>

        <Section title="3. Cara Kami Menggunakan Data">
          <ul>
            <li>Menyediakan dan memelihara layanan (menampilkan data, menyimpan catatan Anda).</li>
            <li>Meningkatkan pengalaman (analitik agregat, perbaikan pencarian).</li>
            <li>Keamanan: mencegah penyalahgunaan dan melindungi integritas data.</li>
            <li>Komunikasi bila Anda menghubungi kami.</li>
          </ul>
          <p>Kami <strong>tidak menjual</strong> data pribadi kepada pihak ketiga.</p>
        </Section>

        <Section title="4. Cookie & Penyimpanan Lokal">
          <p>
            Kami menggunakan penyimpanan lokal browser (localStorage) untuk preferensi
            tampilan (tema, tata letak, pencarian tersimpan). Cookie pihak ketiga dapat
            dipasang oleh layanan analitik/iklan bila diaktifkan. Anda dapat menghapusnya
            melalui pengaturan browser.
          </p>
        </Section>

        <Section title="5. Penyimpanan & Keamanan">
          <p>
            Data disimpan di infrastruktur cloud (Supabase/PostgreSQL) dengan enkripsi
            in-transit (TLS) dan proteksi akses berbasis peran (RLS). Audit trail
            append-only mencatat perubahan data untuk menjaga integritas. Tidak ada
            sistem yang 100% aman, namun kami menerapkan praktik standar industri.
          </p>
        </Section>

        <Section title="6. Hak Anda">
          <p>
            Anda berhak mengakses, mengoreksi, atau meminta penghapusan data pribadi Anda
            (sesuai peraturan yang berlaku, termasuk GDPR bila Anda berada di EEA).
            Ajukan permintaan melalui email kontak di bawah.
          </p>
        </Section>

        <Section title="7. Tautan Pihak Ketiga">
          <p>
            Situs kami menautkan ke sumber data eksternal (DefiLlama, forum proyek, GitHub,
            dll). Kebijakan privasi sumber-sumber tersebut di luar kendali kami.
          </p>
        </Section>

        <Section title="8. Perubahan Kebijakan">
          <p>
            Perubahan akan diumumkan di halaman ini dengan tanggal pembaruan. Penggunaan
            berkelanjutan dianggap sebagai penerimaan terhadap versi terbaru.
          </p>
        </Section>

        <Section title="9. Kontak">
          <p>
            Pertanyaan terkait privasi:{" "}
            <a href={`mailto:${SITE.contactEmail}`} className="text-primary hover:underline">
              {SITE.contactEmail}
            </a>
            {SITE.address && <> · {SITE.address}</>}.
          </p>
        </Section>

        <p className="mt-6 text-[12px] text-muted-foreground">
          Baca juga: <Link href="/terms" className="text-primary hover:underline">Terms of Service</Link>{" "}
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

import { Shield } from "lucide-react";
