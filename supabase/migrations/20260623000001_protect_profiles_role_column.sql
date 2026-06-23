/*
  # Protect profiles.role from self-elevation

  ## Problem
  The existing "update_own_profile" policy allows authenticated users to update
  any column on their own profile row, including the `role` column. A user who
  knows the Supabase anon key (which is public and embedded in the JS bundle)
  can call the Supabase API directly and set their own role to 'admin':

      curl -X PATCH \
        'https://<project>.supabase.co/rest/v1/profiles?id=eq.<user-uuid>' \
        -H 'apikey: <anon-key>' \
        -H 'Authorization: Bearer <user-jwt>' \
        -H 'Content-Type: application/json' \
        -d '{"role": "admin"}'

  Because EVERY admin policy across courses, lessons, assessments, questions,
  and enrollments checks `profiles.role = 'admin'`, a successful self-elevation
  grants full admin CRUD across the entire database.

  ## Fix
  1. Create a SECURITY DEFINER helper function that reads the caller's current
     role from profiles without triggering RLS (avoids the infinite-recursion
     pattern seen in migration 20260620120238).
  2. Replace "update_own_profile" with a policy whose WITH CHECK pins the role
     column to its current committed value — any update that changes `role` is
     rejected by the database.

  ## Note on admin profile management
  This migration does NOT add an admin UPDATE policy for profiles. If admins
  need to promote/demote users via the AdminPanel, a separate service-role
  call (bypassing RLS entirely) or a dedicated SECURITY DEFINER function
  should be used. Do not add a general admin UPDATE policy for profiles
  without also pinning role changes to an explicit allowlist.
*/

-- ─── Step 1: helper function ────────────────────────────────────────────────
-- SECURITY DEFINER makes this run as the function owner (postgres), bypassing
-- RLS. The subquery inside therefore reads the committed pre-update row value,
-- not the in-progress update — which is exactly what the WITH CHECK needs.

CREATE OR REPLACE FUNCTION get_my_role()
RETURNS text
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid();
$$;

-- ─── Step 2: replace the UPDATE policy ──────────────────────────────────────
-- Drop and recreate. The new WITH CHECK adds a second condition:
--   role = get_my_role()
-- This means: after the update, the `role` column in the new row must equal
-- what it was in the committed row before the update. Any attempt to change
-- the role is rejected by the database before the write lands.

DROP POLICY IF EXISTS "update_own_profile" ON profiles;

CREATE POLICY "update_own_profile" ON profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (
    auth.uid() = id
    AND role = get_my_role()
  );
