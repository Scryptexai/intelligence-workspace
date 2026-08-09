/**
 * Runtime shape coercion untuk baris DB / PostgREST.
 *
 * Kolom JSONB/TEXT di Supabase bisa saja berisi bentuk tak terduga (string
 * alih-alih array, null pada kolom angka, objek versi konflik berupa teks)
 * — mis. saat diisi manual dari dashboard atau pipeline eksternal. Tanpa
 * koersi ini, satu sel yang "salah bentuk" bisa melempar TypeError saat
 * render (`x.map is not a function`) dan menjatuhkan seluruh halaman ke
 * error boundary. Semua fungsi di sini TIDAK PERNAH melempar.
 */

/** Array<string> dari bentuk apa pun (array|csv string|null|lainnya). */
export function asStringArray(v: unknown): string[] {
  if (Array.isArray(v)) return v.filter((x): x is string => typeof x === "string");
  if (typeof v === "string" && v.trim()) {
    return v
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
  }
  return [];
}

/** number dari number|string|null — jatuh ke `dflt` bila tidak valid. */
export function asNumber(v: unknown, dflt = 0): number {
  const n = typeof v === "string" ? Number(v) : v;
  return typeof n === "number" && Number.isFinite(n) ? n : dflt;
}

/** string dari bentuk apa pun. */
export function asText(v: unknown, dflt = ""): string {
  return typeof v === "string" ? v : dflt;
}

export interface ConflictVersion {
  source: string;
  value: string;
  date: string;
  url: string;
  evidence: string;
}

/** Objek version A/B konflik — toleran terhadap string/null/objek parsial. */
export function asConflictVersion(v: unknown, label: string): ConflictVersion {
  const empty: ConflictVersion = { source: label, value: "", date: "", url: "#", evidence: "" };
  if (typeof v === "string") return { ...empty, value: v };
  if (!v || typeof v !== "object" || Array.isArray(v)) return empty;
  const o = v as Record<string, unknown>;
  return {
    source: asText(o.source, label),
    value: asText(o.value),
    date: asText(o.date),
    url: asText(o.url, "#"),
    evidence: asText(o.evidence),
  };
}

/** Record<string,string> dari JSONB apa pun. */
export function asStringRecord(v: unknown): Record<string, string> {
  if (!v || typeof v !== "object" || Array.isArray(v)) return {};
  const out: Record<string, string> = {};
  for (const [k, val] of Object.entries(v as Record<string, unknown>)) {
    if (typeof val === "string") out[k] = val;
  }
  return out;
}

/** Objek JSON apa pun → Record<string,unknown>; selain itu null (tidak melempar). */
export function asJsonObject(v: unknown): Record<string, unknown> | null {
  if (v && typeof v === "object" && !Array.isArray(v)) {
    return v as Record<string, unknown>;
  }
  return null;
}

/** Teks nullable — string non-kosong → nilai; null/undefined → null. */
export function asNullableText(v: unknown): string | null {
  return typeof v === "string" && v.length > 0 ? v : null;
}

/** boolean dari bentuk apa pun — jatuh ke `dflt` bila tidak bisa dipastikan. */
export function asBoolean(v: unknown, dflt = false): boolean {
  if (typeof v === "boolean") return v;
  if (v === "true" || v === 1 || v === "1") return true;
  if (v === "false" || v === 0 || v === "0") return false;
  return dflt;
}

/**
 * Bangun DataProvenance dari kolom provenance mentah (nullable).
 * `hasProvenance` true bila minimal satu kolom terisi — dipakai UI untuk
 * memutuskan menampilkan provenance atau fallback "tidak tercatat".
 * Tidak pernah melempar.
 */
export function buildProvenance(
  source: unknown,
  sourceUrl: unknown,
  connector: unknown,
  ingestedAt: unknown
): import("@/lib/types/lineage").DataProvenance {
  const s = asText(source);
  const u = asText(sourceUrl);
  const c = asText(connector);
  const i = asText(ingestedAt);
  return {
    source: s,
    sourceUrl: u,
    connector: c,
    ingestedAt: i,
    hasProvenance: Boolean(s || u || c || i),
  };
}
