/**
 * Workspaces API — daftar workspace (Fase 2 RBAC).
 * Kontrak: GET /api/workspaces → { data: Workspace[], meta }
 * Server-only read via service key (RLS: anggota hanya lihat workspace-nya
 * sendiri; tanpa auth, service role membaca semua). Bila tabel belum ada
 * (migrasi Phase 0 belum dijalankan) → [] (empty-state, bukan error).
 */
export const dynamic = "force-dynamic";

import { workspaceRepository } from "@/lib/api/server";
import { apiJson } from "@/lib/api/response";
import { supabaseRestEnabled } from "@/db/supabaseService";

export async function GET() {
  const workspaces = await workspaceRepository.list();
  return apiJson(workspaces, {
    source: supabaseRestEnabled ? "supabase-rest" : "live",
    cache: "no-store",
  });
}
