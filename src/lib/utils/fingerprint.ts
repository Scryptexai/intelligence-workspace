/**
 * Data Fingerprint — "kode kasus" pendek untuk setiap item (gaya CSI).
 * Hash deterministik dari id lengkap → #kxm2f. Stabil antar render.
 */
export function fingerprintId(id: string): string {
  if (!id) return "—";
  let h = 2166136261;
  for (let i = 0; i < id.length; i++) {
    h ^= id.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return `#${(h >>> 0).toString(36).padStart(6, "0").slice(0, 6)}`;
}
