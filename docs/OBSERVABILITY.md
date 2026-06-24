# Observability

> Current state: None configured. This document defines the target observability strategy.

## Current State

| Signal | Status | Notes |
|--------|--------|-------|
| Error tracking | ❌ | `ErrorBoundary` logs to console only |
| Performance monitoring | ❌ | No RUM (Real User Monitoring) |
| Analytics / product events | ❌ | No tracking |
| Server-side logs | ✅ Partial | Supabase provides query logs in dashboard |
| Uptime monitoring | ❌ | No external health check |

---

## Recommended Tools

### Error Tracking — Sentry

**Why Sentry:** Industry standard for React error tracking. Captures:
- Unhandled exceptions with full stack traces
- React component trees at the time of error
- User context (anonymized or authenticated)
- Source maps for minified bundles

**Integration:**
```bash
npm install @sentry/react
```

```typescript
// src/main.tsx
import * as Sentry from '@sentry/react'

Sentry.init({
  dsn: import.meta.env.VITE_SENTRY_DSN,
  integrations: [
    Sentry.browserTracingIntegration(),
    Sentry.replayIntegration({ maskAllText: true }),
  ],
  tracesSampleRate: 0.1,   // 10% of transactions
  replaysOnErrorSampleRate: 1.0,
})
```

**ErrorBoundary hook:**
```typescript
// src/components/ErrorBoundary.tsx — add to componentDidCatch:
componentDidCatch(error: Error, info: ErrorInfo) {
  Sentry.captureException(error, { extra: info })
}
```

The stub comment for this hook already exists in `ErrorBoundary.tsx`.

---

### Product Analytics — PostHog

**Why PostHog:** Open-source, self-hostable, privacy-friendly. Captures:
- Page views and navigation events
- Feature usage (enrollment, assessment completion, certificate download)
- Funnel analysis (enrollment → completion → certificate)
- Session recordings (optional, with PII masking)

**Key events to track:**

| Event | Trigger | Properties |
|-------|---------|-----------|
| `user_signed_in` | Auth sign-in success | `role`, `department` |
| `course_enrolled` | `enrollInCourse()` API call | `course_id`, `course_title` |
| `lesson_completed` | Lesson progress upsert | `lesson_id`, `course_id` |
| `assessment_started` | `startAssessmentAttempt()` | `assessment_id` |
| `assessment_submitted` | `submitAssessment()` | `score`, `passed`, `course_id` |
| `certificate_downloaded` | `downloadPDF()` trigger | `certificate_id` |
| `page_viewed` | React Router navigation | `page`, `role` |

---

### Performance — Web Vitals

React's `reportWebVitals` (built into Vite React template) can capture:
- **LCP** (Largest Contentful Paint) — target < 2.5s
- **FID** / **INP** — target < 200ms
- **CLS** — target < 0.1

```typescript
// src/main.tsx
import { onCLS, onINP, onLCP } from 'web-vitals'
onCLS(console.log)
onINP(console.log)
onLCP(console.log)
// Replace console.log with PostHog or custom endpoint in production
```

---

## Supabase Dashboard Monitoring

Available now without additional setup:

| Feature | Location |
|---------|----------|
| Database query logs | Supabase dashboard → Logs → Postgres |
| Auth events | Supabase dashboard → Logs → Auth |
| Edge Function logs | Supabase dashboard → Functions |
| API request metrics | Supabase dashboard → Reports |
| RLS policy violations | Supabase dashboard → Logs → Postgres (search `RLS`) |

Check these manually during development; set up alerts in production.

---

## Implementation Roadmap

| Phase | Deliverable | Priority |
|-------|-----------|---------|
| P4 | Sentry DSN configured; ErrorBoundary wired | High |
| P4 | PostHog installed; 6 key events tracked | High |
| P4 | Uptime monitor (UptimeRobot or BetterUptime) | Medium |
| P5 | Web vitals reporting to PostHog | Medium |
| P5 | Sentry performance tracing (10% sample) | Low |
| P5 | Session replay with PII masking | Low |

---

## Privacy Considerations

- No PII in PostHog event properties — use IDs, not names or emails
- Session recordings must mask all text input fields (`maskAllText: true`)
- Inform users of analytics in Privacy Policy before enabling
- PostHog can be self-hosted on the same Supabase infrastructure to avoid third-party data transfer
