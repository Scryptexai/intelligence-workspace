import type { Relationship } from "@/lib/types/entity";

export const relationshipsBySlug: Record<string, Relationship[]> = {
  arbitrum: [
    { id: "R-001", source: "offchain-labs", target: "arbitrum-one", type: "founded" },
    { id: "R-002", source: "offchain-labs", target: "arbitrum-nova", type: "founded" },
    { id: "R-003", source: "arbitrum-foundation", target: "security-council", type: "controls" },
    { id: "R-004", source: "arbitrum-foundation", target: "arbitrum-dao", type: "partnered" },
    { id: "R-005", source: "arbitrum-dao", target: "arbitrum-one", type: "governs" },
    { id: "R-006", source: "security-council", target: "arbitrum-one", type: "safeguards" },
    { id: "R-007", source: "steven-goldfeder", target: "offchain-labs", type: "leads" },
    { id: "R-008", source: "ed-felten", target: "offchain-labs", type: "founded" },
    { id: "R-009", source: "harry-kalodner", target: "offchain-labs", type: "founded" },
    { id: "R-010", source: "pantera-capital", target: "offchain-labs", type: "invested" },
    { id: "R-011", source: "lightspeed", target: "offchain-labs", type: "invested" },
    { id: "R-012", source: "polychain", target: "offchain-labs", type: "invested" },
    { id: "R-013", source: "delphi-digital", target: "arbitrum-one", type: "research" },
    { id: "R-014", source: "gmx", target: "arbitrum-one", type: "deployed-on" },
    { id: "R-015", source: "aave", target: "arbitrum-one", type: "deployed-on" },
    { id: "R-016", source: "uniswap", target: "arbitrum-one", type: "deployed-on" },
    { id: "R-017", source: "treasure-dao", target: "arbitrum-nova", type: "deployed-on" },
    { id: "R-018", source: "plutus-dao", target: "arbitrum-dao", type: "proposed" },
    { id: "R-019", source: "trail-of-bits", target: "arbitrum-one", type: "audited" },
    { id: "R-020", source: "gauntlet", target: "arbitrum-one", type: "risk-assessed" },
    { id: "R-021", source: "oat", target: "arbitrum-foundation", type: "audited" },
    { id: "R-022", source: "arbitrum-foundation", target: "offchain-labs", type: "partnered" },
    { id: "R-023", source: "offchain-labs", target: "arbitrum-dao", type: "leads" },
    { id: "R-024", source: "gmx", target: "treasure-dao", type: "partnered" },
    { id: "R-025", source: "franklin-templeton", target: "arbitrum-one", type: "deployed-on" },
    { id: "R-026", source: "curve-finance", target: "arbitrum-one", type: "deployed-on" },
    { id: "R-027", source: "blackrock", target: "arbitrum-one", type: "research" },
    { id: "R-028", source: "robinhood", target: "arbitrum-one", type: "partnered" },
    { id: "R-029", source: "binance", target: "arbitrum-one", type: "partnered" },
    { id: "R-030", source: "kraken", target: "arbitrum-one", type: "partnered" },
  ],
  optimism: [
    { id: "OR-001", source: "op-labs", target: "op-stack", type: "founded" },
    { id: "OR-002", source: "op-foundation", target: "op-collective", type: "partnered" },
    { id: "OR-003", source: "op-collective", target: "op-stack", type: "governs" },
    { id: "OR-004", source: "op-security-council", target: "op-stack", type: "safeguards" },
    { id: "OR-005", source: "coinbase", target: "base", type: "founded" },
    { id: "OR-006", source: "base", target: "op-stack", type: "deployed-on" },
    { id: "OR-007", source: "worldcoin", target: "op-stack", type: "deployed-on" },
    { id: "OR-008", source: "velodrome", target: "op-stack", type: "deployed-on" },
    { id: "OR-009", source: "etherna", target: "op-stack", type: "deployed-on" },
    { id: "OR-010", source: "op-labs", target: "op-collective", type: "leads" },
    { id: "OR-011", source: "op-foundation", target: "op-security-council", type: "controls" },
  ],
};

export function getRelationships(slug: string): Relationship[] {
  return relationshipsBySlug[slug] ?? [];
}
