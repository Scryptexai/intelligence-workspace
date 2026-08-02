import { DATA_SOURCE, API_VERSION } from "@/lib/api/config";
import { getProjects } from "@/lib/data";
import { dbStatus } from "@/db/dataService";
import { apiJson } from "@/lib/api/response";

export const dynamic = "force-dynamic";

/** GET /api/config → ApiConfigInfo (mode data source + health DB) */
export async function GET() {
  const db = dbStatus();
  return apiJson({
    dataSource: DATA_SOURCE,
    version: API_VERSION,
    database: db.connected ? "connected" : "mock",
    projectCount: getProjects().length,
    endpoints: [],
    meta: {
      dbMode: db.mode,
    },
  });
}
