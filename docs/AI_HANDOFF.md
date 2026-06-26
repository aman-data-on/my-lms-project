# AI Handoff Notes

> Context document for AI-assisted development continuity.
> Maintained by: Claude Code (Anthropic) on behalf of the development team.
> Last updated: 2026-06-26
> See also: [../CLAUDE.md](../CLAUDE.md) (start here + docs index) and
> [MEMORY.md](MEMORY.md) (durable decisions). Update all three on each change.

---

## Project State Summary

Phases 1–2 (routing, react-query data layer) are complete. Phase 3 (UX/responsive
redesign) is underway, and the **Module 1 premium lesson reader** is built and
shipped. Codebase is stable: 0 TypeScript errors, passing production build.
First push to `origin/main` landed as commit `967586c`.

### Completed Phases

| Phase | Description | Status |
|-------|-------------|--------|
| P1 | React Router v6 integration, code splitting, auth guards | ✅ Complete |
| P2 | react-query data layer (Dashboard, MyCourses, CourseDetail, Assessments) | ✅ Complete |
| P2-Docs | Documentation catch-up | ✅ Complete |
| P3 | Responsive app shell, mobile sidebar a11y, shared UI foundation | ✅ Complete |
| P3+ | **Module 1 premium reader** (see below) | ✅ Complete |

### Module 1 premium reader (current flagship)

A data-driven lesson experience for Module 1 — **dark course rail + light reading
canvas** — that replaced the old slide blob. Built across several sessions:

- `LessonWorkspace.tsx`: dark `CourseSidebar` (active/done/locked states, module
  progress, unlock card), `CourseTopBar` (progress + account actions), breadcrumb
  + large red lesson number header, prev/up-next/next nav, mobile drawer.
- Visual block system + central `VisualBlockRenderer`: timeline, key_facts,
  architecture, ecosystem, use_case, feature_benefit, comparison, process,
  scenario, data_viz, flashcards, knowledge_check. One lucide icon registry
  (`blocks/icons.tsx`) — no emoji.
- Content-aware layouts: two-column intro, auto-inferred vector illustrations
  (`TopicIllustration.tsx`), diagram+card horizontal pairing with equal-height
  cards, full-width lead, bespoke `public/illustrations/who-we-are.svg`.
- Module 1 content migrated to JSON blocks via `supabase/migrations/2026062500000*`
  → `2026062600000*`. **All lesson facts sourced from the original content; only
  presentation is new** (see [MEMORY.md](MEMORY.md)).

### Next Phase / step

- **Migrate Modules 2–6** off the legacy hardcoded `MODULE_SLIDES` in
  `SalesOnboardingCourse.tsx` into JSON blocks + the new reader (one module at a
  time). Everything (sidebar, icons, illustrations, layout engine) is reusable.
- Remaining P3 items: toast notifications, `src/components/ui/` library
  completion, AdminPanel responsive/sort-filter, generated Supabase types.
- Optional: wire the top-bar account actions (avatar/notifications) to real data.

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
