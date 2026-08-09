# Enterprise — Phase 0: Multi-Tenant & Audit Trail

> Status: **implemented** di branch `arena/019fe539-intelligence-workspace`.
> Eksekusi manual post-merge: jalankan migrasi di Supabase SQL Editor, lalu redeploy Vercel Production dari master.

Phase 0 adalah fondasi enterprise CIF: **kepercayaan** (audit trail court-grade) dan
**struktur organisasi** (workspace multi-tenant). Ini prasyarat prioritas #1–#2 pada
roadmap enterprise: *Audit Trail & Data Lineage* dan *RBAC & Workspace*.

---

## 1. Ringkasan Deliverable

| Lapisan | Artefak |
|---|---|
| DB (migrasi) | `supabase/migrations/20260809000000_phase0_multitenant_audit.sql` |
| Tipe | `src/lib/types/activity.ts` |
| Mapper & helper | `src/db/coerce.ts` (+`asJsonObject`/`asNullableText`/`asBoolean`), `src/db/supabaseService.ts` (+`mapActivityEntry`, `changedFieldsBetween`, `listActivity`) |
| Data service | `src/db/dataService.ts` (+`dbListActivity`) · `src/db/schema.ts` (+tabel drizzle `audit_log`) |
| Repository | `src/lib/api/server.ts` (+`activityRepository` server) · `src/lib/api/repositories.ts` (+`activityRepository` client) |
| API | `src/app/api/activity/route.ts` (GET, whitelist tabel + limit) |
| Hook | `src/hooks/useActivityQuery.ts` (refetch 60 s, real-only) |
| UI | `/activity` (Activity Ledger gaya git-log) · `src/components/activity/*` · `RowHistory` di knowledge detail |
| Sidebar | Entry "Activity" (ikon `ScrollText`) |
| Dokumen | `docs/ENTERPRISE_PHASE0.md` (ini) |

---

## 2. Arsitektur

```
Supabase (PostgreSQL)
├─ workspaces ────────── workspace default: 'CIF Research'
├─ workspace_members ─── user_id → auth.users · role admin/editor/viewer
├─ ~16 tabel inti ────── + kolom provenance: workspace_id, source,
│                         source_url, connector, ingested_at (nullable)
│      │  INSERT / UPDATE / DELETE
│      ▼
│  TRIGGER cif_audit_row()   (SECURITY DEFINER, SET search_path)
│      │  → actor dari JWT claims (service key → 'system')
│      │  → old_data/new_data jsonb · changed_fields · row_id
│      ▼
├─ audit_log ─────────── append-only (guard trigger; RLS tanpa policy anon)
│
Aplikasi (Next.js)
├─ RSC / API routes ──── activityRepository (server) → dbListActivity
│                          → supabaseRest.listActivity (REST, service key)
│                          → fallback pg (DATABASE_URL) → [] (empty-state)
├─ GET /api/activity ─── whitelist tabel + action + rowId + limit(1..200)
├─ useActivityQuery ──── TanStack Query, refetchInterval 60 s
├─ /activity ─────────── Activity Ledger gaya git-log + diff old→new
└─ RowHistory ────────── riwayat per baris di knowledge detail page
```

### Alur data (tidak ada mock, tidak ada self-fetch HTTP)

- **Server (RSC/route):** `activityRepository.list()` → `db.dbListActivity()` →
  Supabase REST (`audit_log` via service key) → `mapActivityEntry()` (koersi,
  tidak pernah melempar) → `[]` bila DB tidak terhubung.
- **Client:** `useActivityQuery()` → `activityRepository.list()` → `GET /api/activity`
  → envelope `{ data, meta }` (auto-unwrap di `apiFetch`).
- Mode `DATA_SOURCE=mock` → **selalu `[]`** (bukan fake data). Empty-state adalah
  perilaku yang benar, bukan kekurangan.

---

## 3. Migrasi SQL — detail desain

Semua idempoten (`IF NOT EXISTS` / `CREATE OR REPLACE` / `DO $$ … $$` /
`DROP … IF EXISTS`), additive-only, aman dijalankan ulang.

### 3.1 `workspaces` & `workspace_members`

- `workspaces`: `id uuid PK default gen_random_uuid()`, `name`, `slug` (unique),
  `description`, `settings jsonb`, `created_at`, `updated_at`.
- Workspace default **`CIF Research`** dengan **uuid tetap**
  `00000000-0000-0000-0000-000000000001` (insert `ON CONFLICT DO NOTHING`).
- `workspace_members`: PK `(workspace_id, user_id)`, `role` dengan CHECK
  `admin|editor|viewer` (default `viewer`), FK `workspace_id → workspaces`,
  FK `user_id → auth.users` dibuat **ter-guard** (`to_regclass('auth.users')`)
  agar migrasi tetap jalan di luar Supabase.
- RBAC penuh (policies read/write per role + enforcement di tabel inti) → **Phase 2**.

### 3.2 `audit_log` (append-only)

```sql
CREATE TABLE public.audit_log (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  table_name text NOT NULL,
  row_id text,
  action text CHECK (action IN ('INSERT','UPDATE','DELETE')),
  old_data jsonb, new_data jsonb,
  changed_fields jsonb DEFAULT '[]',
  actor_label text, actor_id text,
  workspace_id text,
  created_at timestamptz NOT NULL DEFAULT now()
);
```

- **Append-only ganda:** trigger `cif_audit_log_guard()` menolak UPDATE/DELETE
  (bahkan untuk service key) + RLS **tanpa policy apa pun** → hanya service role
  / security definer yang bisa baca (server-only read).
- Index: `table_name`, `row_id`, `created_at DESC`.

### 3.3 Trigger `cif_audit_row()`

- `SECURITY DEFINER` + `SET search_path = public` → menulis ke `audit_log` tanpa
  terhalang RLS, dan kebal hijack search_path.
- **Actor:** `current_setting('request.jwt.claims')` → `sub` → `actor_id`,
  `email/name/role` → `actor_label`. Tanpa JWT (service key / pipeline /
  internal) → `'system'`. Blok `EXCEPTION WHEN OTHERS` → tidak pernah melempar.
- **row_id:** default kolom `id`; CASE khusus `behavior_profiles`
  (PK `project_slug`). Pada DELETE, `NEW` tidak ter-assign → semua akses lewat
  `to_jsonb(OLD)/to_jsonb(NEW)` yang aman per `TG_OP`.
- **changed_fields:** INSERT/DELETE → semua kolom; UPDATE → union kolom yang
  nilainya berubah (`IS DISTINCT FROM`) + kolom baru.
- **workspace_id:** diambil dari kolom provenance bila tabel memilikinya.
- Dipasang pada 16 tabel: 13 tabel inti (`projects, knowledge_items,
  evidence_items, entities, relationships, events, conflicts, qa_dimensions,
  qa_phases, behavior_profiles, notes, saved_views, users`) + 3 tabel CIF
  (`cif_patterns, cif_backtests, cif_decision_events`) — masing-masing
  ter-guard `to_regclass` sehingga tabel yang belum ada tidak menggagalkan migrasi.

### 3.4 Kolom provenance (additif, nullable)

`workspace_id uuid`, `source text`, `source_url text`, `connector text`,
`ingested_at timestamptz` — ditambahkan ke 16 tabel inti, lalu `workspace_id`
di-backfill ke workspace default. **Tidak ada** kolom yang di-drop/diubah.

### 3.5 RLS

- `audit_log`: enabled, **tanpa policy** → tidak ada akses anon/authenticated.
- `workspaces`: policy `SELECT` untuk `authenticated` anggota (subquery
  `workspace_members`). `workspace_members`: policy `SELECT` untuk keanggotaan
  sendiri. Service role tetap bypass (pipeline CIF tidak terpengaruh).

---

## 4. Aplikasi — desain

### Tipe (`src/lib/types/activity.ts`)

`ActivityEntry` (id, tableName, rowId, action, oldData/newData, changedFields,
actorLabel, actorId, workspaceId, createdAt) + `ActivityFilters` +
`ACTIVITY_TABLE_WHITELIST` (16 tabel) + label UI Indonesia.

### Koersi (`src/db/coerce.ts`)

`asJsonObject` (JSONB → objek | null), `asNullableText`, `asBoolean` — semua
tidak pernah melempar, sesuai aturan defensif terhadap data kotor riil.

### Service & mapper (`src/db/supabaseService.ts`)

- `changedFieldsBetween(old, new)` — diff nama field via `JSON.stringify`
  (toleran urutan key berbeda tetap dianggap sama bila serialisasi identik).
- `mapActivityEntry(row)` — snake_case → `ActivityEntry`; action di luar union
  di-koersi ke `UPDATE`; `changed_fields` kosong dihitung ulang dari old/new.
- `supabaseRest.listActivity(filters, limit)` — query PostgREST
  `audit_log?table_name=eq.…&action=eq.…&row_id=eq.…&order=created_at.desc&limit=…`.

### Data service (`src/db/dataService.ts`)

`dbListActivity(filters, limit)` — prioritas sumber sama dengan data lain:
Supabase REST → pg (`DATABASE_URL`, via tabel drizzle `audit_log`) → `[]`.
Tidak pernah `throw` ke pemanggil (selalu catch → `[]`).

### Route `GET /api/activity`

- `force-dynamic`; validasi ketat: tabel ∈ whitelist (selain itu 400
  `TABLE_NOT_ALLOWED`), action ∈ `{INSERT,UPDATE,DELETE}` (400 `INVALID_ACTION`),
  limit dijepit 1..200 (default 50). `rowId` bebas untuk RowHistory.
- Envelope `{ data, meta }`; `source`: `supabase-rest | live | mock`.

### Hook & UI

- `useActivityQuery` — `refetchInterval: 60_000`, `staleTime: 30_000`, retry 1,
  **tanpa placeholder** (real-only).
- `/activity` — Activity Ledger: toolbar filter (tabel/aksi/jumlah), daftar gaya
  git-log (rail dot + garis vertikal), badge aksi (INSERT `+` hijau, UPDATE `~`
  kuning, DELETE `−` merah), diff **expandable old → new** per entri, empty-state
  informatif, error-state dengan tombol coba lagi, auto-refresh 60 s.
- `RowHistory` — disematkan di knowledge detail page (`/project/[slug]/knowledge/[id]`),
  filter `table=knowledge_items&rowId=<id>`, render 15 perubahan terbaru.
- Sidebar: entry **Activity** (ikon `ScrollText`) di grup Workspace.

---

## 5. Verifikasi yang sudah dijalankan

### 5.1 Migrasi SQL — dieksekusi di PostgreSQL nyata (PGlite/WASM, harness di luar repo)

File migrasi dijalankan statement-by-statement di Postgres asli (WASM) dengan
schema inti + stub `auth.users`/`auth.uid()`, lalu diuji:

| Uji | Hasil |
|---|---|
| Migrasi berjalan tanpa error (21 statement) | ✅ |
| Workspace default `CIF Research` + uuid tetap | ✅ |
| Kolom provenance 5/5 + backfill `workspace_id` | ✅ |
| INSERT → audit (actor `system`, workspace default, semua field) | ✅ |
| INSERT pada tabel **tanpa** `project_slug` (projects/notes) → row_id benar | ✅ |
| UPDATE → `changed_fields` hanya field berubah; actor dari JWT claims (`analyst@cif.id`) | ✅ |
| DELETE + PK non-`id` (`behavior_profiles`) → row_id benar | ✅ |
| Guard append-only menolak UPDATE/DELETE audit_log | ✅ |
| Migrasi idempoten (dijalankan ulang) | ✅ |
| RLS: anon SELECT audit_log → 0 baris; service → bisa baca | ✅ |

**Bug nyata yang ditemukan & diperbaiki saat validasi:** referensi record statis
(`OLD.project_slug`) pada `CASE` di dalam PL/pgSQL dianalisis secara keseluruhan
oleh parser — trigger gagal dengan `record "old" has no field "project_slug"`
saat dijalankan pada tabel tanpa kolom itu (projects/notes/saved_views/users).
Perbaikan: semua akses record lewat `to_jsonb(NEW)/to_jsonb(OLD) ->> 'kolom'`
(yang aman untuk semua tabel, dan memang wajib pada trigger DELETE karena
`NEW` tidak ter-assign). Dikover regresi di uji 4b.

### 5.2 Aplikasi — build + runtime dengan mirror data riil

- `npx tsc --noEmit` → bersih; `npx eslint` pada semua file baru/tersentuh → bersih
  (14 temuan lint yang tersisa semuanya pre-existing di file yang tidak disentuh).
- `npx next build` (dengan env `NEXT_PUBLIC_SUPABASE_URL` → mirror) → sukses.
- **Mirror data riil** (di luar repo, tidak ikut ter-commit): server
  PostgREST-style di `127.0.0.1:8799` yang mereplikasi **production 1:1** untuk
  semua tabel yang disentuh route Phase 0 — 29 proyek (termasuk arbitrum dengan
  `cif_score 81.6`), dataset arbitrum penuh (39 knowledge, 34 evidence, 43 events,
  6 QA dimensions, 7 QA phases, behavior profile, 4 conflicts), tabel kosong
  sesuai produksi (relationships, notes, saved_views, users, **audit_log** —
  tabel ini memang belum ada di production karena migrasi belum dijalankan).
  Data diambil langsung dari REST API production via fetch tool.
- `next start` → curl semua route yang disentuh:

| Route | Hasil |
|---|---|
| `GET /api/activity` | 200, `{data:[], meta.source:"supabase-rest"}` |
| `GET /api/activity?table=knowledge_items&action=UPDATE` | 200 |
| `GET /api/activity?table=knowledge_items&rowId=arbitrum-K-001&limit=20` | 200 |
| `GET /api/activity?table=tidak_ada` | 400 `TABLE_NOT_ALLOWED` |
| `GET /api/activity?action=HACK` | 400 `INVALID_ACTION` |
| `GET /activity` (HTML) | 200, berisi "Activity Ledger" + empty-state |
| `GET /project/arbitrum/knowledge/arbitrum-K-001` (HTML) | 200, berisi Row History + data riil |
| `GET /project/arbitrum/knowledge/arbitrum-K-003` (HTML) | 200, Row History ter-render |
| `GET /` (dashboard), `/compare`, `/settings`, project pages, API routes lain | 200 semua (regresi) |
| `GET /api/config`, `/api/health` | 200 |

- **Mapper ledger diuji dengan data riil**: 4 baris audit (INSERT proyek, UPDATE
  knowledge, UPDATE status, DELETE event — diturunkan dari data riil, dimuat ke
  mirror sebagai harness) → `/api/activity` mengembalikan entri terurut
  descending dengan `changedFields`/`oldData`/`newData`/`workspaceId`/`actorLabel`
  yang benar; filter `UPDATE + knowledge_items + arbitrum-K-001` → tepat 1 entri
  (`changedFields: ["confidence"]`, 90 → 92).

---

## 6. Roadmap Enterprise — Fase 1–6

Prioritas (disetujui): **1) Audit Trail & Lineage → 2) RBAC & Workspace →
3) Enterprise API → 4) Pattern Detection → 5) Compliance Report →
6) SSO & White-label.**

| Fase | Modul | Isi | Status |
|---|---|---|---|
| **0** | Audit Trail & Workspace foundation | audit_log + trigger + provenance + workspaces + Activity Ledger + RowHistory | ✅ **Fase ini** |
| **1** | Data Lineage & Impact Analysis | "data ini dari DefiLlama 2026-08-07 14:23"; siapa/mengubah/kapan/nilai; dampak perubahan ke Knowledge terkait (graf lineage di knowledge detail) | 📋 berikutnya |
| **2** | RBAC & Workspace penuh | RLS per role (admin/editor/viewer) pada tabel inti; management UI workspace + member; project templates (VC Due Diligence, Exchange Listing) | 📋 |
| **3** | Enterprise API | API Gateway REST (+GraphQL), rate limiting & quota (metering/entitlements per tenant), webhook (mis. Slack saat conflict baru) | 📋 |
| **4** | Pattern Detection | Automated pattern detection, anomaly detection, forecasting (tabel `cif_patterns/cif_backtests/cif_decision_events` siap dipakai) | 📋 |
| **5** | Compliance Report | Auto-generate laporan kepatuhan (validasi CIF Score) → PDF/Excel/JSON; audit certifier | 📋 |
| **6** | SSO & White-label | SAML/OIDC (Okta, Azure AD, Google), SCIM provisioning, white-label + custom CSS | 📋 |
| — | (potong scope) | Certification & Training | ⛔ dipotong dari scope engineering (keputusan) |
| — | (ditunda) | Data versioning & branching penuh → v1 cukup "scenarios" | ⏸ ditunda |
| — | (tambahan disetujui) | Metering & entitlements (usage tracking per tenant) → masuk Fase 3 | ✅ disetujui |

### Prinsip yang dijaga di semua fase

1. Tanpa mock/fake data di aplikasi — data kosong → empty-state.
2. Perubahan additive-only; migrasi idempoten.
3. Defensif terhadap data kotor (semua mapper lewat `src/db/coerce.ts`).
4. UI & dokumen Bahasa Indonesia (istilah teknis boleh English).
5. OSINT mulai dari feed gratis (Snapshot/Tally, DefiLlama, GitHub releases), bukan X API.
6. Verifikasi wajib: `tsc --noEmit` + `next build` + curl semua route yang disentuh.
