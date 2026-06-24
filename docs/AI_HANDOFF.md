# AI Handoff Notes

> Context document for AI-assisted development continuity.
> Maintained by: Claude Code (Anthropic) on behalf of the development team.
> Last updated: 2026-06-24

---

## Project State Summary

The Employee Onboarding LMS has completed Phases 1 (routing) and 2 (react-query data layer). The codebase is in a stable state with 0 TypeScript errors and a passing production build.

### Completed Phases

| Phase | Description | Status |
|-------|-------------|--------|
| P1 | React Router v6 integration, code splitting, auth guards | ✅ Complete |
| P2-A | Lazy loading all routes (code splitting) | ✅ Complete |
| P2-B | Dashboard + MyCourses react-query migration | ✅ Complete |
| P2-C | CourseDetail + Settings react-query migration | ✅ Complete |
| P2-D | Assessments react-query migration | ✅ Complete |
| P2-Docs | Documentation catch-up per MASTER_REFACTOR_INSTRUCTIONS.md | ✅ Complete |

### Next Phase

**P3: UX and Responsive Redesign.** See `MASTER_REFACTOR_INSTRUCTIONS.md` for full scope. Key deliverables from the P3 brief:
- Mobile-responsive sidebar (hamburger drawer)
- Component library in `src/components/ui/` (Button, Card, Badge, Input, Spinner)
- Skeleton loading states on Dashboard and CourseLibrary
- Toast notification system for mutations
- Submit-assessment confirmation dialog
- Responsive layout fixes for CourseDetail and AdminPanel
- Accessibility improvements (WCAG 2.1 AA)

---

## Critical Invariants

These must never be broken:

1. **All Supabase queries go through `src/lib/api.ts`** — no page or component imports `supabase` directly.
2. **All HTML rendered with `dangerouslySetInnerHTML` must use `safeHtml()`** — the DOMPurify wrapper in `api.ts`.
3. **Service role key never in client code or committed to git.**
4. **`VITE_SUPABASE_ANON_KEY` is public by design** — it's embedded in the bundle and protected by RLS.
5. **TypeScript must compile with 0 errors before any commit** — run `npx tsc --noEmit`.
6. **react-query key convention:** `['resource-name', userId]` for all user-scoped queries.

---

## Architecture Quick Reference

```
src/
  App.tsx          ← routes (all lazy) + auth guards
  main.tsx         ← QueryClientProvider + BrowserRouter + AuthProvider
  lib/
    api.ts         ← ALL database queries and mutations
    supabase.ts    ← Supabase client singleton (do not import elsewhere)
  contexts/
    AuthContext.tsx ← user, loading, refreshUser, signOut
  pages/           ← route components; own useQuery/useMutation
  components/      ← shared UI; receive props only
```

---

## Known Technical Debt

| Item | Priority | Document |
|------|----------|----------|
| No generated TypeScript types from Supabase schema | P3 | AI_CODE_REVIEW.md |
| `any` in useMutation error handlers | P3 | AI_CODE_REVIEW.md |
| No toast notifications — mutations give no visual feedback | P3 | UX_AUDIT.md |
| AdminPanel lacks sort/filter | P4 | UX_AUDIT.md |
| No staging environment | Before P4 launch | DEPLOYMENT_GUIDE.md |
| No error tracking (Sentry) | P4 | OBSERVABILITY.md |

---

## Supabase Project

| Property | Value |
|----------|-------|
| Project ref | `cthnljvcfnzxluedquxf` |
| URL | `https://cthnljvcfnzxluedquxf.supabase.co` |
| Anon key | In `.env` as `VITE_SUPABASE_ANON_KEY` — safe to commit |
| Service role key | Never in client code or git |

---

## How to Verify State Before Starting Work

```bash
# 1. Type check — must be 0 errors
npx tsc --noEmit

# 2. Build check — must succeed
npm run build

# 3. Verify no direct supabase imports in pages
grep -rn "from '../lib/supabase'" src/pages/
grep -rn "from './supabase'" src/pages/
# Should return empty

# 4. Verify no dangerouslySetInnerHTML without safeHtml
grep -rn "dangerouslySetInnerHTML" src/
# All results should include safeHtml()
```

---

## Common Patterns to Follow

### Adding a new data fetch
```typescript
// In api.ts
export async function fetchThing(userId: string): Promise<Thing[]> {
  const { data, error } = await supabase.from('things').select('*').eq('user_id', userId)
  if (error) throw error
  return data ?? []
}

// In page component
const { data, isLoading, isError } = useQuery({
  queryKey: ['things', user?.id],
  queryFn: () => fetchThing(user!.id),
  enabled: !!user,
})
```

### Adding a new mutation
```typescript
const mutation = useMutation({
  mutationFn: (payload: CreateThingPayload) => createThing(payload),
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['things', user?.id] })
  },
})
```

---

## Docs Index

All documentation lives in `docs/` and `adr/`:

- Architecture decisions: `adr/ADR-001.md` through `adr/ADR-004.md`
- Changelog/P2 report: `docs/CHANGELOG.md`
- Schema: `docs/DATABASE_SCHEMA.md`
- API: `docs/API_DOCUMENTATION.md`
- Security: `docs/SECURITY_CHECKLIST.md`
- Deployment: `docs/DEPLOYMENT_GUIDE.md`
- UX findings: `docs/UX_AUDIT.md`, `docs/UX_RESEARCH.md`
- Component conventions: `docs/COMPONENT_GUIDELINES.md`
- P3 scope: See `MASTER_REFACTOR_INSTRUCTIONS.md` § Phase 3
