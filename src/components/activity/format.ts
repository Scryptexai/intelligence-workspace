/**
 * Helper format untuk UI Activity Ledger (client-safe, pure functions).
 */
import {
  ACTIVITY_ACTION_LABEL,
  ACTIVITY_TABLE_LABELS,
  type ActivityAction,
  type ActivityEntry,
} from "@/lib/types/activity";

/** Waktu relatif Indonesia: "baru saja", "5 mnt lalu", "2 jam lalu", "kemarin", … */
export function formatRelativeTime(iso: string): string {
  if (!iso) return "—";
  const t = new Date(iso).getTime();
  if (!Number.isFinite(t)) return "—";
  const diff = Date.now() - t;
  const abs = Math.abs(diff);
  const min = Math.floor(abs / 60_000);
  if (min < 1) return "baru saja";
  if (min < 60) return `${min} mnt lalu`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr} jam lalu`;
  const day = Math.floor(hr / 24);
  if (day === 1) return "kemarin";
  if (day < 7) return `${day} hari lalu`;
  return new Date(iso).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

/** Tanggal + jam absolut (tooltip / detail). */
export function formatDateTime(iso: string): string {
  if (!iso) return "—";
  const t = new Date(iso);
  if (!Number.isFinite(t.getTime())) return "—";
  return t.toLocaleString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/** Nilai JSON → teks aman untuk ditampilkan (tidak pernah melempar). */
export function formatValue(v: unknown): string {
  if (v === null || v === undefined) return "∅";
  if (typeof v === "string") return v;
  if (typeof v === "number" || typeof v === "boolean") return String(v);
  try {
    return JSON.stringify(v);
  } catch {
    return String(v);
  }
}

/** Label UI per aksi (INSERT → "menambahkan"). */
export function actionLabel(action: ActivityAction): string {
  return ACTIVITY_ACTION_LABEL[action] ?? action;
}

/** Label UI per tabel (knowledge_items → "Knowledge Items"). */
export function tableLabel(tableName: string): string {
  return ACTIVITY_TABLE_LABELS[tableName] ?? tableName;
}

/** Deskripsi satu entri untuk ringkasan (git-log subject line). */
export function entrySummary(e: ActivityEntry): string {
  const who = e.actorLabel === "system" ? "Sistem" : e.actorLabel;
  return `${who} ${actionLabel(e.action)} ${tableLabel(e.tableName).toLowerCase()} ${e.rowId ?? ""}`.trim();
}
