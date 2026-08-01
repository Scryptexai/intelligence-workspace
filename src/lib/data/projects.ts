import type { Project } from "@/lib/types/project";
import { qaReports } from "./qa";
import { behaviorProfiles } from "./behavior";

export const projects: Project[] = [
  {
    id: "arbitrum",
    slug: "arbitrum",
    name: "ARBITRUM",
    symbol: "ARB",
    tagline: "Ethereum L2 · Optimistic Rollup · Nitro Stack",
    description:
      "Arbitrum is the leading optimistic-rollup L2 for Ethereum, operated by the Arbitrum Foundation with technology from Offchain Labs. Intelligence surface covers treasury governance, the ARB token, the Security Council, sequencer operations and the Orbit ecosystem.",
    color: "#22d3ee",
    accent: "#0e7490",
    status: "active",
    cifScore: 86.1,
    confidence: 86,
    knowledgeCount: 12,
    conflictCount: 10,
    coverage: 66,
    entityCount: 27,
    eventCount: 20,
    lastUpdated: "2026-02-14",
    lastActivityHours: 2,
    tags: ["L2", "Optimistic Rollup", "Governance", "Nitro"],
    qa: qaReports.arbitrum,
    behavior: behaviorProfiles.arbitrum,
  },
  {
    id: "optimism",
    slug: "optimism",
    name: "OPTIMISM",
    symbol: "OP",
    tagline: "Ethereum L2 · OP Stack · Superchain",
    description:
      "Optimism is the Superchain's flagship L2, built on the open-source OP Stack. Intelligence surface covers the two-house Collective governance, RetroPGF, the OP token economy, the Superchain roadmap and fault-proof decentralization.",
    color: "#a78bfa",
    accent: "#6d28d9",
    status: "active",
    cifScore: 78.4,
    confidence: 81,
    knowledgeCount: 10,
    conflictCount: 3,
    coverage: 81,
    entityCount: 10,
    eventCount: 10,
    lastUpdated: "2026-02-11",
    lastActivityHours: 5,
    tags: ["L2", "OP Stack", "Superchain", "RetroPGF"],
    qa: qaReports.optimism,
    behavior: behaviorProfiles.optimism,
  },
];

export const projectsBySlug: Record<string, Project> = Object.fromEntries(
  projects.map((p) => [p.slug, p])
);

export function getProjectBySlug(slug: string): Project | undefined {
  return projectsBySlug[slug];
}

export function getProjects(): Project[] {
  return projects;
}
