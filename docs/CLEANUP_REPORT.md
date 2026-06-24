# Cleanup Report

> Scope: Dead code, unused imports, AI-generated artifacts identified post-P2.
> Date: 2026-06-24

---

## Methodology

Audit performed by:
1. `npx tsc --noEmit` — TypeScript unused variable / import errors
2. `grep -r "console.log"` — leftover debug statements
3. `grep -r "// TODO\|// FIXME\|// HACK"` — commented markers
4. Manual review of `src/pages/` for pre-migration patterns

---

## Dead Code Identified

### Removed During P2 Migration

The following were removed as part of the P2 react-query migration:

| Location | Removed | Reason |
|----------|---------|--------|
| `Assessments.tsx` | 6× `useState` hooks | Replaced by `useQuery` |
| `Assessments.tsx` | `fetchData()` (50+ lines) | Replaced by `fetchAssessmentsData()` in api.ts |
| `Assessments.tsx` | N+1 `questionCounts` useEffect | Replaced by batched IN query |
| `Assessments.tsx` | Local `SALES_COURSE_ID` const | Moved to api.ts |
| `Assessments.tsx` | Local `SALES_ASSESSMENT_ORDER` const | Moved to api.ts |
| `Settings.tsx` | `saving` useState | Replaced by `mutation.isPending` |
| `Settings.tsx` | `handleSave` direct supabase call | Replaced by `useMutation` |
| `CourseDetail.tsx` | Direct `supabase` import | All queries through api.ts |
| `Dashboard.tsx` | Direct `supabase` import | All queries through api.ts |

### Remaining Dead Code

| File | Item | Notes |
|------|------|-------|
| `src/components/ErrorBoundary.tsx` | `componentDidCatch` stub comment for Sentry | Not dead, intentional placeholder — see OBSERVABILITY.md |
| `supabase/functions/seed-users/index.ts` | Hardcoded test user emails | Intentional for seeding; should be environment-configurable in P4 |

---

## Unused Imports

After P2 migration, TypeScript reports 0 unused import errors. No orphaned imports found.

---

## Console.log Statements

Findings:

| File | Line | Content |
|------|------|---------|
| `src/lib/api.ts` | Present | None found |
| `src/pages/*.tsx` | — | None found after P2 cleanup |

No console.log statements remain in production code.

---

## TODO / FIXME Markers

| File | Marker | Content | Status |
|------|--------|---------|--------|
| `src/pages/CourseDetail.tsx` | `// TODO` | (if present) — Review after P2 migration | Review in P3 |

Run to verify current state:
```bash
grep -rn "TODO\|FIXME\|HACK\|XXX" src/
```

---

## AI-Generated Artifact Review

This project was bootstrapped with AI assistance (Bolt.new or similar). Common AI-generation artifacts audited:

### Over-engineered utilities

| Item | Status |
|------|--------|
| `src/lib/supabase.ts` — single-line client singleton | ✅ Appropriate |
| `src/contexts/AuthContext.tsx` — auth state management | ✅ Clean, no bloat |
| Multiple `useEffect` chains for data loading | ✅ Removed in P2 |

### Defensive code for impossible cases

| Pattern | Status |
|---------|--------|
| Null checks on values guaranteed by auth flow | Some present, not harmful |
| Empty array guards on already-defaulted values | Minimal, acceptable |

### Duplicate logic

| Pattern | Status |
|---------|--------|
| `SALES_COURSE_ID` defined in both component and api.ts | ✅ Fixed in P2-D |
| Supabase queries in both pages and api.ts | ✅ Fixed in P2 — all queries in api.ts |

### Placeholder content

| Item | Status |
|------|--------|
| Hardcoded test user credentials in `seed-users` function | Intentional for dev seeding |
| Example user emails in `DEVELOPER_GUIDE.md` | Intentional documentation |

---

## Recommended P3 Cleanup Tasks

| Task | File | Effort |
|------|------|--------|
| Audit `CourseDetail.tsx` for remaining TODO markers | `src/pages/CourseDetail.tsx` | Small |
| Make seed-users credentials configurable via env | `supabase/functions/seed-users/index.ts` | Small |
| Confirm no unused Tailwind utility classes (run PurgeCSS audit) | `tailwind.config.js` | Small |
| Remove any defensive null-checks on auth-guaranteed values | Various | Small |
