"use client";

import { useState } from "react";
import { Building2, Trash2, TriangleAlert, UserPlus, Users } from "lucide-react";
import { useMemberMutation, useWorkspaceMembersQuery, useWorkspacesQuery } from "@/hooks/useWorkspaceQuery";
import { MEMBER_ROLES, type MemberRole } from "@/lib/types/workspace";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RoleBadge } from "./RoleBadge";

/**
 * Workspace Manager — kelola workspace & anggota (Fase 2 RBAC).
 * Data riil dari /api/workspaces (Supabase, service key). Tanpa tabel
 * (migrasi belum dijalankan) → empty-state informatif. Tanpa auth, operasi
 * berjalan sebagai service role; begitu auth menyala, RLS Postgres membatasi
 * sesuai role user.
 */
export function WorkspaceManager() {
  const { data: workspaces, isLoading: wsLoading } = useWorkspacesQuery();
  const [selectedId, setSelectedId] = useState<string | undefined>();
  const workspaceId = selectedId ?? workspaces?.[0]?.id;

  const { data: members, isLoading: mLoading, isError: mError } =
    useWorkspaceMembersQuery(workspaceId);
  const memberOps = useMemberMutation(workspaceId);

  // form tambah anggota
  const [userId, setUserId] = useState("");
  const [role, setRole] = useState<MemberRole>("viewer");
  const [error, setError] = useState<string | null>(null);

  const add = () => {
    setError(null);
    if (!workspaceId) return;
    if (!userId.trim()) {
      setError("User ID (uuid) wajib diisi.");
      return;
    }
    memberOps.add.mutate(
      { userId: userId.trim(), role },
      {
        onSuccess: () => {
          setUserId("");
          setRole("viewer");
        },
        onError: (e) => setError(e instanceof Error ? e.message : "Gagal menambah anggota."),
      }
    );
  };

  return (
    <div className="space-y-4">
      {/* daftar workspace */}
      <div className="flex items-center gap-2 rounded-lg border border-border bg-card p-3">
        <Building2 className="h-4 w-4 shrink-0 text-primary" />
        <span className="text-[12px] font-medium text-foreground">Workspace:</span>
        {wsLoading ? (
          <Skeleton className="h-6 w-40" />
        ) : workspaces && workspaces.length > 0 ? (
          <Select value={workspaceId} onValueChange={(v) => setSelectedId(v)}>
            <SelectTrigger className="h-7 w-auto min-w-[160px] text-[12px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {workspaces.map((w) => (
                <SelectItem key={w.id} value={w.id}>
                  {w.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        ) : (
          <span className="text-[12px] text-muted-foreground">
            belum ada workspace — jalankan migrasi Phase 0/2 di Supabase SQL Editor
          </span>
        )}
      </div>

      {/* daftar anggota */}
      <div className="rounded-lg border border-border bg-card">
        <div className="flex items-center gap-1.5 border-b border-border px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
          <Users className="h-3.5 w-3.5" /> Anggota Workspace
          <span className="ml-auto font-mono text-[10px] text-muted-foreground/60">
            {members ? members.length : "—"} anggota
          </span>
        </div>

        {mLoading ? (
          <div className="space-y-2 p-3">
            {Array.from({ length: 2 }).map((_, i) => (
              <Skeleton key={i} className="h-9 w-full" />
            ))}
          </div>
        ) : mError ? (
          <div className="flex items-center gap-2 p-4 text-[12px] text-muted-foreground">
            <TriangleAlert className="h-4 w-4 text-destructive" />
            Gagal memuat anggota workspace.
          </div>
        ) : !members || members.length === 0 ? (
          <p className="p-4 text-[12px] leading-relaxed text-muted-foreground">
            Belum ada anggota tercatat untuk workspace ini. Tambahkan anggota
            (user yang sudah ada di <code className="font-mono">auth.users</code>)
            melalui form di bawah — setiap perubahan langsung tercatat di{" "}
            <code className="font-mono">audit_log</code> oleh trigger.
          </p>
        ) : (
          <div className="divide-y divide-border/60">
            {members.map((m) => (
              <div key={m.userId} className="flex items-center gap-2 px-3 py-2">
                <span className="min-w-0 flex-1 truncate font-mono text-[11.5px] text-foreground">
                  {m.userId}
                </span>
                <RoleBadge role={m.role} />
                <Select
                  value={m.role}
                  onValueChange={(v) =>
                    memberOps.updateRole.mutate({ userId: m.userId, role: v as MemberRole })
                  }
                >
                  <SelectTrigger className="h-7 w-[110px] text-[11.5px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {MEMBER_ROLES.map((r) => (
                      <SelectItem key={r} value={r}>
                        {r}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive"
                  onClick={() => memberOps.remove.mutate(m.userId)}
                  disabled={memberOps.remove.isPending}
                  title="Hapus anggota"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* form tambah anggota */}
      <div className="rounded-lg border border-border bg-card p-3">
        <div className="mb-2 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
          <UserPlus className="h-3.5 w-3.5" /> Tambah Anggota
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Input
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
            placeholder="user id (uuid dari auth.users)"
            className="h-8 min-w-[220px] flex-1 font-mono text-[11.5px]"
          />
          <Select value={role} onValueChange={(v) => setRole(v as MemberRole)}>
            <SelectTrigger className="h-8 w-[110px] text-[11.5px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {MEMBER_ROLES.map((r) => (
                <SelectItem key={r} value={r}>
                  {r}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            size="sm"
            className="h-8 gap-1 text-[12px]"
            onClick={add}
            disabled={memberOps.add.isPending || !workspaceId}
          >
            <UserPlus className="h-3.5 w-3.5" /> Tambah
          </Button>
        </div>
        {error && (
          <p className="mt-2 flex items-center gap-1.5 text-[11.5px] text-destructive">
            <TriangleAlert className="h-3.5 w-3.5" /> {error}
          </p>
        )}
        <p className="mt-2 text-[10.5px] leading-relaxed text-muted-foreground/80">
          Anggota harus sudah terdaftar di <code className="font-mono">auth.users</code> —
          bila user tidak dikenal, database menolak (FK). Role dikunci RLS:
          admin kelola penuh, editor tulis, viewer baca.
        </p>
      </div>
    </div>
  );
}
