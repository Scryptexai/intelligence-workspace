-- ============================================================
-- Intelligence Workspace — SEED DATA untuk Supabase
-- ============================================================
-- Cara pakai:
--   1. Jalankan drizzle migration:  npx drizzle-kit push   (dengan DATABASE_URL Supabase)
--   2. Atau eksekusi file  drizzle/0000_*.sql  di SQL Editor Supabase
--   3. Lalu eksekusi file ini untuk mengisi data contoh (Arbitrum & Optimism)
--
-- Alternatif penuh:  npx tsx src/db/seed.ts   (mengisi SEMUA data dari lib/data)
-- ============================================================

-- Projek dasar
INSERT INTO projects (id, slug, name, symbol, tagline, description, color, accent, status, cif_score, confidence, knowledge_count, conflict_count, coverage, entity_count, event_count, last_updated, last_activity_hours, tags)
VALUES
('arbitrum', 'arbitrum', 'ARBITRUM', 'ARB', 'Ethereum L2 · Optimistic Rollup · Nitro Stack',
 'Arbitrum is the leading optimistic-rollup L2 for Ethereum, operated by the Arbitrum Foundation with technology from Offchain Labs.',
 '#22d3ee', '#0e7490', 'active', 86.1, 86, 12, 10, 66, 27, 20, '2026-02-14', 2, '["L2","Optimistic Rollup","Governance","Nitro"]'::jsonb),
('optimism', 'optimism', 'OPTIMISM', 'OP', 'Ethereum L2 · OP Stack · Superchain',
 'Optimism is the Superchain flagship L2, built on the open-source OP Stack.',
 '#a78bfa', '#6d28d9', 'active', 78.4, 81, 10, 3, 81, 10, 10, '2026-02-11', 5, '["L2","OP Stack","Superchain","RetroPGF"]'::jsonb)
ON CONFLICT (id) DO NOTHING;

-- Contoh knowledge + evidence (Arbitrum)
INSERT INTO knowledge_items (id, project_slug, name, category, description, confidence, status, updated_at, author, related_knowledge, dependencies)
VALUES
('K-001', 'arbitrum', 'DAO Treasury — ~4.5B ARB under DAO control', 'Governance',
 'The Arbitrum DAO controls roughly 4.5B ARB — the largest treasury in the L2 ecosystem.',
 92, 'Stable', '2026-01-28', 'Treasury Unit', '["K-002","K-003","K-004"]'::jsonb, '["E-009","E-012","E-013"]'::jsonb)
ON CONFLICT (id) DO NOTHING;

INSERT INTO evidence_items (id, knowledge_id, event_id, event_name, date, source, url, weight, note, sort_order)
VALUES
('EV-001-1', 'K-001', 'E-012', 'AIP-1 ratification controversy', '2023-04-02', 'Arbitrum forum', 'https://forum.arbitrum.foundation', 5, 'Foundation confirmed 750M ARB operational budget.', 0)
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- Data LENGKAP (semua knowledge, entities, events, conflicts,
-- QA, behavior) diisi otomatis dengan:
--   npx tsx src/db/seed.ts
-- ============================================================
