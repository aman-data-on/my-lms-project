# Security Checklist

> Last updated: 2026-06-24 (post-P2)
> Reference: `SECURITY_AUDIT.md` for detailed findings

## Authentication

| Item | Status | Notes |
|------|--------|-------|
| Supabase Auth handles session tokens | ✅ | JWT-based, managed by Supabase |
| Auth state gated at route level | ✅ | `<RequireAuth>` in `App.tsx` |
| Admin routes require role check | ✅ | `<RequireAdmin>` in `App.tsx` |
| Auth redirects unauthenticated users to `/auth` | ✅ | `RequireAuth` redirects |
| Already-authenticated users redirected away from `/auth` | ✅ | `AuthPage.tsx` `useEffect` |
| Password complexity enforced | ⚠️ | Supabase default rules only; no custom policy |
| Session expiry / token rotation | ✅ | Managed by Supabase (JWT exp) |

---

## Authorization (RLS)

| Item | Status | Notes |
|------|--------|-------|
| RLS enabled on all tables | ✅ | Verified in migration files |
| Users can only read own `profiles` | ✅ | `select_own_profile` policy |
| Users cannot self-elevate `profiles.role` | ✅ | `get_my_role()` SECURITY DEFINER check — migration 20260623000001 |
| Enrollments scoped to own user | ✅ | |
| Lesson progress scoped to own user | ✅ | |
| Assessment attempts scoped to own user | ✅ | |
| Certificates scoped to own user | ✅ | |
| Activities scoped to own user | ✅ | |
| `assessments` CRUD restricted to admin | ❌ | Any authenticated user can INSERT/UPDATE/DELETE |
| `questions` CRUD restricted to admin | ❌ | Same gap as above |
| `certificates` INSERT restricted to server | ❌ | Users can self-issue certificates via direct API call |
| Admin policies on `courses`/`lessons` use SECURITY DEFINER | ⚠️ | Use subquery; lower recursion risk but not pinned |

---

## XSS / Content Security

| Item | Status | Notes |
|------|--------|-------|
| All `dangerouslySetInnerHTML` sanitized | ✅ | DOMPurify via `safeHtml()` in `sanitize.ts` |
| No `eval()` or `Function()` calls | ✅ | Verified |
| Third-party scripts | ✅ None | No CDN scripts in `index.html` |
| CSP headers | ❌ Not set | No `Content-Security-Policy` response header configured |

---

## Input Validation

| Item | Status | Notes |
|------|--------|-------|
| Form inputs trimmed before DB write | ⚠️ | Profile update sends raw values; no `.trim()` applied |
| Assessment answers validated on submit | ✅ | Client-side scoring only; server doesn't re-validate answers |
| File uploads | ✅ N/A | No file upload functionality |
| SQL injection | ✅ | Supabase JS client uses parameterized queries |

---

## Data Exposure

| Item | Status | Notes |
|------|--------|-------|
| Supabase `anon` key in client bundle | ✅ OK | Anon key is designed to be public; RLS enforces access |
| Supabase `service_role` key in client | ✅ Not present | Service role key never sent to browser |
| `.env` committed with anon key | ✅ OK | Anon key is intentionally public; tracked in git |
| Sensitive user data in `localStorage` | ✅ None | Supabase session in `localStorage` is expected behavior |
| Error messages exposing internals | ⚠️ | Some Supabase error messages surface to UI; should be mapped to user-friendly messages |

---

## API Security

| Item | Status | Notes |
|------|--------|-------|
| All API calls use `supabase` client (not raw `fetch`) | ✅ | Parameterized, authenticated |
| Edge Function (`seed-users`) protected | ⚠️ | Accepts anon key; should be restricted to service role or disabled post-seeding |
| Rate limiting | ❌ | No rate limiting on auth or API routes |

---

## Remediation Priority

### Critical
None currently.

### High
1. **`assessments`/`questions` open CRUD** — Add admin-only INSERT/UPDATE/DELETE policies:
   ```sql
   DROP POLICY IF EXISTS "insert_assessments" ON assessments;
   CREATE POLICY "insert_assessments" ON assessments FOR INSERT
     TO authenticated WITH CHECK (get_my_role() = 'admin');
   -- Repeat for UPDATE, DELETE, and questions table
   ```

2. **Self-issued certificates** — Restrict INSERT to server-side only:
   ```sql
   DROP POLICY IF EXISTS "insert_own_certificates" ON certificates;
   -- Add admin-only or service-role-only INSERT
   ```

### Medium
3. **CSP headers** — Configure `Content-Security-Policy` in hosting layer (Netlify/Vercel headers or Supabase edge)
4. **`seed-users` function** — Disable or add service-role auth requirement post-seeding
5. **Input trimming** — Add `.trim()` to all form values before DB write

### Low
6. **User-friendly error messages** — Map Supabase error codes to readable messages
7. **Password policy** — Document or configure minimum password requirements via Supabase Auth settings
