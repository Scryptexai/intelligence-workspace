# Data Integration — API Client Modular

Frontend tidak lagi menyentuh mock data secara langsung untuk data konten.
Semua akses data melewati **repository layer** (`src/lib/api/`) yang memilih
sumber data lewat satu env toggle.

---

## 1. Arsitektur Layer

```
┌─────────────────────────────────────────────────────────────┐
│  UI (pages, components, hooks)                              │
│  → import { projectRepository, knowledgeRepository, … }     │
├─────────────────────────────────────────────────────────────┤
│  src/lib/api/repositories.ts  (facade pemilih sumber)        │
│                                                             │
│   DATA_SOURCE === "mock"     →  mockAdapter (lib/data)      │
│   DATA_SOURCE === "backend"  →  http client → REST API      │
├─────────────────────────────────────────────────────────────┤
│  src/lib/api/                                                │
│   ├─ config.ts      → env, base URL, auth token             │
│   ├─ client.ts      → fetch wrapper (timeout, error, retry) │
│   ├─ endpoints.ts   → kontrak path API (single source)      │
│   ├─ types.ts       → envelope, ApiError, pagination        │
│   └─ mockAdapter.ts → simulasi backend dari lib/data        │
├─────────────────────────────────────────────────────────────┤
│  REST API (server)  →  src/app/api/**                        │
│  Backend asli nanti →  PostgreSQL + CMS (kontrak sama)      │
└─────────────────────────────────────────────────────────────┘
```

## 2. Sumber Data Mock → Penggantian

| Konsumen | Sumber mock lama | Sekarang |
| --- | --- | --- |
| Home page | `lib/data/projects` | `projectRepository.list()` |
| Project overview / layout | `getProjectBySlug` | `projectRepository.get()` |
| Knowledge list & detail | `getKnowledge*` | `knowledgeRepository.*` |
| Entity graph | `getEntities/getRelationships/getEntity` | `entityRepository.*` |
| Timeline | `getEvents` | `eventRepository.*` |
| Conflict list & detail | `getConflicts*` | `conflictRepository.*` |
| QA / Copilot | `getProjectBySlug/getKnowledge` | `projectRepository + knowledgeRepository` |
| Compare | `getProjects/getKnowledge` | `useProjectsList + useKnowledgeQuery` |
| Global search (⌘K) | `buildSearchIndex` lokal | `searchRepository.query()` / `useSearchQuery` |
| Private notes | localStorage langsung | `noteRepository.*` (mock=localStorage, backend=DB) |
| Saved views | localStorage langsung | `viewRepository.*` |
| Market metrics | `/api/market/[slug]` (sudah API) | `marketRepository.get()` |

Sisa `lib/data` yang masih dipakai secara langsung:
- **Shell components** (Sidebar, Breadcrumb, ProjectTheme, DynamicFavicon): hanya
  metadata registry statis proyek (slug, nama, warna) untuk navigasi/tema —
  bukan data konten riset.
- **Placeholder first-paint** di TanStack Query (`placeholderData`) agar UI
  langsung terisi sebelum fetch selesai.

## 3. Swap ke Backend/Database

Tanpa mengubah satu baris kode UI:

```bash
# .env.local
NEXT_PUBLIC_DATA_SOURCE=backend
NEXT_PUBLIC_API_BASE_URL=https://api.workspace.example.com/api
# NEXT_PUBLIC_API_BASE_URL=http://localhost:3000/api   # kalau backend lokal
```

Backend sungguhan cukup mengimplementasikan kontrak REST di `endpoints.ts`.
Semua response sudah dinormalisasi lewat `apiFetch` (error, timeout, auth bearer).

## 4. Endpoint API (kontrak)

| Method | Path | Keterangan |
| --- | --- | --- |
| GET | `/api/config` | mode data source + health |
| GET | `/api/projects` | daftar proyek |
| GET | `/api/projects/[slug]` | bundle riset lengkap |
| GET | `/api/projects/[slug]/knowledge` | list knowledge |
| GET | `/api/projects/[slug]/knowledge/[id]` | detail knowledge |
| GET | `/api/projects/[slug]/entities[?id=]` | entity (+ detail) |
| GET | `/api/projects/[slug]/relationships` | edge graph |
| GET | `/api/projects/[slug]/events` | timeline events |
| GET | `/api/projects/[slug]/conflicts` | daftar conflict |
| GET | `/api/projects/[slug]/conflicts/[id]` | detail conflict |
| GET | `/api/projects/[slug]/qa` | QA report |
| GET | `/api/projects/[slug]/behavior` | behavior profile |
| GET | `/api/market/[slug]` | TVL/price/volume live (DefiLlama+CoinGecko) |
| GET | `/api/search?q=` | faceted search |
| GET/POST | `/api/notes` | private notes (mock: in-memory; DB nanti) |
| GET/POST | `/api/views`, DELETE `/api/views/[id]` | saved views |

## 5. Auth (persiapan backend)

`client.ts` otomatis menyertakan `Authorization: Bearer <token>` dari
`getAuthToken()` (env `API_TOKEN` di server / `localStorage "iw-auth-token"` di
browser). Endpoint publik bisa `{ auth: false }`.
