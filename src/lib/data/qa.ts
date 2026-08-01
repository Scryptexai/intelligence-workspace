import type { QAReport } from "@/lib/types/project";

export const qaReports: Record<string, QAReport> = {
  arbitrum: {
    total: 86.1,
    dimensions: [
      {
        key: "research",
        label: "Research",
        score: 92,
        weight: 15,
        description:
          "Depth and breadth of primary-source research across governance, security and market domains.",
      },
      {
        key: "consistency",
        label: "Consistency",
        score: 90,
        weight: 10,
        description:
          "How well knowledge statements agree across independent evidence chains.",
      },
      {
        key: "evidence",
        label: "Evidence",
        score: 90,
        weight: 20,
        description:
          "Traceability of every claim to dated, sourced, weighted evidence.",
      },
      {
        key: "coverage",
        label: "Coverage",
        score: 66,
        weight: 10,
        description:
          "Share of the intelligence surface (entities, events, conflicts) captured.",
      },
      {
        key: "conflict",
        label: "Conflict",
        score: 82,
        weight: 15,
        description:
          "Completeness and quality of the conflict-resolution ledger.",
      },
      {
        key: "knowledge",
        label: "Knowledge",
        score: 88,
        weight: 30,
        description:
          "Number, maturity and stability of published knowledge items.",
      },
    ],
    phases: [
      { name: "Research & Scoping", status: "Passed", score: 92, owner: "Research Unit" },
      { name: "Evidence Collection", status: "Passed", score: 90, owner: "Evidence Unit" },
      { name: "Conflict Resolution", status: "In Progress", score: 74, owner: "Conflict Desk" },
      { name: "Synthesis", status: "In Progress", score: 82, owner: "Synthesis Unit" },
      { name: "Publication", status: "Not Started", score: 0, owner: "Publication Unit" },
    ],
  },
  optimism: {
    total: 78.4,
    dimensions: [
      {
        key: "research",
        label: "Research",
        score: 84,
        weight: 15,
        description:
          "Depth and breadth of primary-source research across governance, security and market domains.",
      },
      {
        key: "consistency",
        label: "Consistency",
        score: 80,
        weight: 10,
        description:
          "How well knowledge statements agree across independent evidence chains.",
      },
      {
        key: "evidence",
        label: "Evidence",
        score: 78,
        weight: 20,
        description:
          "Traceability of every claim to dated, sourced, weighted evidence.",
      },
      {
        key: "coverage",
        label: "Coverage",
        score: 81,
        weight: 10,
        description:
          "Share of the intelligence surface (entities, events, conflicts) captured.",
      },
      {
        key: "conflict",
        label: "Conflict",
        score: 70,
        weight: 15,
        description:
          "Completeness and quality of the conflict-resolution ledger.",
      },
      {
        key: "knowledge",
        label: "Knowledge",
        score: 78,
        weight: 30,
        description:
          "Number, maturity and stability of published knowledge items.",
      },
    ],
    phases: [
      { name: "Research & Scoping", status: "Passed", score: 84, owner: "Research Unit" },
      { name: "Evidence Collection", status: "Passed", score: 80, owner: "Evidence Unit" },
      { name: "Conflict Resolution", status: "In Progress", score: 70, owner: "Conflict Desk" },
      { name: "Synthesis", status: "In Progress", score: 78, owner: "Synthesis Unit" },
      { name: "Publication", status: "Not Started", score: 0, owner: "Publication Unit" },
    ],
  },
};
