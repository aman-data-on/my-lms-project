# Database Migrations

> Supabase project ref: `cthnljvcfnzxluedquxf`
> Total migrations: 20 (all applied as of 2026-06-24)

## Running Migrations

```bash
# Link to project (one-time per environment)
npx supabase link --project-ref cthnljvcfnzxluedquxf

# Apply all pending migrations
npx supabase db push

# List migration status
npx supabase migration list
```

## Migration Log

| # | Timestamp | File | Description |
|---|-----------|------|-------------|
| 01 | 20260619075856 | create_profiles_table | `profiles` table with RLS; user select/insert/update/delete own row |
| 02 | 20260619075929 | create_courses_and_progress_tables | `courses`, `lessons`, `enrollments`, `lesson_progress`; user-scoped RLS |
| 03 | 20260619080017 | create_assessments_and_certificates_tables | `assessments`, `questions`, `assessment_attempts`, `certificates`, `activities` |
| 04 | 20260619084458 | add_role_and_course_status | `profiles.role` (default `employee`), `courses.status`, `lessons.section`; admin CRUD policies |
| 05 | 20260619134936 | confirm_seed_user_emails | Confirms email addresses for seeded test users |
| 06 | 20260620120238 | fix_rls_infinite_recursion | Rewrites admin RLS policies to avoid `profiles` self-referential recursion |
| 07 | 20260622065028 | add_sales_onboarding_course | Seeds the Sales Onboarding course record and all 12 lesson modules |
| 08 | 20260622065106 | add_sales_onboarding_questions | Seeds Phase 1–5 assessment questions |
| 09–16 | 20260622065106…071531 | update_module_*_visuals | Updates lesson content blocks with improved visual layouts (8 migrations) |
| 17 | 20260622072619 | create_phase_progress_table | `phase_progress` (5-phase gated journey) and `task_submissions` |
| 18 | 20260623000001 | protect_profiles_role_column | `get_my_role()` SECURITY DEFINER function; replace `update_own_profile` to pin `role` |

---

## Writing New Migrations

### Naming convention
```
YYYYMMDDHHMMSS_descriptive_snake_case_name.sql
```

### Template
```sql
/*
  # Migration: <short description>

  ## Problem
  <What was broken or missing>

  ## Solution
  <What this migration does>

  ## Tables affected
  - table_name: what changes

  ## Rollback
  <SQL to undo this migration>
*/

-- Migration SQL here
```

### Safety rules
1. Always use `IF NOT EXISTS` / `IF EXISTS` guards on CREATE/DROP
2. For column additions: `ALTER TABLE t ADD COLUMN IF NOT EXISTS col type`
3. For policy changes: `DROP POLICY IF EXISTS "name" ON table` before CREATE
4. Test against a staging project before applying to production
5. Always document a rollback path in the migration header

### Rollback process
Supabase does not support automatic migration rollbacks. To roll back:
1. Write a reverse migration SQL file
2. Apply via `npx supabase db push` or directly via the Supabase SQL editor
3. Remove or archive the original migration file

---

## Environment Promotion Path

```
Local dev  →  Staging project  →  Production project
```

Currently only one environment exists (production). Before P4 deployment work:
- Create a staging Supabase project
- Apply all migrations to staging first
- Validate with seed data before production push

---

## Pending Schema Changes (P3/P4 scope)

| Change | Reason | Priority |
|--------|--------|---------|
| Add admin-only INSERT policy on `certificates` | Users can currently self-issue certificates | High |
| Restrict INSERT on `assessments`/`questions` to admin role | Any user can create assessments | Medium |
| Add `updated_at` trigger on `enrollments` | Tracking last activity | Low |
| Soft delete on `courses` | Currently hard-delete; loses enrollment history | Low |
