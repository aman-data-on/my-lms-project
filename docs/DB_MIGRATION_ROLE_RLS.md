# Database Security Migration: Protect `profiles.role` from Self-Elevation

**Migration file:** `supabase/migrations/20260623000001_protect_profiles_role_column.sql`  
**Status:** Ready to apply — NOT YET DEPLOYED  
**Author:** P1 security audit (Claude Code, 2026-06-23)  
**Requires:** Database operator with Supabase project access

---

## 1. Current Risk (if this migration is NOT applied)

### Severity: CRITICAL

Every authenticated user who knows the Supabase anon key — which is public, embedded in the compiled JavaScript bundle, and visible to anyone who opens DevTools — can self-elevate to `admin` with a single API call:

```bash
curl -X PATCH \
  'https://<project-ref>.supabase.co/rest/v1/profiles?id=eq.<their-uuid>' \
  -H 'apikey: <VITE_SUPABASE_ANON_KEY>' \
  -H 'Authorization: Bearer <their-session-jwt>' \
  -H 'Content-Type: application/json' \
  -d '{"role": "admin"}'
```

No special knowledge beyond the anon key and a valid login is needed. The anon key is intentionally public in a Supabase project (it is not a secret), so this attack is available to any employee with an account.

### Why this is the entire authorization model

The frontend `RequireAdmin` route guard (added in P1 commit `dd2a930`) blocks UI access to `/admin` and `/course-builder`. However, the underlying RLS policies for every privileged table check `profiles.role`:

```sql
-- Pattern used in courses, lessons, assessments, questions, enrollments:
EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
```

There is no secondary check. If `profiles.role = 'admin'` for a row, that user gets full admin CRUD on all protected tables — regardless of whether the frontend guard is in place. The UI guard and the DB guard are not redundant; they protect different attack surfaces. Both must be present.

### What a successful self-elevation grants

| Table | Admin policy | Attacker gains |
|---|---|---|
| `courses` | `admin_manage_courses` — FOR ALL | Create, edit, delete any course |
| `lessons` | `admin_manage_lessons` — FOR ALL | Create, edit, delete any lesson content |
| `assessments` | `admin_manage_assessments` — FOR ALL | Create, edit, delete assessments |
| `questions` | `admin_manage_questions` — FOR ALL | Create, edit, delete questions |
| `enrollments` | `admin_view_enrollments` — FOR SELECT | Read all employee enrollment records |
| `profiles` | `select_all_profiles` — FOR SELECT | Read all employee profile records |

The attacker also bypasses the `RequireAdmin` frontend guard on their next page load, since `isAdmin` in `AuthContext` is derived directly from `profile.role`.

---

## 2. Tables Affected

### Primary table

| Table | Column | Type | Default | Current protection |
|---|---|---|---|---|
| `profiles` | `role` | `text NOT NULL` | `'employee'` | None — any user can update their own row including this column |

### Tables protected downstream (all inherit the fix)

Once `profiles.role` cannot be self-modified, these tables' admin policies become trustworthy:

- `courses`
- `lessons`
- `assessments`
- `questions`
- `enrollments`

### Existing UPDATE policy (the gap)

Defined in `20260619075856_create_profiles_table.sql`:

```sql
CREATE POLICY "update_own_profile" ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);
```

The `WITH CHECK (auth.uid() = id)` only verifies that the `id` column in the updated row still matches the caller's user ID. It places no constraint on any other column. `role`, `email`, `department`, and every other column are freely writable by the row owner.

---

## 3. Policy Definition

### Why a helper function is required

The naive fix — subquery inside WITH CHECK — causes infinite recursion:

```sql
-- ❌ WILL DEADLOCK: reads profiles from within a policy on profiles
WITH CHECK (
  auth.uid() = id
  AND role = (SELECT role FROM profiles WHERE id = auth.uid())
)
```

This is the same recursion that broke the original `admin_view_profiles` policy, fixed in migration `20260620120238_fix_rls_infinite_recursion.sql`. The solution, consistent with the existing codebase pattern, is a `SECURITY DEFINER` function that reads `profiles` with the function owner's privileges (bypassing RLS entirely), eliminating the recursion.

### Step 1 — Create helper function

```sql
CREATE OR REPLACE FUNCTION get_my_role()
RETURNS text
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid();
$$;
```

**Key properties:**

| Property | Meaning |
|---|---|
| `SECURITY DEFINER` | Runs as the function owner (postgres), bypasses RLS on its internal query |
| `STABLE` | PostgreSQL can call it once per query rather than once per row |
| `SET search_path = public` | Prevents search_path hijacking — a required hardening step for all SECURITY DEFINER functions |
| Returns `text` | Matches `profiles.role` type exactly |

**Why `STABLE` is safe:** Within a single UPDATE statement, the committed value of `role` (the old value before the update lands) is stable. `get_my_role()` returns that old value, and the WITH CHECK verifies the new row's `role` equals it. If a user sets `role = 'admin'`, the check fails because `'admin' ≠ 'employee'` (the old value). The update is rejected.

### Step 2 — Replace the UPDATE policy

```sql
DROP POLICY IF EXISTS "update_own_profile" ON profiles;

CREATE POLICY "update_own_profile" ON profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (
    auth.uid() = id
    AND role = get_my_role()
  );
```

**How the WITH CHECK works:**

1. User calls `UPDATE profiles SET role = 'admin' WHERE id = '<their-uuid>'`.
2. PostgreSQL prepares the new row (all columns with their updated values).
3. The `WITH CHECK` evaluates against the new row:
   - `auth.uid() = id` → passes (same user)
   - `role = get_my_role()` → `'admin' = get_my_role()` → `'admin' = 'employee'` → **FAILS**
4. PostgreSQL rejects the update with `ERROR: new row violates row-level security policy`.
5. No write lands.

If the user updates a legitimate column (e.g. `full_name`, `department`, `avatar_url`), the `role` value in the new row is still `'employee'` (unchanged), so `get_my_role()` returns `'employee'`, and the check passes.

### Complete migration file

```sql
-- supabase/migrations/20260623000001_protect_profiles_role_column.sql

CREATE OR REPLACE FUNCTION get_my_role()
RETURNS text
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid();
$$;

DROP POLICY IF EXISTS "update_own_profile" ON profiles;

CREATE POLICY "update_own_profile" ON profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (
    auth.uid() = id
    AND role = get_my_role()
  );
```

This is identical to the file at `supabase/migrations/20260623000001_protect_profiles_role_column.sql`.

---

## 4. Rollback SQL

Apply this if the migration causes unexpected issues in production. It restores the original (vulnerable) policy and removes the helper function.

```sql
-- ─── ROLLBACK: restore original update_own_profile policy ───────────────────

DROP POLICY IF EXISTS "update_own_profile" ON profiles;

CREATE POLICY "update_own_profile" ON profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

DROP FUNCTION IF EXISTS get_my_role();
```

**Warning:** Rolling back re-opens the role self-elevation vulnerability. Only roll back if necessary, and treat it as a temporary state that must be remediated immediately.

---

## 5. Verification Steps After Deployment

Run these checks in the Supabase SQL editor (or via `psql`) after applying the migration.

### 5.1 Confirm the function exists and has the correct security settings

```sql
SELECT
  routine_name,
  security_type,
  routine_definition
FROM information_schema.routines
WHERE routine_schema = 'public'
  AND routine_name = 'get_my_role';
```

Expected: one row with `security_type = 'DEFINER'`.

### 5.2 Confirm the policy was replaced

```sql
SELECT
  policyname,
  cmd,
  qual AS using_clause,
  with_check
FROM pg_policies
WHERE tablename = 'profiles'
ORDER BY policyname;
```

Expected: `update_own_profile` row has a `with_check` value that includes `get_my_role()`. The old policy's `with_check` was just `(uid() = id)`.

### 5.3 Confirm role self-elevation is blocked

Run as any non-admin test user. The easiest way is via the Supabase client in the browser console after logging in as a regular employee:

```javascript
// Run in browser DevTools on the LMS app, logged in as a regular employee
const { error } = await supabase
  .from('profiles')
  .update({ role: 'admin' })
  .eq('id', (await supabase.auth.getUser()).data.user.id);

console.log(error?.message);
// Expected: "new row violates row-level security policy for table \"profiles\""
```

### 5.4 Confirm legitimate profile updates still work

```javascript
// Still in browser DevTools as the same employee
const { error } = await supabase
  .from('profiles')
  .update({ department: 'Marketing' })
  .eq('id', (await supabase.auth.getUser()).data.user.id);

console.log(error);
// Expected: null (update succeeds)
```

### 5.5 Confirm admin access still works for admins

Log in as `admin@company.com` and verify:
- Admin Panel loads at `/admin`
- Course Builder loads at `/course-builder`
- Admin can create/edit/delete courses and lessons

### 5.6 Confirm existing users are unaffected

```sql
-- Verify no profiles have a role other than 'admin' or 'employee'
SELECT role, COUNT(*)
FROM profiles
GROUP BY role
ORDER BY role;
```

Expected: only `admin` and `employee` roles present. If any unexpected values exist, investigate before deploying.

---

## How to Deploy

### Via Supabase CLI (recommended for tracked migrations)

```bash
supabase db push
```

This applies all unapplied migrations in `supabase/migrations/` in timestamp order. The new file `20260623000001_protect_profiles_role_column.sql` will be applied.

### Via Supabase Dashboard SQL editor (manual apply)

1. Open the Supabase Dashboard → SQL Editor.
2. Paste the contents of `supabase/migrations/20260623000001_protect_profiles_role_column.sql`.
3. Run.
4. Execute the verification queries in §5.

### Important: do not skip

Until this migration is applied, the `RequireAdmin` frontend guard (commit `dd2a930`) only protects the UI. The underlying database remains writable by any authenticated user who targets the API directly. Both layers must be active simultaneously for defense-in-depth to hold.
