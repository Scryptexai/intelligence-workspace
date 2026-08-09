/**
 * Satu sumber kebenaran untuk path endpoint API.
 * Backend sungguhan nanti wajib mengikuti kontrak ini (relative ke API_BASE_URL).
 */

export const ENDPOINTS = {
  config: "/config",

  // projects
  projects: "/projects",
  project: (slug: string) => `/projects/${slug}`,

  // knowledge
  knowledge: (slug: string) => `/projects/${slug}/knowledge`,
  knowledgeItem: (slug: string, id: string) => `/projects/${slug}/knowledge/${id}`,

  // entities + relationships
  entities: (slug: string) => `/projects/${slug}/entities`,
  relationships: (slug: string) => `/projects/${slug}/relationships`,

  // events
  events: (slug: string) => `/projects/${slug}/events`,

  // conflicts
  conflicts: (slug: string) => `/projects/${slug}/conflicts`,
  conflict: (slug: string, id: string) => `/projects/${slug}/conflicts/${id}`,

  // QA + behavior
  qa: (slug: string) => `/projects/${slug}/qa`,
  behavior: (slug: string) => `/projects/${slug}/behavior`,

  // market (live metrics)
  market: (slug: string) => `/market/${slug}`,

  // global search
  search: "/search",

  // collaboration (notes & views)
  notes: "/notes",
  note: (scope: string, id: string) => `/notes?scope=${encodeURIComponent(scope)}&id=${encodeURIComponent(id)}`,
  views: "/views",
  view: (id: string) => `/views/${id}`,

  // audit trail (activity ledger)
  activity: "/activity",
} as const;

export type Endpoints = typeof ENDPOINTS;
