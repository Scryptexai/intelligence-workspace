import type { Conflict } from "@/lib/types/conflict";

export const conflictsBySlug: Record<string, Conflict[]> = {
  arbitrum: [
    {
      id: "C-001",
      projectSlug: "arbitrum",
      category: "Governance",
      title: "AIP-1 ratification — 750M ARB treasury motion",
      description:
        "The Arbitrum Foundation moved 750M ARB to its own wallet citing AIP-1 ratification, while the vote passed with only ~0.01% quorum — far below the customary governance threshold. The community disputed both the threshold and the legitimacy of the motion.",
      severity: "Critical",
      status: "Resolved",
      versionA: {
        source: "Arbitrum Foundation",
        value:
          "AIP-1 was ratified on 2023-03-16 with majority support of votes cast. The 750M ARB operational budget is approved and held in a Foundation-controlled multisig.",
        date: "2023-04-02",
        url: "https://arbitrum.foundation",
        evidence: "Snapshot vote archive, Foundation announcement",
      },
      versionB: {
        source: "Arbitrum DAO community",
        value:
          "AIP-1 passed with a 0.01% quorum, far below the customary 5%+ threshold. The motion is not a legitimate ratification and the treasury move must be reversed or re-voted.",
        date: "2023-04-05",
        url: "https://forum.arbitrum.foundation",
        evidence: "Forum thread, governance threshold analysis by delegates",
      },
      resolution:
        "The Foundation issued a formal apology, committed to governance process reform, and the DAO re-ran key votes with proper thresholds. Tally adopted minimum quorum standards thereafter.",
      affectedKnowledge: ["K-001", "K-003", "K-004"],
      affectedPhase: "Governance",
      updatedAt: "2023-04-20",
    },
    {
      id: "C-002",
      projectSlug: "arbitrum",
      category: "Governance",
      title: "Treasury size — $400M vs $750M budget",
      description:
        "Disagreement over the Foundation's annual operating budget: the Foundation budgeted 750M ARB (~$1B), while delegates argued a leaner ~400M ARB budget aligned with ecosystem needs.",
      severity: "Medium",
      status: "Resolved",
      versionA: {
        source: "Arbitrum Foundation",
        value:
          "750M ARB is needed for multi-year ecosystem growth, grants, and legal operations; a smaller budget would handicap the ecosystem race.",
        date: "2023-04-06",
        url: "https://arbitrum.foundation",
        evidence: "AIP-1 budget appendix",
      },
      versionB: {
        source: "Delegate bloc (e.g., Michigan Blockchain)",
        value:
          "A 400M ARB budget is sufficient and a 750M allocation concentrates too much value under Foundation control.",
        date: "2023-04-08",
        url: "https://forum.arbitrum.foundation",
        evidence: "Delegate budget counter-proposal",
      },
      resolution:
        "Compromise: Foundation retained 750M ARB but with enhanced reporting obligations and quarterly disclosure commitments.",
      affectedKnowledge: ["K-001"],
      affectedPhase: "Governance",
      updatedAt: "2023-04-25",
    },
    {
      id: "C-003",
      projectSlug: "arbitrum",
      category: "Security",
      title: "Security Council composition — 6 vs 12 elected seats",
      description:
        "At launch, the Security Council had 12 members with 6 appointed by the Foundation. The community demanded full DAO election, while the Foundation argued for continuity during bootstrap.",
      severity: "High",
      status: "Resolved",
      versionA: {
        source: "Arbitrum Foundation",
        value:
          "6 Foundation-appointed seats are necessary for operational continuity during the bootstrap phase; DAO elections phased in over time.",
        date: "2023-03-20",
        url: "https://arbitrum.foundation",
        evidence: "AIP-1 council design section",
      },
      versionB: {
        source: "Community delegates",
        value:
          "A security council that can upgrade contracts must be fully DAO-elected; appointed seats create an unaccountable veto bloc.",
        date: "2023-04-10",
        url: "https://forum.arbitrum.foundation",
        evidence: "Governance working-group proposal",
      },
      resolution:
        "Compromise reached: 6 elected / 6 appointed at launch with a defined rotation schedule; first DAO elections held Aug 2024.",
      affectedKnowledge: ["K-003"],
      affectedPhase: "Security",
      updatedAt: "2024-08-20",
    },
    {
      id: "C-004",
      projectSlug: "arbitrum",
      category: "Security",
      title: "Sequencer centralization",
      description:
        "Offchain Labs operates the only sequencer for Arbitrum One. Analysts flag a single point of failure and MEV power; the team argues sequencing centralization is standard for L2s today.",
      severity: "High",
      status: "Unresolved",
      versionA: {
        source: "Offchain Labs / Foundation",
        value:
          "A permissioned sequencer is a deliberate, standard L2 design that maximizes UX; decentralization can follow without compromising correctness guarantees.",
        date: "2024-03-01",
        url: "https://docs.arbitrum.io",
        evidence: "L2BEAT risk assessments, official docs",
      },
      versionB: {
        source: "Independent researchers (L2BEAT)",
        value:
          "Sequencer centralization grants Offchain Labs unilateral ordering power and MEV extraction; a permissionless sequencing roadmap is required for trust-minimization.",
        date: "2024-03-15",
        url: "https://l2beat.com",
        evidence: "L2BEAT stage analysis — Stage 0/1 assessment",
      },
      resolution: undefined,
      affectedKnowledge: ["K-005", "K-007"],
      affectedPhase: "Technology",
      updatedAt: "2026-01-10",
    },
    {
      id: "C-005",
      projectSlug: "arbitrum",
      category: "Tokenomics",
      title: "STIP funding amount — 50M vs 75M ARB",
      description:
        "The Short-Term Incentive Program's size was contested: a 50M ARB baseline proposal vs. an expanded 75M ARB version including gaming and derivatives verticals.",
      severity: "Low",
      status: "Resolved",
      versionA: {
        source: "STIP authors",
        value:
          "75M ARB across all verticals maximizes ecosystem bootstrapping and matches competitive L2 incentive benchmarks.",
        date: "2023-09-18",
        url: "https://forum.arbitrum.foundation",
        evidence: "STIP proposal v2",
      },
      versionB: {
        source: "Fiscal hawks (delegates)",
        value:
          "50M ARB is sufficient; 75M creates sell-pressure and rewards mercenary liquidity.",
        date: "2023-09-22",
        url: "https://forum.arbitrum.foundation",
        evidence: "Delegate objections in proposal thread",
      },
      resolution: "75M ARB approved (Oct 2023) with per-vertical caps.",
      affectedKnowledge: ["K-010"],
      affectedPhase: "Governance",
      updatedAt: "2023-10-04",
    },
    {
      id: "C-006",
      projectSlug: "arbitrum",
      category: "Tokenomics",
      title: "Timeboost — MEV value distribution",
      description:
        "Timeboost (TAP-5) auctions transaction ordering to the highest bidder, with revenue to the DAO. Opponents argue it formalizes MEV extraction from users.",
      severity: "High",
      status: "Unresolved",
      versionA: {
        source: "Offchain Labs / TAP-5 authors",
        value:
          "A time auction is the fairest MEV mechanism: it is transparent, captures value for the treasury, and can include user-protection features like time-in-trade.",
        date: "2024-06-17",
        url: "https://forum.arbitrum.foundation",
        evidence: "TAP-5 proposal text",
      },
      versionB: {
        source: "User advocates / MEV researchers",
        value:
          "Any MEV auction institutionalizes extraction at user expense; funds should go to a burn or direct rebate, not the treasury.",
        date: "2024-07-02",
        url: "https://forum.arbitrum.foundation",
        evidence: "MEV research threads",
      },
      resolution: undefined,
      affectedKnowledge: ["K-007"],
      affectedPhase: "Tokenomics",
      updatedAt: "2026-02-01",
    },
    {
      id: "C-007",
      projectSlug: "arbitrum",
      category: "Roadmap",
      title: "BoLD activation timeline",
      description:
        "Offchain Labs proposed a phased BoLD rollout (Nova first, then One). Some delegates demanded simultaneous activation on One, citing validator decentralization urgency.",
      severity: "Medium",
      status: "Unresolved",
      versionA: {
        source: "Offchain Labs",
        value:
          "Phased activation de-risks the protocol; One follows after Nova proves the mechanism in production.",
        date: "2024-02-01",
        url: "https://offchainlabs.com/blog",
        evidence: "BoLD technical post",
      },
      versionB: {
        source: "Delegates (e.g., Arbitrum governance WG)",
        value:
          "Deferring BoLD on One prolongs whitelisted-validator risk; both chains should activate on the same schedule.",
        date: "2024-02-20",
        url: "https://forum.arbitrum.foundation",
        evidence: "Governance WG position paper",
      },
      resolution: undefined,
      affectedKnowledge: ["K-011"],
      affectedPhase: "Technology",
      updatedAt: "2026-01-22",
    },
    {
      id: "C-008",
      projectSlug: "arbitrum",
      category: "Data",
      title: "Nova vs One TVL attribution",
      description:
        "Ecosystem dashboards differ on how Nova's TVL is attributed: some count only bridged ETH, others include token valuations — producing a wide spread in 'total Arbitrum TVL' figures.",
      severity: "Low",
      status: "Unresolved",
      versionA: {
        source: "DefiLlama",
        value:
          "Nova TVL should be counted at bridge value only (~$100M), making Arbitrum One the dominant chain by far.",
        date: "2025-06-01",
        url: "https://defillama.com",
        evidence: "DefiLlama chain pages",
      },
      versionB: {
        source: "Arbitrum Foundation",
        value:
          "Ecosystem-wide reporting should include both chains' applications and token balances, showing a materially larger combined footprint.",
        date: "2025-06-10",
        url: "https://arbitrum.foundation",
        evidence: "Foundation ecosystem report",
      },
      resolution: undefined,
      affectedKnowledge: ["K-009"],
      affectedPhase: "Data",
      updatedAt: "2025-06-15",
    },
    {
      id: "C-009",
      projectSlug: "arbitrum",
      category: "Governance",
      title: "Delegate concentration risk",
      description:
        "Large delegated blocs (PlutusDAO 200M ARB, plus top-10 delegates) control a disproportionate share of voting power, raising capture risk in treasury votes.",
      severity: "Critical",
      status: "Unresolved",
      versionA: {
        source: "Nansen / on-chain analytics",
        value:
          "Top delegates control >30% of liquid voting power; single proposals can pass with a handful of yes-votes.",
        date: "2023-04-15",
        url: "https://nansen.ai",
        evidence: "Delegate concentration dashboard",
      },
      versionB: {
        source: "Arbitrum Foundation",
        value:
          "Concentration is transient post-airdrop; delegation is fluid and quorum requirements prevent capture of the full treasury.",
        date: "2023-05-01",
        url: "https://arbitrum.foundation",
        evidence: "Foundation governance note",
      },
      resolution: undefined,
      affectedKnowledge: ["K-008", "K-001"],
      affectedPhase: "Governance",
      updatedAt: "2026-01-28",
    },
    {
      id: "C-010",
      projectSlug: "arbitrum",
      category: "Tokenomics",
      title: "ARB unlock schedule disclosure",
      description:
        "Conflicting statements about when investor/team ARB unlocks begin: the token contract shows linear unlocks while early communications suggested cliff schedules.",
      severity: "Medium",
      status: "Resolved",
      versionA: {
        source: "Token contract analysis",
        value:
          "ARB unlocks are linear from launch with no cliff — investor/team supply enters circulation immediately.",
        date: "2023-03-24",
        url: "https://etherscan.io",
        evidence: "Token vesting contract",
      },
      versionB: {
        source: "Community interpretations",
        value:
          "A 12-month cliff was implied by the airdrop FAQ; early unlock would contradict the stated schedule.",
        date: "2023-03-26",
        url: "https://forum.arbitrum.foundation",
        evidence: "Airdrop FAQ archive",
      },
      resolution:
        "Foundation clarified linear-unlock mechanics in a governance FAQ; contract data confirmed as authoritative.",
      affectedKnowledge: ["K-002"],
      affectedPhase: "Tokenomics",
      updatedAt: "2023-04-01",
    },
  ],
  optimism: [
    {
      id: "OP-C001",
      projectSlug: "optimism",
      category: "Tokenomics",
      title: "OP inflation cap — 2% vs 0%",
      description:
        "Debate over the 2% annual OP inflation, which funds the ecosystem fund: some holders demand disinflation, while the Foundation argues inflation funds RetroPGF and growth.",
      severity: "Low",
      status: "Resolved",
      versionA: {
        source: "Optimism Foundation",
        value:
          "2% inflation is fully allocated to the ecosystem fund and public goods; removing it would starve the Collective's core mechanism.",
        date: "2022-05-10",
        url: "https://optimism.io",
        evidence: "OP token economics post",
      },
      versionB: {
        source: "OP holders",
        value:
          "Inflation dilutes holders; the ecosystem fund should be funded from sequencer revenue instead.",
        date: "2022-06-01",
        url: "https://gov.optimism.io",
        evidence: "Tokenomics forum debate",
      },
      resolution:
        "2% inflation retained; sequencer revenue-share added as a complementary funding stream in 2024.",
      affectedKnowledge: ["OP-005"],
      affectedPhase: "Tokenomics",
      updatedAt: "2024-06-10",
    },
    {
      id: "OP-C002",
      projectSlug: "optimism",
      category: "Governance",
      title: "RetroPGF allocation bias",
      description:
        "Repeated analyses show RetroPGF rewards concentrate among a few projects and badgeholders, raising questions about capture and fairness of round-based allocation.",
      severity: "Medium",
      status: "Unresolved",
      versionA: {
        source: "Independent analysts",
        value:
          "The top 10% of projects capture the majority of OP in each round; badgeholder overlap creates structural bias.",
        date: "2024-08-15",
        url: "https://gov.optimism.io",
        evidence: "Round allocation analyses",
      },
      versionB: {
        source: "Optimism Foundation",
        value:
          "Concentration reflects impact variance; rounds are iterating (Round 4 added caps and new badgeholder cohorts) to improve distribution.",
        date: "2024-09-01",
        url: "https://community.optimism.io",
        evidence: "Foundation process notes",
      },
      resolution: undefined,
      affectedKnowledge: ["OP-010"],
      affectedPhase: "Governance",
      updatedAt: "2026-01-05",
    },
    {
      id: "OP-C003",
      projectSlug: "optimism",
      category: "Governance",
      title: "Governance restructure — one house or two",
      description:
        "The 2025 restructure proposal consolidates the two-house model. Some community members defend the Citizens' House as unique to Optimism; others argue it duplicates the Token House.",
      severity: "Medium",
      status: "Unresolved",
      versionA: {
        source: "Restructure authors",
        value:
          "A unified Assembly with streamlined councils reduces complexity, speeds decisions, and keeps RetroPGF under the same accountability framework.",
        date: "2025-02-03",
        url: "https://gov.optimism.io",
        evidence: "Restructure draft proposal",
      },
      versionB: {
        source: "Citizens' House advocates",
        value:
          "Citizenship-based voting prevents plutocracy; merging houses would let large OP holders dominate public-goods funding.",
        date: "2025-03-01",
        url: "https://gov.optimism.io",
        evidence: "Counter-proposal threads",
      },
      resolution: undefined,
      affectedKnowledge: ["OP-002", "OP-008"],
      affectedPhase: "Governance",
      updatedAt: "2025-03-05",
    },
  ],
};

export function getConflicts(slug: string): Conflict[] {
  return conflictsBySlug[slug] ?? [];
}

export function getConflict(
  slug: string,
  id: string
): Conflict | undefined {
  return getConflicts(slug).find((c) => c.id === id);
}
