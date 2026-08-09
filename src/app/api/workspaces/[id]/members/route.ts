/**
 * Workspace Members API — daftar & tambah anggota (Fase 2 RBAC).
 * Kontrak:
 *   GET  /api/workspaces/:id/members → { data: WorkspaceMember[], meta }
 *   POST /api/workspaces/:id/members { userId, role } → 204
 * Server-only via service key; validasi: uuid, role ∈ admin/editor/viewer.
 * Tanpa DB → POST gagal 500 dengan pesan jelas (bukan fake data).
 */
export const dynamic = "force-dynamic";

import { workspaceRepository } from "@/lib/api/server";
import { apiJson, apiError } from "@/lib/api/response";
import { MEMBER_ROLES, type MemberRole } from "@/lib/types/workspace";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  if (!UUID_RE.test(id)) return apiError("workspace id tidak valid", 400, "INVALID_ID");
  const members = await workspaceRepository.members(id);
  return apiJson(members, { source: "supabase-rest", cache: "no-store" });
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  if (!UUID_RE.test(id)) return apiError("workspace id tidak valid", 400, "INVALID_ID");
  const body = (await req.json().catch(() => ({}))) as { userId?: string; role?: string };
  if (!body.userId || !UUID_RE.test(body.userId)) {
    return apiError("userId (uuid) wajib diisi", 400, "INVALID_USER");
  }
  const role = body.role as MemberRole;
  if (!(MEMBER_ROLES as readonly string[]).includes(role)) {
    return apiError("role harus admin/editor/viewer", 400, "INVALID_ROLE");
  }
  try {
    await workspaceRepository.addMember(id, body.userId, role);
    return new Response(null, { status: 204 });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "gagal menambah anggota";
    return apiError(msg, 500, "ADD_MEMBER_FAILED");
  }
}
