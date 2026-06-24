# Future Improvements

> Post-P3 backlog of improvements, features, and technical investments.
> Items here are out of scope for the current refactor but should be tracked for prioritization.

---

## P4 Candidates (Observability & Quality)

| Improvement | Rationale | Effort |
|-------------|-----------|--------|
| Sentry error tracking | Catch production errors proactively | Small |
| PostHog analytics (6 core events) | Understand usage and completion funnels | Small |
| Supabase generated TypeScript types | Replace manual types with schema-accurate generated types | Small |
| Vitest unit tests (Tier 1 coverage) | Assessment logic, api.ts query functions | Medium |
| Playwright E2E test (critical path) | Login → enroll → lesson → assessment → certificate | Medium |
| Staging Supabase environment | Separate database for test data | Medium |
| CSP headers in hosting config | Defense-in-depth XSS protection | Small |
| Web Vitals reporting | Measure LCP, INP, CLS in production | Small |

---

## P5 Candidates (Feature Expansion)

### Assessment Features

| Feature | Notes |
|---------|-------|
| Assessment retake (admin-configurable) | `assessment_attempts` already supports multiple attempts; just needs UI unlock + policy |
| Time-boxed retake cooldown | E.g., retry after 7 days |
| Randomized question order | `Math.random()` shuffle on fetch, or a `randomized` flag per assessment |
| Question types beyond MCQ | True/False, short answer, matching |
| Partial scoring | Award partial credit for multi-select questions |

### Course Features

| Feature | Notes |
|---------|-------|
| Video lesson support | Embed YouTube/Vimeo or Supabase Storage video |
| Downloadable resources | PDFs, slide decks attached to lessons |
| Course completion deadlines | Due dates per enrollment, reminders |
| Prerequisites | Course A required before Course B |
| Instructor-led sessions | Scheduled live sessions with calendar integration |

### Admin Features

| Feature | Notes |
|---------|-------|
| Admin dashboard with aggregate metrics | Completion rates, avg scores, dept breakdowns |
| Bulk enrollment | Enroll entire department in a course |
| User import via CSV | Bulk user creation from HR systems |
| Notification system | Push/email reminders for incomplete courses |
| Reporting exports | CSV download of completion and score data |
| Audit log | Who accessed what and when |

### Platform Features

| Feature | Notes |
|---------|-------|
| SCORM import | Import courses from other LMS platforms |
| SSO / SAML | Enterprise login via Okta, Azure AD |
| Multi-tenancy | Support multiple organizations in one deployment |
| Mobile app | Native iOS/Android (React Native) |
| Offline mode | Service Worker for lesson content access without internet |
| Global search | Full-text search across courses, lessons, assessments |

---

## Technical Investments

| Investment | Rationale | Effort |
|-----------|-----------|--------|
| Server-side certificate rendering | Higher fidelity PDFs via Puppeteer edge function | Large |
| Real-time progress sync | Supabase Realtime for multi-device progress | Medium |
| Optimistic updates in react-query | Faster perceived performance on mutations | Medium |
| React Query devtools (dev-only) | Easier debugging of cache state | Small |
| Storybook component library | Visual component documentation and testing | Large |
| i18n (react-intl or lingui) | Multi-language support | Large |
| Dark mode | User preference via Tailwind `dark:` variants | Medium |
| Keyboard navigation audit | Full WCAG 2.1 AA compliance | Medium |

---

## Deferred from Current Scope

Items explicitly deferred from P3 per project decisions:

| Item | Why Deferred |
|------|-------------|
| Admin aggregate dashboard | P4 — needs analytics data collection first |
| SCORM support | Significant parsing complexity; not required for internal use |
| Notification emails | Requires Supabase email integration; P4 scope |
| Assessment retake UI | Admin feature; blocked on admin policy decision |
| Staging environment | Operational overhead; deferred until pre-external-launch |
