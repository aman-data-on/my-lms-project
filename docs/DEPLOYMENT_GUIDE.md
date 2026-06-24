# Deployment Guide

> Last updated: 2026-06-24
> Stack: Vite (frontend) + Supabase (backend)

## Prerequisites

- Node.js 18+
- npm 9+
- Supabase CLI (`npm i -g supabase` or `npx supabase`)
- Access to Supabase project `cthnljvcfnzxluedquxf`

---

## Environment Variables

| Variable | Value | Source |
|----------|-------|--------|
| `VITE_SUPABASE_URL` | `https://cthnljvcfnzxluedquxf.supabase.co` | Supabase project settings |
| `VITE_SUPABASE_ANON_KEY` | `eyJhbGciOiJIUzI1NiIs...` | Supabase project settings → API |

Both are **public by design** — the anon key is embedded in the JS bundle and protected by Supabase RLS, not by being secret.

**Never add to `.env`:**
- `SUPABASE_SERVICE_ROLE_KEY` — must never reach the client
- Any API keys for third-party services

---

## Local Development

```bash
# Install dependencies
npm install

# Start dev server (hot reload)
npm run dev
# → http://localhost:5173

# Type check (run before committing)
npx tsc --noEmit

# Production build (validate before deploying)
npm run build
npm run preview  # serve dist/ locally
```

---

## Database Setup (new environment)

```bash
# 1. Log in to Supabase CLI
npx supabase login
# Follow browser auth flow

# 2. Link to project
npx supabase link --project-ref cthnljvcfnzxluedquxf

# 3. Apply all migrations
npx supabase db push

# 4. Verify migrations applied
npx supabase migration list

# 5. Deploy edge function
npx supabase functions deploy seed-users

# 6. Seed test users (curl)
curl -X POST \
  https://cthnljvcfnzxluedquxf.supabase.co/functions/v1/seed-users \
  -H "Authorization: Bearer <VITE_SUPABASE_ANON_KEY>"
```

---

## Frontend Deployment

### Option A: Netlify (recommended)

1. Connect GitHub repository to Netlify
2. Set build command: `npm run build`
3. Set publish directory: `dist`
4. Add environment variables in Netlify dashboard:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
5. Add `_redirects` file to `public/` for SPA routing:
   ```
   /*  /index.html  200
   ```

### Option B: Vercel

1. Connect GitHub repository to Vercel
2. Framework preset: Vite
3. Add environment variables in Vercel dashboard
4. SPA routing is handled automatically by Vercel

### Option C: Manual (VPS / S3)

```bash
npm run build
# Upload dist/ to web server or S3 bucket
# Configure server to serve index.html for all 404s (SPA requirement)
```

---

## Supabase Auth Configuration

In Supabase Dashboard → Authentication → URL Configuration:

| Setting | Value |
|---------|-------|
| Site URL | `https://your-domain.com` |
| Redirect URLs | `https://your-domain.com/**` |

Without correct redirect URLs, OAuth and magic link flows will fail.

---

## Adding a New Migration

```bash
# Create migration file (auto-timestamps)
npx supabase migration new my_migration_name

# Edit the file in supabase/migrations/
# Then apply:
npx supabase db push
```

---

## Rollback Procedure

Supabase does not support automatic rollbacks. Manual process:

1. Write reverse SQL in a new migration file
2. Apply via `npx supabase db push` or Supabase SQL editor
3. Archive or remove the original migration file (if not yet pushed to production)

---

## Production Checklist

Before going live:

- [ ] `npx tsc --noEmit` — 0 errors
- [ ] `npm run build` — succeeds
- [ ] Supabase Auth redirect URLs configured for production domain
- [ ] RLS enabled on all tables (verify in Supabase dashboard)
- [ ] `seed-users` edge function disabled or protected (no prod seeding)
- [ ] Error tracking (Sentry) configured — see `OBSERVABILITY.md`
- [ ] CSP headers added in hosting config
- [ ] Environment variables set in hosting dashboard (not in `.env`)

---

## Current Environment Status

| Environment | URL | Database | Status |
|-------------|-----|----------|--------|
| Production | TBD | `cthnljvcfnzxluedquxf` | Active (development) |
| Staging | Not created | Not created | ❌ Missing |
| Local | `localhost:5173` | Connects to production | Dev use |

> **Note:** There is currently only one Supabase project. All development connects to it. A staging project should be created before P4 deployment work.
