# Changelog

## Icons — fix empty KPI slot + section-heading icons (2026-06-27)

- Bug: the "Global Presence" key-fact rendered an empty box — its data icon was `servers`, which wasn't in the registry (only `server`), so it resolved to nothing.
- Registry ([src/components/blocks/icons.tsx](../src/components/blocks/icons.tsx)): added `servers` + semantic aliases (team, customer, security, performance, features, benefits, architecture, comparison, company, chip) — all mapping to already-imported Lucide icons. One library, no emoji.
- Reader ([src/components/Module1Reader.tsx](../src/components/Module1Reader.tsx)): `BIcon` now falls back to a neutral icon instead of an empty slot (can never ship a blank box again); added semantic icons to every section heading (Building / Cloud / Layers / Clock / Boxes / TrendingUp / Users / Share2) and the hero eyebrow.
- Semantics ([supabase/migrations/20260627000002_module1_global_icon.sql](../supabase/migrations/20260627000002_module1_global_icon.sql), **pushed**): "Global Presence" now uses `globe` instead of `servers` (Global → Globe).
- Verified live: scan of all icon containers reports **0 empty**, 12 section-heading icons present; `tsc` 0 errors, `npm run build` passes.

## Module 1 — Growth Timeline two-column + growth arc (2026-06-27)

- The Growth Timeline topic was a left-aligned list with an empty right half. Made it two-column ([src/components/Module1Reader.tsx](../src/components/Module1Reader.tsx)): left 50% keeps the timeline (years + events, tighter row spacing); right 50% is a new `GrowthArc` SVG.
- `GrowthArc` (Option B): a rising trajectory built from the real timeline steps — a red growth line through all eras with labelled milestone dots (Founded 2006 → Rebrand 2009 → Global 2010–14 → CloudJiffy 2018 → Acquired 2023–24 → CloudPe 2024 → India 2025 → Today), a "GROWTH" axis, and a "22,000+ customers today" impact callout at the endpoint. All labels are real source data; the chart conveys the growth story on its own.
- Cool palette to match the reader; stacks to one column below 980px. `tsc` 0 errors, `npm run build` passes; verified live (arc labels dumped from the DOM are all real).

## Module 1 reader — fix split overlap + drop card persona tags (2026-06-27)

- **Overlap**: a tall split-topic illustration (e.g. "What Leapswitch Provides") rode up into the section above it because section spacing depended on the heading's top margin, which the centered split absorbed — and the preceding `key_facts` strip has no heading. Fixed in [src/components/Module1Reader.tsx](../src/components/Module1Reader.tsx): every `.m1-sec` now carries a uniform `margin-top`, the heading's top margin is removed, and split sections are `align-items:start` (illustration top-aligns with the heading). Verified: 0 overlapping sections.
- **Eyebrow/persona tag**: removed the per-card persona label (AI / ML, GOVERNMENT, …) from the use-case cards — cards now show icon + title + description only. Verified: 0 persona tags remain.
- `tsc` 0 errors, `npm run build` passes.

## Phase 1 — real, self-explanatory diagrams (2026-06-27)

- Problem: the `TopicIllustration` SVGs added in the redesign were generic skeletons (gray placeholder bars, no real labels) — decorative, not instructional.
- Fix: extended `TopicIllustration` ([src/components/course/TopicIllustration.tsx](../src/components/course/TopicIllustration.tsx)) with a `content` prop + a `LabeledDiagram` renderer that draws **actual text** in four shapes — `flow` (ordered steps), `stack` (named layers + items), `hub` (centre + labelled satellites), `pillars` (titled columns) — tone-aware, plus a `plain` Frame mode. No new component.
- Module 1 reader ([src/components/Module1Reader.tsx](../src/components/Module1Reader.tsx)): hero + all 4 text topics now pass real, source-derived labels:
  - Hero / "Who We Are — CloudPe": **flow** Leapswitch → CloudPe → Customers (with what each does).
  - "Who We Are — Leapswitch": **hub** Leapswitch → Startups / Enterprises / Government / Tech companies.
  - "What Leapswitch Provides": **stack** Cloud & app platforms (CloudPe, CloudJiffy) / Managed & protection / Core infrastructure (Compute, Storage, Network, Colocation).
  - "CloudPe in Practice": **hub** CloudPe → Predictable pricing / India-hosted / Enterprise support / AI-ready.
- Modules 2–6 (`LessonWorkspace`): stopped shipping the generic skeleton beside text when the topic already has a real teaching block (process flow, comparison, etc.); the module-overview hero now renders the **actual topic names** as a labelled flow instead of a skeleton.
- Verified live: M1 diagram text dumped from the DOM shows real labels (Leapswitch, CloudPe, Customers, Startups, "Core infrastructure: Compute · Storage · Network · Colocation", …); M2 overview hero shows real topic names; M2 topic pages report **0 content-free skeleton SVGs**. `tsc` 0 errors, `npm run build` passes. (No DB change — component-only; Modules 2–6 content migration was already pushed.)

## Phase 1 redesign — two-column heroes + per-topic visuals (2026-06-27)

- Audited every Module 1–6 topic (visual? layout? whitespace?), got approval, then applied the approved fixes.
- **Module 1 reader** ([src/components/Module1Reader.tsx](../src/components/Module1Reader.tsx)): hero is now two-column — content left (55%), instructional SVG right (45%) — fixing the empty right side. Every text topic over 20 words is now a two-column **text (55%) + concept illustration (45%)** layout; short text (<20 words) stays in a centered reading column (never stretched, no decorative filler). Architecture/timeline/ecosystem/comparison stay full-width. Responsive: stacks below 980px.
- **Instructional SVGs**: reused the existing `TopicIllustration` library (no new component) and added a `tone='cool'` variant ([src/components/course/TopicIllustration.tsx](../src/components/course/TopicIllustration.tsx)) that flattens the two gradients to solids and retints the frame (panel/border/dots) to the Kinetic reader's cool palette. The default `rose` tone (used by Modules 2–6 / LessonWorkspace) is unchanged.
- **Modules 2–6**: left on `LessonWorkspace` (which already renders a two-column hero + content-aware text+diagram layouts). The pending teaching-visuals migration [20260627000001_phase1_teaching_visuals.sql](../supabase/migrations/20260627000001_phase1_teaching_visuals.sql) was **pushed to the remote DB** — so every Module 2–6 topic now carries a learning artifact live.
- Verified: `tsc` 0 errors, `npm run build` passes, and driven live in-browser at 1280px and 1024px — M1 hero + all 4 text topics show cool instructional SVGs (5 SVGs, 0 errors); Modules 2–6 confirmed block-based live and rendering their teaching visuals.

## Phase 1 — every topic must teach (2026-06-27)

- Rule applied: no topic may be text-only unless it's under 20 words; every topic over 20 words now carries at least one learning artifact, and every visual teaches (no decorative images/emoji). Applied first to **Phase 1 (Modules 1–6)**.
- Module 1 already complied. Modules 2–6 were single plain-text HTML blobs (with prohibited emoji and inline-styled pseudo-cards) — each effectively one giant text-only topic. New migration [supabase/migrations/20260627000001_phase1_teaching_visuals.sql](../supabase/migrations/20260627000001_phase1_teaching_visuals.sql) rewrites their `video_url` into block content where each section's prose is paired with a teaching visual **derived only from the existing source facts** (no invented content):
  - **M2 Cloud Market**: evolution `process_flow`, why-moved `feature_benefit`, deployment-model `use_case_cards`, future-trends `feature_benefit`, IaaS/PaaS/SaaS `comparison`, where-we-fit `architecture_diagram`.
  - **M3 Infrastructure Portfolio**: infra-stack `architecture_diagram`, Bare-Metal/GPU `use_case_cards`, services `feature_benefit`, priority products `process_flow`.
  - **M4 CloudPe Portfolio**: VPS/CloudJiffy `use_case_cards`, add-ons `feature_benefit`.
  - **M5 Features & Value**: feature-vs-value `comparison`, Feature→Benefit→Value `process_flow`, value-mapping `feature_benefit`, challenge→solution + practice `scenario_cards`.
  - **M6 Internal Team Structure**: 14-team `use_case_cards`, customer-priorities `feature_benefit`.
- Icons come from the block registry (one icon system); emoji removed. A builder-side validator confirms every >20-word text topic is followed by a learning artifact.
- Verified: rendered all 60 blocks through the real `VisualBlockRenderer` in a temporary harness (now removed) — 5 modules, **0 fallbacks, 0 render errors**; `tsc` 0 errors; `npm run build` passes.
- ⚠️ Not yet live: the content ships as a migration — run `npx supabase db push` to apply it to the database (requires admin DB access, which the session did not have).

## Module 1 reader — adaptive content width (2026-06-27)

- Problem: the reader used one fixed `940px` content stage, so text and visuals alike were trapped in a narrow column with large empty side gutters on laptop/desktop.
- Fix ([src/components/Module1Reader.tsx](../src/components/Module1Reader.tsx)): made the stage container-relative (`.scroll` is now `container-type:inline-size`) and gave each section a width based on its content type — text/hero use a comfortable reading column (`--w-read: min(100%,820px)`), visuals break out wide (`--w-wide: min(100%,1520px)`) sharing the same left edge. Side padding scales with `clamp(20px,3.5cqi,56px)`.
- Result (measured live): reading holds at ~820px everywhere; visuals scale 991px (1366) → 1209px (1600) → ~1408px (1920+), filling ~93% of the workspace on laptop/desktop and capping at ~1408 on ultra-wide so lines stay readable without huge gutters. Card/feature grids switched to `auto-fit minmax(...)` so they reflow (e.g. feature-benefit → 2 cols on laptop, 4 on wide). No hardcoded per-breakpoint widths — scales smoothly via `min()`/`clamp()`/container units.
- Verified: `tsc` 0 errors, `npm run build` passes, screenshots at 1366/1600/1920/2560.

## Module 1 reader — full course-hierarchy navigation (2026-06-27)

- Summary: Replaced the Module 1 reader's flat rail with a GitBook/MS-Learn-style Phase → Module → Topic navigation in [src/components/Module1Reader.tsx](../src/components/Module1Reader.tsx), fed by a `courseTree` built in [CourseDetail](../src/pages/CourseDetail.tsx) (`deriveTopics` parses every lesson's blocks so the tree shows all phases/modules/topics).
- Behaviour: phases + modules are accordions (current phase + current module expanded by default, others collapsed); smooth max-height animation. **IntersectionObserver** scroll-spy highlights the current topic and auto-scrolls the active item into view; clicking a topic smooth-scrolls to its section (clicking a non-active module navigates to it). Footer **Next** advances topic-by-topic, then becomes "Mark complete / Next module" at the end.
- Progress at every level: phase (completed-modules count + bar), module (completed-topics count), topic (completed ✓ / current / visited / upcoming / locked).
- UX: sticky desktop rail with independent scroll; compact spacing; completed items get subtle green checks; active item has a red accent bar. Added a **mobile drawer** (hamburger + slide-in over a scrim + close) so the nav is reachable < 980px. `prefers-reduced-motion` respected.
- Gotcha fixed: the accordion wrapper was renamed from `.collapse` to `.acc` — Tailwind's global `.collapse` utility (`visibility:collapse`) was hiding all nested nav content.
- Verified: `tsc --noEmit` 0 errors, `npm run build` passes, driven live in-browser (login → Module 1) — 5 phases with correct counts, scroll-spy tracking confirmed, accordion + mobile drawer working.

## Module 1 reader — Kinetic Enterprise design (2026-06-27)

- Summary: Ported the "Kinetic Enterprise" design system ([docs/design/companyoverview.md](design/companyoverview.md)) into the live **Module 1 — Company Overview** reader. New self-contained component [src/components/Module1Reader.tsx](../src/components/Module1Reader.tsx), rendered by [CourseDetail](../src/pages/CourseDetail.tsx) only for the Company Overview lesson (`/company overview/i` + index 0); all other modules keep the standard `LessonWorkspace`.
- Design: cool `#f6faff` surfaces, Obsidian `#293138` rail, Action Red `#b7102a` accent, Hanken Grotesk / Inter / JetBrains Mono (added the two new faces to [index.html](../index.html)). Single-scroll layout with scroll-spy rail; the growth timeline is the one motion moment (stagger-reveal, `prefers-reduced-motion` respected).
- Content: driven entirely by the lesson's DB blocks (`lesson.video_url` JSON) — timeline, key facts, architecture layers, feature/benefit, ecosystem, use-case cards — via the shared icon registry ([blocks/icons.tsx](../src/components/blocks/icons.tsx)). No invented facts; hero headline/lead are framing copy only. All styles scoped under `.m1k` so the theme can't leak to other modules.
- Verified: `tsc --noEmit` 0 errors, `npm run build` passes, and driven live in-browser (login → Module 1 reader) at desktop + 390px mobile — renders correctly, no console errors beyond the pre-existing best-effort `seed-users` 401.

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
