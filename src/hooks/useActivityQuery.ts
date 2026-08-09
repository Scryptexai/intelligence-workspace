"use client";

import { useQuery } from "@tanstack/react-query";
import { activityRepository } from "@/lib/api";
import type { ActivityFilters } from "@/lib/types/activity";

/**
 * Query Activity Ledger (real-only).
 *  - refetchInterval 60s → ledger selalu segar (trigger Postgres menulis
 *    audit_log di luar aplikasi, jadi polling ringan lebih andal daripada cache).
 *  - TANPA placeholder/mock: data kosong → empty-state di UI.
 */
export function useActivityQuery(filters: ActivityFilters = {}) {
  return useQuery({
    queryKey: ["activity", filters],
    queryFn: () => activityRepository.list(filters),
    refetchInterval: 60_000,
    staleTime: 30_000,
    retry: 1,
  });
}
