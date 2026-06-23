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
