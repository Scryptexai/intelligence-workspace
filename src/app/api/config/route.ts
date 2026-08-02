import { DATA_SOURCE, API_VERSION } from "@/lib/api/config";
import { getProjects } from "@/lib/data";
import { dbStatus } from "@/db/dataService";
import { supabaseRestEnabled } from "@/db/supabaseService";
import { apiJson } from "@/lib/api/response";

export const dynamic = "force-dynamic";

/** GET /api/config → ApiConfigInfo (mode data source + health DB) */
export async function GET() {
  const db = dbStatus();
  // Bedakan Supabase REST (via PostgREST) dari pg langsung agar UI bisa
  // menampilkan badge sumber data yang akurat ("Supabase" vs "Database").
  const database = !db.connected
    ? "mock"
    : supabaseRestEnabled
      ? "supabase-rest"
      : "connected";
  return apiJson({
    dataSource: DATA_SOURCE,
    version: API_VERSION,
    database,
    projectCount: getProjects().length,
    endpoints: [],
    meta: {
      dbMode: db.mode,
    },
  });
}
