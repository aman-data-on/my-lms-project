# AI Code Review

> Review of AI-generated code in the project for correctness, security, and quality.
> Date: 2026-06-24

---

## Background

This project was bootstrapped using AI-assisted coding (Bolt.new initial scaffold) and developed further with Claude Code. This document identifies patterns introduced by AI generation that require human review or remediation.

---

## Security Review

### XSS — DOMPurify wrapping

**Pattern:** HTML content from the database is rendered via `dangerouslySetInnerHTML`.

**Status:** ✅ Correct — `safeHtml()` wrapper in `src/lib/api.ts` calls `DOMPurify.sanitize()` on all HTML before rendering. See ADR-002.

```typescript
// src/lib/api.ts
export function safeHtml(html: string): string {
  return DOMPurify.sanitize(html, { USE_PROFILES: { html: true } })
}
```

**Risk remaining:** If new block types are added to `CourseDetail.tsx` that render HTML without using `safeHtml()`, XSS is possible. P3 action: add a lint rule or ESLint plugin to flag raw `dangerouslySetInnerHTML` without `safeHtml()`.

---

### SQL Injection

**Status:** ✅ Not a risk — all database access is through Supabase's typed client which uses parameterized queries. No raw SQL in client code.

---

### Authentication bypass

**Status:** ✅ Correct — Auth is enforced at two layers:
1. React Router guards in `App.tsx` redirect unauthenticated users to `/auth`
2. Supabase RLS policies enforce access at the database layer

The application-layer guard is defense-in-depth; RLS is the authoritative control.

---

### Service role key exposure

**Status:** ✅ Not present — only `VITE_SUPABASE_ANON_KEY` is in the client bundle. The service role key is not in any tracked file.

---

## Data Fetching Patterns

### N+1 query anti-pattern

**Was present:** `Assessments.tsx` previously fetched question counts with one query per assessment in a useEffect loop.

**Status:** ✅ Fixed in P2-D — replaced with a single `.in('assessment_id', ids)` batched query in `fetchAssessmentsData()`.

---

### Unhandled promise rejections

**Pattern check:** All `useQuery`/`useMutation` calls let react-query handle errors. Direct `async` functions in event handlers (`startAssessment`, `handleSubmit`) have try/catch blocks.

**Status:** ✅ Acceptable — react-query surfaces errors via `isError`/`error` state. Event handler try/catch is present.

**Improvement:** Some error messages are shown as raw Supabase error strings. See UI_CONSISTENCY_REPORT.md for remediation.

---

### Stale closure risk in useEffect

**Pattern:** Timer `useEffect` in `Assessments.tsx` reads `timeLeft` state.

**Status:** ✅ Correctly implemented — the effect uses the functional update form `setTimeLeft(prev => prev - 1)` so it doesn't capture a stale closure.

---

## Component Design

### Prop drilling

**Status:** Minimal. Auth state comes from `useAuth()` context. Query data is fetched at the page level and passed to child components as props. No more than 2 levels deep in current UI.

---

### Overly large components

| Component | Lines | Assessment |
|-----------|-------|------------|
| `Assessments.tsx` | ~400 | Borderline — assessment-taking UI is complex |
| `CourseDetail.tsx` | ~350 | Acceptable — block renderer has many types |
| `Dashboard.tsx` | ~250 | Fine |
| `AdminPanel.tsx` | ~300 | Acceptable |

**P3 action:** Extract assessment-taking (in-progress state) into a sub-component `<AssessmentSession>` to reduce Assessments.tsx size.

---

### Key prop correctness

All `.map()` calls in JSX use stable IDs (UUIDs from database) as keys, not array indices.

**Status:** ✅ Correct.

---

## TypeScript Quality

### `any` usage

```bash
grep -rn ": any" src/
```

Known locations:
- `onError: (err: any)` — in `useMutation` error handlers where Supabase error type is opaque

**Recommendation:** Replace with `Error | PostgrestError` type from `@supabase/supabase-js` in P3.

---

### Missing types

`assessment_attempts` table returns a generic `Record<string, unknown>` from Supabase because there are no generated types. The project does not yet use `supabase gen types typescript`.

**P3 action:** Run `npx supabase gen types typescript --project-id cthnljvcfnzxluedquxf > src/lib/database.types.ts` and replace manual type definitions.

---

## AI-Specific Risk Patterns

| Risk | Status | Notes |
|------|--------|-------|
| Hardcoded credentials in source | ✅ None | Only test user emails in seed function (intentional) |
| Commented-out code left in | ✅ Minimal | One Sentry stub comment (intentional placeholder) |
| Over-defensive null checks | ⚠️ Some | Acceptable; non-harmful |
| Inconsistent naming conventions | ⚠️ Minor | `fetchXxx` / `getXxx` mixed in one place — standardize in P3 |
| Unreachable code paths | ✅ None found | TypeScript would catch most |
| Missing loading/error states | ✅ Fixed in P2 | All queries via react-query now expose `isLoading`/`isError` |

---

## Summary

The AI-generated scaffold is structurally sound. The main quality gaps are:
1. Manual TypeScript types instead of generated ones
2. Some `any` usage in mutation error handlers
3. Raw Supabase error strings in UI
4. Component sizes borderline but manageable

No security vulnerabilities found in the reviewed code. XSS, SQL injection, and auth bypass patterns are correctly handled.
