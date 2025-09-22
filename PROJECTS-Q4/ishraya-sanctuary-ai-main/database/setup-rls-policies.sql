-- ============================================================
-- GHOSTVAULT RLS CONFIGURATION SCRIPT
-- Purpose: Toggle RLS off for development, restore with policies later
-- ============================================================

-- 1. Ensure table exists
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.tables
        WHERE table_name = 'memory_crystals'
    ) THEN
        RAISE NOTICE 'Table memory_crystals not found!';
    END IF;
END $$;

-- 2. Disable RLS for development (fast unblock)
ALTER TABLE public.memory_crystals DISABLE ROW LEVEL SECURITY;

-- 3. Optional: grant blanket access (local dev only!)
GRANT ALL ON public.memory_crystals TO PUBLIC;

-- ============================================================
-- WHEN READY FOR PRODUCTION SECURITY, RUN BELOW INSTEAD:
-- ============================================================

-- Enable RLS
-- ALTER TABLE public.memory_crystals ENABLE ROW LEVEL SECURITY;

-- Drop old policies if they exist
-- DROP POLICY IF EXISTS insert_own_crystals ON public.memory_crystals;
-- DROP POLICY IF EXISTS select_own_crystals ON public.memory_crystals;
-- DROP POLICY IF EXISTS update_own_crystals ON public.memory_crystals;
-- DROP POLICY IF EXISTS delete_own_crystals ON public.memory_crystals;

-- Auth helper (maps JWT `sub` claim → auth.uid())
-- CREATE OR REPLACE FUNCTION auth.uid() RETURNS uuid AS $$
--   SELECT nullif(current_setting('request.jwt.claim.sub', true), '')::uuid;
-- $$ LANGUAGE sql STABLE;

-- Allow each user to insert their own rows
-- CREATE POLICY insert_own_crystals
-- ON public.memory_crystals
-- FOR INSERT
-- WITH CHECK (owner_id = auth.uid());

-- Allow each user to read their own rows
-- CREATE POLICY select_own_crystals
-- ON public.memory_crystals
-- FOR SELECT
-- USING (owner_id = auth.uid());

-- Allow updates/deletes only by row owner
-- CREATE POLICY update_own_crystals
-- ON public.memory_crystals
-- FOR UPDATE
-- USING (owner_id = auth.uid());

-- CREATE POLICY delete_own_crystals
-- ON public.memory_crystals
-- FOR DELETE
-- USING (owner_id = auth.uid());
