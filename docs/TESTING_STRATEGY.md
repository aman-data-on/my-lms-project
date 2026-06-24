# Testing Strategy

> Current state (post-P2): Zero automated tests exist.
> This document defines the target testing strategy for P3 and beyond.

## Current State

| Type | Coverage | Tools |
|------|---------|-------|
| Unit tests | 0% | None configured |
| Integration tests | 0% | None configured |
| Component tests | 0% | None configured |
| E2E tests | 0% | None configured |
| Type checking | ✅ | `npx tsc --noEmit` (zero errors post-P2) |
| Build validation | ✅ | `npm run build` runs in CI |

---

## Recommended Stack

| Layer | Tool | Reason |
|-------|------|--------|
| Unit / Integration | **Vitest** | Native Vite integration; Jest-compatible API; fast |
| Component | **React Testing Library** | Tests user behavior, not implementation; pairs with Vitest |
| E2E | **Playwright** | Cross-browser; reliable; handles Supabase auth flows |
| API mocking | **MSW (Mock Service Worker)** | Intercepts at network level; works in browser + Node |

---

## Test Priority Matrix

### Tier 1 — Must have before production

| Test | Type | Rationale |
|------|------|-----------|
| Auth flow: login → redirect to dashboard | E2E | Core user journey; previously broken |
| Auth flow: unauthenticated → redirected to `/auth` | E2E | Security |
| Admin route guard: non-admin redirected from `/admin` | E2E | Authorization |
| Assessment submission: score computed correctly | Unit | Business logic |
| `safeHtml()` strips `<script>` tags | Unit | XSS prevention |
| `api.ts` functions: throw on Supabase error | Unit | Error propagation |

### Tier 2 — High value

| Test | Type | Rationale |
|------|------|-----------|
| Course enrollment flow: enroll → appears in MyCourses | E2E | Core feature |
| Assessment: timer counts down; auto-submits at zero | Component | Complex timer state |
| Certificate PDF download: triggers dynamic import | Component | Lazy loading |
| Profile update: saves and refreshes user context | Integration | Data mutation |
| Sales Onboarding lock: phase 2 locked until phase 1 passed | Integration | Business rule |

### Tier 3 — Nice to have

| Test | Type | Rationale |
|------|------|-----------|
| All pages render without crashing | Component | Regression safety |
| Sidebar active state matches current route | Component | Navigation UX |
| Empty states render when no data | Component | UX |
| AdminPanel: create assessment → appears in list | E2E | Admin workflow |

---

## Vitest Configuration (proposed)

```typescript
// vitest.config.ts
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov'],
      include: ['src/lib/**', 'src/components/**'],
    },
  },
})
```

```typescript
// src/test/setup.ts
import '@testing-library/jest-dom'
import { server } from './mocks/server'

beforeAll(() => server.listen())
afterEach(() => server.resetHandlers())
afterAll(() => server.close())
```

---

## MSW API Mocking Structure

```
src/test/
├── mocks/
│   ├── handlers.ts        # MSW request handlers for all api.ts functions
│   ├── server.ts          # Node server for Vitest
│   └── browser.ts         # Browser service worker for development
├── fixtures/
│   ├── users.ts           # Mock user profiles
│   ├── courses.ts         # Mock course data
│   └── assessments.ts     # Mock assessment data
└── setup.ts               # Global test setup
```

---

## E2E Playwright Configuration

```typescript
// playwright.config.ts
import { defineConfig } from '@playwright/test'

export default defineConfig({
  testDir: './e2e',
  use: {
    baseURL: 'http://localhost:5173',
    storageState: 'e2e/auth.json',  // saved auth session
  },
  projects: [
    { name: 'chromium', use: { channel: 'chrome' } },
    { name: 'firefox' },
  ],
})
```

E2E tests run against a Supabase test project (separate from production).

---

## CI Integration (P4 deliverable)

```yaml
# .github/workflows/ci.yml
- name: Type check
  run: npx tsc --noEmit

- name: Unit + Integration tests
  run: npx vitest run --coverage

- name: Build
  run: npm run build

- name: E2E tests
  run: npx playwright test
```

---

## Implementation Plan

| Phase | Deliverable | When |
|-------|-----------|------|
| P3 | Vitest + RTL setup; unit tests for `api.ts` + `sanitize.ts` | P3 start |
| P3 | Component tests for `ErrorBoundary`, `Sidebar`, `Assessments` timer | P3 mid |
| P4 | Playwright E2E for Tier 1 flows | P4 start |
| P4 | CI/CD pipeline with all test tiers | P4 |
| P5 | Coverage target: 60% on `src/lib/` and `src/components/` | P5 |
