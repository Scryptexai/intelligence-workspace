-- ═══════════════════════════════════════════════════════════════════════════
-- FILE GABUNGAN (convenience) — PHASE 0 + PHASE 2 enterprise
-- ═══════════════════════════════════════════════════════════════════════════
-- Cara pakai: buka Supabase Dashboard → SQL Editor → tempel SEMUA isi file
-- ini → Run. SEKALI JALAN (kedua bagian idempoten, aman dijalankan ulang).
--
-- Isi:
--   [1] Phase 0 — multitenant & audit trail
--       workspaces + workspace_members + audit_log + trigger cif_audit_row()
--       + kolom provenance + RLS dasar
--   [2] Phase 2 — RBAC & Workspace penuh
--       helper cif_workspace_role() + RLS per role (viewer/editor/admin)
--       pada 16 tabel inti + admin kelola anggota workspace
--
-- ⚠️ Setelah migrasi ini: role anon (publishable key) TIDAK bisa lagi membaca
-- tabel inti (hanya authenticated + service key). Bila ingin buka read anon,
-- lihat komentar di bagian Phase 2.
--
-- File ini di-generate otomatis dari dua migrasi sumber — jangan diedit
-- manual; edit sumbernya lalu regenerate.
-- ═══════════════════════════════════════════════════════════════════════════

-- ═══════════════════════════════════════════════════════════════════════════
-- PHASE 0 — MULTI-TENANT & AUDIT TRAIL (enterprise foundation)
-- ═══════════════════════════════════════════════════════════════════════════
-- 1) workspaces + workspace_members  (multi-tenant; RBAC penuh = Phase 2)
-- 2) audit_log append-only + trigger cif_audit_row() (security definer)
--    pada ~16 tabel inti (13 tabel schema.sql + cif_patterns/cif_backtests/
--    cif_decision_events bila ada)
-- 3) Kolom provenance additif di tabel inti: workspace_id, source,
--    source_url, connector, ingested_at (semua nullable, backfill
--    workspace_id → workspace default)
-- 4) RLS: audit_log TANPA policy anon (server-only read via service key);
--    workspaces/workspace_members hanya bisa dibaca anggota (authenticated).
--
-- IDEMPOTEN: aman dijalankan ulang kapan saja (IF NOT EXISTS / OR REPLACE /
-- DO $$ … $$). Tidak menghapus / mengubah data existing.
-- ═══════════════════════════════════════════════════════════════════════════

-- ---------------------------------------------------------------------------
-- 1. WORKSPACES & WORKSPACE_MEMBERS
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.workspaces (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text UNIQUE,
  description text,
  settings jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Workspace default dengan uuid tetap — semua data existing di-backfill ke sini.
INSERT INTO public.workspaces (id, name, slug, description)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  'CIF Research',
  'cif-research',
  'Workspace default — seluruh data CIF yang ada sebelum migrasi Phase 0.'
)
ON CONFLICT (id) DO NOTHING;

-- user_id mengacu auth.users (uuid). FK dibuat ter-guard agar migrasi tetap
-- idempoten dan tidak gagal bila dijalankan di luar Supabase (tanpa auth schema).
CREATE TABLE IF NOT EXISTS public.workspace_members (
  workspace_id uuid NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  role text NOT NULL DEFAULT 'viewer' CHECK (role IN ('admin', 'editor', 'viewer')),
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (workspace_id, user_id)
);

DO $$
BEGIN
  IF to_regclass('auth.users') IS NOT NULL
     AND NOT EXISTS (
       SELECT 1 FROM pg_constraint
       WHERE conname = 'workspace_members_user_id_fkey'
         AND conrelid = 'public.workspace_members'::regclass
     ) THEN
    ALTER TABLE public.workspace_members
      ADD CONSTRAINT workspace_members_user_id_fkey
      FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
  END IF;
END $$;

-- ---------------------------------------------------------------------------
-- 2. AUDIT LOG (append-only)
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.audit_log (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  table_name text NOT NULL,
  row_id text,
  action text NOT NULL CHECK (action IN ('INSERT', 'UPDATE', 'DELETE')),
  old_data jsonb,
  new_data jsonb,
  changed_fields jsonb DEFAULT '[]'::jsonb,
  actor_label text,
  actor_id text,
  workspace_id text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS audit_log_table_idx ON public.audit_log (table_name);
CREATE INDEX IF NOT EXISTS audit_log_row_idx ON public.audit_log (row_id);
CREATE INDEX IF NOT EXISTS audit_log_created_idx ON public.audit_log (created_at DESC);

-- Penjaga append-only: UPDATE/DELETE langsung ditolak (bahkan untuk service key).
CREATE OR REPLACE FUNCTION public.cif_audit_log_guard()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  RAISE EXCEPTION 'audit_log is append-only: row % cannot be modified/deleted', OLD.id
    USING ERRCODE = '55000';
END;
$$;

DROP TRIGGER IF EXISTS trg_audit_log_guard ON public.audit_log;
CREATE TRIGGER trg_audit_log_guard
  BEFORE UPDATE OR DELETE ON public.audit_log
  FOR EACH ROW EXECUTE FUNCTION public.cif_audit_log_guard();

-- ---------------------------------------------------------------------------
-- 3. TRIGGER AUDIT INTI — cif_audit_row()
-- ---------------------------------------------------------------------------
-- SECURITY DEFINER: trigger menulis ke audit_log tanpa terhalang RLS audit_log.
-- SET search_path mencegah hijack fungsi saat runtime.
-- Actor: dari JWT claims (sub → actor_id, email/name/role → actor_label);
-- tanpa JWT (service key / internal) → 'system'.
-- row_id: kolom PK tiap tabel (CASE per tabel; default `id`).
CREATE OR REPLACE FUNCTION public.cif_audit_row()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_old_data   jsonb;
  v_new_data   jsonb;
  v_changed    jsonb := '[]'::jsonb;
  v_row_id     text;
  v_actor_id   text := 'system';
  v_actor_label text := 'system';
  v_workspace_id text;
  v_claims     text;
  v_claims_json jsonb;
  v_keys       text[];
BEGIN
  -- actor dari JWT claims (kosong saat service key / internal)
  v_claims := NULLIF(current_setting('request.jwt.claims', true), '');
  IF v_claims IS NOT NULL THEN
    BEGIN
      v_claims_json := v_claims::jsonb;
      v_actor_id   := NULLIF(v_claims_json ->> 'sub', '');
      v_actor_label := NULLIF(
        COALESCE(v_claims_json ->> 'email', v_claims_json ->> 'name', v_claims_json ->> 'role'),
        ''
      );
    EXCEPTION WHEN OTHERS THEN
      v_actor_id := NULL;
      v_actor_label := NULL;
    END;
  END IF;
  v_actor_id := COALESCE(v_actor_id, 'system');
  v_actor_label := COALESCE(v_actor_label, v_actor_id, 'system');

  -- workspace_id dari kolom provenance bila ada (tidak pernah melempar)
  v_workspace_id := NULL;
  IF TG_OP <> 'DELETE' AND to_jsonb(NEW) ? 'workspace_id' THEN
    v_workspace_id := to_jsonb(NEW) ->> 'workspace_id';
  ELSIF TG_OP = 'DELETE' AND to_jsonb(OLD) ? 'workspace_id' THEN
    v_workspace_id := to_jsonb(OLD) ->> 'workspace_id';
  END IF;

  -- row_id: tabel tanpa kolom `id` (behavior_profiles) dihandle CASE khusus.
  -- Catatan PENTING: PL/pgSQL menganalisis ekspresi CASE secara keseluruhan —
  -- referensi field statis (mis. NEW.project_slug) akan ERROR pada tabel yang
  -- tidak punya kolom itu (projects, notes, saved_views, users). Karena itu
  -- SEMUA akses record lewat to_jsonb(NEW)/to_jsonb(OLD) ->> 'kolom' yang
  -- mengembalikan NULL bila kolom tidak ada (aman untuk semua tabel), dan
  -- pada trigger DELETE record NEW memang tidak ter-assign.
  v_row_id := CASE TG_TABLE_NAME
    WHEN 'behavior_profiles' THEN
      CASE WHEN TG_OP = 'DELETE'
        THEN to_jsonb(OLD) ->> 'project_slug'
        ELSE to_jsonb(NEW) ->> 'project_slug'
      END
    ELSE
      CASE WHEN TG_OP = 'DELETE'
        THEN to_jsonb(OLD) ->> 'id'
        ELSE to_jsonb(NEW) ->> 'id'
      END
  END;

  IF TG_OP = 'INSERT' THEN
    v_old_data := NULL;
    v_new_data := to_jsonb(NEW);
    SELECT COALESCE(array_agg(k ORDER BY k), '{}'::text[])
      INTO v_keys FROM jsonb_object_keys(v_new_data) AS k;
  ELSIF TG_OP = 'UPDATE' THEN
    v_old_data := to_jsonb(OLD);
    v_new_data := to_jsonb(NEW);
    -- field yang nilainya berubah + field baru yang muncul
    SELECT COALESCE(array_agg(k ORDER BY k), '{}'::text[])
      INTO v_keys
      FROM (
        SELECT k FROM jsonb_object_keys(v_old_data) AS k
          WHERE (v_old_data -> k) IS DISTINCT FROM (v_new_data -> k)
        UNION
        SELECT k FROM jsonb_object_keys(v_new_data) AS k
          WHERE NOT (v_old_data ? k)
      ) AS changed;
  ELSE -- DELETE
    v_old_data := to_jsonb(OLD);
    v_new_data := NULL;
    SELECT COALESCE(array_agg(k ORDER BY k), '{}'::text[])
      INTO v_keys FROM jsonb_object_keys(v_old_data) AS k;
  END IF;

  SELECT COALESCE(jsonb_agg(k), '[]'::jsonb) INTO v_changed
    FROM unnest(v_keys) AS k;

  INSERT INTO public.audit_log (
    table_name, row_id, action, old_data, new_data,
    changed_fields, actor_label, actor_id, workspace_id, created_at
  ) VALUES (
    TG_TABLE_NAME, v_row_id, TG_OP, v_old_data, v_new_data,
    v_changed, v_actor_label, v_actor_id, v_workspace_id, now()
  );

  RETURN NULL;
END;
$$;

-- ---------------------------------------------------------------------------
-- 4. KOLOM PROVENANCE + TRIGGER PADA TABEL INTI (idempoten, ter-guard)
-- ---------------------------------------------------------------------------

DO $$
DECLARE
  t text;
  c text;
  default_ws constant text := '00000000-0000-0000-0000-000000000001';
BEGIN
  FOREACH t IN ARRAY ARRAY[
    'behavior_profiles', 'conflicts', 'entities', 'events', 'evidence_items',
    'knowledge_items', 'notes', 'projects', 'qa_dimensions', 'qa_phases',
    'relationships', 'saved_views', 'users',
    'cif_patterns', 'cif_backtests', 'cif_decision_events'
  ] LOOP
    IF to_regclass('public.' || t) IS NOT NULL THEN
      -- workspace_id dengan DEFAULT: baris existing ikut terisi (fast default
      -- PG 11+), dan INSERT baru tanpa nilai eksplisit otomatis masuk workspace
      -- default. Kolom tetap nullable (provenance additif).
      EXECUTE format(
        'ALTER TABLE public.%I ADD COLUMN IF NOT EXISTS workspace_id uuid DEFAULT %L',
        t, default_ws
      );
      FOREACH c IN ARRAY ARRAY[
        'source text', 'source_url text', 'connector text', 'ingested_at timestamptz'
      ] LOOP
        EXECUTE format('ALTER TABLE public.%I ADD COLUMN IF NOT EXISTS %s', t, c);
      END LOOP;
      -- backfill workspace_id → workspace default (idempoten: hanya yang NULL)
      EXECUTE format(
        'UPDATE public.%I SET workspace_id = %L WHERE workspace_id IS NULL',
        t, '00000000-0000-0000-0000-000000000001'
      );
      -- trigger audit (re-create agar definisi terbaru selalu terpasang)
      EXECUTE format('DROP TRIGGER IF EXISTS trg_%s_audit ON public.%I', t, t);
      EXECUTE format(
        'CREATE TRIGGER trg_%s_audit AFTER INSERT OR UPDATE OR DELETE ON public.%I FOR EACH ROW EXECUTE FUNCTION public.cif_audit_row()',
        t, t
      );
    END IF;
  END LOOP;
END $$;

-- ---------------------------------------------------------------------------
-- 5. ROW LEVEL SECURITY
-- ---------------------------------------------------------------------------
-- audit_log: TANPA policy apa pun → tidak ada role (anon/authenticated) yang
-- bisa baca; hanya service role / security definer (server-side). Policy per
-- role akan ditambahkan di Phase 2 (RBAC).
ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workspaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workspace_members ENABLE ROW LEVEL SECURITY;

-- Workspace: anggota (authenticated) hanya bisa melihat workspace-nya sendiri.
DROP POLICY IF EXISTS "workspaces_select_member" ON public.workspaces;
CREATE POLICY "workspaces_select_member"
  ON public.workspaces FOR SELECT TO authenticated
  USING (
    id IN (
      SELECT workspace_id FROM public.workspace_members
      WHERE user_id = auth.uid()
    )
  );

-- Workspace members: user hanya bisa melihat keanggotaannya sendiri.
DROP POLICY IF EXISTS "workspace_members_select_own" ON public.workspace_members;
CREATE POLICY "workspace_members_select_own"
  ON public.workspace_members FOR SELECT TO authenticated
  USING (user_id = auth.uid());

-- ═══════════════════════════════════════════════════════════════════════════
-- SELESAI — verifikasi cepat:
--   SELECT count(*) FROM public.audit_log;                       -- 0
--   SELECT * FROM public.workspaces;                             -- CIF Research
--   SELECT table_name, count(*) FROM information_schema.columns
--     WHERE column_name = 'workspace_id' GROUP BY 1;             -- 16 tabel
-- ═══════════════════════════════════════════════════════════════════════════


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
