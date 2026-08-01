# API Contract — Backend Integration

Dokumen ini adalah kontrak tunggal antara frontend dan backend/database.
Frontend (mode `NEXT_PUBLIC_DATA_SOURCE=backend`) memanggil REST API ini dan
**otomatis meng-unwrap envelope** `{ data, meta }` — jadi backend WAJIB membungkus
setiap respons dengan envelope agar metadata (source, version, pagination)
tidak hilang.

---

## 1. Koneksi

```bash
# .env.local
NEXT_PUBLIC_DATA_SOURCE=backend
NEXT_PUBLIC_API_BASE_URL=https://api.workspace.example.com/api
# opsional
API_TOKEN=sk-...            # untuk Authorization: Bearer (server-side)
NEXT_PUBLIC_API_BASE_URL=…  # juga dipakai server-side SSR (wajib URL absolut)
```

Setiap request membawa:
- `Authorization: Bearer <token>` (jika token ada)
- `x-request-id: iw-<timestamp>-<seq>` (tracing)
- `Content-Type: application/json` (untuk body)

---

## 2. Envelope Respons (WAJIB)

```json
{
  "data": { ... },                 // payload murni
  "meta": {
    "generatedAt": "2026-08-01T00:00:00.000Z",
    "source": "live" | "degraded" | "stale" | "mock",
    "version": "v1",               // opsional (etag/revalidation)
    "pagination": {                // opsional (hanya endpoint paginated)
      "page": 1, "pageSize": 20, "total": 120, "pages": 6
    }
  }
}
```

Client `client.ts` → `unwrap()` otomatis mengambil `data`. Frontend tidak pernah
melihat envelope — tetapi metadata tetap bisa diakses via `apiGet(...).meta`.

**Error** (status non-2xx):
```json
{ "error": "project not found", "code": "NOT_FOUND" }
```

---

## 3. Endpoint

### Projects
| Method | Path | Query | Returns (`data`) |
|---|---|---|---|
| GET | `/projects` | `q, sort, order` | `ProjectSummary[]` |
| GET | `/projects/{slug}` | — | `ProjectBundle` |

`ProjectBundle`:
```jsonc
{
  "project": Project,
  "knowledge": KnowledgeItem[],
  "entities": Entity[],
  "events": TimelineEvent[],
  "conflicts": Conflict[],
  "relationships": Relationship[]
}
```

### Knowledge
| Method | Path | Query | Returns |
|---|---|---|---|
| GET | `/projects/{slug}/knowledge` | `q, status, category, page, pageSize, sort, order` | `KnowledgeItem[]` (+ `meta.pagination`) |
| GET | `/projects/{slug}/knowledge/{id}` | — | `KnowledgeItem` |
| POST | `/projects/{slug}/knowledge` | — | `KnowledgeItem` (create) |
| PATCH | `/projects/{slug}/knowledge/{id}` | — | `KnowledgeItem` (update) |
| DELETE | `/projects/{slug}/knowledge/{id}` | — | `204` |

### Entities & Relationships
| Method | Path | Query | Returns |
|---|---|---|---|
| GET | `/projects/{slug}/entities` | `q, type, status` | `Entity[]` |
| GET | `/projects/{slug}/entities/{id}` | — | `Entity` |
| GET | `/projects/{slug}/relationships` | `type` | `Relationship[]` |

### Events
| Method | Path | Query | Returns |
|---|---|---|---|
| GET | `/projects/{slug}/events` | `q, type, page, pageSize` | `TimelineEvent[]` (+ pagination) |

### Conflicts
| Method | Path | Query | Returns |
|---|---|---|---|
| GET | `/projects/{slug}/conflicts` | `q, severity, status, category, page, pageSize` | `Conflict[]` (+ pagination) |
| GET | `/projects/{slug}/conflicts/{id}` | — | `Conflict` |

### QA & Behavior
| Method | Path | Returns |
|---|---|---|
| GET | `/projects/{slug}/qa` | `QAReport` |
| GET | `/projects/{slug}/behavior` | `BehaviorProfile` |

### Market (live)
| Method | Path | Returns |
|---|---|---|
| GET | `/market/{slug}` | `{ slug, tvl, tvlChange, price, marketCap, volume24h, priceChange24h, updatedAt, source }` |

`source` di sini = `live | degraded | stale` (status upstream DefiLlama/CoinGecko).
Frontend menampilkan badge Live/Partial/**Data Stale** — tidak pernah crash.

### Search (faceted)
| Method | Path | Query | Returns |
|---|---|---|---|
| GET | `/search` | `q` (mendukung `type:`, `status:`, `severity:`, `confidence:>n`) | `SearchResult[]` |

### Kolaborasi
| Method | Path | Body/Query | Returns |
|---|---|---|---|
| GET | `/notes?scope=&id=` | — | `string` (note) |
| POST | `/notes` | `{ scope, id, text }` | `204` |
| GET | `/views?scope=` | — | `SavedView[]` |
| POST | `/views` | `{ id, name, scope, filters }` | `SavedView[]` |
| DELETE | `/views/{id}?scope=` | — | `SavedView[]` |

### Config & Health
| Method | Path | Returns |
|---|---|---|
| GET | `/config` | `{ dataSource, version, database, projectCount }` |
| GET | `/health` | `{ ok: true }` |

---

## 4. Schema Types (referensi backend/DB)

Semua tipe di `src/lib/types/*` adalah kontrak. Field wajib:

- **Project**: `id, slug, name, symbol, tagline, description, color, accent, status, cifScore, confidence, knowledgeCount, conflictCount, coverage, entityCount, eventCount, lastUpdated, lastActivityHours, tags, qa, behavior`
- **KnowledgeItem**: `id (K-001), projectSlug, name, category, description, confidence (0-100), status (Stable|Emerging|Volatile|Deprecated), updatedAt, author, evidence[{eventId,eventName,date,source,url,weight,note}], relatedKnowledge[], dependencies[]`
- **Entity**: `id, projectSlug, name, type (9 jenis), status, description, founded?, relatedKnowledge[], relatedEvents[], metadata?`
- **Relationship**: `id, source, target, type (13 jenis)`
- **TimelineEvent**: `id (E-001), projectSlug, name, date, type (10 jenis), participants[], description, result, source, url?, affectedKnowledge[], impact`
- **Conflict**: `id (C-001), projectSlug, category, title, description, severity, status, versionA{source,value,date,url,evidence}, versionB{...}, resolution?, affectedKnowledge[], affectedPhase, updatedAt`
- **QAReport**: `total, dimensions[{key,label,score,weight,description}], phases[{name,status,score,owner}]`

---

## 5. Migrasi Mock → Backend (tanpa kehilangan data)

1. Implementasikan endpoint di atas di backend (PostgreSQL/Drizzle atau CMS).
2. Seluruh respons pakai envelope `{ data, meta }` (helper `apiJson` tersedia di `src/lib/api/response.ts`).
3. Set `NEXT_PUBLIC_DATA_SOURCE=backend`.
4. Repository otomatis beralih: `mockAdapter` → HTTP. UI **tidak berubah**.

**Tidak ada data yang hilang** karena:
- Semua respons di-unwrap otomatis; metadata (source/version/pagination) dipertahankan di `meta`.
- Endpoint list mendukung `page/pageSize` → `meta.pagination` → UI bisa virtualize data besar.
- Error 404/5xx dinormalisasi jadi `ApiError` — UI punya fallback (badge Data Stale, empty state, error boundary).
