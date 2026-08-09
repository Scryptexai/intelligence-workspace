/**
 * Tipe untuk Workspace & RBAC (Fase 2 enterprise).
 *
 * Sumber: tabel `workspaces` + `workspace_members` (migrasi Phase 0),
 * dibaca/dikelola server-side via service key; enforcement per-user via
 * RLS Postgres (policy Phase 2). Tanpa auth (belum ada login), operasi
 * management memakai service role — begitu auth menyala, RLS membatasi
 * sesuai role user.
 */

/** Role anggota workspace — dikunci RLS (admin/editor/viewer). */
export type MemberRole = "admin" | "editor" | "viewer";

export const MEMBER_ROLES: readonly MemberRole[] = ["admin", "editor", "viewer"];

export const MEMBER_ROLE_LABEL: Record<MemberRole, string> = {
  admin: "Admin",
  editor: "Editor",
  viewer: "Viewer",
};

/** Workspace default (uuid tetap dari migrasi Phase 0). */
export const DEFAULT_WORKSPACE_ID = "00000000-0000-0000-0000-000000000001";
export const DEFAULT_WORKSPACE_NAME = "CIF Research";

export interface Workspace {
  id: string;
  name: string;
  slug: string;
  description: string;
  settings: Record<string, unknown>;
  createdAt: string;
}

export interface WorkspaceMember {
  workspaceId: string;
  userId: string;
  role: MemberRole;
  createdAt: string;
}

/* ------------------------------------------------------------------ */
/* Project Templates — konten produk (bukan data riset / mock).        */
/* Dua template disetujui: VC Due Diligence & Exchange Listing.        */
/* ------------------------------------------------------------------ */

export interface ProjectTemplate {
  id: string;
  name: string;
  description: string;
  /** Fokus analisis template (fase CIF yang diprioritaskan). */
  focusAreas: string[];
  /** Emoji penanda (UI saja). */
  emoji: string;
}

export const PROJECT_TEMPLATES: ProjectTemplate[] = [
  {
    id: "vc-due-diligence",
    name: "VC Due Diligence",
    description:
      "Template riset untuk evaluasi investasi: fokus pada pendanaan, tim, dan tokenomics.",
    focusAreas: ["Funding", "Team", "Tokenomics"],
    emoji: "💼",
  },
  {
    id: "exchange-listing",
    name: "Exchange Listing",
    description:
      "Template riset untuk penilaian listing: fokus pada keamanan, audit, dan kepatuhan.",
    focusAreas: ["Security", "Audit", "Compliance"],
    emoji: "🏦",
  },
];
