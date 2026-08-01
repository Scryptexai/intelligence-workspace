# 🧠 Intelligence Workspace — Crypto Intelligence Framework (CIF)

Platform analisis data kripto berbasis **CIF (Crypto Intelligence Framework)**:
Knowledge yang dapat dilacak hingga ke sumber (ala Git blame), Entity Graph
interaktif ("Live Intelligence Radar"), Conflict Center ala Git merge-conflict,
Live Timeline ala Bloomberg Terminal, QA Center dengan ECharts, dan AI Copilot.

> **Stack:** Next.js 16 (App Router) · React 19 · TypeScript · Tailwind CSS v4 · shadcn/ui-style components · React Flow (@xyflow/react) · Apache ECharts · TanStack Query · Zustand · PostgreSQL/Drizzle (opsional)

---

## ✨ Fitur Utama

| Area | Fitur |
|---|---|
| **Homepage** | Mission Control: global metrics bar, health indicator per proyek, recent activity feed, live price chip (CoinGecko) |
| **Project Overview** | Draggable dashboard (react-grid-layout), sparkline tiap metrik, live market cards (DefiLlama + CoinGecko, auto-refresh 60 detik), ecosystem partners marquee, Export PDF |
| **Knowledge** | Git-blame evidence trace, Notion-style dossier (2 kolom + sticky sidebar + confidence gauge), reading mode "Presentasi", virtualized list |
| **Entity Graph** | Live Intelligence Radar: card nodes, edge berwarna per relasi + animasi aliran, floating toolbar (zoom/lock/auto-layout/search), Focus Mode 2-hop, side panel 3 tab, filter pill tipe |
| **Timeline** | Dual-layer: density histogram + swimlane per tipe, **▶ Replay History** (time-lapse), event type matrix (heatmap), rich tooltip |
| **Conflict Center** | War Room: donut chart per phase, impact score, forensic **side-by-side diff** dengan highlight angka, Source Reliability |
| **QA Center** | Radar chart (gradient + glow), donut weight distribution, score breakdown, phase status |
| **Compare** | Side-by-side metrics, knowledge overlap, radar overlay, behavior patterns |
| **Global** | ⌘K faceted search (`type:conflict severity:critical`), saved views, private notes, keyboard shortcuts (⌘1–5), dark/light theme, density toggle |

---

## 🧰 Prasyarat (Local)

| Requirement | Versi Min | Cek |
|---|---|---|
| **Node.js** | ≥ 20.9 (disarankan 22 LTS) | `node -v` |
| **npm** | ≥ 10 | `npm -v` |
| **PostgreSQL** (opsional) | 14+ | `psql --version` — *hanya dibutuhkan jika memakai mode `backend` atau ingin `/api/health` hijau* |

> Aplikasi berjalan penuh **tanpa database** (mode `mock` default). PostgreSQL
> hanya diperlukan untuk koneksi ke backend/DB sungguhan.

---

## 🚀 Quick Start (Local)

```bash
# 1. Clone repo
git clone <your-repo-url> intelligence-workspace
cd intelligence-workspace

# 2. Install semua dependency
npm install

# 3. Siapkan env (opsional — mock mode jalan tanpa file env)
cp .env.example .env.local

# 4. Jalankan development server
npm run dev
```

Buka **http://localhost:3000** — aplikasi langsung berjalan dengan data riset mock
(Arbitrum & Optimism, 22 knowledge, 27 entity, 30 event, 13 conflict, dll).

---

## 🔐 Environment Variables

Salin `.env.example` → `.env.local`. Semua variabel **opsional** (mock mode default):

| Variable | Default | Fungsi |
|---|---|---|
| `NEXT_PUBLIC_DATA_SOURCE` | `mock` | `mock` = data dari `lib/data` (offline) · `backend` = panggil REST API |
| `NEXT_PUBLIC_API_BASE_URL` | `/api` | Base URL backend (same-origin `/api` atau URL absolut, mis. `https://api.anda.com/api`) |
| `API_TOKEN` | — | Token opsional → dikirim sebagai `Authorization: Bearer` (server-side) |
| `DATABASE_URL` | — | Hanya untuk `/api/health` & mode backend dengan DB (PostgreSQL) |
| `NODE_ENV` | otomatis | `development` / `production` |

Contoh mode backend:

```bash
# .env.local
NEXT_PUBLIC_DATA_SOURCE=backend
NEXT_PUBLIC_API_BASE_URL=https://api.example.com/api
```

> Kontrak endpoint backend lengkap: [docs/API_CONTRACT.md](./docs/API_CONTRACT.md)
> Penjelasan arsitektur data: [docs/DATA_INTEGRATION.md](./docs/DATA_INTEGRATION.md)

---

## 📦 Dependencies (sudah ada di `package.json` — cukup `npm install`)

### Runtime
| Package | Kegunaan |
|---|---|
| `next@16.2.6` · `react@19.2.6` · `react-dom` | Framework & UI |
| `typescript` · `@types/*` | Bahasa & tipe |
| `tailwindcss@4` · `@tailwindcss/postcss` · `postcss` | Styling |
| `class-variance-authority` · `clsx` · `tailwind-merge` | Utilitas className (shadcn) |
| `lucide-react` | Ikon |
| `next-themes` | Dark/light theme |
| `@radix-ui/react-*` (avatar, dialog, dropdown-menu, label, progress, scroll-area, select, separator, slot, tabs, tooltip) | Komponen headless UI (shadcn/ui) |
| `zustand` | State management (UI + graph store) |
| `@tanstack/react-query` | Data fetching (staleTime, refetchInterval 60s) |
| `@tanstack/react-virtual` | Virtualisasi daftar (Knowledge/Conflict) |
| `@xyflow/react` (React Flow v12) | Entity Graph |
| `dagre` · `d3-force` (+ `@types/*`) | Layout graph (hierarchical & force-directed) |
| `echarts` | Radar, donut, heatmap, sparkline (tree-shaken via `echarts/core`) |
| `react-grid-layout` | Drag & drop dashboard |
| `framer-motion` | Page transitions & micro-interaction |
| `react-hotkeys-hook` | Shortcut ⌘K, ⌘1–5 |
| `@react-pdf/renderer` | Export PDF report |
| `drizzle-orm` · `pg` · `drizzle-kit` · `dotenv` | (Opsional) koneksi PostgreSQL |

### Skrip yang tersedia
```bash
npm run dev        # development server (http://localhost:3000)
npm run build      # production build
npm run start      # jalankan hasil build (wajib setelah build)
npm run lint       # ESLint
npm run typecheck  # tsc --noEmit

# Database (perlu DATABASE_URL di .env)
npx drizzle-kit push        # terapkan skema ke PostgreSQL/Supabase
npx drizzle-kit generate    # hasilkan migration SQL (folder drizzle/)
npx tsx src/db/seed.ts      # isi semua data riset dari lib/data ke DB
```

---

## 📁 Struktur Proyek (ringkas)

```
src/
├── app/
│   ├── (dashboard)/          # Homepage, /project/[slug]/*, compare
│   ├── api/                  # 19 API routes (envelope { data, meta })
│   ├── layout.tsx · providers.tsx · globals.css
│   └── not-found.tsx · error.tsx · loading.tsx
├── components/
│   ├── ui/                   # shadcn-style primitives
│   ├── layout/               # Sidebar, Header, Breadcrumb, CommandPalette, AppShell
│   ├── graph/                # EntityGraphV2 + hooks/ + utils/ (Live Intelligence Radar)
│   ├── timeline/ · conflicts/ · knowledge/ · qa/ · market/ · brand/ · copilot/
│   └── export/ · notes/ · tour/ · overview/
├── hooks/                    # useMarketQuery, useProjectQuery, useResourceQueries
├── lib/
│   ├── api/                  # config, client, endpoints, repositories, mockAdapter, types, response
│   ├── data/                 # Mock data riset (projects, knowledge, entities, events, conflicts, qa, behavior)
│   ├── types/                # Kontrak TypeScript (project, knowledge, entity, event, conflict, market, view)
│   ├── store/                # Zustand stores (ui, graph, globalFilters)
│   └── utils/ · search/ · brand.ts · constants.ts · report.ts
├── services/                 # Service layer (project, knowledge, market, entity, event, conflict, qa, search, note)
└── db/                       # (Opsional) Drizzle + PostgreSQL
docs/
├── API_CONTRACT.md           # Kontrak REST backend
└── DATA_INTEGRATION.md       # Arsitektur layer data
```

---

## ▲ Deploy ke Vercel

### Opsi A — Vercel Dashboard (tanpa CLI)

1. Push repo ke GitHub/GitLab/Bitbucket.
2. Buka [vercel.com/new](https://vercel.com/new) → **Import Project** → pilih repo.
3. Vercel auto-deteksi **Next.js**. Pastikan:
   - **Framework Preset:** `Next.js`
   - **Build Command:** `npm run build`
   - **Output Directory:** *(biarkan kosong — default Next.js)*
   - **Node.js Version:** `22.x` (Settings → General → Node.js)
4. **Environment Variables** (Settings → Environment Variables):
   - *(opsional)* `NEXT_PUBLIC_DATA_SOURCE=mock` (default — tanpa DB)
   - *(opsional)* `NEXT_PUBLIC_API_BASE_URL=/api`
   - *(untuk mode backend/DB)* `DATABASE_URL=postgres://…` (Neon/Supabase)
5. Klik **Deploy** → selesai, dapat URL `https://<project>.vercel.app`.

### Opsi B — Vercel CLI

```bash
# 1. install CLI global
npm i -g vercel

# 2. login
vercel login

# 3. deploy (preview)
vercel

# 4. set env vars (opsional)
vercel env add NEXT_PUBLIC_DATA_SOURCE
vercel env add DATABASE_URL

# 5. deploy production
vercel --prod
```

### Catatan Penting untuk Vercel

- **Mock mode tidak butuh database** — app langsung jalan; hanya `/api/health`
  yang memerlukan `DATABASE_URL` (kembalikan 500 jika DB tidak dikonfigurasi).
- **Market data live** (`/api/market/[slug]`) memanggil DefiLlama & CoinGecko dari
  server — otomatis berfungsi; jika upstream mati, UI menampilkan badge **"Data Stale"**.
- **Image remote** sudah dikonfigurasi di `next.config.ts` (simpleicons, proicons,
  wikimedia, pexels, dll) — tidak perlu perubahan.
- **Monorepo/subfolder**: jika repo root bukan folder Next.js, atur **Root Directory**
  di Vercel ke folder proyek.
- Untuk **PostgreSQL di Vercel**: gunakan [Neon](https://neon.tech) atau
  [Supabase](https://supabase.com) → salin connection string ke `DATABASE_URL`,
  lalu `npx drizzle-kit push` dari lokal (lihat skrip DB di bawah).

### 🗄️ Supabase / PostgreSQL (opsional — mode fullstack)

Skema database lengkap sudah disiapkan di `src/db/schema.ts` (13 tabel relasional)
dan migration SQL siap-merge di `drizzle/0000_*.sql`.

```bash
# 1. Buat project di Supabase → dapatkan connection string
#    Settings → Database → Connection string (mode transaction / pooled)

# 2. Set env
#    NEXT_PUBLIC_DATA_SOURCE=backend
#    DATABASE_URL=postgresql://postgres:postgres@db.xxxx.supabase.co:5432/postgres?sslmode=require

# 3. Terapkan skema ke Supabase (buat semua tabel + index)
npx drizzle-kit push

# 4. Isi data awal (semua knowledge, entities, events, conflicts, QA, behavior)
npx tsx src/db/seed.ts

# 5. Jalankan — API otomatis baca dari Supabase (fallback mock jika DB mati)
npm run dev
```

Alternatif manual di Supabase SQL Editor:
1. Salin isi `drizzle/0000_*.sql` → Run (buat tabel)
2. Salin isi `supabase/seed.sql` → Run (data contoh), atau `npx tsx src/db/seed.ts` untuk data lengkap

**Tabel yang dibuat:** `projects`, `knowledge_items`, `evidence_items`, `entities`,
`relationships`, `events`, `conflicts`, `qa_dimensions`, `qa_phases`,
`behavior_profiles`, `notes`, `saved_views`, `users` — lengkap dengan FK & index.

> Tanpa `DATABASE_URL`, aplikasi jalan penuh di mock mode. Set `DATABASE_URL`
> → API server membaca dari database (health jadi `connected`).

---

## 🩺 Troubleshooting

| Masalah | Solusi |
|---|---|
| `DATABASE_URL is required` saat buka `/api/health` | Set `DATABASE_URL`, atau abaikan — endpoint lain tetap jalan di mock mode |
| Halaman Knowledge reload terus-menerus | Pastikan memakai kode terbaru (bug loop `router.replace` sudah diperbaiki) — `git pull` + `npm install` |
| Logo/entity tidak muncul | Koneksi ke CDN (simpleicons, dll) dibutuhkan; jika offline, fallback icon tipe otomatis tampil |
| `npm run build` gagal di Vercel | Cek Node version (22.x) dan pastikan `next.config.ts` ada; bersihkan cache: Settings → Build & Deployment → Clear cache |
| Market card menunjukkan "Data Stale" | API DefiLlama/CoinGecko tidak terjangkau / rate-limit — data fallback deterministik ditampilkan (bukan crash) |
| Shortcut ⌘K tidak jalan | Fokus di dalam input lain; klik kanvas dulu |

---

## 📚 Dokumentasi Lain

- [docs/API_CONTRACT.md](./docs/API_CONTRACT.md) — kontrak REST untuk koneksi backend/DB
- [docs/DATA_INTEGRATION.md](./docs/DATA_INTEGRATION.md) — arsitektur layer data & migrasi mock → backend

---

## 🛡️ Lisensi

Proyek ini bersifat internal/demo. Data riset (Arbitrum, Optimism) adalah mock
untuk keperluan tampilan — bukan nasihat investasi.
