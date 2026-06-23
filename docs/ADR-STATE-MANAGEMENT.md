# ADR: State Management - Adoption of @tanstack/react-query

- Date: 2026-06-23
- Status: Accepted (Phase 2)

## Context
The codebase currently performs direct Supabase queries inside component-level effects across multiple pages, leading to duplicated requests, inconsistent loading/error handling, and no caching or deduplication.

## Decision
Adopt `@tanstack/react-query` (react-query) as the primary server-state/data-fetching library. Provide a single `QueryClient` at app root, and migrate existing direct Supabase calls to a small service layer (`src/lib/api.ts`) that is consumed via `useQuery`/`useMutation` hooks.

## Consequences
- Positive:
  - Caching and request deduplication across components
  - Declarative data fetching with standardized loading/error states
  - Easy invalidation and background refetching
  - Simpler migration path for optimistic updates and pagination
- Negative:
  - Another dependency to maintain
  - Requires developer familiarity and discipline to use hooks properly

## Implementation Notes
- Add `@tanstack/react-query` to dependencies and wrap `App` with `QueryClientProvider` in `src/main.tsx`.
- Create `src/lib/api.ts` as a thin wrapper around Supabase; expose promise-returning functions for queries and mutations.
- Migrate pages incrementally (start with high-traffic pages like `CourseDetail`, `Dashboard`).
- Add `react-query` devtools during development for debugging.

## Alternatives Considered
- Redux Toolkit Query: heavier and more opinionated for this codebase
- Apollo Client: not appropriate (not GraphQL)
- Manual fetch with caching layer: more effort and reimplementation of features react-query provides

## Decision Makers
- Lead developer (approved)
