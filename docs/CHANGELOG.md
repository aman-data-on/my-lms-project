# Changelog

## Module Overview redesign — light theme + hover-collapse rail

- Date: 2026-06-27
- Summary: Redesigned the Module Overview page in an all-light theme (brand red `#ED3237` + ink black `#1A1A1A` as the only accents; no dark surfaces). The course rail is now light and **auto-collapses to a 76px icon strip, expanding to 280px on cursor hover** so the reading canvas reclaims the width. Added a richer, screen-filling overview: a rose-gradient hero band with decorative geometry, quick-stat chips, a primary "Start lesson" CTA, an animated 3-column topic-card grid (per-card glyphs inferred from topic content, hover-lift + accent sweep), and an encouragement strip. Fully responsive (single column + hamburger drawer on mobile).
- Content unchanged: all module/topic titles, the module summary, previews, and counts are rendered verbatim — only presentation (layout, icons, illustration, animation) was added, per the "no new facts" convention.
- Files modified:
  - [src/components/LessonWorkspace.tsx](src/components/LessonWorkspace.tsx) — redesigned `ModuleOverview`, hover-collapse rail wrapper, light mobile drawer, wider overview canvas (`max-w-[1600px]`).
  - [src/components/course/CourseSidebar.tsx](src/components/course/CourseSidebar.tsx) — converted dark rail → light; collapsed icon-rail mode (progress ring, glyph badges) that expands on hover via `group/rail`; added `forceExpanded` for the mobile drawer.
- Note: This intentionally departs from the previously documented "dark navigation chrome" invariant for this surface, at the user's explicit request (full light theme, hover-collapsible sidebar). Verified with the temporary Vite + headless-Chrome screenshot harness (desktop collapsed, expanded rail, mobile) — harness removed after verification. `tsc --noEmit` = 0 errors; `npm run build` passes.

## Phase 1 - Introduce router and API service (WIP)

- Date: 2026-06-23
- Summary: Added `react-router-dom` dependency, wrapped the app in `BrowserRouter`, refactored `src/App.tsx` to use `Routes`/`Route` with protected `RequireAuth` wrapper, updated `Sidebar` to use `NavLink` and router navigation, and added `src/lib/api.ts` as a lightweight Supabase service facade.

- Files modified:
  - [package.json](package.json)
  - [src/main.tsx](src/main.tsx)
  - [src/App.tsx](src/App.tsx)
  - [src/components/Sidebar.tsx](src/components/Sidebar.tsx)
  - [src/lib/api.ts](src/lib/api.ts)

- Root cause addressed: The app used manual state-based routing which prevented deep-linking, browser navigation, and clean URL sharing. Supabase calls were scattered across pages with no centralized service layer.

- Implementation details: Implemented React Router for URL-based routing and added an API wrapper to centralize DB access patterns (to be adopted across pages in subsequent commits).

- Expected impact: Enables bookmarkable URLs, back/forward navigation, and a clear path to move Supabase queries into a single service layer for better maintainability and testability.

- Next steps:
  1. Run `npm install` or preferred package manager to install `react-router-dom`.
  2. Incrementally refactor pages to use `src/lib/api.ts` instead of direct `supabase` calls.
  3. Update `Sidebar` UX to reflect route-based active states and improve ARIA attributes.
  4. Add unit/integration tests for route guards and API wrappers.

## P1 Security & Reliability Fixes

- Date: 2026-06-23
- Commits: `3d3d125`, `4eb9b45`, `dd2a930`
- Summary: Resolved all critical XSS vulnerabilities, added a global error boundary, and enforced role-based access control on admin routes.

### Fix 1 — XSS: Sanitize all `dangerouslySetInnerHTML` callsites (commit `3d3d125`)

**Vulnerability:** Seven `dangerouslySetInnerHTML` usages rendered HTML strings with no sanitization, enabling stored XSS via admin-authored lesson content and a legacy raw-HTML fallback path.

**Risk levels by source:**
| File | Line | Content source | Risk |
|------|------|---------------|------|
| `src/components/BlockRenderer.tsx` | 37 | `data.html` — DB (`lessons.video_url`) | HIGH |
| `src/components/BlockRenderer.tsx` | 114 | `data.rightText` image+text — DB | HIGH |
| `src/components/BlockRenderer.tsx` | 123 | `data.leftText` text+text — DB | HIGH |
| `src/components/BlockRenderer.tsx` | 127 | `data.rightText` text+text — DB | HIGH |
| `src/pages/CourseDetail.tsx` | 149 | `lesson.video_url` raw fallback — DB | HIGH |
| `src/components/BlockEditor.tsx` | 336 | editor preview, in-memory admin state | MEDIUM |
| `src/pages/SalesOnboardingCourse.tsx` | 2484 | `MODULE_SLIDES` hardcoded constant | LOW |

**Fix applied:**
- Created `src/lib/sanitize.ts` — single `safeHtml()` wrapper around `DOMPurify.sanitize()` with `USE_PROFILES: { html: true }`.
- Installed `dompurify@3.4.11` + `@types/dompurify@3.0.5`.
- All seven callsites updated to `dangerouslySetInnerHTML={{ __html: safeHtml(value) }}`.

**Files modified:** `src/lib/sanitize.ts` (created), `src/components/BlockRenderer.tsx`, `src/pages/CourseDetail.tsx`, `src/components/BlockEditor.tsx`, `src/pages/SalesOnboardingCourse.tsx`, `package.json`

---

### Fix 2 — Reliability: Global Error Boundary (commit `4eb9b45`)

**Problem:** Any unhandled React render error produced a white screen with no recovery path. No error was surfaced to the user or logged.

**Fix applied:**
- Created `src/components/ErrorBoundary.tsx` — class component using `getDerivedStateFromError` and `componentDidCatch`.
- Recovery UI: centered card with "Reload page" button and collapsible error details.
- `componentDidCatch` logs to console; stub comment marks where `Sentry.captureException()` should be wired in Phase 5.
- Wrapped the entire app in `App.tsx`: `<ErrorBoundary><AuthProvider><AppContent /></AuthProvider></ErrorBoundary>`.

**Files modified:** `src/components/ErrorBoundary.tsx` (created), `src/App.tsx`

---

### Fix 3 — Authorization: Admin route guard (commit `dd2a930`)

**Problem:** `/admin` and `/course-builder` routes were protected only by `RequireAuth` (session check). Any authenticated non-admin user who navigated directly to those URLs could access admin pages.

**Fix applied:**
- Added `RequireAdmin` component to `src/App.tsx` — reads `isAdmin` from `AuthContext`; redirects non-admins to `/`.
- Applied as `<RequireAuth><RequireAdmin>…</RequireAdmin></RequireAuth>` on both admin routes.

**Remaining risk (database level — not addressable from frontend):** A user who can call the Supabase API directly could update their own `profiles.role` to `'admin'` if no RLS policy blocks it. The required policy is:
```sql
CREATE POLICY "users cannot update their own role"
ON profiles FOR UPDATE
USING (auth.uid() = id)
WITH CHECK (role = (SELECT role FROM profiles WHERE id = auth.uid()));
```
This must be applied manually by a database operator.

**Files modified:** `src/App.tsx`

---

## Phase 2 - Foundation Improvements: State Management with react-query

- Date: 2026-06-23
- Summary: Added `@tanstack/react-query` (QueryClient) and refactored `CourseDetail` to use the centralized `src/lib/api.ts` with `react-query` hooks. This introduces caching, request deduplication, and a standard pattern for server state across the app.

- Files modified:
  - [package.json](package.json)
  - [src/main.tsx](src/main.tsx)
  - [src/pages/CourseDetail.tsx](src/pages/CourseDetail.tsx)
  - [src/lib/api.ts](src/lib/api.ts)
  - [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)
  - [docs/ADR-STATE-MANAGEMENT.md](docs/ADR-STATE-MANAGEMENT.md)

- Root cause addressed: No centralized query/cache layer led to duplicate requests, inconsistent loading/error handling, and scattered Supabase calls.

- Implementation details:
  - Added `@tanstack/react-query` to handle server state and caching.
  - Wrapped the app with `QueryClientProvider` in `src/main.tsx`.
  - Migrated `CourseDetail` to use `useQuery` for course, lessons, and progress, and API wrapper functions for mutations.

- Expected impact: Reduced duplicate network calls, improved perceived performance via caching, standardized loading/error states, and a clear pattern for future data fetching refactors.

- Validation: `npm run build` completed successfully after the Dashboard migration, confirming the `react-query` integration and production build pipeline.

- Next steps:
  1. Run `npm install` to add new packages.
  2. Incrementally migrate other pages to use `react-query` and `src/lib/api.ts`.
  3. Add devtools and configure retry/backoff policies for production readiness.

---

## P2 Completion — Foundation Improvements (All Sub-phases)

- Date: 2026-06-24
- Status: **COMPLETE**
- Validation: `npx tsc --noEmit` — 0 errors | `npm run build` — success

### P2-A — Route-level Code Splitting

**Problem:** All 12 page components were statically imported in `App.tsx`, bundling them into a single 1,326 KB main chunk served on every page load.

**Fix applied:**
- Converted all 12 page imports to `React.lazy(() => import(...))`.
- Added a `PageLoader` spinner component.
- Wrapped `<Routes>` in `<Suspense fallback={<PageLoader />}>`.

**Impact:** Main bundle 1,326 KB → 433 KB (−67%). Each page loads only when first visited.

**Files modified:** `src/App.tsx`

---

### P2-B — Lazy-load jsPDF + html2canvas

**Problem:** `Certificates.tsx` statically imported `jspdf` (358 KB) and `html2canvas` (202 KB), adding 560 KB to the Certificates chunk on every load even if the user never downloads a certificate.

**Fix applied:**
- Removed static `import` statements for both libraries.
- Added dynamic `Promise.all([import('html2canvas'), import('jspdf')])` inside `downloadPDF()` — libraries load only when the user clicks download.

**Impact:** Certificates chunk 572 KB → 11 KB (−98%). PDF libraries load on demand.

**Files modified:** `src/pages/Certificates.tsx`

---

### P2-C — react-query Migration: MyCourses, CourseLibrary, Certificates, Settings

**Problem:** Four pages used `useEffect` + `useState` for data fetching with direct `supabase` client calls. This produced duplicate requests on remount, no caching, inconsistent loading states, and no central error handling layer.

**Fix applied per page:**

| Page | Pattern | Changes |
|------|---------|---------|
| `MyCourses` | `useQuery` (read) | Removed `useEffect`/`useState`, added `fetchMyCourses` in api.ts |
| `CourseLibrary` | `useQuery` + `useMutation` | Parallel fetch courses+enrollments, `enrollInCourse` mutation with cache invalidation |
| `Certificates` | `useQuery` (read) | Replaced `useEffect`/`useState`, added `fetchCertificates` in api.ts |
| `Settings` | `useMutation` (write) | Replaced direct Supabase update, `updateProfile` mutation with `refreshUser()` callback |

**api.ts additions:** `fetchMyCourses`, `fetchCourseLibrary`, `enrollInCourse`, `fetchCertificates`, `updateProfile`

**Files modified:** `src/lib/api.ts`, `src/pages/MyCourses.tsx`, `src/pages/CourseLibrary.tsx`, `src/pages/Certificates.tsx`, `src/pages/Settings.tsx`

---

### P2-D — react-query Migration: Assessments

**Problem:** `Assessments.tsx` had 4 distinct server-data paths using direct `supabase` calls, including an N+1 serial loop that fetched question counts one assessment at a time.

**Fix applied:**
- **Main data load:** Replaced `fetchData()` + `useEffect` with `useQuery(['assessments-data', userId])` calling `fetchAssessmentsData()`. Grouping and sorting logic moved to api.ts.
- **Question counts:** Replaced N serial `select count` queries with a single `.in('assessment_id', ids)` query + JS aggregation. O(N) queries → 1 query.
- **`startAssessment`:** Replaced inline `supabase` calls with `fetchAssessmentQuestions()` + `startAssessmentAttempt()` from api.ts.
- **`handleSubmit`:** Replaced 5–6 inline `supabase` calls (attempt update, activity, certificate, phase_progress) with `submitAssessment()`. Cache invalidated via `queryClient.invalidateQueries` instead of manual re-fetch.
- **`handleCreateAssessment`:** Replaced direct Supabase insert loop with `useMutation` calling `createAssessment()`.
- **Timer `useEffect`:** Unchanged — pure client state, no server dependency.

**api.ts additions:** `SALES_COURSE_ID` (exported const), `SALES_ASSESSMENT_ORDER` (exported const), `fetchAssessmentsData`, `fetchAssessmentQuestions`, `startAssessmentAttempt`, `submitAssessment`, `createAssessment`

**Files modified:** `src/lib/api.ts`, `src/pages/Assessments.tsx`

---

### P2 Bundle Summary

| Chunk | Before P2 | After P2 | Δ |
|-------|-----------|----------|---|
| Main index | 1,326 KB | 433 KB | −67% |
| Certificates | 572 KB | 11 KB | −98% |
| Assessments | ~30 KB | 27 KB | −9% |
| jsPDF | (always loaded) | 358 KB on demand | deferred |
| html2canvas | (always loaded) | 202 KB on demand | deferred |

### P2 Direct Supabase Calls Eliminated

All pages now route server data through `src/lib/api.ts` and react-query. No page component imports `supabase` directly for data fetching (the Supabase client remains only in `api.ts` and `AuthContext`).

Pages fully migrated: `Dashboard`, `CourseDetail`, `MyCourses`, `CourseLibrary`, `Certificates`, `Settings`, `Assessments`

Pages deferred (P2-E, per original plan): `AdminPanel`, `CourseBuilder` — high complexity, admin-only, regression risk.

## P3+ - Module 1 premium lesson reader + project docs

- Date: 2026-06-26
- Summary: Built a data-driven lesson reader for Module 1 (dark course rail + light reading canvas) and added project guidance docs.
- Reader: `src/components/LessonWorkspace.tsx` + `src/components/course/*` (dark `CourseSidebar`, `CourseTopBar`, `LessonHeader`, `LearningObjectiveCallout`, `LessonNavigation`, `TopicIllustration`) + visual block system `src/components/blocks/*` with a central `VisualBlockRenderer` and a single lucide icon registry (`blocks/icons.tsx`, no emoji).
- Layout engine: two-column intro, auto-inferred vector illustrations, content-aware diagram+card horizontal pairing with equal-height cards, full-width lead.
- Content: Module 1 migrated to JSON blocks (`supabase/migrations/20260625000001` → `20260626000006`); bespoke `public/illustrations/who-we-are.svg`. All lesson facts sourced from the original course content — presentation only is new.
- Docs: added root `CLAUDE.md` (project guidance + full docs index), `docs/MEMORY.md` (durable decisions), refreshed `docs/AI_HANDOFF.md`. Convention: update CLAUDE.md / AI_HANDOFF.md / MEMORY.md / this CHANGELOG on every significant change.
- Verification: `tsc --noEmit` 0 errors, `npm run build` passes. First push to `origin/main` = commit `967586c`.
- Scope: Module 1 only; Modules 2–6 still use legacy `MODULE_SLIDES` in `SalesOnboardingCourse.tsx` (next migration target).
