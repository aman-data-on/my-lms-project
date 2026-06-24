# Database Schema

> Supabase (PostgreSQL) — Project ref: `cthnljvcfnzxluedquxf`
> Last updated: 2026-06-24 (reflects all 20 applied migrations)

## Tables Overview

| Table | Rows | Scope | RLS |
|-------|------|-------|-----|
| `profiles` | 1 per user | User-scoped | ✅ |
| `courses` | Seeded | All authenticated | ✅ |
| `lessons` | Seeded | All authenticated | ✅ |
| `enrollments` | User-scoped | User-scoped | ✅ |
| `lesson_progress` | User-scoped | User-scoped | ✅ |
| `assessments` | Seeded + admin-created | All authenticated | ✅ |
| `questions` | Seeded + admin-created | All authenticated | ✅ |
| `assessment_attempts` | User-scoped | User-scoped | ✅ |
| `certificates` | User-scoped | User-scoped | ✅ |
| `activities` | User-scoped | User-scoped | ✅ |
| `phase_progress` | User-scoped | User-scoped | ✅ |
| `task_submissions` | User-scoped | User-scoped | ✅ |

---

## `profiles`

Extends `auth.users`. Created automatically on user sign-up via edge function or manual insert.

| Column | Type | Nullable | Default | Notes |
|--------|------|----------|---------|-------|
| `id` | uuid | NO | — | PK, FK → `auth.users(id)` ON DELETE CASCADE |
| `full_name` | text | NO | — | |
| `employee_id` | text | NO | — | UNIQUE |
| `department` | text | NO | — | HR, IT, Finance, Sales, Operations, Marketing |
| `job_title` | text | NO | — | |
| `email` | text | NO | — | |
| `avatar_url` | text | YES | NULL | |
| `onboarding_batch` | text | YES | NULL | e.g. "Batch 2026-Q1" |
| `role` | text | NO | `'employee'` | `'employee'` or `'admin'` |
| `created_at` | timestamptz | NO | `now()` | |
| `updated_at` | timestamptz | NO | `now()` | |

**RLS policies:** `select_own_profile`, `insert_own_profile`, `update_own_profile` (role-pinned via `get_my_role()` SECURITY DEFINER), `delete_own_profile`, `admin_view_profiles`

---

## `courses`

| Column | Type | Nullable | Default | Notes |
|--------|------|----------|---------|-------|
| `id` | uuid | NO | `gen_random_uuid()` | PK |
| `title` | text | NO | — | |
| `description` | text | NO | — | |
| `department` | text | NO | — | |
| `thumbnail_url` | text | YES | NULL | |
| `duration` | text | NO | — | e.g. `"2h 30m"` |
| `status` | text | NO | `'published'` | `'draft'` or `'published'` |
| `created_at` | timestamptz | NO | `now()` | |
| `updated_at` | timestamptz | NO | `now()` | |

**RLS:** All authenticated can read. Admin can manage all.

---

## `lessons`

| Column | Type | Nullable | Default | Notes |
|--------|------|----------|---------|-------|
| `id` | uuid | NO | `gen_random_uuid()` | PK |
| `course_id` | uuid | NO | — | FK → `courses(id)` ON DELETE CASCADE |
| `title` | text | NO | — | |
| `type` | text | NO | — | `video`, `quiz`, `document` |
| `video_url` | text | YES | NULL | URL or rich HTML content |
| `duration` | text | YES | NULL | |
| `order_index` | integer | NO | `0` | Display order within course |
| `section` | text | YES | NULL | Curriculum section label |
| `created_at` | timestamptz | NO | `now()` | |

**RLS:** All authenticated can read. Admin can manage all.

---

## `enrollments`

| Column | Type | Nullable | Default | Notes |
|--------|------|----------|---------|-------|
| `id` | uuid | NO | `gen_random_uuid()` | PK |
| `user_id` | uuid | NO | — | FK → `auth.users(id)` ON DELETE CASCADE |
| `course_id` | uuid | NO | — | FK → `courses(id)` ON DELETE CASCADE |
| `status` | text | NO | `'not_started'` | `not_started`, `in_progress`, `completed` |
| `progress_percent` | integer | NO | `0` | 0–100 |
| `enrolled_at` | timestamptz | NO | `now()` | |
| `completed_at` | timestamptz | YES | NULL | |

**Unique constraint:** `(user_id, course_id)`

---

## `lesson_progress`

| Column | Type | Nullable | Default | Notes |
|--------|------|----------|---------|-------|
| `id` | uuid | NO | `gen_random_uuid()` | PK |
| `user_id` | uuid | NO | — | FK → `auth.users(id)` ON DELETE CASCADE |
| `lesson_id` | uuid | NO | — | FK → `lessons(id)` ON DELETE CASCADE |
| `completed` | boolean | NO | `false` | |
| `completed_at` | timestamptz | YES | NULL | |
| `created_at` | timestamptz | NO | `now()` | |

**Unique constraint:** `(user_id, lesson_id)`

---

## `assessments`

| Column | Type | Nullable | Default | Notes |
|--------|------|----------|---------|-------|
| `id` | uuid | NO | `gen_random_uuid()` | PK |
| `title` | text | NO | — | |
| `course_id` | uuid | YES | NULL | FK → `courses(id)` ON DELETE SET NULL |
| `time_limit` | integer | NO | — | Minutes |
| `passing_score` | integer | NO | — | Percentage (0–100) |
| `created_at` | timestamptz | NO | `now()` | |

---

## `questions`

| Column | Type | Nullable | Default | Notes |
|--------|------|----------|---------|-------|
| `id` | uuid | NO | `gen_random_uuid()` | PK |
| `assessment_id` | uuid | NO | — | FK → `assessments(id)` ON DELETE CASCADE |
| `type` | text | NO | — | `multiple_choice`, `true_false`, `fill_blank`, `matching`, `short_answer`, `long_answer` |
| `question_text` | text | NO | — | |
| `options` | jsonb | YES | NULL | Array of strings for multiple_choice |
| `correct_answer` | text | YES | NULL | Not set for manual-grading types |
| `matching_pairs` | jsonb | YES | NULL | `[{left, right}]` for matching type |
| `manual_grading` | boolean | NO | `false` | `true` for short_answer, long_answer |
| `order_index` | integer | NO | `0` | |
| `created_at` | timestamptz | NO | `now()` | |

---

## `assessment_attempts`

| Column | Type | Nullable | Default | Notes |
|--------|------|----------|---------|-------|
| `id` | uuid | NO | `gen_random_uuid()` | PK |
| `user_id` | uuid | NO | — | FK → `auth.users(id)` ON DELETE CASCADE |
| `assessment_id` | uuid | NO | — | FK → `assessments(id)` ON DELETE CASCADE |
| `score` | integer | YES | NULL | Set on submit (0–100) |
| `status` | text | NO | `'in_progress'` | `in_progress`, `passed`, `failed` |
| `answers` | jsonb | YES | NULL | `{questionId: answer}` map |
| `started_at` | timestamptz | NO | `now()` | |
| `submitted_at` | timestamptz | YES | NULL | Set on submit |

---

## `certificates`

| Column | Type | Nullable | Default | Notes |
|--------|------|----------|---------|-------|
| `id` | uuid | NO | `gen_random_uuid()` | PK |
| `user_id` | uuid | NO | — | FK → `auth.users(id)` ON DELETE CASCADE |
| `course_id` | uuid | YES | NULL | FK → `courses(id)` ON DELETE SET NULL |
| `course_name` | text | NO | — | Denormalized for display stability |
| `score` | integer | YES | NULL | Assessment score at time of issue |
| `certificate_id` | text | NO | — | e.g. `LMS-2026-AB3X7K` |
| `issued_at` | timestamptz | NO | `now()` | |

---

## `activities`

| Column | Type | Nullable | Default | Notes |
|--------|------|----------|---------|-------|
| `id` | uuid | NO | `gen_random_uuid()` | PK |
| `user_id` | uuid | NO | — | FK → `auth.users(id)` ON DELETE CASCADE |
| `type` | text | NO | — | `course_enrolled`, `lesson_completed`, `assessment_started`, `assessment_completed`, `certificate_earned` |
| `title` | text | NO | — | Human-readable event title |
| `description` | text | YES | NULL | Additional context |
| `created_at` | timestamptz | NO | `now()` | |

---

## `phase_progress`

Used exclusively by the Sales Onboarding Course's 5-phase gated journey.

| Column | Type | Nullable | Default | Notes |
|--------|------|----------|---------|-------|
| `id` | uuid | NO | `gen_random_uuid()` | PK |
| `user_id` | uuid | NO | — | FK → `auth.users(id)` ON DELETE CASCADE |
| `course_id` | uuid | NO | — | FK → `courses(id)` ON DELETE CASCADE |
| `phase_number` | integer | NO | — | CHECK 1–5 |
| `status` | text | NO | `'locked'` | CHECK `locked`, `in_progress`, `completed` |
| `assessment_passed` | boolean | NO | `false` | |
| `assessment_score` | integer | YES | NULL | |
| `created_at` | timestamptz | NO | `now()` | |
| `updated_at` | timestamptz | NO | `now()` | |

**Unique constraint:** `(user_id, course_id, phase_number)`

---

## `task_submissions`

Phase 5 task submissions for the Sales Onboarding Course.

| Column | Type | Nullable | Default | Notes |
|--------|------|----------|---------|-------|
| `id` | uuid | NO | `gen_random_uuid()` | PK |
| `user_id` | uuid | NO | — | FK → `auth.users(id)` ON DELETE CASCADE |
| `course_id` | uuid | NO | — | FK → `courses(id)` ON DELETE CASCADE |
| `task_type` | text | NO | — | CHECK `shadow_calls`, `mock_sales_flow`, `final_assessment` |
| `content` | text | NO | — | Submission text |
| `status` | text | NO | `'submitted'` | CHECK `submitted`, `reviewed`, `approved` |
| `feedback` | text | YES | NULL | Reviewer notes |
| `created_at` | timestamptz | NO | `now()` | |
| `updated_at` | timestamptz | NO | `now()` | |

---

## Security Functions

### `get_my_role() → text`
- **Type:** SECURITY DEFINER, STABLE
- **Purpose:** Returns the caller's current `profiles.role` value, bypassing RLS. Used by the `update_own_profile` policy's WITH CHECK clause to prevent role self-elevation.
- **Migration:** `20260623000001_protect_profiles_role_column.sql`

---

## Known RLS Gaps

| Table | Gap | Risk |
|-------|-----|------|
| `assessments` | All authenticated users can INSERT/UPDATE/DELETE — no admin check | Medium: any user can create assessments |
| `questions` | Same as above | Medium |
| `courses` | Admin policy uses subquery, not `get_my_role()` | Low: RLS recursion risk if subquery pattern changes |
| `certificates` | User can INSERT their own certificate directly | Medium: bypass assessment requirement |

See `SECURITY_CHECKLIST.md` for remediation plan.
