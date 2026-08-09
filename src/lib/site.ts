/**
 * Identitas situs — satu tempat untuk semua data yang dipakai halaman
 * About/Privacy/Terms/Docs, footer, dan metadata (SEO/Google).
 *
 * ⚠️ Ganti EMAIL/ALAMAT dengan milik Anda sebelum submit ke Google Search
 * Console — Google S&K mewajibkan info kontak nyata yang bisa diverifikasi.
 */

export const SITE = {
  name: "Intelligence Workspace",
  shortName: "CIF",
  tagline: "Crypto Intelligence Framework — court-grade research, traceable evidence",
  description:
    "Platform intelijen kripto enterprise: knowledge berbasis bukti (evidence-weighted), konflik sumber yang dilacak, timeline peristiwa, entity graph, dan audit trail lengkap — dirancang untuk due diligence, monitoring portofolio, dan analisis kompetitif.",
  url: process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : "http://localhost:3000",
  /** Ganti dengan email legal/kontak nyata Anda. */
  contactEmail: "legal@intelligence-workspace.dev",
  /** Ganti dengan alamat nyata bila diperlukan (opsional). */
  address: "",
  foundedYear: 2026,
  language: "id",
} as const;

export const NAV_LINKS = [
  { href: "/", label: "Projects" },
  { href: "/compare", label: "Compare" },
  { href: "/activity", label: "Activity" },
  { href: "/docs", label: "Docs" },
  { href: "/about", label: "About" },
  { href: "/settings", label: "Settings" },
] as const;

export const LEGAL_LINKS = [
  { href: "/about", label: "About" },
  { href: "/privacy", label: "Privacy" },
  { href: "/terms", label: "Terms" },
  { href: "/docs", label: "Documentation" },
] as const;
