import type { BehaviorProfile } from "@/lib/types/project";

export const behaviorProfiles: Record<string, BehaviorProfile> = {
  arbitrum: {
    strategicObjectives: [
      "Capture #1 position among Ethereum L2s via low fees and high throughput (Nitro, BoLD).",
      "Expand the ecosystem surface through Orbit L3 chains and the ArbitrumOne/Nova dual-chain strategy.",
      "Restore governance legitimacy after the AIP-1 ratification controversy.",
      "Grow real economic activity (TVL, stablecoins, DEX volume) rather than raw airdrop farming.",
    ],
    decisionPatterns: [
      "Foundation acts first, seeks retroactive DAO ratification (e.g., 750M ARB treasury motion).",
      "Rapid technical iteration — Nitro, BoLD and Timeboost shipped on aggressive timelines.",
      "Heavy use of token incentives (STIP, delegation campaigns) to bootstrap liquidity and participation.",
      "Delegation-driven governance: large delegated blocs (PlutusDAO) move proposals.",
    ],
    riskResponse: [
      "Aggressive — deploy first, refine later; relies on the Security Council as backstop.",
      "Post-incident remediation via governance apologies and re-votes (AIP-1).",
      "Centralization of sequencer accepted as short-term trade-off, contested by community.",
    ],
    tradeOffs: [
      "Decentralization vs. execution speed.",
      "Short-term incentive spend vs. long-term treasury health.",
      "Permissioned sequencer UX vs. trust-minimized operations.",
    ],
  },
  optimism: {
    strategicObjectives: [
      "Build the Superchain: a network of interoperable, standardized L2s sharing liquidity.",
      "Fund public goods at scale through RetroPGF and the Citizens' House.",
      "Champion open-source infrastructure (OP Stack) as the default L2 standard.",
    ],
    decisionPatterns: [
      "Community-first governance with a two-house model (Token House + Citizens' House).",
      "Deliberative, proposal-heavy culture with long comment periods.",
      "Long-horizon retroactive funding that rewards shipped impact rather than promises.",
    ],
    riskResponse: [
      "Conservative — phased rollouts with extensive testnet validation (Bedrock, fault proofs).",
      "Progressive decentralization: fault proofs and permissionless verification before trust cuts.",
      "Transparent public-good accounting via the Optimism Foundation reports.",
    ],
    tradeOffs: [
      "Speed vs. deliberation.",
      "Openness and modularity vs. coordination overhead.",
      "Public-goods spend vs. token holder returns.",
    ],
  },
};
