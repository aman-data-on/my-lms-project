# Changelog

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
