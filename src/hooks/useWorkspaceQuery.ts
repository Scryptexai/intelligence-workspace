"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { workspaceRepository } from "@/lib/api";
import type { MemberRole } from "@/lib/types/workspace";

/**
 * Query Workspace & RBAC (real-only, tanpa placeholder/mock).
 *  - useWorkspacesQuery: daftar workspace (refetch 60s).
 *  - useWorkspaceMembersQuery: anggota per workspace (refetch 60s).
 *  - useMemberMutation: tambah/ubah/hapus anggota → invalidate list.
 */

export function useWorkspacesQuery() {
  return useQuery({
    queryKey: ["workspaces"],
    queryFn: () => workspaceRepository.listWorkspaces(),
    refetchInterval: 60_000,
    staleTime: 30_000,
    retry: 1,
  });
}

export function useWorkspaceMembersQuery(workspaceId: string | undefined) {
  return useQuery({
    queryKey: ["workspace-members", workspaceId],
    queryFn: () => workspaceRepository.listMembers(workspaceId!),
    enabled: !!workspaceId,
    refetchInterval: 60_000,
    staleTime: 30_000,
    retry: 1,
  });
}

export function useMemberMutation(workspaceId: string | undefined) {
  const qc = useQueryClient();
  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ["workspace-members", workspaceId] });
  };
  return {
    add: useMutation({
      mutationFn: ({ userId, role }: { userId: string; role: MemberRole }) =>
        workspaceRepository.addMember(workspaceId!, userId, role),
      onSuccess: invalidate,
    }),
    updateRole: useMutation({
      mutationFn: ({ userId, role }: { userId: string; role: MemberRole }) =>
        workspaceRepository.updateRole(workspaceId!, userId, role),
      onSuccess: invalidate,
    }),
    remove: useMutation({
      mutationFn: (userId: string) => workspaceRepository.removeMember(workspaceId!, userId),
      onSuccess: invalidate,
    }),
  };
}
