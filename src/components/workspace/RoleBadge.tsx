"use client";

import { cn } from "@/lib/utils/helpers";
import { MEMBER_ROLE_LABEL, type MemberRole } from "@/lib/types/workspace";

/** Warna badge per role RBAC (admin/editor/viewer). */
const ROLE_STYLE: Record<MemberRole, string> = {
  admin: "border-primary/40 bg-primary/10 text-primary",
  editor: "border-warning/40 bg-warning/10 text-warning",
  viewer: "border-border bg-muted text-muted-foreground",
};

export function RoleBadge({ role, className }: { role: MemberRole; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded border px-1.5 py-px text-[10.5px] font-semibold",
        ROLE_STYLE[role] ?? ROLE_STYLE.viewer,
        className
      )}
    >
      {MEMBER_ROLE_LABEL[role] ?? role}
    </span>
  );
}
