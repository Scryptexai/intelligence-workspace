/**
 * Workspace Member API — ubah role & hapus anggota (Fase 2 RBAC).
 * Kontrak:
 *   PATCH  /api/workspaces/:id/members/:userId { role } → 204
 *   DELETE /api/workspaces/:id/members/:userId → 204
 * Server-only via service key; validasi uuid + role.
 */
export const dynamic = "force-dynamic";

import { workspaceRepository } from "@/lib/api/server";
import { apiError } from "@/lib/api/response";
import { MEMBER_ROLES, type MemberRole } from "@/lib/types/workspace";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string; userId: string }> }
) {
  const { id, userId } = await params;
  if (!UUID_RE.test(id) || !UUID_RE.test(userId)) {
    return apiError("id/userId tidak valid", 400, "INVALID_ID");
  }
  const body = (await req.json().catch(() => ({}))) as { role?: string };
  const role = body.role as MemberRole;
  if (!(MEMBER_ROLES as readonly string[]).includes(role)) {
    return apiError("role harus admin/editor/viewer", 400, "INVALID_ROLE");
  }
  try {
    await workspaceRepository.updateRole(id, userId, role);
    return new Response(null, { status: 204 });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "gagal mengubah role";
    return apiError(msg, 500, "UPDATE_ROLE_FAILED");
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string; userId: string }> }
) {
  const { id, userId } = await params;
  if (!UUID_RE.test(id) || !UUID_RE.test(userId)) {
    return apiError("id/userId tidak valid", 400, "INVALID_ID");
  }
  try {
    await workspaceRepository.removeMember(id, userId);
    return new Response(null, { status: 204 });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "gagal menghapus anggota";
    return apiError(msg, 500, "REMOVE_MEMBER_FAILED");
  }
}
