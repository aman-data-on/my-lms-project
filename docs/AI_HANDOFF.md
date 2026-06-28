# AI Handoff Notes

> Context document for AI-assisted development continuity.
> Maintained by: Claude Code (Anthropic) on behalf of the development team.
> Last updated: 2026-06-28
> See also: [../CLAUDE.md](../CLAUDE.md) (start here + docs index) and
> [MEMORY.md](MEMORY.md) (durable decisions). Update all three on each change.

---

## Project State Summary

Phases 1–2 (routing, react-query) are complete. The **Phase-1 premium reader**
now powers **all six Phase-1 modules** via the generalized `Module1Reader`, and
this arc added **topic-level progression**, a **module-completion modal**, a
**dashboard resume** fix, and **app-wide toast feedback** (the formerly-unused
toast system is now wired everywhere). Codebase is stable: 0 TypeScript errors,
passing production build. This arc lives on branch `phase1-lms-redesign` (PR into
`main`); earlier work landed on `main` through `967586c`.

### Completed Phases

| Phase | Description | Status |
|-------|-------------|--------|
| P1 | React Router v6 integration, code splitting, auth guards | ✅ Complete |
| P2 | react-query data layer (Dashboard, MyCourses, CourseDetail, Assessments) | ✅ Complete |
| P2-Docs | Documentation catch-up | ✅ Complete |
| P3 | Responsive app shell, mobile sidebar a11y, shared UI foundation | ✅ Complete |
| P3+ | Phase-1 premium reader — Modules 1–6 on the generalized `Module1Reader` | ✅ Complete |
| P3+ | Topic-level progression (`topic_progress`, completion model, resume) | ✅ Complete |
| P3+ | Module-completion modal, dashboard resume, silent-failure/toast pass | ✅ Complete |

### Phase-1 premium reader + this arc (current flagship)

A data-driven lesson experience — **dark course rail + light reading canvas** — in
`src/components/Module1Reader.tsx` for all Phase-1 modules (Phase 2+ still use
`LessonWorkspace.tsx`). Built across several sessions:

- Reader chrome: dark `CourseSidebar` (active/done/locked states, module
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

**This arc (`phase1-lms-redesign`) added:**

- **Topic-level progression** — `topic_progress` (own-row RLS) + completion model
  in `src/lib/completion.ts` (per-topic rules, weighted) rolling up into
  `lesson_progress` (unlock authority unchanged); resume =
  first-incomplete-required → last-visited → first-topic. Migration
  `supabase/migrations/20260627000003_topic_progress.sql`.
- **Module-completion modal** — `src/components/ModuleCompleteModal.tsx`. End CTA
  "Mark Module Complete" → marks complete, unlocks next, shows an Award modal
  (real objective = the lesson's authored "Goal", course-wide X/N, "Module N
  unlocked"); Continue, or Back to Dashboard / ESC. No confetti. Wired in
  `CourseDetail.markCompleteAndContinue`.
- **Dashboard "Continue Learning" fix** — the `enrollments → courses(...)` embed
  is an OBJECT; reading `courses[0]` left fields undefined → empty slug → dead
  button. Now reads the object and deep-links to the resume lesson.
- **No silent failures** — the toast system (`useToast`) is now wired across
  enroll, assessments, certificate download, course-builder save, and admin
  actions (loading → disabled + spinner; errors → toast). `api.ts` upserts pass
  `onConflict` (natural key).

### Next Phase / step

- **Extend to Phase 2+** (modules still on `LessonWorkspace`): the completion
  modal already fires there; migrate their content/visuals to the premium reader
  when ready.
- **Held (need explicit go):** auto knowledge-checks, flashcards (canonical
  content only), large visual refactors.
- Optional: generated Supabase types; wire top-bar account actions to real data.

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
| ~~No toast notifications~~ → toast system wired app-wide (this arc) | ✅ Done | UX_AUDIT.md |
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
