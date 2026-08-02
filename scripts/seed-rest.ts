/**
 * ─────────────────────────────────────────────────────────────────────────────
 * SEED SUPABASE VIA REST — CLI
 * ─────────────────────────────────────────────────────────────────────────────
 * Mengisi semua tabel relasional dari data riset lib/data via PostgREST
 * (tanpa koneksi pg langsung). Membutuhkan env:
 *
 *   NEXT_PUBLIC_SUPABASE_URL=https://<ref>.supabase.co
 *   SUPABASE_SECRET_KEY=sb_secret_...
 *
 *   npx tsx scripts/seed-rest.ts            # seed hanya jika tabel kosong
 *   npx tsx scripts/seed-rest.ts --force    # upsert ulang (idempotent)
 *   npx tsx scripts/seed-rest.ts --dry-run  # tampilkan jumlah baris, tanpa kirim
 *
 * Catatan: ini jalur data aplikasi (lib/data). Untuk data riset dari repo
 * crypto-intelligence-framework, jalankan tools/sync_supabase.py di repo itu
 * (tabel CIF-nya: projects/entities/knowledge/qa/behavior — ID berbeda,
 * tidak bentrok dengan seed ini).
 */
import { loadEnvFile } from "node:process";
try {
  loadEnvFile(".env");
} catch {
  /* tidak wajib */
}

import { seedViaRest, restSeedEnabled, isProjectsEmpty } from "@/db/seedRest";

const args = process.argv.slice(2);
const force = args.includes("--force");
const dryRun = args.includes("--dry-run");

async function main() {
  if (!restSeedEnabled) {
    console.error("✖ NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SECRET_KEY belum diset.");
    process.exit(1);
  }
  if (dryRun) {
    const empty = await isProjectsEmpty();
    console.log(`projects kosong: ${empty}${force ? " (--force)" : ""}`);
    console.log("(dry-run — tidak ada data yang dikirim)");
    return;
  }
  const result = await seedViaRest(force);
  if (result.skipped) {
    console.log(`⏭  ${result.skipped}${force ? " — upsert tetap dijalankan" : ""}`);
  }
  if (result.seeded || force) {
    const total = Object.values(result.counts).reduce((a, b) => a + b, 0);
    console.log(`✔ seed selesai — ${total} baris di ${Object.keys(result.counts).length} tabel`);
    for (const [t, n] of Object.entries(result.counts)) {
      console.log(`   ${t.padEnd(20)} ${n}`);
    }
  }
}

main().catch((e) => {
  console.error("✖ gagal:", e.message);
  process.exit(1);
});
