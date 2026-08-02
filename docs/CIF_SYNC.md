# Integrasi crypto-intelligence-framework (CIF) — Supabase Sync

Dokumen ini menjelaskan cara menyambungkan **data riset CIF** (repo
`Scryptexai/crypto-intelligence-framework`) ke database Supabase yang sama
dengan Intelligence Workspace. Repo framework **tidak diubah** — pipeline-nya
sudah menargetkan skema ini (lihat `tools/sync_supabase.py`).

## Status skema di Supabase `uqtvjerhgvwoxiejvrli` (verified 2026-08-02)

| Tabel | Status | Pengisi data |
|---|---|---|
| `projects`, `knowledge_items`, `evidence_items`, `entities`, `relationships`, `events`, `conflicts`, `qa_dimensions`, `qa_phases`, `behavior_profiles`, `notes`, `saved_views`, `users` | ✅ Ada, kolom lengkap | `npm run seed:rest` (data aplikasi) |
| `cif_patterns`, `cif_backtests`, `cif_decision_events` | ❌ Belum ada | SQL di bawah, lalu `sync_supabase.py` |

## 1. Buat tabel CIF (sekali saja)

Tempel SQL ini di **Supabase SQL Editor → Run** (kolom mengikuti struktur baris
yang dikirim `tools/sync_supabase.py`):

```sql
create table if not exists public.cif_patterns (
  id text primary key,
  name text,
  confidence text,
  instances jsonb default '[]'::jsonb,
  scope text,
  analogs jsonb default '[]'::jsonb,
  triggers jsonb default '[]'::jsonb,
  source text,
  prediction text,
  validation text,
  watch jsonb default '[]'::jsonb
);
create table if not exists public.cif_backtests (
  id text primary key,
  title text,
  type text,
  category text,
  given jsonb default '[]'::jsonb,
  expect jsonb default '[]'::jsonb,
  fired jsonb default '[]'::jsonb,
  missed jsonb default '[]'::jsonb,
  outcome text,
  source text,
  verdict text,
  recall numeric,
  file text
);
create table if not exists public.cif_decision_events (
  id text primary key,
  project text,
  event_date text,
  title text,
  motivation text,
  constraint_text text,
  pressure text,
  tradeoff text,
  alternatives jsonb default '[]'::jsonb,
  expectation_vs_actual text,
  reactions jsonb default '{}'::jsonb,
  grounding text,
  open_threads text,
  trigger text,
  decision_evidence text,
  decision_text text,
  immediate_result text,
  long_term_impact text,
  supporting_dataset text
);
alter table public.cif_patterns enable row level security;
alter table public.cif_backtests enable row level security;
alter table public.cif_decision_events enable row level security;
create policy "cif read anon" on public.cif_patterns for select using (true);
create policy "cif read anon" on public.cif_backtests for select using (true);
create policy "cif read anon" on public.cif_decision_events for select using (true);
```

## 2. Jalankan sync framework

Dari checkout repo `crypto-intelligence-framework`:

```bash
cd crypto-intelligence-framework
export SUPABASE_URL="https://uqtvjerhgvwoxiejvrli.supabase.co"
export SUPABASE_SERVICE_ROLE_KEY="sb_secret_..."   # service role key
python tools/sync_supabase.py --only projects,entities,knowledge_items,evidence_items,qa_dimensions,qa_phases,behavior_profiles
python tools/sync_supabase.py --only cif_patterns,cif_backtests,cif_decision_events
```

> **Catatan penting**
> - `sync_supabase.py` meng-upsert (merge) via REST — aman dijalankan berulang.
> - ID data CIF berbeda dari seed aplikasi (mis. `arbitrum-K-001` vs `K-001`),
>   sehingga kedua sumber bisa hidup berdampingan.
> - Pipeline CIF belum menghasilkan baris untuk `relationships`, `events`,
>   `conflicts` (extractor belum dibangun di framework) — tabel-tabel itu diisi
>   oleh seed aplikasi (`lib/data`).
> - Jangan commit secret apa pun; gunakan env var / secret manager.

## 2b. Auto-seed via GitHub Actions (opsional)

Template workflow ada di `.github/workflows.example/supabase-seed.yml`.
Aktifkan dengan:

```bash
mkdir -p .github/workflows
cp .github/workflows.example/supabase-seed.yml .github/workflows/
```

Lalu di GitHub → Settings → Secrets and variables → Actions, tambahkan:
`SUPABASE_URL` dan `SUPABASE_SECRET_KEY`. Setiap push ke `master` akan
menjalankan `npm run seed:rest` (idempotent).

## 3. Verifikasi

```bash
curl -s "https://uqtvjerhgvwoxiejvrli.supabase.co/rest/v1/projects?select=id,name" \
  -H "apikey: sb_publishable_..." -H "Authorization: Bearer sb_publishable_..."
```

Atau dari aplikasi: buka `/api/health` (harus `database: supabase-rest`) dan
badge header "Supabase" di UI.
