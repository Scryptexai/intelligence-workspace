/**
 * Activity Ledger API — baca audit trail (tabel `audit_log`).
 *
 * Kontrak: GET /api/activity?table=&action=&rowId=&limit= → { data: ActivityEntry[], meta }
 *  - table  : harus ∈ ACTIVITY_TABLE_WHITELIST (whitelist ketat, selain itu 400)
 *  - action : INSERT | UPDATE | DELETE (selain itu 400)
 *  - rowId  : filter per baris (dipakai RowHistory)
 *  - limit  : 1..200 (default 50)
 *
 * Server-only read: audit_log tanpa policy anon (RLS) — dibaca via service key
 * / pg. Bila DB tidak terhubung → [] (empty-state, bukan data palsu).
 */
export const dynamic = "force-dynamic";

import { dbListActivity, dbStatus } from "@/db/dataService";
import { supabaseRestEnabled } from "@/db/supabaseService";
import { apiJson, apiError } from "@/lib/api/response";
import {
  ACTIVITY_TABLE_WHITELIST,
  type ActivityAction,
  type ActivityFilters,
} from "@/lib/types/activity";

const VALID_ACTIONS = new Set<ActivityAction>(["INSERT", "UPDATE", "DELETE"]);

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);

  const table = searchParams.get("table")?.trim() || undefined;
  const action = (searchParams.get("action")?.trim() || undefined) as
    | ActivityAction
    | undefined;
  const rowId = searchParams.get("rowId")?.trim() || undefined;
  const rawLimit = Number(searchParams.get("limit") ?? 50);

  if (table && !(ACTIVITY_TABLE_WHITELIST as readonly string[]).includes(table)) {
    return apiError(`tabel tidak diizinkan: ${table}`, 400, "TABLE_NOT_ALLOWED");
  }
  if (action && !VALID_ACTIONS.has(action)) {
    return apiError(`action tidak valid: ${action}`, 400, "INVALID_ACTION");
  }
  const limit = Number.isFinite(rawLimit)
    ? Math.min(Math.max(Math.floor(rawLimit), 1), 200)
    : 50;

  const filters: ActivityFilters = { table, action, rowId, limit };
  const entries = await dbListActivity(filters, limit);

  const source =
    supabaseRestEnabled
      ? ("supabase-rest" as const)
      : dbStatus().mode === "database"
        ? ("live" as const)
        : ("mock" as const);

  return apiJson(entries, { source, cache: "no-store" });
}
