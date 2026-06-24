# Developer Guide

> Onboarding guide for new contributors to the Employee Onboarding LMS project.
> Last updated: 2026-06-24

## Tech Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| Frontend | React | 18 |
| Language | TypeScript | 5.x |
| Styling | Tailwind CSS | 3.x |
| Routing | React Router | 6.x |
| Server state | TanStack React Query | 5.x |
| Backend | Supabase | (hosted) |
| Auth | Supabase Auth | (hosted) |
| Build | Vite | 5.x |
| Icons | Lucide React | latest |

---

## Getting Started

```bash
# 1. Clone repository
git clone <repo-url>
cd project

# 2. Install dependencies
npm install

# 3. Copy environment variables (ask team for values or see DEPLOYMENT_GUIDE.md)
cp .env.example .env
# Fill in VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY

# 4. Start dev server
npm run dev
# → http://localhost:5173
```

---

## Test Accounts

| Email | Password | Role |
|-------|----------|------|
| `admin@leapswitch.com` | `Admin@123` | Admin |
| `john.doe@leapswitch.com` | `Employee@123` | Employee |
| `jane.smith@leapswitch.com` | `Employee@123` | Employee |

---

## Project Structure

See `FOLDER_STRUCTURE.md` for full layout. Key files:

| File | Purpose |
|------|---------|
| `src/App.tsx` | Route definitions and auth guards |
| `src/main.tsx` | App entry: providers (QueryClient, Router, Auth) |
| `src/lib/api.ts` | All Supabase queries and mutations |
| `src/lib/supabase.ts` | Supabase client singleton |
| `src/contexts/AuthContext.tsx` | Auth state and helper hooks |

---

## Architecture Principles

1. **Pages fetch, components display** — pages own `useQuery`/`useMutation`; shared components receive props.
2. **All data through `api.ts`** — no page or component imports `supabase` directly.
3. **All HTML through `safeHtml()`** — every `dangerouslySetInnerHTML` uses the DOMPurify wrapper.
4. **Lazy routes** — all page imports use `React.lazy()` for code splitting.
5. **react-query key convention** — all user-scoped queries include `userId` as the second key: `['resource-name', userId]`.

---

## Making Changes

### Adding a new page

1. Create `src/pages/NewPage.tsx`
2. Add a lazy import in `src/App.tsx`:
   ```typescript
   const NewPage = lazy(() => import('./pages/NewPage'))
   ```
3. Add a `<Route>` in `App.tsx`
4. Add a nav link in `src/components/Sidebar.tsx`
5. Add any server data functions to `src/lib/api.ts`

### Adding a new API function

1. Add the function to `src/lib/api.ts`
2. Keep it a plain `async` function — no React hooks
3. Follow the naming pattern: `fetchXxx` for reads, `mutateXxx`/verb for writes
4. Throw errors (`if (error) throw error`) — let react-query catch them

### Adding a database migration

1. Create file: `supabase/migrations/YYYYMMDDHHMMSS_description.sql`
2. Write SQL with `IF NOT EXISTS` guards
3. Document rollback SQL in a comment
4. Apply: `npx supabase db push`
5. Update `DATABASE_SCHEMA.md` and `DATABASE_MIGRATIONS.md`

### Adding a Supabase edge function

1. `npx supabase functions new function-name`
2. Write handler in `supabase/functions/function-name/index.ts`
3. Deploy: `npx supabase functions deploy function-name`

---

## Git Workflow

```bash
# Branch from master
git checkout -b feat/my-feature

# Work in small commits
git add src/pages/MyPage.tsx src/lib/api.ts
git commit -m "feat(my-feature): add initial page with data query"

# Type check before pushing
npx tsc --noEmit

# Build check before PR
npm run build
```

### Commit message format

```
type(scope): short description

Types: feat, fix, perf, refactor, docs, chore, test
Scope: page name, feature name, or layer (api, auth, db)

Examples:
feat(assessments): add phase-lock UI for sales onboarding
fix(auth): redirect authenticated users away from /auth
perf(p2-a): lazy-load all routes with React.lazy
docs(security): add RLS migration guide
```

---

## Common Tasks

### Reseed test users
```bash
curl -X POST \
  $VITE_SUPABASE_URL/functions/v1/seed-users \
  -H "Authorization: Bearer $VITE_SUPABASE_ANON_KEY"
```

### Check TypeScript errors
```bash
npx tsc --noEmit
```

### Verify production build
```bash
npm run build && npm run preview
```

### Check migration status
```bash
npx supabase migration list
```

---

## Troubleshooting

| Problem | Likely cause | Fix |
|---------|-------------|-----|
| 400 on login | User not in database | Reseed test users |
| Data not loading | Wrong Supabase project in `.env` | Check `VITE_SUPABASE_URL` |
| `supabase` not found after migration | Old import in a page | All data through `api.ts`; run `grep -r "from '../lib/supabase'" src/pages/` |
| Page not loading, stays on spinner | lazy import path wrong | Check `React.lazy(() => import('./pages/PageName'))` |
| TypeScript error after edit | Stale IDE diagnostics | Run `npx tsc --noEmit` for authoritative errors |
| RLS error in console | User accessing unauthorized data | Check RLS policies in Supabase dashboard |

---

## Architecture Decision Records

See `adr/` directory for decisions on:
- [ADR-001](../adr/ADR-001.md): React Router
- [ADR-002](../adr/ADR-002.md): DOMPurify XSS protection
- [ADR-003](../adr/ADR-003.md): TanStack React Query
