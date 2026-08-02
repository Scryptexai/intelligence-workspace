-- ============================================================
-- Intelligence Workspace — SEED DATA LENGKAP untuk Supabase
-- ============================================================
-- File ini DIGENERATE dari data riset (lib/data) oleh:
--   npx tsx scripts/build-seed-sql.ts
--
-- Cara pakai:
--   1. Jalankan migration skema dulu (buat tabel):
--      - npx drizzle-kit push   (dengan DATABASE_URL Supabase), ATAU
--      - tempel isi drizzle/0000_*.sql di Supabase SQL Editor
--   2. Tempel SELURUH isi file ini di Supabase SQL Editor → Run
--      (atau: psql "$DATABASE_URL" -f supabase/seed.sql)
--
-- Idempotent: ON CONFLICT DO NOTHING di setiap INSERT.
-- ============================================================

-- Projek
INSERT INTO projects (id, slug, name, symbol, tagline, description, color, accent, status, cif_score, confidence, knowledge_count, conflict_count, coverage, entity_count, event_count, last_updated, last_activity_hours, tags)
VALUES ('arbitrum', 'arbitrum', 'ARBITRUM', 'ARB', 'Ethereum L2 · Optimistic Rollup · Nitro Stack', 'Arbitrum is the leading optimistic-rollup L2 for Ethereum, operated by the Arbitrum Foundation with technology from Offchain Labs. Intelligence surface covers treasury governance, the ARB token, the Security Council, sequencer operations and the Orbit ecosystem.', '#22d3ee', '#0e7490', 'active', 86.1, 86, 12, 10, 66, 27, 20, '2026-02-14', 2, '["L2","Optimistic Rollup","Governance","Nitro"]'::jsonb)
ON CONFLICT (id) DO NOTHING;
INSERT INTO projects (id, slug, name, symbol, tagline, description, color, accent, status, cif_score, confidence, knowledge_count, conflict_count, coverage, entity_count, event_count, last_updated, last_activity_hours, tags)
VALUES ('optimism', 'optimism', 'OPTIMISM', 'OP', 'Ethereum L2 · OP Stack · Superchain', 'Optimism is the Superchain''s flagship L2, built on the open-source OP Stack. Intelligence surface covers the two-house Collective governance, RetroPGF, the OP token economy, the Superchain roadmap and fault-proof decentralization.', '#a78bfa', '#6d28d9', 'active', 78.4, 81, 10, 3, 81, 10, 10, '2026-02-11', 5, '["L2","OP Stack","Superchain","RetroPGF"]'::jsonb)
ON CONFLICT (id) DO NOTHING;

-- Knowledge items + evidence
INSERT INTO knowledge_items (id, project_slug, name, category, description, confidence, status, updated_at, author, related_knowledge, dependencies)
VALUES ('K-001', 'arbitrum', 'DAO Treasury — ~4.5B ARB under DAO control', 'Governance', 'The Arbitrum DAO controls roughly 4.5B ARB (~$4B+ at peak) — the largest treasury in the L2 ecosystem. Disbursements require on-chain governance votes, though the Foundation holds administrative keys for operational spending (locked to 750M ARB after AIP-1).', 92, 'Stable', '2026-01-28', 'Treasury Unit', '["K-002","K-003","K-004"]'::jsonb, '["E-009","E-012","E-013"]'::jsonb)
ON CONFLICT (id) DO NOTHING;
INSERT INTO evidence_items (id, knowledge_id, event_id, event_name, date, source, url, weight, note, sort_order)
VALUES ('EV-001-1', 'K-001', 'E-012', 'AIP-1 ratification controversy', '2023-04-02', 'Arbitrum forum', 'https://forum.arbitrum.foundation', 5, 'Foundation confirmed 750M ARB operational budget in its own wallet.', 0)
ON CONFLICT (id) DO NOTHING;
INSERT INTO evidence_items (id, knowledge_id, event_id, event_name, date, source, url, weight, note, sort_order)
VALUES ('EV-001-2', 'K-001', 'E-009', 'ARB token launch and airdrop', '2023-03-23', 'Arbitrum Foundation', 'https://arbitrum.foundation', 5, 'Initial supply schedule published at token genesis.', 1)
ON CONFLICT (id) DO NOTHING;
INSERT INTO evidence_items (id, knowledge_id, event_id, event_name, date, source, url, weight, note, sort_order)
VALUES ('EV-001-3', 'K-001', 'E-013', 'STIP — 75M ARB incentive program', '2023-10-04', 'Tally', 'https://tally.xyz', 4, 'On-chain vote moved 75M ARB to STIP grants.', 2)
ON CONFLICT (id) DO NOTHING;
INSERT INTO knowledge_items (id, project_slug, name, category, description, confidence, status, updated_at, author, related_knowledge, dependencies)
VALUES ('K-002', 'arbitrum', 'ARB initial distribution — 42.78% ecosystem allocation', 'Tokenomics', 'At genesis, 42.78% of the 10B ARB supply was allocated to the ecosystem (DAO treasury, user airdrops, and ecosystem development), 26.94% to Offchain Labs investors, 17.53% to Offchain Labs team/contributors, and 7% to the Foundation.', 95, 'Stable', '2025-11-02', 'Tokenomics Unit', '["K-001","K-008"]'::jsonb, '["E-009"]'::jsonb)
ON CONFLICT (id) DO NOTHING;
INSERT INTO evidence_items (id, knowledge_id, event_id, event_name, date, source, url, weight, note, sort_order)
VALUES ('EV-002-1', 'K-002', 'E-009', 'ARB token launch and airdrop', '2023-03-23', 'Arbitrum Foundation allocation post', 'https://arbitrum.foundation', 5, NULL, 0)
ON CONFLICT (id) DO NOTHING;
INSERT INTO evidence_items (id, knowledge_id, event_id, event_name, date, source, url, weight, note, sort_order)
VALUES ('EV-002-2', 'K-002', 'E-011', '200M ARB delegated to PlutusDAO', '2023-03-24', 'Nansen on-chain report', 'https://nansen.ai', 4, 'Post-genesis delegation confirms liquid supply dynamics.', 1)
ON CONFLICT (id) DO NOTHING;
INSERT INTO knowledge_items (id, project_slug, name, category, description, confidence, status, updated_at, author, related_knowledge, dependencies)
VALUES ('K-003', 'arbitrum', 'Security Council — 12 members, 6 elected by DAO', 'Security', 'The Arbitrum Security Council is a 12-member multisig (9-of-12 threshold) that can upgrade protocol contracts in emergencies. Six seats are elected by the DAO; six are initially appointed by the Foundation. Elections rotate on a rolling schedule.', 88, 'Stable', '2025-12-19', 'Security Unit', '["K-001","K-004","K-011"]'::jsonb, '["E-012","E-017"]'::jsonb)
ON CONFLICT (id) DO NOTHING;
INSERT INTO evidence_items (id, knowledge_id, event_id, event_name, date, source, url, weight, note, sort_order)
VALUES ('EV-003-1', 'K-003', 'E-012', 'AIP-1 ratification controversy', '2023-04-02', 'Arbitrum forum', 'https://forum.arbitrum.foundation', 4, 'Council composition disclosed during AIP-1 debate.', 0)
ON CONFLICT (id) DO NOTHING;
INSERT INTO evidence_items (id, knowledge_id, event_id, event_name, date, source, url, weight, note, sort_order)
VALUES ('EV-003-2', 'K-003', 'E-017', 'Security Council rotation election', '2024-08-14', 'Tally', 'https://tally.xyz', 5, 'First DAO election cycle completed on-chain.', 1)
ON CONFLICT (id) DO NOTHING;
INSERT INTO knowledge_items (id, project_slug, name, category, description, confidence, status, updated_at, author, related_knowledge, dependencies)
VALUES ('K-004', 'arbitrum', 'Arbitrum Foundation — Cayman entity stewarding the ecosystem', 'Governance', 'The Arbitrum Foundation (Cayman Islands) was established in March 2023 to steward the DAO treasury, run grant programs, and represent the protocol. It holds the administrative multisig for the 750M ARB operational budget and appoints initial Security Council members.', 90, 'Stable', '2025-09-14', 'Governance Unit', '["K-001","K-003"]'::jsonb, '["E-010"]'::jsonb)
ON CONFLICT (id) DO NOTHING;
INSERT INTO evidence_items (id, knowledge_id, event_id, event_name, date, source, url, weight, note, sort_order)
VALUES ('EV-004-1', 'K-004', 'E-010', 'Arbitrum Foundation established', '2023-03-16', 'Arbitrum Foundation', 'https://arbitrum.foundation', 5, NULL, 0)
ON CONFLICT (id) DO NOTHING;
INSERT INTO evidence_items (id, knowledge_id, event_id, event_name, date, source, url, weight, note, sort_order)
VALUES ('EV-004-2', 'K-004', 'E-001', 'Offchain Labs founded', '2019-08-15', 'Company announcement', 'https://offchainlabs.com', 3, NULL, 1)
ON CONFLICT (id) DO NOTHING;
INSERT INTO knowledge_items (id, project_slug, name, category, description, confidence, status, updated_at, author, related_knowledge, dependencies)
VALUES ('K-005', 'arbitrum', 'Permissioned sequencer operated by Offchain Labs', 'Technology', 'Arbitrum One and Nova use a single permissioned sequencer operated by Offchain Labs. The sequencer orders transactions and posts batches to Ethereum. There is no live sequencer-failure fallback or decentralized sequencing roadmap beyond community proposals.', 74, 'Emerging', '2026-01-10', 'Infrastructure Unit', '["K-006","K-007"]'::jsonb, '["E-008","E-016"]'::jsonb)
ON CONFLICT (id) DO NOTHING;
INSERT INTO evidence_items (id, knowledge_id, event_id, event_name, date, source, url, weight, note, sort_order)
VALUES ('EV-005-1', 'K-005', 'E-008', 'Arbitrum One Nitro upgrade', '2022-08-31', 'Offchain Labs docs', 'https://docs.arbitrum.io', 4, NULL, 0)
ON CONFLICT (id) DO NOTHING;
INSERT INTO evidence_items (id, knowledge_id, event_id, event_name, date, source, url, weight, note, sort_order)
VALUES ('EV-005-2', 'K-005', 'E-016', 'Timeboost proposal (TAP-5)', '2024-06-17', 'Arbitrum forum', 'https://forum.arbitrum.foundation', 3, 'MEV policy debate implies sequencer remains permissioned.', 1)
ON CONFLICT (id) DO NOTHING;
INSERT INTO knowledge_items (id, project_slug, name, category, description, confidence, status, updated_at, author, related_knowledge, dependencies)
VALUES ('K-006', 'arbitrum', 'Nitro Stack — ~7× gas reduction, Geth EVM equivalence', 'Technology', 'Arbitrum Nitro replaces the original AVM with a WASM-based fraud-proof architecture that directly executes Geth. It delivered ~7× gas reductions, full EVM compatibility, and a ~40% reduction in minimum dispute period when it shipped in August 2022.', 93, 'Stable', '2025-06-30', 'Infrastructure Unit', '["K-005","K-011","K-012"]'::jsonb, '["E-006","E-008"]'::jsonb)
ON CONFLICT (id) DO NOTHING;
INSERT INTO evidence_items (id, knowledge_id, event_id, event_name, date, source, url, weight, note, sort_order)
VALUES ('EV-006-1', 'K-006', 'E-006', 'Nitro technology announced', '2022-06-01', 'Offchain Labs blog', 'https://offchainlabs.com/blog', 5, NULL, 0)
ON CONFLICT (id) DO NOTHING;
INSERT INTO evidence_items (id, knowledge_id, event_id, event_name, date, source, url, weight, note, sort_order)
VALUES ('EV-006-2', 'K-006', 'E-008', 'Arbitrum One Nitro upgrade', '2022-08-31', 'Offchain Labs blog', 'https://offchainlabs.com/blog', 5, NULL, 1)
ON CONFLICT (id) DO NOTHING;
INSERT INTO knowledge_items (id, project_slug, name, category, description, confidence, status, updated_at, author, related_knowledge, dependencies)
VALUES ('K-007', 'arbitrum', 'Timeboost — MEV auction proposal (TAP-5)', 'Tokenomics', 'Timeboost proposes a time-auction mechanism for the Arbitrum sequencer: users bid for early inclusion, with proceeds flowing to the DAO treasury. Critics argue it institutionalizes MEV extraction at the expense of everyday users.', 55, 'Volatile', '2026-02-01', 'Market Unit', '["K-005","K-001"]'::jsonb, '["E-016"]'::jsonb)
ON CONFLICT (id) DO NOTHING;
INSERT INTO evidence_items (id, knowledge_id, event_id, event_name, date, source, url, weight, note, sort_order)
VALUES ('EV-007-1', 'K-007', 'E-016', 'Timeboost proposal (TAP-5)', '2024-06-17', 'Arbitrum forum', 'https://forum.arbitrum.foundation', 4, 'Proposal text and community objections archived.', 0)
ON CONFLICT (id) DO NOTHING;
INSERT INTO evidence_items (id, knowledge_id, event_id, event_name, date, source, url, weight, note, sort_order)
VALUES ('EV-007-2', 'K-007', 'E-020', 'ARB staking proposal debate', '2025-06-11', 'Arbitrum forum', 'https://forum.arbitrum.foundation', 2, NULL, 1)
ON CONFLICT (id) DO NOTHING;
INSERT INTO knowledge_items (id, project_slug, name, category, description, confidence, status, updated_at, author, related_knowledge, dependencies)
VALUES ('K-008', 'arbitrum', 'PlutusDAO delegation event — 200M ARB concentration', 'Governance', 'Days after the airdrop, 200M ARB (~$700M) was delegated to PlutusDAO, briefly concentrating ~5% of voting power in a single delegate. Community pressure and later redistribution reduced the concentration, but large-delegate dominance remains a structural risk.', 71, 'Volatile', '2025-08-21', 'Governance Unit', '["K-002","K-001","K-003"]'::jsonb, '["E-011"]'::jsonb)
ON CONFLICT (id) DO NOTHING;
INSERT INTO evidence_items (id, knowledge_id, event_id, event_name, date, source, url, weight, note, sort_order)
VALUES ('EV-008-1', 'K-008', 'E-011', '200M ARB delegated to PlutusDAO', '2023-03-24', 'Nansen on-chain report', 'https://nansen.ai', 5, NULL, 0)
ON CONFLICT (id) DO NOTHING;
INSERT INTO evidence_items (id, knowledge_id, event_id, event_name, date, source, url, weight, note, sort_order)
VALUES ('EV-008-2', 'K-008', 'E-012', 'AIP-1 ratification controversy', '2023-04-02', 'Arbitrum forum', 'https://forum.arbitrum.foundation', 3, NULL, 1)
ON CONFLICT (id) DO NOTHING;
INSERT INTO knowledge_items (id, project_slug, name, category, description, confidence, status, updated_at, author, related_knowledge, dependencies)
VALUES ('K-009', 'arbitrum', 'Arbitrum One TVL — consistently top-ranked L2', 'Market', 'Arbitrum One has held the #1 L2 position by TVL for most of its history, crossing $2B in 2022, ~$3B+ after Nitro, and re-accelerating after Dencun''s blob EIP-4844 cut costs. Competitors (Base, Optimism) periodically narrow the gap.', 68, 'Volatile', '2026-02-10', 'Market Unit', '["K-006","K-010"]'::jsonb, '["E-004","E-013","E-015"]'::jsonb)
ON CONFLICT (id) DO NOTHING;
INSERT INTO evidence_items (id, knowledge_id, event_id, event_name, date, source, url, weight, note, sort_order)
VALUES ('EV-009-1', 'K-009', 'E-004', 'Arbitrum One public beta', '2021-05-28', 'DefiLlama', 'https://defillama.com', 4, NULL, 0)
ON CONFLICT (id) DO NOTHING;
INSERT INTO evidence_items (id, knowledge_id, event_id, event_name, date, source, url, weight, note, sort_order)
VALUES ('EV-009-2', 'K-009', 'E-015', 'Dencun / EIP-4844 mainnet', '2024-03-13', 'L2BEAT', 'https://l2beat.com', 4, NULL, 1)
ON CONFLICT (id) DO NOTHING;
INSERT INTO evidence_items (id, knowledge_id, event_id, event_name, date, source, url, weight, note, sort_order)
VALUES ('EV-009-3', 'K-009', 'E-013', 'STIP — 75M ARB incentive program', '2023-10-04', 'DefiLlama', 'https://defillama.com', 3, NULL, 2)
ON CONFLICT (id) DO NOTHING;
INSERT INTO knowledge_items (id, project_slug, name, category, description, confidence, status, updated_at, author, related_knowledge, dependencies)
VALUES ('K-010', 'arbitrum', 'STIP — 75M ARB short-term incentive program', 'Governance', 'The Short-Term Incentive Program allocated 75M ARB across ecosystem protocols to bootstrap liquidity and user activity over ~12 weeks. It materially lifted TVL and volume but raised questions about incentive dependency and token sell-pressure.', 84, 'Stable', '2025-05-12', 'Market Unit', '["K-009","K-001"]'::jsonb, '["E-013"]'::jsonb)
ON CONFLICT (id) DO NOTHING;
INSERT INTO evidence_items (id, knowledge_id, event_id, event_name, date, source, url, weight, note, sort_order)
VALUES ('EV-010-1', 'K-010', 'E-013', 'STIP — 75M ARB incentive program', '2023-10-04', 'Tally', 'https://tally.xyz', 5, NULL, 0)
ON CONFLICT (id) DO NOTHING;
INSERT INTO evidence_items (id, knowledge_id, event_id, event_name, date, source, url, weight, note, sort_order)
VALUES ('EV-010-2', 'K-010', 'E-015', 'Dencun / EIP-4844 mainnet', '2024-03-13', 'DefiLlama', 'https://defillama.com', 3, NULL, 1)
ON CONFLICT (id) DO NOTHING;
INSERT INTO knowledge_items (id, project_slug, name, category, description, confidence, status, updated_at, author, related_knowledge, dependencies)
VALUES ('K-011', 'arbitrum', 'BoLD — permissionless dispute resolution', 'Technology', 'BoLD replaces the whitelisted-validator model with permissionless validators and a bounded dispute window, eliminating griefing attacks. It is being rolled out in phases across Arbitrum chains, with Arbitrum One activation scheduled after Nova.', 77, 'Emerging', '2026-01-22', 'Infrastructure Unit', '["K-006","K-005","K-003"]'::jsonb, '["E-014"]'::jsonb)
ON CONFLICT (id) DO NOTHING;
INSERT INTO evidence_items (id, knowledge_id, event_id, event_name, date, source, url, weight, note, sort_order)
VALUES ('EV-011-1', 'K-011', 'E-014', 'BoLD protocol proposal', '2024-02-01', 'Offchain Labs blog', 'https://offchainlabs.com/blog', 5, NULL, 0)
ON CONFLICT (id) DO NOTHING;
INSERT INTO evidence_items (id, knowledge_id, event_id, event_name, date, source, url, weight, note, sort_order)
VALUES ('EV-011-2', 'K-011', 'E-017', 'Security Council rotation election', '2024-08-14', 'L2BEAT', 'https://l2beat.com', 3, NULL, 1)
ON CONFLICT (id) DO NOTHING;
INSERT INTO knowledge_items (id, project_slug, name, category, description, confidence, status, updated_at, author, related_knowledge, dependencies)
VALUES ('K-012', 'arbitrum', 'Orbit — 100+ L3 chains on the L3 framework', 'Technology', 'Arbitrum Orbit lets anyone deploy a customized L3 (or L2) using Arbitrum tech, with configurable gas tokens, data availability and privacy. The ecosystem passed 100 Orbit chains in 2025, making it the most-adopted L3 framework.', 79, 'Emerging', '2025-12-05', 'Ecosystem Unit', '["K-006"]'::jsonb, '["E-007","E-019"]'::jsonb)
ON CONFLICT (id) DO NOTHING;
INSERT INTO evidence_items (id, knowledge_id, event_id, event_name, date, source, url, weight, note, sort_order)
VALUES ('EV-012-1', 'K-012', 'E-019', 'Orbit ecosystem passes 100 chains', '2025-03-05', 'Arbitrum Foundation', 'https://arbitrum.foundation', 5, NULL, 0)
ON CONFLICT (id) DO NOTHING;
INSERT INTO evidence_items (id, knowledge_id, event_id, event_name, date, source, url, weight, note, sort_order)
VALUES ('EV-012-2', 'K-012', 'E-007', 'Arbitrum Nova launched', '2022-08-11', 'Offchain Labs blog', 'https://offchainlabs.com/blog', 3, 'Nova validated the AnyTrust variant Orbit builds on.', 1)
ON CONFLICT (id) DO NOTHING;
INSERT INTO knowledge_items (id, project_slug, name, category, description, confidence, status, updated_at, author, related_knowledge, dependencies)
VALUES ('OP-001', 'optimism', 'OP Stack — modular, open-source L2 framework', 'Technology', 'The OP Stack is a standardized, open-source framework for building L2 chains (Bedrock). It powers OP Mainnet, Base and 30+ Superchain members, with shared standards for bridging, sequencing and proving.', 90, 'Stable', '2026-01-15', 'Infrastructure Unit', '["OP-006"]'::jsonb, '["OP-004","OP-005"]'::jsonb)
ON CONFLICT (id) DO NOTHING;
INSERT INTO evidence_items (id, knowledge_id, event_id, event_name, date, source, url, weight, note, sort_order)
VALUES ('EV-OP1-1', 'OP-001', 'OP-004', 'Bedrock upgrade', '2023-06-06', 'OP Labs blog', 'https://oplabs.co', 5, NULL, 0)
ON CONFLICT (id) DO NOTHING;
INSERT INTO evidence_items (id, knowledge_id, event_id, event_name, date, source, url, weight, note, sort_order)
VALUES ('EV-OP1-2', 'OP-001', 'OP-005', 'Base launches on OP Stack', '2023-08-09', 'Base / Coinbase', 'https://base.org', 4, NULL, 1)
ON CONFLICT (id) DO NOTHING;
INSERT INTO knowledge_items (id, project_slug, name, category, description, confidence, status, updated_at, author, related_knowledge, dependencies)
VALUES ('OP-002', 'optimism', 'Two-house Collective — Token House + Citizens'' House', 'Governance', 'The Optimism Collective splits governance into a Token House (OP-holder votes on protocol upgrades, funding) and a Citizens'' House (non-transferable citizenship NFTs deciding RetroPGF allocation). A 2025 restructure proposal seeks to streamline the model.', 87, 'Stable', '2025-10-08', 'Governance Unit', '["OP-003","OP-008"]'::jsonb, '["OP-010"]'::jsonb)
ON CONFLICT (id) DO NOTHING;
INSERT INTO evidence_items (id, knowledge_id, event_id, event_name, date, source, url, weight, note, sort_order)
VALUES ('EV-OP2-1', 'OP-002', 'OP-006', 'RetroPGF Round 3', '2023-11-21', 'Optimism governance', 'https://community.optimism.io', 4, NULL, 0)
ON CONFLICT (id) DO NOTHING;
INSERT INTO evidence_items (id, knowledge_id, event_id, event_name, date, source, url, weight, note, sort_order)
VALUES ('EV-OP2-2', 'OP-002', 'OP-010', 'Governance restructure proposal', '2025-02-03', 'Optimism forum', 'https://gov.optimism.io', 4, NULL, 1)
ON CONFLICT (id) DO NOTHING;
INSERT INTO knowledge_items (id, project_slug, name, category, description, confidence, status, updated_at, author, related_knowledge, dependencies)
VALUES ('OP-003', 'optimism', 'RetroPGF — retroactive public-goods funding', 'Governance', 'RetroPGF distributes OP rewards to builders whose shipped work benefited the Collective, decided after the fact by badgeholders. Rounds 1–4 distributed ~70M OP; the mechanism is the flagship experiment in retroactive funding.', 86, 'Stable', '2025-11-19', 'Governance Unit', '["OP-002","OP-008"]'::jsonb, '["OP-006","OP-009"]'::jsonb)
ON CONFLICT (id) DO NOTHING;
INSERT INTO evidence_items (id, knowledge_id, event_id, event_name, date, source, url, weight, note, sort_order)
VALUES ('EV-OP3-1', 'OP-003', 'OP-006', 'RetroPGF Round 3', '2023-11-21', 'Optimism governance', 'https://community.optimism.io', 5, NULL, 0)
ON CONFLICT (id) DO NOTHING;
INSERT INTO evidence_items (id, knowledge_id, event_id, event_name, date, source, url, weight, note, sort_order)
VALUES ('EV-OP3-2', 'OP-003', 'OP-009', 'RetroPGF Round 4', '2024-07-31', 'Optimism governance', 'https://community.optimism.io', 4, NULL, 1)
ON CONFLICT (id) DO NOTHING;
INSERT INTO knowledge_items (id, project_slug, name, category, description, confidence, status, updated_at, author, related_knowledge, dependencies)
VALUES ('OP-004', 'optimism', 'Bedrock — EVM equivalence and modular rollup', 'Technology', 'The Bedrock upgrade (June 2023) rebuilt OP Mainnet around EVM equivalence, cut deposit times to minutes, and introduced the modular architecture later generalized into the OP Stack.', 92, 'Stable', '2025-07-01', 'Infrastructure Unit', '["OP-001"]'::jsonb, '["OP-004"]'::jsonb)
ON CONFLICT (id) DO NOTHING;
INSERT INTO evidence_items (id, knowledge_id, event_id, event_name, date, source, url, weight, note, sort_order)
VALUES ('EV-OP4-1', 'OP-004', 'OP-004', 'Bedrock upgrade', '2023-06-06', 'OP Labs blog', 'https://oplabs.co', 5, NULL, 0)
ON CONFLICT (id) DO NOTHING;
INSERT INTO knowledge_items (id, project_slug, name, category, description, confidence, status, updated_at, author, related_knowledge, dependencies)
VALUES ('OP-005', 'optimism', 'OP tokenomics — 4.29B supply, 2% inflation', 'Tokenomics', 'OP launched with a 4.29B initial supply: 19% to user airdrops, 25% to ecosystem fund, 20% to core contributors, 19% to investors, 17% to Foundation. Supply inflates 2% annually, mostly into the ecosystem fund.', 90, 'Stable', '2025-09-03', 'Tokenomics Unit', '["OP-002"]'::jsonb, '["OP-002","OP-003"]'::jsonb)
ON CONFLICT (id) DO NOTHING;
INSERT INTO evidence_items (id, knowledge_id, event_id, event_name, date, source, url, weight, note, sort_order)
VALUES ('EV-OP5-1', 'OP-005', 'OP-002', 'OP token announced', '2022-04-27', 'Optimism blog', 'https://optimism.io', 5, NULL, 0)
ON CONFLICT (id) DO NOTHING;
INSERT INTO evidence_items (id, knowledge_id, event_id, event_name, date, source, url, weight, note, sort_order)
VALUES ('EV-OP5-2', 'OP-005', 'OP-003', 'OP airdrop round 1', '2022-05-31', 'Optimism blog', 'https://optimism.io', 4, NULL, 1)
ON CONFLICT (id) DO NOTHING;
INSERT INTO knowledge_items (id, project_slug, name, category, description, confidence, status, updated_at, author, related_knowledge, dependencies)
VALUES ('OP-006', 'optimism', 'Superchain — interoperable network of OP Stack chains', 'Technology', 'The Superchain is the network of OP Stack chains sharing security, bridges and tooling. Base''s launch made it the largest member; revenue-share and interop standards are actively being defined.', 83, 'Emerging', '2026-01-29', 'Ecosystem Unit', '["OP-001"]'::jsonb, '["OP-005","OP-008"]'::jsonb)
ON CONFLICT (id) DO NOTHING;
INSERT INTO evidence_items (id, knowledge_id, event_id, event_name, date, source, url, weight, note, sort_order)
VALUES ('EV-OP6-1', 'OP-006', 'OP-005', 'Base launches on OP Stack', '2023-08-09', 'Base / Coinbase', 'https://base.org', 5, NULL, 0)
ON CONFLICT (id) DO NOTHING;
INSERT INTO evidence_items (id, knowledge_id, event_id, event_name, date, source, url, weight, note, sort_order)
VALUES ('EV-OP6-2', 'OP-006', 'OP-008', 'Superchain revenue share framework', '2024-06-04', 'Optimism forum', 'https://gov.optimism.io', 4, NULL, 1)
ON CONFLICT (id) DO NOTHING;
INSERT INTO knowledge_items (id, project_slug, name, category, description, confidence, status, updated_at, author, related_knowledge, dependencies)
VALUES ('OP-007', 'optimism', 'Fault proofs — permissionless challenge system', 'Technology', 'OP Mainnet shipped permissionless fault proofs in March 2024, letting anyone challenge invalid state transitions. This removed reliance on trusted proposers for state correctness.', 89, 'Stable', '2025-08-17', 'Infrastructure Unit', '["OP-001"]'::jsonb, '["OP-007"]'::jsonb)
ON CONFLICT (id) DO NOTHING;
INSERT INTO evidence_items (id, knowledge_id, event_id, event_name, date, source, url, weight, note, sort_order)
VALUES ('EV-OP7-1', 'OP-007', 'OP-007', 'Fault proof system goes live', '2024-03-11', 'OP Labs blog', 'https://oplabs.co', 5, NULL, 0)
ON CONFLICT (id) DO NOTHING;
INSERT INTO knowledge_items (id, project_slug, name, category, description, confidence, status, updated_at, author, related_knowledge, dependencies)
VALUES ('OP-008', 'optimism', 'Governance restructure — 2025 reform proposal', 'Governance', 'A 2025 proposal consolidates the two-house model: merging Citizen and Token House powers into a unified Assembly, streamlining councils, and clarifying OP emissions governance. Final vote pending.', 64, 'Volatile', '2026-02-02', 'Governance Unit', '["OP-002","OP-003"]'::jsonb, '["OP-010"]'::jsonb)
ON CONFLICT (id) DO NOTHING;
INSERT INTO evidence_items (id, knowledge_id, event_id, event_name, date, source, url, weight, note, sort_order)
VALUES ('EV-OP8-1', 'OP-008', 'OP-010', 'Governance restructure proposal', '2025-02-03', 'Optimism forum', 'https://gov.optimism.io', 5, NULL, 0)
ON CONFLICT (id) DO NOTHING;
INSERT INTO knowledge_items (id, project_slug, name, category, description, confidence, status, updated_at, author, related_knowledge, dependencies)
VALUES ('OP-009', 'optimism', 'Coinbase Base — largest Superchain member', 'Market', 'Base, launched by Coinbase on the OP Stack in August 2023, became the largest Superchain chain by usage and a major driver of OP Stack adoption. Its sequencer revenue and governance remain separate from OP Mainnet.', 82, 'Stable', '2025-12-11', 'Market Unit', '["OP-006","OP-001"]'::jsonb, '["OP-005"]'::jsonb)
ON CONFLICT (id) DO NOTHING;
INSERT INTO evidence_items (id, knowledge_id, event_id, event_name, date, source, url, weight, note, sort_order)
VALUES ('EV-OP9-1', 'OP-009', 'OP-005', 'Base launches on OP Stack', '2023-08-09', 'Base / Coinbase', 'https://base.org', 5, NULL, 0)
ON CONFLICT (id) DO NOTHING;
INSERT INTO knowledge_items (id, project_slug, name, category, description, confidence, status, updated_at, author, related_knowledge, dependencies)
VALUES ('OP-010', 'optimism', 'RetroPGF allocation concentration risk', 'Governance', 'RetroPGF rounds show recurring concentration: a small share of badgeholders and projects capture a large share of rewards, raising questions about capture, sybil resistance, and the sustainability of round-based funding.', 58, 'Volatile', '2026-01-05', 'Governance Unit', '["OP-003"]'::jsonb, '["OP-009"]'::jsonb)
ON CONFLICT (id) DO NOTHING;
INSERT INTO evidence_items (id, knowledge_id, event_id, event_name, date, source, url, weight, note, sort_order)
VALUES ('EV-OP10-1', 'OP-010', 'OP-009', 'RetroPGF Round 4', '2024-07-31', 'Optimism governance analytics', 'https://community.optimism.io', 4, NULL, 0)
ON CONFLICT (id) DO NOTHING;

-- Entities
INSERT INTO entities (id, project_slug, name, type, status, description, founded, related_knowledge, related_events, metadata)
VALUES ('offchain-labs', 'arbitrum', 'Offchain Labs', 'Company', 'Active', 'Core developer of Arbitrum. Built the Nitro stack, operates the permissioned sequencer, and authored BoLD. Founded by Ed Felten, Steven Goldfeder and Harry Kalodner in 2019.', '2019', '["K-004","K-005","K-006","K-011"]'::jsonb, '["E-001","E-002","E-003","E-006","E-008","E-014"]'::jsonb, '{"HQ":"New York, USA","Employees":"100–250"}'::jsonb)
ON CONFLICT (id) DO NOTHING;
INSERT INTO entities (id, project_slug, name, type, status, description, founded, related_knowledge, related_events, metadata)
VALUES ('arbitrum-foundation', 'arbitrum', 'Arbitrum Foundation', 'Foundation', 'Active', 'Cayman-registered foundation established March 2023. Stewards the DAO treasury, runs ecosystem programs, and holds the 750M ARB operational budget multisig.', '2023', '["K-001","K-004"]'::jsonb, '["E-010","E-012","E-019"]'::jsonb, '{"Jurisdiction":"Cayman Islands"}'::jsonb)
ON CONFLICT (id) DO NOTHING;
INSERT INTO entities (id, project_slug, name, type, status, description, founded, related_knowledge, related_events, metadata)
VALUES ('arbitrum-dao', 'arbitrum', 'Arbitrum DAO', 'DAO', 'Active', 'ARB-token-holder governance body controlling the ~4.5B ARB treasury. Votes on proposals via on-chain voting (Tally) and the forum.', '2023', '["K-001","K-003","K-008","K-010"]'::jsonb, '["E-011","E-012","E-013","E-016","E-020"]'::jsonb, '{"Voting":"On-chain (Tally)"}'::jsonb)
ON CONFLICT (id) DO NOTHING;
INSERT INTO entities (id, project_slug, name, type, status, description, founded, related_knowledge, related_events, metadata)
VALUES ('security-council', 'arbitrum', 'Security Council', 'Security', 'Active', '12-member, 9-of-12 multisig able to upgrade protocol contracts in emergencies. Six seats elected by the DAO, six appointed by the Foundation.', '2023', '["K-003"]'::jsonb, '["E-012","E-017"]'::jsonb, '{"Threshold":"9 of 12"}'::jsonb)
ON CONFLICT (id) DO NOTHING;
INSERT INTO entities (id, project_slug, name, type, status, description, founded, related_knowledge, related_events, metadata)
VALUES ('arbitrum-one', 'arbitrum', 'Arbitrum One', 'Protocol', 'Active', 'The flagship optimistic-rollup L2. Ran Nitro since Aug 2022; consistently the #1 L2 by TVL; migrating to BoLD permissionless validation.', '2021', '["K-006","K-009","K-011"]'::jsonb, '["E-004","E-008","E-015"]'::jsonb, '{"Type":"Optimistic Rollup"}'::jsonb)
ON CONFLICT (id) DO NOTHING;
INSERT INTO entities (id, project_slug, name, type, status, description, founded, related_knowledge, related_events, metadata)
VALUES ('arbitrum-nova', 'arbitrum', 'Arbitrum Nova', 'Protocol', 'Active', 'AnyTrust chain for high-throughput social/gaming apps, using a data-availability committee instead of full on-chain calldata. Home of the Treasure ecosystem.', '2022', '["K-012"]'::jsonb, '["E-007"]'::jsonb, '{"Type":"AnyTrust chain"}'::jsonb)
ON CONFLICT (id) DO NOTHING;
INSERT INTO entities (id, project_slug, name, type, status, description, founded, related_knowledge, related_events, metadata)
VALUES ('steven-goldfeder', 'arbitrum', 'Steven Goldfeder', 'Person', 'Active', 'CEO of Offchain Labs, co-founder of Arbitrum. Former Princeton PhD (secure multiparty computation) and Cornell Tech postdoc.', NULL, '["K-004","K-005"]'::jsonb, '["E-001","E-006"]'::jsonb, '{"Role":"CEO, Offchain Labs"}'::jsonb)
ON CONFLICT (id) DO NOTHING;
INSERT INTO entities (id, project_slug, name, type, status, description, founded, related_knowledge, related_events, metadata)
VALUES ('ed-felten', 'arbitrum', 'Ed Felten', 'Person', 'Active', 'Co-founder and Chief Scientist of Offchain Labs. Princeton professor, former White House Deputy CTO.', NULL, '["K-004"]'::jsonb, '["E-001"]'::jsonb, '{"Role":"Chief Scientist"}'::jsonb)
ON CONFLICT (id) DO NOTHING;
INSERT INTO entities (id, project_slug, name, type, status, description, founded, related_knowledge, related_events, metadata)
VALUES ('harry-kalodner', 'arbitrum', 'Harry Kalodner', 'Person', 'Active', 'Co-founder and CTO of Offchain Labs. Architect of the original Arbitrum and Nitro designs.', NULL, '["K-005","K-006"]'::jsonb, '["E-001","E-006"]'::jsonb, '{"Role":"CTO, Offchain Labs"}'::jsonb)
ON CONFLICT (id) DO NOTHING;
INSERT INTO entities (id, project_slug, name, type, status, description, founded, related_knowledge, related_events, metadata)
VALUES ('pantera-capital', 'arbitrum', 'Pantera Capital', 'Investor', 'Active', 'Led the $3.7M seed round into Offchain Labs (2019). One of the earliest crypto-focused investment firms.', NULL, '["K-004"]'::jsonb, '["E-002"]'::jsonb, '{"Stage":"Seed"}'::jsonb)
ON CONFLICT (id) DO NOTHING;
INSERT INTO entities (id, project_slug, name, type, status, description, founded, related_knowledge, related_events, metadata)
VALUES ('lightspeed', 'arbitrum', 'Lightspeed Venture Partners', 'Investor', 'Active', 'Led the $120M Series B into Offchain Labs at a $1.2B valuation (2021).', NULL, '["K-004"]'::jsonb, '["E-003"]'::jsonb, '{"Stage":"Series B"}'::jsonb)
ON CONFLICT (id) DO NOTHING;
INSERT INTO entities (id, project_slug, name, type, status, description, founded, related_knowledge, related_events, metadata)
VALUES ('polychain', 'arbitrum', 'Polychain Capital', 'Investor', 'Active', 'Participated in the Series B; prominent crypto-native investment firm with long-duration L1/L2 exposure.', NULL, '["K-004"]'::jsonb, '["E-003"]'::jsonb, '{"Stage":"Series B"}'::jsonb)
ON CONFLICT (id) DO NOTHING;
INSERT INTO entities (id, project_slug, name, type, status, description, founded, related_knowledge, related_events, metadata)
VALUES ('delphi-digital', 'arbitrum', 'Delphi Digital', 'Investor', 'Active', 'Research firm and investor publishing in-depth Arbitrum ecosystem reports; benchmark for ecosystem health.', NULL, '["K-009","K-010"]'::jsonb, '["E-013"]'::jsonb, '{"Role":"Research / Investor"}'::jsonb)
ON CONFLICT (id) DO NOTHING;
INSERT INTO entities (id, project_slug, name, type, status, description, founded, related_knowledge, related_events, metadata)
VALUES ('gmx', 'arbitrum', 'GMX', 'Application', 'Active', 'Perpetual DEX and a core Arbitrum One liquidity engine; large share of network volume and fee revenue.', NULL, '["K-009"]'::jsonb, '["E-005","E-013"]'::jsonb, '{"Sector":"Perpetuals DEX"}'::jsonb)
ON CONFLICT (id) DO NOTHING;
INSERT INTO entities (id, project_slug, name, type, status, description, founded, related_knowledge, related_events, metadata)
VALUES ('aave', 'arbitrum', 'Aave', 'Application', 'Active', 'Flagship lending protocol deployed on Arbitrum One; among the largest TVL contributors.', NULL, '["K-009"]'::jsonb, '["E-013"]'::jsonb, '{"Sector":"Lending"}'::jsonb)
ON CONFLICT (id) DO NOTHING;
INSERT INTO entities (id, project_slug, name, type, status, description, founded, related_knowledge, related_events, metadata)
VALUES ('uniswap', 'arbitrum', 'Uniswap', 'Application', 'Active', 'Largest DEX by volume, with deep Arbitrum One deployment; drives most swap volume on the network.', NULL, '["K-009"]'::jsonb, '["E-013"]'::jsonb, '{"Sector":"DEX"}'::jsonb)
ON CONFLICT (id) DO NOTHING;
INSERT INTO entities (id, project_slug, name, type, status, description, founded, related_knowledge, related_events, metadata)
VALUES ('treasure-dao', 'arbitrum', 'Treasure DAO', 'DAO', 'Active', 'Gaming ecosystem DAO; anchor tenant of Arbitrum Nova and one of the earliest adopters of the AnyTrust chain.', NULL, '["K-012"]'::jsonb, '["E-007"]'::jsonb, '{"Sector":"Gaming"}'::jsonb)
ON CONFLICT (id) DO NOTHING;
INSERT INTO entities (id, project_slug, name, type, status, description, founded, related_knowledge, related_events, metadata)
VALUES ('plutus-dao', 'arbitrum', 'PlutusDAO', 'DAO', 'Contested', 'Received a 200M ARB delegation days after the airdrop, becoming a top delegate and sparking governance-concentration concerns.', NULL, '["K-008"]'::jsonb, '["E-011"]'::jsonb, '{"Role":"Delegate aggregator"}'::jsonb)
ON CONFLICT (id) DO NOTHING;
INSERT INTO entities (id, project_slug, name, type, status, description, founded, related_knowledge, related_events, metadata)
VALUES ('trail-of-bits', 'arbitrum', 'Trail of Bits', 'Company', 'Active', 'Security firm that has audited core Arbitrum components (Nitro, BoLD) and published multiple advisories.', NULL, '["K-006","K-011"]'::jsonb, '["E-006","E-014"]'::jsonb, '{"Role":"Auditor"}'::jsonb)
ON CONFLICT (id) DO NOTHING;
INSERT INTO entities (id, project_slug, name, type, status, description, founded, related_knowledge, related_events, metadata)
VALUES ('gauntlet', 'arbitrum', 'Gauntlet', 'Company', 'Active', 'Risk-management firm running simulations and risk frameworks for Arbitrum governance parameters.', NULL, '["K-001"]'::jsonb, '["E-020"]'::jsonb, '{"Role":"Risk manager"}'::jsonb)
ON CONFLICT (id) DO NOTHING;
INSERT INTO entities (id, project_slug, name, type, status, description, founded, related_knowledge, related_events, metadata)
VALUES ('oat', 'arbitrum', 'OAT — Onchain Auditing Taskforce', 'Security', 'Unknown', 'Community-driven onchain auditing taskforce tracking protocol upgrades, multisig changes and emergency actions on Arbitrum chains.', NULL, '["K-003","K-011"]'::jsonb, '["E-017"]'::jsonb, '{"Role":"Community watch"}'::jsonb)
ON CONFLICT (id) DO NOTHING;
INSERT INTO entities (id, project_slug, name, type, status, description, founded, related_knowledge, related_events, metadata)
VALUES ('blackrock', 'arbitrum', 'BlackRock', 'Investor', 'Active', 'World''s largest asset manager ($10T+ AUM). Its tokenized-fund push (BUIDL on Ethereum) and RWA strategy signal institutional demand that flows into L2 settlement rails like Arbitrum.', NULL, '["K-009"]'::jsonb, '["E-015"]'::jsonb, '{"AUM":"$10T+","Sector":"Asset Management"}'::jsonb)
ON CONFLICT (id) DO NOTHING;
INSERT INTO entities (id, project_slug, name, type, status, description, founded, related_knowledge, related_events, metadata)
VALUES ('franklin-templeton', 'arbitrum', 'Franklin Templeton', 'Investor', 'Active', 'First major asset manager to launch a tokenized money-market fund on Arbitrum (FOBXX / BENJI) — a flagship institutional RWA deployment on the network.', NULL, '["K-009"]'::jsonb, '["E-015"]'::jsonb, '{"Fund":"FOBXX (BENJI)","Chain":"Arbitrum One"}'::jsonb)
ON CONFLICT (id) DO NOTHING;
INSERT INTO entities (id, project_slug, name, type, status, description, founded, related_knowledge, related_events, metadata)
VALUES ('robinhood', 'arbitrum', 'Robinhood', 'Application', 'Active', 'Retail trading platform whose self-custody wallet supports Arbitrum network swaps and deposits, broadening retail exposure to L2 DeFi.', NULL, '["K-009"]'::jsonb, '["E-015"]'::jsonb, '{"Sector":"Retail brokerage"}'::jsonb)
ON CONFLICT (id) DO NOTHING;
INSERT INTO entities (id, project_slug, name, type, status, description, founded, related_knowledge, related_events, metadata)
VALUES ('curve-finance', 'arbitrum', 'Curve Finance', 'Application', 'Active', 'Stablecoin DEX and liquidity engine deployed on Arbitrum One — among the largest sources of stablecoin TVL on the network.', NULL, '["K-009"]'::jsonb, '["E-013"]'::jsonb, '{"Sector":"Stablecoin DEX"}'::jsonb)
ON CONFLICT (id) DO NOTHING;
INSERT INTO entities (id, project_slug, name, type, status, description, founded, related_knowledge, related_events, metadata)
VALUES ('binance', 'arbitrum', 'Binance', 'Company', 'Active', 'Largest centralized exchange and the primary venue for ARB spot and derivatives liquidity, plus a major market maker for the token.', NULL, '["K-002"]'::jsonb, '["E-009"]'::jsonb, '{"Sector":"CEX","Ticker":"BNB"}'::jsonb)
ON CONFLICT (id) DO NOTHING;
INSERT INTO entities (id, project_slug, name, type, status, description, founded, related_knowledge, related_events, metadata)
VALUES ('kraken', 'arbitrum', 'Kraken', 'Company', 'Active', 'US-regulated exchange with deep ARB order books and L2 custody support — an important institutional fiat on-ramp for the ecosystem.', NULL, '["K-002"]'::jsonb, '["E-009"]'::jsonb, '{"Sector":"CEX"}'::jsonb)
ON CONFLICT (id) DO NOTHING;
INSERT INTO entities (id, project_slug, name, type, status, description, founded, related_knowledge, related_events, metadata)
VALUES ('op-collective', 'optimism', 'Optimism Collective', 'DAO', 'Active', 'The two-house governance body (Token House + Citizens'' House) steering the Optimism ecosystem and RetroPGF.', '2022', '["OP-002","OP-003","OP-008"]'::jsonb, '["OP-006","OP-010"]'::jsonb, '{"Houses":"Token + Citizens"}'::jsonb)
ON CONFLICT (id) DO NOTHING;
INSERT INTO entities (id, project_slug, name, type, status, description, founded, related_knowledge, related_events, metadata)
VALUES ('op-foundation', 'optimism', 'Optimism Foundation', 'Foundation', 'Active', 'Non-profit steward of the OP token economy, treasury and Collective processes.', '2022', '["OP-005"]'::jsonb, '["OP-002","OP-003"]'::jsonb, '{"Jurisdiction":"Cayman Islands"}'::jsonb)
ON CONFLICT (id) DO NOTHING;
INSERT INTO entities (id, project_slug, name, type, status, description, founded, related_knowledge, related_events, metadata)
VALUES ('op-labs', 'optimism', 'OP Labs', 'Company', 'Active', 'Core developer of the OP Stack and OP Mainnet. Builds Bedrock, fault proofs and interop standards.', '2020', '["OP-001","OP-004","OP-007"]'::jsonb, '["OP-004","OP-007"]'::jsonb, '{"HQ":"Remote-first"}'::jsonb)
ON CONFLICT (id) DO NOTHING;
INSERT INTO entities (id, project_slug, name, type, status, description, founded, related_knowledge, related_events, metadata)
VALUES ('op-security-council', 'optimism', 'OP Security Council', 'Security', 'Active', 'Multisig guardian with upgrade powers over OP Mainnet contracts, accountable to the Collective.', NULL, '["OP-002"]'::jsonb, '["OP-010"]'::jsonb, '{"Threshold":"13 of 24"}'::jsonb)
ON CONFLICT (id) DO NOTHING;
INSERT INTO entities (id, project_slug, name, type, status, description, founded, related_knowledge, related_events, metadata)
VALUES ('op-stack', 'optimism', 'OP Stack', 'Protocol', 'Active', 'Open-source modular L2 framework powering OP Mainnet, Base and the Superchain.', '2023', '["OP-001","OP-006"]'::jsonb, '["OP-004","OP-005"]'::jsonb, '{"License":"MIT"}'::jsonb)
ON CONFLICT (id) DO NOTHING;
INSERT INTO entities (id, project_slug, name, type, status, description, founded, related_knowledge, related_events, metadata)
VALUES ('base', 'optimism', 'Base', 'Protocol', 'Active', 'Coinbase''s L2 built on the OP Stack; the largest Superchain member by usage.', '2023', '["OP-006","OP-009"]'::jsonb, '["OP-005"]'::jsonb, '{"Operator":"Coinbase"}'::jsonb)
ON CONFLICT (id) DO NOTHING;
INSERT INTO entities (id, project_slug, name, type, status, description, founded, related_knowledge, related_events, metadata)
VALUES ('coinbase', 'optimism', 'Coinbase', 'Company', 'Active', 'US-listed exchange operating Base and integrating the OP Stack into its wallet and onchain strategy.', NULL, '["OP-009"]'::jsonb, '["OP-005"]'::jsonb, '{"Ticker":"COIN"}'::jsonb)
ON CONFLICT (id) DO NOTHING;
INSERT INTO entities (id, project_slug, name, type, status, description, founded, related_knowledge, related_events, metadata)
VALUES ('worldcoin', 'optimism', 'Worldcoin', 'Application', 'Active', 'Identity protocol (World ID) running a large share of its backend on OP Mainnet; major driver of daily transactions.', NULL, '["OP-006"]'::jsonb, '["OP-005"]'::jsonb, '{"Sector":"Identity"}'::jsonb)
ON CONFLICT (id) DO NOTHING;
INSERT INTO entities (id, project_slug, name, type, status, description, founded, related_knowledge, related_events, metadata)
VALUES ('velodrome', 'optimism', 'Velodrome', 'Application', 'Active', 'Flagship ve(3,3) DEX on OP Mainnet; core liquidity and emissions venue for the ecosystem.', NULL, '["OP-006"]'::jsonb, '["OP-004"]'::jsonb, '{"Sector":"DEX"}'::jsonb)
ON CONFLICT (id) DO NOTHING;
INSERT INTO entities (id, project_slug, name, type, status, description, founded, related_knowledge, related_events, metadata)
VALUES ('etherna', 'optimism', 'Etherna', 'Application', 'Active', 'Self-custodial MPC wallet popularized on the Superchain, onboarding non-custodial users to OP Mainnet.', NULL, '["OP-006"]'::jsonb, '["OP-005"]'::jsonb, '{"Sector":"Wallet"}'::jsonb)
ON CONFLICT (id) DO NOTHING;

-- Relationships
INSERT INTO relationships (id, project_slug, source, target, type)
VALUES ('R-001', 'arbitrum', 'offchain-labs', 'arbitrum-one', 'founded')
ON CONFLICT (id) DO NOTHING;
INSERT INTO relationships (id, project_slug, source, target, type)
VALUES ('R-002', 'arbitrum', 'offchain-labs', 'arbitrum-nova', 'founded')
ON CONFLICT (id) DO NOTHING;
INSERT INTO relationships (id, project_slug, source, target, type)
VALUES ('R-003', 'arbitrum', 'arbitrum-foundation', 'security-council', 'controls')
ON CONFLICT (id) DO NOTHING;
INSERT INTO relationships (id, project_slug, source, target, type)
VALUES ('R-004', 'arbitrum', 'arbitrum-foundation', 'arbitrum-dao', 'partnered')
ON CONFLICT (id) DO NOTHING;
INSERT INTO relationships (id, project_slug, source, target, type)
VALUES ('R-005', 'arbitrum', 'arbitrum-dao', 'arbitrum-one', 'governs')
ON CONFLICT (id) DO NOTHING;
INSERT INTO relationships (id, project_slug, source, target, type)
VALUES ('R-006', 'arbitrum', 'security-council', 'arbitrum-one', 'safeguards')
ON CONFLICT (id) DO NOTHING;
INSERT INTO relationships (id, project_slug, source, target, type)
VALUES ('R-007', 'arbitrum', 'steven-goldfeder', 'offchain-labs', 'leads')
ON CONFLICT (id) DO NOTHING;
INSERT INTO relationships (id, project_slug, source, target, type)
VALUES ('R-008', 'arbitrum', 'ed-felten', 'offchain-labs', 'founded')
ON CONFLICT (id) DO NOTHING;
INSERT INTO relationships (id, project_slug, source, target, type)
VALUES ('R-009', 'arbitrum', 'harry-kalodner', 'offchain-labs', 'founded')
ON CONFLICT (id) DO NOTHING;
INSERT INTO relationships (id, project_slug, source, target, type)
VALUES ('R-010', 'arbitrum', 'pantera-capital', 'offchain-labs', 'invested')
ON CONFLICT (id) DO NOTHING;
INSERT INTO relationships (id, project_slug, source, target, type)
VALUES ('R-011', 'arbitrum', 'lightspeed', 'offchain-labs', 'invested')
ON CONFLICT (id) DO NOTHING;
INSERT INTO relationships (id, project_slug, source, target, type)
VALUES ('R-012', 'arbitrum', 'polychain', 'offchain-labs', 'invested')
ON CONFLICT (id) DO NOTHING;
INSERT INTO relationships (id, project_slug, source, target, type)
VALUES ('R-013', 'arbitrum', 'delphi-digital', 'arbitrum-one', 'research')
ON CONFLICT (id) DO NOTHING;
INSERT INTO relationships (id, project_slug, source, target, type)
VALUES ('R-014', 'arbitrum', 'gmx', 'arbitrum-one', 'deployed-on')
ON CONFLICT (id) DO NOTHING;
INSERT INTO relationships (id, project_slug, source, target, type)
VALUES ('R-015', 'arbitrum', 'aave', 'arbitrum-one', 'deployed-on')
ON CONFLICT (id) DO NOTHING;
INSERT INTO relationships (id, project_slug, source, target, type)
VALUES ('R-016', 'arbitrum', 'uniswap', 'arbitrum-one', 'deployed-on')
ON CONFLICT (id) DO NOTHING;
INSERT INTO relationships (id, project_slug, source, target, type)
VALUES ('R-017', 'arbitrum', 'treasure-dao', 'arbitrum-nova', 'deployed-on')
ON CONFLICT (id) DO NOTHING;
INSERT INTO relationships (id, project_slug, source, target, type)
VALUES ('R-018', 'arbitrum', 'plutus-dao', 'arbitrum-dao', 'proposed')
ON CONFLICT (id) DO NOTHING;
INSERT INTO relationships (id, project_slug, source, target, type)
VALUES ('R-019', 'arbitrum', 'trail-of-bits', 'arbitrum-one', 'audited')
ON CONFLICT (id) DO NOTHING;
INSERT INTO relationships (id, project_slug, source, target, type)
VALUES ('R-020', 'arbitrum', 'gauntlet', 'arbitrum-one', 'risk-assessed')
ON CONFLICT (id) DO NOTHING;
INSERT INTO relationships (id, project_slug, source, target, type)
VALUES ('R-021', 'arbitrum', 'oat', 'arbitrum-foundation', 'audited')
ON CONFLICT (id) DO NOTHING;
INSERT INTO relationships (id, project_slug, source, target, type)
VALUES ('R-022', 'arbitrum', 'arbitrum-foundation', 'offchain-labs', 'partnered')
ON CONFLICT (id) DO NOTHING;
INSERT INTO relationships (id, project_slug, source, target, type)
VALUES ('R-023', 'arbitrum', 'offchain-labs', 'arbitrum-dao', 'leads')
ON CONFLICT (id) DO NOTHING;
INSERT INTO relationships (id, project_slug, source, target, type)
VALUES ('R-024', 'arbitrum', 'gmx', 'treasure-dao', 'partnered')
ON CONFLICT (id) DO NOTHING;
INSERT INTO relationships (id, project_slug, source, target, type)
VALUES ('R-025', 'arbitrum', 'franklin-templeton', 'arbitrum-one', 'deployed-on')
ON CONFLICT (id) DO NOTHING;
INSERT INTO relationships (id, project_slug, source, target, type)
VALUES ('R-026', 'arbitrum', 'curve-finance', 'arbitrum-one', 'deployed-on')
ON CONFLICT (id) DO NOTHING;
INSERT INTO relationships (id, project_slug, source, target, type)
VALUES ('R-027', 'arbitrum', 'blackrock', 'arbitrum-one', 'research')
ON CONFLICT (id) DO NOTHING;
INSERT INTO relationships (id, project_slug, source, target, type)
VALUES ('R-028', 'arbitrum', 'robinhood', 'arbitrum-one', 'partnered')
ON CONFLICT (id) DO NOTHING;
INSERT INTO relationships (id, project_slug, source, target, type)
VALUES ('R-029', 'arbitrum', 'binance', 'arbitrum-one', 'partnered')
ON CONFLICT (id) DO NOTHING;
INSERT INTO relationships (id, project_slug, source, target, type)
VALUES ('R-030', 'arbitrum', 'kraken', 'arbitrum-one', 'partnered')
ON CONFLICT (id) DO NOTHING;
INSERT INTO relationships (id, project_slug, source, target, type)
VALUES ('OR-001', 'optimism', 'op-labs', 'op-stack', 'founded')
ON CONFLICT (id) DO NOTHING;
INSERT INTO relationships (id, project_slug, source, target, type)
VALUES ('OR-002', 'optimism', 'op-foundation', 'op-collective', 'partnered')
ON CONFLICT (id) DO NOTHING;
INSERT INTO relationships (id, project_slug, source, target, type)
VALUES ('OR-003', 'optimism', 'op-collective', 'op-stack', 'governs')
ON CONFLICT (id) DO NOTHING;
INSERT INTO relationships (id, project_slug, source, target, type)
VALUES ('OR-004', 'optimism', 'op-security-council', 'op-stack', 'safeguards')
ON CONFLICT (id) DO NOTHING;
INSERT INTO relationships (id, project_slug, source, target, type)
VALUES ('OR-005', 'optimism', 'coinbase', 'base', 'founded')
ON CONFLICT (id) DO NOTHING;
INSERT INTO relationships (id, project_slug, source, target, type)
VALUES ('OR-006', 'optimism', 'base', 'op-stack', 'deployed-on')
ON CONFLICT (id) DO NOTHING;
INSERT INTO relationships (id, project_slug, source, target, type)
VALUES ('OR-007', 'optimism', 'worldcoin', 'op-stack', 'deployed-on')
ON CONFLICT (id) DO NOTHING;
INSERT INTO relationships (id, project_slug, source, target, type)
VALUES ('OR-008', 'optimism', 'velodrome', 'op-stack', 'deployed-on')
ON CONFLICT (id) DO NOTHING;
INSERT INTO relationships (id, project_slug, source, target, type)
VALUES ('OR-009', 'optimism', 'etherna', 'op-stack', 'deployed-on')
ON CONFLICT (id) DO NOTHING;
INSERT INTO relationships (id, project_slug, source, target, type)
VALUES ('OR-010', 'optimism', 'op-labs', 'op-collective', 'leads')
ON CONFLICT (id) DO NOTHING;
INSERT INTO relationships (id, project_slug, source, target, type)
VALUES ('OR-011', 'optimism', 'op-foundation', 'op-security-council', 'controls')
ON CONFLICT (id) DO NOTHING;

-- Events
INSERT INTO events (id, project_slug, name, date, type, participants, description, result, source, url, affected_knowledge, impact)
VALUES ('E-001', 'arbitrum', 'Offchain Labs founded', '2019-08-15', 'Founding', '["Offchain Labs","Ed Felten","Steven Goldfeder","Harry Kalodner"]'::jsonb, 'Offchain Labs incorporated in New York to build trust-minimized scaling technology for Ethereum, initially focused on Arbitrum Rollup research.', 'Company established; early Arbitrum prototype research begins.', 'Company announcement', 'https://offchainlabs.com', '["K-004"]'::jsonb, 'High')
ON CONFLICT (id) DO NOTHING;
INSERT INTO events (id, project_slug, name, date, type, participants, description, result, source, url, affected_knowledge, impact)
VALUES ('E-002', 'arbitrum', '$3.7M seed round led by Pantera', '2019-12-10', 'Funding', '["Offchain Labs","Pantera Capital"]'::jsonb, 'Seed round of $3.7M led by Pantera Capital to fund development of the Arbitrum rollup technology.', 'Development runway secured; team expanded.', 'TechCrunch', 'https://techcrunch.com', '["K-004"]'::jsonb, 'Medium')
ON CONFLICT (id) DO NOTHING;
INSERT INTO events (id, project_slug, name, date, type, participants, description, result, source, url, affected_knowledge, impact)
VALUES ('E-003', 'arbitrum', '$120M Series B led by Lightspeed', '2021-04-12', 'Funding', '["Offchain Labs","Lightspeed Venture Partners","Polychain Capital","Ribbit Capital"]'::jsonb, 'Series B of $120M at a $1.2B valuation led by Lightspeed, joined by Polychain and Ribbit, to scale the Arbitrum ecosystem.', 'Valuation $1.2B; hiring spree for mainnet launch.', 'The Block', 'https://theblock.co', '["K-004"]'::jsonb, 'Medium')
ON CONFLICT (id) DO NOTHING;
INSERT INTO events (id, project_slug, name, date, type, participants, description, result, source, url, affected_knowledge, impact)
VALUES ('E-004', 'arbitrum', 'Arbitrum One public beta', '2021-05-28', 'Launch', '["Offchain Labs"]'::jsonb, 'Arbitrum One launches in public beta on Ethereum mainnet, opening deposits to users and developers.', 'First users and protocols onboard; TVL grows past $500M within months.', 'Offchain Labs blog', 'https://offchainlabs.com/blog', '["K-009"]'::jsonb, 'High')
ON CONFLICT (id) DO NOTHING;
INSERT INTO events (id, project_slug, name, date, type, participants, description, result, source, url, affected_knowledge, impact)
VALUES ('E-005', 'arbitrum', 'Arbitrum Odyssey campaign', '2021-08-10', 'Market', '["Arbitrum One","GMX","SushiSwap","Treasure DAO"]'::jsonb, 'Arbitrum Odyssey — a multi-week on-chain activity campaign — drives a spike in transactions and attention across ecosystem protocols.', 'Network activity surge; gas spikes; campaign later paused and resumed.', 'Arbitrum blog', 'https://arbitrum.io', '["K-009"]'::jsonb, 'Medium')
ON CONFLICT (id) DO NOTHING;
INSERT INTO events (id, project_slug, name, date, type, participants, description, result, source, url, affected_knowledge, impact)
VALUES ('E-006', 'arbitrum', 'Nitro technology announced', '2022-06-01', 'Technology', '["Offchain Labs"]'::jsonb, 'Arbitrum Nitro announced — a full redesign of the Arbitrum stack with WASM-based fraud proofs and Geth integration.', 'Foundation for the 7× gas reduction upgrade.', 'Offchain Labs blog', 'https://offchainlabs.com/blog', '["K-006"]'::jsonb, 'High')
ON CONFLICT (id) DO NOTHING;
INSERT INTO events (id, project_slug, name, date, type, participants, description, result, source, url, affected_knowledge, impact)
VALUES ('E-007', 'arbitrum', 'Arbitrum Nova launched', '2022-08-11', 'Launch', '["Offchain Labs"]'::jsonb, 'Arbitrum Nova launches — an AnyTrust chain for high-throughput, low-cost social and gaming applications, with a data-availability committee.', 'Second production chain; Treasure ecosystem migrates.', 'Offchain Labs blog', 'https://offchainlabs.com/blog', '["K-012"]'::jsonb, 'High')
ON CONFLICT (id) DO NOTHING;
INSERT INTO events (id, project_slug, name, date, type, participants, description, result, source, url, affected_knowledge, impact)
VALUES ('E-008', 'arbitrum', 'Arbitrum One Nitro upgrade', '2022-08-31', 'Technology', '["Offchain Labs","Arbitrum One"]'::jsonb, 'Arbitrum One migrates to Nitro: ~7× reduction in gas costs and full EVM compatibility via Geth.', 'Fees drop sharply; TVL and usage accelerate.', 'Offchain Labs blog', 'https://offchainlabs.com/blog', '["K-006","K-009"]'::jsonb, 'High')
ON CONFLICT (id) DO NOTHING;
INSERT INTO events (id, project_slug, name, date, type, participants, description, result, source, url, affected_knowledge, impact)
VALUES ('E-009', 'arbitrum', 'ARB token launch and airdrop', '2023-03-23', 'Token', '["Arbitrum Foundation","Arbitrum DAO","ARB holders"]'::jsonb, 'ARB governance token launches with an airdrop of ~1.275B ARB to users and DAOs, alongside the establishment of the Arbitrum DAO.', 'One of the largest L2 airdrops; governance opens to token holders.', 'Arbitrum Foundation', 'https://arbitrum.foundation', '["K-002","K-001"]'::jsonb, 'High')
ON CONFLICT (id) DO NOTHING;
INSERT INTO events (id, project_slug, name, date, type, participants, description, result, source, url, affected_knowledge, impact)
VALUES ('E-010', 'arbitrum', 'Arbitrum Foundation established', '2023-03-16', 'Governance', '["Arbitrum Foundation","Offchain Labs"]'::jsonb, 'The Arbitrum Foundation is registered in the Cayman Islands to steward the DAO treasury and drive ecosystem growth.', 'Formal separation of protocol governance from Offchain Labs.', 'Arbitrum Foundation', 'https://arbitrum.foundation', '["K-004","K-001"]'::jsonb, 'High')
ON CONFLICT (id) DO NOTHING;
INSERT INTO events (id, project_slug, name, date, type, participants, description, result, source, url, affected_knowledge, impact)
VALUES ('E-011', 'arbitrum', '200M ARB delegated to PlutusDAO', '2023-03-24', 'Governance', '["PlutusDAO","Arbitrum Foundation","Arbitrum DAO"]'::jsonb, 'Shortly after launch, 200M ARB (~$700M at the time) is delegated to PlutusDAO, concentrating voting power in a single delegate.', 'Governance concentration alarm; delegation later redistributed after community pressure.', 'Nansen / on-chain analysis', 'https://nansen.ai', '["K-008","K-001"]'::jsonb, 'High')
ON CONFLICT (id) DO NOTHING;
INSERT INTO events (id, project_slug, name, date, type, participants, description, result, source, url, affected_knowledge, impact)
VALUES ('E-012', 'arbitrum', 'AIP-1 ratification controversy', '2023-04-02', 'Governance', '["Arbitrum Foundation","Arbitrum DAO"]'::jsonb, 'The Foundation moves 750M ARB to its own wallet citing AIP-1 ratification at a 0.01% quorum — far below the customary 5% threshold — triggering community backlash.', 'Foundation apologizes; new vote thresholds discussed; AIP-1 re-scoped.', 'Arbitrum forum / Snapshot', 'https://forum.arbitrum.foundation', '["K-001","K-003"]'::jsonb, 'High')
ON CONFLICT (id) DO NOTHING;
INSERT INTO events (id, project_slug, name, date, type, participants, description, result, source, url, affected_knowledge, impact)
VALUES ('E-013', 'arbitrum', 'STIP — 75M ARB incentive program', '2023-10-04', 'Governance', '["Arbitrum DAO","Arbitrum Foundation"]'::jsonb, 'The Short-Term Incentive Program (STIP) allocates 75M ARB to bootstrap liquidity and activity across ecosystem protocols.', 'TVL and volume grow materially; debates over long-term incentive efficacy.', 'Arbitrum forum / Tally', 'https://tally.xyz', '["K-010","K-009"]'::jsonb, 'High')
ON CONFLICT (id) DO NOTHING;
INSERT INTO events (id, project_slug, name, date, type, participants, description, result, source, url, affected_knowledge, impact)
VALUES ('E-014', 'arbitrum', 'BoLD protocol proposal', '2024-02-01', 'Technology', '["Offchain Labs","Arbitrum DAO"]'::jsonb, 'BoLD (Bold, Open, Limitless Dispute) proposal introduces permissionless validators and a bounded dispute window for Arbitrum chains.', 'Proposal accepted; rollout scheduled in phases.', 'Offchain Labs blog', 'https://offchainlabs.com/blog', '["K-011"]'::jsonb, 'High')
ON CONFLICT (id) DO NOTHING;
INSERT INTO events (id, project_slug, name, date, type, participants, description, result, source, url, affected_knowledge, impact)
VALUES ('E-015', 'arbitrum', 'Dencun / EIP-4844 mainnet', '2024-03-13', 'Technology', '["Ethereum","Arbitrum One","All L2s"]'::jsonb, 'Ethereum''s Dencun upgrade ships blobs (EIP-4844), cutting L2 data-availability costs by up to ~90%.', 'Arbitrum fees fall to sub-cent levels; usage surges.', 'Ethereum Foundation', 'https://ethereum.org', '["K-009"]'::jsonb, 'High')
ON CONFLICT (id) DO NOTHING;
INSERT INTO events (id, project_slug, name, date, type, participants, description, result, source, url, affected_knowledge, impact)
VALUES ('E-016', 'arbitrum', 'Timeboost proposal (TAP-5)', '2024-06-17', 'Governance', '["Arbitrum DAO","Offchain Labs"]'::jsonb, 'Timeboost — a time-auction MEV mechanism for the sequencer — is proposed, sparking debate on value extraction vs. user fairness.', 'Ongoing debate; implementation deferred pending further review.', 'Arbitrum forum', 'https://forum.arbitrum.foundation', '["K-007"]'::jsonb, 'Medium')
ON CONFLICT (id) DO NOTHING;
INSERT INTO events (id, project_slug, name, date, type, participants, description, result, source, url, affected_knowledge, impact)
VALUES ('E-017', 'arbitrum', 'Security Council rotation election', '2024-08-14', 'Security', '["Security Council","Arbitrum DAO"]'::jsonb, 'First major Security Council election cycle: six seats elected by the DAO, six retained by the Foundation-appointed cohort.', 'Council composition partially refreshed; multisig structure unchanged.', 'Arbitrum forum / Tally', 'https://tally.xyz', '["K-003"]'::jsonb, 'High')
ON CONFLICT (id) DO NOTHING;
INSERT INTO events (id, project_slug, name, date, type, participants, description, result, source, url, affected_knowledge, impact)
VALUES ('E-018', 'arbitrum', 'DAO tooling integrations (Tally, Aragon)', '2025-01-20', 'Integration', '["Arbitrum DAO","Tally","Aragon"]'::jsonb, 'Arbitrum DAO governance integrates modern tooling — Tally''s governance UI and Aragon-based structures — improving proposal discoverability.', 'Higher proposal participation and auditability.', 'Tally', 'https://tally.xyz', '["K-003"]'::jsonb, 'Low')
ON CONFLICT (id) DO NOTHING;
INSERT INTO events (id, project_slug, name, date, type, participants, description, result, source, url, affected_knowledge, impact)
VALUES ('E-019', 'arbitrum', 'Orbit ecosystem passes 100 chains', '2025-03-05', 'Integration', '["Arbitrum Foundation","Orbit chains","Offchain Labs"]'::jsonb, 'The Orbit L3 framework passes 100 launched chains, making it the most adopted L3 framework in the ecosystem.', 'Orbit consolidates as the default L3 standard.', 'Arbitrum Foundation', 'https://arbitrum.foundation', '["K-012"]'::jsonb, 'Medium')
ON CONFLICT (id) DO NOTHING;
INSERT INTO events (id, project_slug, name, date, type, participants, description, result, source, url, affected_knowledge, impact)
VALUES ('E-020', 'arbitrum', 'ARB staking proposal debate', '2025-06-11', 'Governance', '["Arbitrum DAO","ARB holders"]'::jsonb, 'Proposals to introduce ARB staking (yield on locked tokens) divide the DAO between value accrual and treasury sustainability.', 'Multiple drafts in discussion; no final ratification yet.', 'Arbitrum forum', 'https://forum.arbitrum.foundation', '["K-001","K-002"]'::jsonb, 'Medium')
ON CONFLICT (id) DO NOTHING;
INSERT INTO events (id, project_slug, name, date, type, participants, description, result, source, url, affected_knowledge, impact)
VALUES ('OP-001', 'optimism', 'Optimism launches as OVM 2.0', '2021-07-16', 'Launch', '["Optimism","OP Labs"]'::jsonb, 'Optimism launches on mainnet with OVM 2.0, a compatibility-focused optimistic VM for Ethereum scaling.', 'Early protocols onboard; fees and UX iterated quickly.', 'Optimism blog', 'https://optimism.io', '["OP-001"]'::jsonb, 'High')
ON CONFLICT (id) DO NOTHING;
INSERT INTO events (id, project_slug, name, date, type, participants, description, result, source, url, affected_knowledge, impact)
VALUES ('OP-002', 'optimism', 'OP token announced', '2022-04-27', 'Token', '["Optimism Foundation","OP Labs"]'::jsonb, 'The OP governance token is announced with a 4.29B initial supply, 2% annual inflation, and a large ecosystem fund.', 'Foundation of the Optimism Collective economy.', 'Optimism blog', 'https://optimism.io', '["OP-005"]'::jsonb, 'High')
ON CONFLICT (id) DO NOTHING;
INSERT INTO events (id, project_slug, name, date, type, participants, description, result, source, url, affected_knowledge, impact)
VALUES ('OP-003', 'optimism', 'OP airdrop round 1', '2022-05-31', 'Token', '["Optimism Foundation","OP holders"]'::jsonb, 'First OP airdrop distributes ~214M OP to early users, repeat users and DAOs participating in the ecosystem.', 'Governance opens to the widest holder base to date.', 'Optimism blog', 'https://optimism.io', '["OP-002"]'::jsonb, 'Medium')
ON CONFLICT (id) DO NOTHING;
INSERT INTO events (id, project_slug, name, date, type, participants, description, result, source, url, affected_knowledge, impact)
VALUES ('OP-004', 'optimism', 'Bedrock upgrade', '2023-06-06', 'Technology', '["OP Labs","Optimism"]'::jsonb, 'Bedrock — the modular OP Stack upgrade — ships EVM equivalence and reduced deposit times, laying the base for the Superchain.', 'Standardized chain architecture; fees and finality improved.', 'OP Labs blog', 'https://oplabs.co', '["OP-001","OP-006"]'::jsonb, 'High')
ON CONFLICT (id) DO NOTHING;
INSERT INTO events (id, project_slug, name, date, type, participants, description, result, source, url, affected_knowledge, impact)
VALUES ('OP-005', 'optimism', 'Base launches on OP Stack', '2023-08-09', 'Integration', '["Coinbase","OP Labs","Base"]'::jsonb, 'Coinbase''s Base L2 launches on the OP Stack, becoming the largest Superchain member and validating the open-source model.', 'Superchain TVL multiples; OP Stack adoption accelerates.', 'Base / Coinbase', 'https://base.org', '["OP-006"]'::jsonb, 'High')
ON CONFLICT (id) DO NOTHING;
INSERT INTO events (id, project_slug, name, date, type, participants, description, result, source, url, affected_knowledge, impact)
VALUES ('OP-006', 'optimism', 'RetroPGF Round 3', '2023-11-21', 'Governance', '["Optimism Collective","Citizens'' House"]'::jsonb, 'RetroPGF Round 3 distributes 30M OP to public-goods builders based on retrospective impact assessment by badgeholders.', '30M OP allocated across infrastructure, tools and education.', 'Optimism governance', 'https://community.optimism.io', '["OP-003"]'::jsonb, 'Medium')
ON CONFLICT (id) DO NOTHING;
INSERT INTO events (id, project_slug, name, date, type, participants, description, result, source, url, affected_knowledge, impact)
VALUES ('OP-007', 'optimism', 'Fault proof system goes live', '2024-03-11', 'Technology', '["OP Labs","Optimism"]'::jsonb, 'Permissionless fault proofs go live on OP Mainnet, allowing anyone to challenge invalid state transitions.', 'Major step toward trust-minimized operation of OP Mainnet.', 'OP Labs blog', 'https://oplabs.co', '["OP-007"]'::jsonb, 'High')
ON CONFLICT (id) DO NOTHING;
INSERT INTO events (id, project_slug, name, date, type, participants, description, result, source, url, affected_knowledge, impact)
VALUES ('OP-008', 'optimism', 'Superchain revenue share framework', '2024-06-04', 'Governance', '["Optimism Collective","Superchain members"]'::jsonb, 'The Collective proposes a revenue-share framework where Superchain chains contribute sequencer revenue to public goods.', 'Ongoing debate over fee capture and incentive alignment.', 'Optimism forum', 'https://gov.optimism.io', '["OP-006"]'::jsonb, 'Medium')
ON CONFLICT (id) DO NOTHING;
INSERT INTO events (id, project_slug, name, date, type, participants, description, result, source, url, affected_knowledge, impact)
VALUES ('OP-009', 'optimism', 'RetroPGF Round 4', '2024-07-31', 'Governance', '["Optimism Collective","Citizens'' House"]'::jsonb, 'RetroPGF Round 4 allocates 10M OP to early-stage builders, refining badgeholder processes.', 'Process iteration; smaller but more targeted round.', 'Optimism governance', 'https://community.optimism.io', '["OP-003"]'::jsonb, 'Low')
ON CONFLICT (id) DO NOTHING;
INSERT INTO events (id, project_slug, name, date, type, participants, description, result, source, url, affected_knowledge, impact)
VALUES ('OP-010', 'optimism', 'Governance restructure proposal', '2025-02-03', 'Governance', '["Optimism Collective","Token House","Citizens'' House"]'::jsonb, 'A major governance restructure proposal — merging Token House and Citizens'' House powers and streamlining councils — enters community review.', 'Draft phase; final vote expected mid-2025.', 'Optimism forum', 'https://gov.optimism.io', '["OP-002","OP-008"]'::jsonb, 'High')
ON CONFLICT (id) DO NOTHING;

-- Conflicts
INSERT INTO conflicts (id, project_slug, category, title, description, severity, status, version_a, version_b, resolution, affected_knowledge, affected_phase, updated_at)
VALUES ('C-001', 'arbitrum', 'Governance', 'AIP-1 ratification — 750M ARB treasury motion', 'The Arbitrum Foundation moved 750M ARB to its own wallet citing AIP-1 ratification, while the vote passed with only ~0.01% quorum — far below the customary governance threshold. The community disputed both the threshold and the legitimacy of the motion.', 'Critical', 'Resolved', '{"source":"Arbitrum Foundation","value":"AIP-1 was ratified on 2023-03-16 with majority support of votes cast. The 750M ARB operational budget is approved and held in a Foundation-controlled multisig.","date":"2023-04-02","url":"https://arbitrum.foundation","evidence":"Snapshot vote archive, Foundation announcement"}'::jsonb, '{"source":"Arbitrum DAO community","value":"AIP-1 passed with a 0.01% quorum, far below the customary 5%+ threshold. The motion is not a legitimate ratification and the treasury move must be reversed or re-voted.","date":"2023-04-05","url":"https://forum.arbitrum.foundation","evidence":"Forum thread, governance threshold analysis by delegates"}'::jsonb, 'The Foundation issued a formal apology, committed to governance process reform, and the DAO re-ran key votes with proper thresholds. Tally adopted minimum quorum standards thereafter.', '["K-001","K-003","K-004"]'::jsonb, 'Governance', '2023-04-20')
ON CONFLICT (id) DO NOTHING;
INSERT INTO conflicts (id, project_slug, category, title, description, severity, status, version_a, version_b, resolution, affected_knowledge, affected_phase, updated_at)
VALUES ('C-002', 'arbitrum', 'Governance', 'Treasury size — $400M vs $750M budget', 'Disagreement over the Foundation''s annual operating budget: the Foundation budgeted 750M ARB (~$1B), while delegates argued a leaner ~400M ARB budget aligned with ecosystem needs.', 'Medium', 'Resolved', '{"source":"Arbitrum Foundation","value":"750M ARB is needed for multi-year ecosystem growth, grants, and legal operations; a smaller budget would handicap the ecosystem race.","date":"2023-04-06","url":"https://arbitrum.foundation","evidence":"AIP-1 budget appendix"}'::jsonb, '{"source":"Delegate bloc (e.g., Michigan Blockchain)","value":"A 400M ARB budget is sufficient and a 750M allocation concentrates too much value under Foundation control.","date":"2023-04-08","url":"https://forum.arbitrum.foundation","evidence":"Delegate budget counter-proposal"}'::jsonb, 'Compromise: Foundation retained 750M ARB but with enhanced reporting obligations and quarterly disclosure commitments.', '["K-001"]'::jsonb, 'Governance', '2023-04-25')
ON CONFLICT (id) DO NOTHING;
INSERT INTO conflicts (id, project_slug, category, title, description, severity, status, version_a, version_b, resolution, affected_knowledge, affected_phase, updated_at)
VALUES ('C-003', 'arbitrum', 'Security', 'Security Council composition — 6 vs 12 elected seats', 'At launch, the Security Council had 12 members with 6 appointed by the Foundation. The community demanded full DAO election, while the Foundation argued for continuity during bootstrap.', 'High', 'Resolved', '{"source":"Arbitrum Foundation","value":"6 Foundation-appointed seats are necessary for operational continuity during the bootstrap phase; DAO elections phased in over time.","date":"2023-03-20","url":"https://arbitrum.foundation","evidence":"AIP-1 council design section"}'::jsonb, '{"source":"Community delegates","value":"A security council that can upgrade contracts must be fully DAO-elected; appointed seats create an unaccountable veto bloc.","date":"2023-04-10","url":"https://forum.arbitrum.foundation","evidence":"Governance working-group proposal"}'::jsonb, 'Compromise reached: 6 elected / 6 appointed at launch with a defined rotation schedule; first DAO elections held Aug 2024.', '["K-003"]'::jsonb, 'Security', '2024-08-20')
ON CONFLICT (id) DO NOTHING;
INSERT INTO conflicts (id, project_slug, category, title, description, severity, status, version_a, version_b, resolution, affected_knowledge, affected_phase, updated_at)
VALUES ('C-004', 'arbitrum', 'Security', 'Sequencer centralization', 'Offchain Labs operates the only sequencer for Arbitrum One. Analysts flag a single point of failure and MEV power; the team argues sequencing centralization is standard for L2s today.', 'High', 'Unresolved', '{"source":"Offchain Labs / Foundation","value":"A permissioned sequencer is a deliberate, standard L2 design that maximizes UX; decentralization can follow without compromising correctness guarantees.","date":"2024-03-01","url":"https://docs.arbitrum.io","evidence":"L2BEAT risk assessments, official docs"}'::jsonb, '{"source":"Independent researchers (L2BEAT)","value":"Sequencer centralization grants Offchain Labs unilateral ordering power and MEV extraction; a permissionless sequencing roadmap is required for trust-minimization.","date":"2024-03-15","url":"https://l2beat.com","evidence":"L2BEAT stage analysis — Stage 0/1 assessment"}'::jsonb, NULL, '["K-005","K-007"]'::jsonb, 'Technology', '2026-01-10')
ON CONFLICT (id) DO NOTHING;
INSERT INTO conflicts (id, project_slug, category, title, description, severity, status, version_a, version_b, resolution, affected_knowledge, affected_phase, updated_at)
VALUES ('C-005', 'arbitrum', 'Tokenomics', 'STIP funding amount — 50M vs 75M ARB', 'The Short-Term Incentive Program''s size was contested: a 50M ARB baseline proposal vs. an expanded 75M ARB version including gaming and derivatives verticals.', 'Low', 'Resolved', '{"source":"STIP authors","value":"75M ARB across all verticals maximizes ecosystem bootstrapping and matches competitive L2 incentive benchmarks.","date":"2023-09-18","url":"https://forum.arbitrum.foundation","evidence":"STIP proposal v2"}'::jsonb, '{"source":"Fiscal hawks (delegates)","value":"50M ARB is sufficient; 75M creates sell-pressure and rewards mercenary liquidity.","date":"2023-09-22","url":"https://forum.arbitrum.foundation","evidence":"Delegate objections in proposal thread"}'::jsonb, '75M ARB approved (Oct 2023) with per-vertical caps.', '["K-010"]'::jsonb, 'Governance', '2023-10-04')
ON CONFLICT (id) DO NOTHING;
INSERT INTO conflicts (id, project_slug, category, title, description, severity, status, version_a, version_b, resolution, affected_knowledge, affected_phase, updated_at)
VALUES ('C-006', 'arbitrum', 'Tokenomics', 'Timeboost — MEV value distribution', 'Timeboost (TAP-5) auctions transaction ordering to the highest bidder, with revenue to the DAO. Opponents argue it formalizes MEV extraction from users.', 'High', 'Unresolved', '{"source":"Offchain Labs / TAP-5 authors","value":"A time auction is the fairest MEV mechanism: it is transparent, captures value for the treasury, and can include user-protection features like time-in-trade.","date":"2024-06-17","url":"https://forum.arbitrum.foundation","evidence":"TAP-5 proposal text"}'::jsonb, '{"source":"User advocates / MEV researchers","value":"Any MEV auction institutionalizes extraction at user expense; funds should go to a burn or direct rebate, not the treasury.","date":"2024-07-02","url":"https://forum.arbitrum.foundation","evidence":"MEV research threads"}'::jsonb, NULL, '["K-007"]'::jsonb, 'Tokenomics', '2026-02-01')
ON CONFLICT (id) DO NOTHING;
INSERT INTO conflicts (id, project_slug, category, title, description, severity, status, version_a, version_b, resolution, affected_knowledge, affected_phase, updated_at)
VALUES ('C-007', 'arbitrum', 'Roadmap', 'BoLD activation timeline', 'Offchain Labs proposed a phased BoLD rollout (Nova first, then One). Some delegates demanded simultaneous activation on One, citing validator decentralization urgency.', 'Medium', 'Unresolved', '{"source":"Offchain Labs","value":"Phased activation de-risks the protocol; One follows after Nova proves the mechanism in production.","date":"2024-02-01","url":"https://offchainlabs.com/blog","evidence":"BoLD technical post"}'::jsonb, '{"source":"Delegates (e.g., Arbitrum governance WG)","value":"Deferring BoLD on One prolongs whitelisted-validator risk; both chains should activate on the same schedule.","date":"2024-02-20","url":"https://forum.arbitrum.foundation","evidence":"Governance WG position paper"}'::jsonb, NULL, '["K-011"]'::jsonb, 'Technology', '2026-01-22')
ON CONFLICT (id) DO NOTHING;
INSERT INTO conflicts (id, project_slug, category, title, description, severity, status, version_a, version_b, resolution, affected_knowledge, affected_phase, updated_at)
VALUES ('C-008', 'arbitrum', 'Data', 'Nova vs One TVL attribution', 'Ecosystem dashboards differ on how Nova''s TVL is attributed: some count only bridged ETH, others include token valuations — producing a wide spread in ''total Arbitrum TVL'' figures.', 'Low', 'Unresolved', '{"source":"DefiLlama","value":"Nova TVL should be counted at bridge value only (~$100M), making Arbitrum One the dominant chain by far.","date":"2025-06-01","url":"https://defillama.com","evidence":"DefiLlama chain pages"}'::jsonb, '{"source":"Arbitrum Foundation","value":"Ecosystem-wide reporting should include both chains'' applications and token balances, showing a materially larger combined footprint.","date":"2025-06-10","url":"https://arbitrum.foundation","evidence":"Foundation ecosystem report"}'::jsonb, NULL, '["K-009"]'::jsonb, 'Data', '2025-06-15')
ON CONFLICT (id) DO NOTHING;
INSERT INTO conflicts (id, project_slug, category, title, description, severity, status, version_a, version_b, resolution, affected_knowledge, affected_phase, updated_at)
VALUES ('C-009', 'arbitrum', 'Governance', 'Delegate concentration risk', 'Large delegated blocs (PlutusDAO 200M ARB, plus top-10 delegates) control a disproportionate share of voting power, raising capture risk in treasury votes.', 'Critical', 'Unresolved', '{"source":"Nansen / on-chain analytics","value":"Top delegates control >30% of liquid voting power; single proposals can pass with a handful of yes-votes.","date":"2023-04-15","url":"https://nansen.ai","evidence":"Delegate concentration dashboard"}'::jsonb, '{"source":"Arbitrum Foundation","value":"Concentration is transient post-airdrop; delegation is fluid and quorum requirements prevent capture of the full treasury.","date":"2023-05-01","url":"https://arbitrum.foundation","evidence":"Foundation governance note"}'::jsonb, NULL, '["K-008","K-001"]'::jsonb, 'Governance', '2026-01-28')
ON CONFLICT (id) DO NOTHING;
INSERT INTO conflicts (id, project_slug, category, title, description, severity, status, version_a, version_b, resolution, affected_knowledge, affected_phase, updated_at)
VALUES ('C-010', 'arbitrum', 'Tokenomics', 'ARB unlock schedule disclosure', 'Conflicting statements about when investor/team ARB unlocks begin: the token contract shows linear unlocks while early communications suggested cliff schedules.', 'Medium', 'Resolved', '{"source":"Token contract analysis","value":"ARB unlocks are linear from launch with no cliff — investor/team supply enters circulation immediately.","date":"2023-03-24","url":"https://etherscan.io","evidence":"Token vesting contract"}'::jsonb, '{"source":"Community interpretations","value":"A 12-month cliff was implied by the airdrop FAQ; early unlock would contradict the stated schedule.","date":"2023-03-26","url":"https://forum.arbitrum.foundation","evidence":"Airdrop FAQ archive"}'::jsonb, 'Foundation clarified linear-unlock mechanics in a governance FAQ; contract data confirmed as authoritative.', '["K-002"]'::jsonb, 'Tokenomics', '2023-04-01')
ON CONFLICT (id) DO NOTHING;
INSERT INTO conflicts (id, project_slug, category, title, description, severity, status, version_a, version_b, resolution, affected_knowledge, affected_phase, updated_at)
VALUES ('OP-C001', 'optimism', 'Tokenomics', 'OP inflation cap — 2% vs 0%', 'Debate over the 2% annual OP inflation, which funds the ecosystem fund: some holders demand disinflation, while the Foundation argues inflation funds RetroPGF and growth.', 'Low', 'Resolved', '{"source":"Optimism Foundation","value":"2% inflation is fully allocated to the ecosystem fund and public goods; removing it would starve the Collective''s core mechanism.","date":"2022-05-10","url":"https://optimism.io","evidence":"OP token economics post"}'::jsonb, '{"source":"OP holders","value":"Inflation dilutes holders; the ecosystem fund should be funded from sequencer revenue instead.","date":"2022-06-01","url":"https://gov.optimism.io","evidence":"Tokenomics forum debate"}'::jsonb, '2% inflation retained; sequencer revenue-share added as a complementary funding stream in 2024.', '["OP-005"]'::jsonb, 'Tokenomics', '2024-06-10')
ON CONFLICT (id) DO NOTHING;
INSERT INTO conflicts (id, project_slug, category, title, description, severity, status, version_a, version_b, resolution, affected_knowledge, affected_phase, updated_at)
VALUES ('OP-C002', 'optimism', 'Governance', 'RetroPGF allocation bias', 'Repeated analyses show RetroPGF rewards concentrate among a few projects and badgeholders, raising questions about capture and fairness of round-based allocation.', 'Medium', 'Unresolved', '{"source":"Independent analysts","value":"The top 10% of projects capture the majority of OP in each round; badgeholder overlap creates structural bias.","date":"2024-08-15","url":"https://gov.optimism.io","evidence":"Round allocation analyses"}'::jsonb, '{"source":"Optimism Foundation","value":"Concentration reflects impact variance; rounds are iterating (Round 4 added caps and new badgeholder cohorts) to improve distribution.","date":"2024-09-01","url":"https://community.optimism.io","evidence":"Foundation process notes"}'::jsonb, NULL, '["OP-010"]'::jsonb, 'Governance', '2026-01-05')
ON CONFLICT (id) DO NOTHING;
INSERT INTO conflicts (id, project_slug, category, title, description, severity, status, version_a, version_b, resolution, affected_knowledge, affected_phase, updated_at)
VALUES ('OP-C003', 'optimism', 'Governance', 'Governance restructure — one house or two', 'The 2025 restructure proposal consolidates the two-house model. Some community members defend the Citizens'' House as unique to Optimism; others argue it duplicates the Token House.', 'Medium', 'Unresolved', '{"source":"Restructure authors","value":"A unified Assembly with streamlined councils reduces complexity, speeds decisions, and keeps RetroPGF under the same accountability framework.","date":"2025-02-03","url":"https://gov.optimism.io","evidence":"Restructure draft proposal"}'::jsonb, '{"source":"Citizens'' House advocates","value":"Citizenship-based voting prevents plutocracy; merging houses would let large OP holders dominate public-goods funding.","date":"2025-03-01","url":"https://gov.optimism.io","evidence":"Counter-proposal threads"}'::jsonb, NULL, '["OP-002","OP-008"]'::jsonb, 'Governance', '2025-03-05')
ON CONFLICT (id) DO NOTHING;

-- QA dimensions & phases
INSERT INTO qa_dimensions (id, project_slug, key, label, score, weight, description, sort_order)
VALUES ('arbitrum-research', 'arbitrum', 'research', 'Research', 92, 15, 'Depth and breadth of primary-source research across governance, security and market domains.', 0)
ON CONFLICT (id) DO NOTHING;
INSERT INTO qa_dimensions (id, project_slug, key, label, score, weight, description, sort_order)
VALUES ('arbitrum-consistency', 'arbitrum', 'consistency', 'Consistency', 90, 10, 'How well knowledge statements agree across independent evidence chains.', 1)
ON CONFLICT (id) DO NOTHING;
INSERT INTO qa_dimensions (id, project_slug, key, label, score, weight, description, sort_order)
VALUES ('arbitrum-evidence', 'arbitrum', 'evidence', 'Evidence', 90, 20, 'Traceability of every claim to dated, sourced, weighted evidence.', 2)
ON CONFLICT (id) DO NOTHING;
INSERT INTO qa_dimensions (id, project_slug, key, label, score, weight, description, sort_order)
VALUES ('arbitrum-coverage', 'arbitrum', 'coverage', 'Coverage', 66, 10, 'Share of the intelligence surface (entities, events, conflicts) captured.', 3)
ON CONFLICT (id) DO NOTHING;
INSERT INTO qa_dimensions (id, project_slug, key, label, score, weight, description, sort_order)
VALUES ('arbitrum-conflict', 'arbitrum', 'conflict', 'Conflict', 82, 15, 'Completeness and quality of the conflict-resolution ledger.', 4)
ON CONFLICT (id) DO NOTHING;
INSERT INTO qa_dimensions (id, project_slug, key, label, score, weight, description, sort_order)
VALUES ('arbitrum-knowledge', 'arbitrum', 'knowledge', 'Knowledge', 88, 30, 'Number, maturity and stability of published knowledge items.', 5)
ON CONFLICT (id) DO NOTHING;
INSERT INTO qa_phases (id, project_slug, name, status, score, owner, sort_order)
VALUES ('arbitrum-phase-1', 'arbitrum', 'Research & Scoping', 'Passed', 92, 'Research Unit', 0)
ON CONFLICT (id) DO NOTHING;
INSERT INTO qa_phases (id, project_slug, name, status, score, owner, sort_order)
VALUES ('arbitrum-phase-2', 'arbitrum', 'Evidence Collection', 'Passed', 90, 'Evidence Unit', 1)
ON CONFLICT (id) DO NOTHING;
INSERT INTO qa_phases (id, project_slug, name, status, score, owner, sort_order)
VALUES ('arbitrum-phase-3', 'arbitrum', 'Conflict Resolution', 'In Progress', 74, 'Conflict Desk', 2)
ON CONFLICT (id) DO NOTHING;
INSERT INTO qa_phases (id, project_slug, name, status, score, owner, sort_order)
VALUES ('arbitrum-phase-4', 'arbitrum', 'Synthesis', 'In Progress', 82, 'Synthesis Unit', 3)
ON CONFLICT (id) DO NOTHING;
INSERT INTO qa_phases (id, project_slug, name, status, score, owner, sort_order)
VALUES ('arbitrum-phase-5', 'arbitrum', 'Publication', 'Not Started', 0, 'Publication Unit', 4)
ON CONFLICT (id) DO NOTHING;
INSERT INTO qa_dimensions (id, project_slug, key, label, score, weight, description, sort_order)
VALUES ('optimism-research', 'optimism', 'research', 'Research', 84, 15, 'Depth and breadth of primary-source research across governance, security and market domains.', 0)
ON CONFLICT (id) DO NOTHING;
INSERT INTO qa_dimensions (id, project_slug, key, label, score, weight, description, sort_order)
VALUES ('optimism-consistency', 'optimism', 'consistency', 'Consistency', 80, 10, 'How well knowledge statements agree across independent evidence chains.', 1)
ON CONFLICT (id) DO NOTHING;
INSERT INTO qa_dimensions (id, project_slug, key, label, score, weight, description, sort_order)
VALUES ('optimism-evidence', 'optimism', 'evidence', 'Evidence', 78, 20, 'Traceability of every claim to dated, sourced, weighted evidence.', 2)
ON CONFLICT (id) DO NOTHING;
INSERT INTO qa_dimensions (id, project_slug, key, label, score, weight, description, sort_order)
VALUES ('optimism-coverage', 'optimism', 'coverage', 'Coverage', 81, 10, 'Share of the intelligence surface (entities, events, conflicts) captured.', 3)
ON CONFLICT (id) DO NOTHING;
INSERT INTO qa_dimensions (id, project_slug, key, label, score, weight, description, sort_order)
VALUES ('optimism-conflict', 'optimism', 'conflict', 'Conflict', 70, 15, 'Completeness and quality of the conflict-resolution ledger.', 4)
ON CONFLICT (id) DO NOTHING;
INSERT INTO qa_dimensions (id, project_slug, key, label, score, weight, description, sort_order)
VALUES ('optimism-knowledge', 'optimism', 'knowledge', 'Knowledge', 78, 30, 'Number, maturity and stability of published knowledge items.', 5)
ON CONFLICT (id) DO NOTHING;
INSERT INTO qa_phases (id, project_slug, name, status, score, owner, sort_order)
VALUES ('optimism-phase-1', 'optimism', 'Research & Scoping', 'Passed', 84, 'Research Unit', 0)
ON CONFLICT (id) DO NOTHING;
INSERT INTO qa_phases (id, project_slug, name, status, score, owner, sort_order)
VALUES ('optimism-phase-2', 'optimism', 'Evidence Collection', 'Passed', 80, 'Evidence Unit', 1)
ON CONFLICT (id) DO NOTHING;
INSERT INTO qa_phases (id, project_slug, name, status, score, owner, sort_order)
VALUES ('optimism-phase-3', 'optimism', 'Conflict Resolution', 'In Progress', 70, 'Conflict Desk', 2)
ON CONFLICT (id) DO NOTHING;
INSERT INTO qa_phases (id, project_slug, name, status, score, owner, sort_order)
VALUES ('optimism-phase-4', 'optimism', 'Synthesis', 'In Progress', 78, 'Synthesis Unit', 3)
ON CONFLICT (id) DO NOTHING;
INSERT INTO qa_phases (id, project_slug, name, status, score, owner, sort_order)
VALUES ('optimism-phase-5', 'optimism', 'Publication', 'Not Started', 0, 'Publication Unit', 4)
ON CONFLICT (id) DO NOTHING;

-- Behavior profiles
INSERT INTO behavior_profiles (project_slug, strategic_objectives, decision_patterns, risk_response, trade_offs)
VALUES ('arbitrum', '["Capture #1 position among Ethereum L2s via low fees and high throughput (Nitro, BoLD).","Expand the ecosystem surface through Orbit L3 chains and the ArbitrumOne/Nova dual-chain strategy.","Restore governance legitimacy after the AIP-1 ratification controversy.","Grow real economic activity (TVL, stablecoins, DEX volume) rather than raw airdrop farming."]'::jsonb, '["Foundation acts first, seeks retroactive DAO ratification (e.g., 750M ARB treasury motion).","Rapid technical iteration — Nitro, BoLD and Timeboost shipped on aggressive timelines.","Heavy use of token incentives (STIP, delegation campaigns) to bootstrap liquidity and participation.","Delegation-driven governance: large delegated blocs (PlutusDAO) move proposals."]'::jsonb, '["Aggressive — deploy first, refine later; relies on the Security Council as backstop.","Post-incident remediation via governance apologies and re-votes (AIP-1).","Centralization of sequencer accepted as short-term trade-off, contested by community."]'::jsonb, '["Decentralization vs. execution speed.","Short-term incentive spend vs. long-term treasury health.","Permissioned sequencer UX vs. trust-minimized operations."]'::jsonb)
ON CONFLICT (project_slug) DO NOTHING;
INSERT INTO behavior_profiles (project_slug, strategic_objectives, decision_patterns, risk_response, trade_offs)
VALUES ('optimism', '["Build the Superchain: a network of interoperable, standardized L2s sharing liquidity.","Fund public goods at scale through RetroPGF and the Citizens'' House.","Champion open-source infrastructure (OP Stack) as the default L2 standard."]'::jsonb, '["Community-first governance with a two-house model (Token House + Citizens'' House).","Deliberative, proposal-heavy culture with long comment periods.","Long-horizon retroactive funding that rewards shipped impact rather than promises."]'::jsonb, '["Conservative — phased rollouts with extensive testnet validation (Bedrock, fault proofs).","Progressive decentralization: fault proofs and permissionless verification before trust cuts.","Transparent public-good accounting via the Optimism Foundation reports."]'::jsonb, '["Speed vs. deliberation.","Openness and modularity vs. coordination overhead.","Public-goods spend vs. token holder returns."]'::jsonb)
ON CONFLICT (project_slug) DO NOTHING;
