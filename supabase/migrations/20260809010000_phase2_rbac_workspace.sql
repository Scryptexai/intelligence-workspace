-- ═══════════════════════════════════════════════════════════════════════════
-- PHASE 2 — RBAC & WORKSPACE (RLS per role) + Project Templates
-- ═══════════════════════════════════════════════════════════════════════════
-- Menindaklanjuti Phase 0 (workspaces/workspace_members + kolom provenance):
--  1) Helper cif_workspace_role() — role user dalam satu workspace
--     (dari workspace_members ∩ auth.uid(); null bila bukan anggota).
--  2) RLS ENABLE + policy pada 16 tabel inti, berbasis role:
--       viewer → SELECT (anggota workspace)
--       editor → INSERT/UPDATE (admin/editor)
--       admin  → DELETE (+ semua di atas)
--  3) workspace_members: admin workspace boleh INSERT/UPDATE/DELETE anggota;
--     anggota boleh SELECT keanggotaan sendiri (policy Phase 0 dipertahankan).
--  4) workspaces: admin boleh UPDATE (nama/deskripsi/settings).
--  5) Index workspace_id pada tabel inti.
--
-- IDEMPOTEN: aman dijalankan ulang (DROP POLICY IF EXISTS + CREATE,
-- IF NOT EXISTS, CREATE OR REPLACE, DO $$ … $$).
--
-- ⚠️ CATATAN KEAMANAN: setelah migrasi ini, role anon (publishable key)
-- TIDAK lagi bisa membaca tabel inti (tidak ada policy anon) — hanya
-- authenticated anggota workspace. Service key (aplikasi server-side) tetap
-- bypass RLS, jadi aplikasi tidak terpengaruh. Bila ingin read-only anon
-- untuk demo, tambahkan policy SELECT anon (contoh di bawah, dikomentari).
-- ═══════════════════════════════════════════════════════════════════════════

-- ---------------------------------------------------------------------------
-- 1. HELPER — role user dalam workspace
-- ---------------------------------------------------------------------------
-- SECURITY DEFINER + SET search_path: membaca workspace_members tanpa
-- terhalang RLS tabel itu sendiri. auth.uid() = sub JWT (null tanpa auth).
CREATE OR REPLACE FUNCTION public.cif_workspace_role(p_workspace_id uuid)
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT wm.role::text
  FROM public.workspace_members AS wm
  WHERE wm.workspace_id = p_workspace_id
    AND wm.user_id = auth.uid()
  LIMIT 1;
$$;

-- ---------------------------------------------------------------------------
-- 2. RLS PADA 16 TABEL INTI
-- ---------------------------------------------------------------------------
-- Policy (per tabel, di-drop lalu dibuat ulang agar idempoten):
--   <tabel>_viewer_select : SELECT — anggota workspace mana pun
--   <tabel>_editor_write  : INSERT/UPDATE — admin/editor workspace
--   <tabel>_admin_delete  : DELETE — admin workspace
-- Baris dengan workspace_id NULL (belum di-backfill) diperlakukan sebagai
-- workspace default (uuid tetap Phase 0).
DO $$
DECLARE
  t text;
  default_ws constant text := '00000000-0000-0000-0000-000000000001';
  has_ws_col boolean;
BEGIN
  FOREACH t IN ARRAY ARRAY[
    'behavior_profiles', 'conflicts', 'entities', 'events', 'evidence_items',
    'knowledge_items', 'notes', 'projects', 'qa_dimensions', 'qa_phases',
    'relationships', 'saved_views', 'users',
    'cif_patterns', 'cif_backtests', 'cif_decision_events'
  ] LOOP
    IF to_regclass('public.' || t) IS NOT NULL THEN
      -- hanya proses bila kolom workspace_id ada (provenance Phase 0)
      EXECUTE format(
        'SELECT EXISTS (SELECT 1 FROM information_schema.columns
           WHERE table_schema = ''public'' AND table_name = %L AND column_name = ''workspace_id'')',
        t
      ) INTO has_ws_col;
      IF has_ws_col THEN
        EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', t);

        EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', t || '_viewer_select', t);
        EXECUTE format(
          'CREATE POLICY %I ON public.%I FOR SELECT TO authenticated
             USING ( public.cif_workspace_role(COALESCE(workspace_id, %L)) IS NOT NULL )',
          t || '_viewer_select', t, default_ws
        );

        EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', t || '_editor_insert', t);
        EXECUTE format(
          'CREATE POLICY %I ON public.%I FOR INSERT TO authenticated
             WITH CHECK ( public.cif_workspace_role(COALESCE(workspace_id, %L)) IN (''admin'', ''editor'') )',
          t || '_editor_insert', t, default_ws
        );
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', t || '_editor_update', t);
        EXECUTE format(
          'CREATE POLICY %I ON public.%I FOR UPDATE TO authenticated
             USING ( public.cif_workspace_role(COALESCE(workspace_id, %L)) IN (''admin'', ''editor'') )
             WITH CHECK ( public.cif_workspace_role(COALESCE(workspace_id, %L)) IN (''admin'', ''editor'') )',
          t || '_editor_update', t, default_ws, default_ws
        );

        EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', t || '_admin_delete', t);
        EXECUTE format(
          'CREATE POLICY %I ON public.%I FOR DELETE TO authenticated
             USING ( public.cif_workspace_role(COALESCE(workspace_id, %L)) = ''admin'' )',
          t || '_admin_delete', t, default_ws
        );

        EXECUTE format('CREATE INDEX IF NOT EXISTS %I ON public.%I (workspace_id)',
          t || '_workspace_id_idx', t);
      END IF;
    END IF;
  END LOOP;
END $$;

-- ---------------------------------------------------------------------------
-- 3. WORKSPACE_MEMBERS — admin kelola anggota (policy Phase 0 dipertahankan)
-- ---------------------------------------------------------------------------
-- (Phase 0 sudah: SELECT sendiri + RLS enabled)

DROP POLICY IF EXISTS "workspace_members_admin_insert" ON public.workspace_members;
CREATE POLICY "workspace_members_admin_insert"
  ON public.workspace_members FOR INSERT TO authenticated
  WITH CHECK ( public.cif_workspace_role(workspace_id) = 'admin' );

DROP POLICY IF EXISTS "workspace_members_admin_update" ON public.workspace_members;
CREATE POLICY "workspace_members_admin_update"
  ON public.workspace_members FOR UPDATE TO authenticated
  USING ( public.cif_workspace_role(workspace_id) = 'admin' );

DROP POLICY IF EXISTS "workspace_members_admin_delete" ON public.workspace_members;
CREATE POLICY "workspace_members_admin_delete"
  ON public.workspace_members FOR DELETE TO authenticated
  USING ( public.cif_workspace_role(workspace_id) = 'admin' );

-- ---------------------------------------------------------------------------
-- 4. WORKSPACES — admin boleh mengubah metadata workspace
-- ---------------------------------------------------------------------------

DROP POLICY IF EXISTS "workspaces_admin_update" ON public.workspaces;
CREATE POLICY "workspaces_admin_update"
  ON public.workspaces FOR UPDATE TO authenticated
  USING ( public.cif_workspace_role(id) = 'admin' );

-- ---------------------------------------------------------------------------
-- (Opsional, dikomentari) policy anon read-only bila ingin membuka data
-- untuk publishable key — TIDAK aktif secara default (enterprise = akses
-- authenticated saja).
-- ---------------------------------------------------------------------------
-- CREATE POLICY "projects_anon_read" ON public.projects FOR SELECT TO anon
--   USING ( true );

-- ═══════════════════════════════════════════════════════════════════════════
-- SELESAI — verifikasi cepat:
--   SELECT * FROM pg_policies WHERE schemaname='public' ORDER BY tablename;
--   SELECT public.cif_workspace_role('00000000-0000-0000-0000-000000000001');
-- ═══════════════════════════════════════════════════════════════════════════
