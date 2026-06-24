# Folder Structure

> Reflects actual codebase state as of 2026-06-24 (post-P2)

## Repository Root

```
/
├── adr/                        # Architecture Decision Records
│   ├── ADR-001.md              # React Router adoption
│   ├── ADR-002.md              # DOMPurify for XSS
│   └── ADR-003.md              # TanStack React Query
├── docs/                       # Project documentation
├── public/                     # Static assets served as-is
├── src/                        # Application source
├── supabase/
│   ├── functions/              # Edge Functions (seed-users)
│   └── migrations/             # SQL migration files (20 total)
├── .env                        # Environment variables (tracked; anon key is public)
├── index.html
├── package.json
├── tailwind.config.js
├── tsconfig.json
└── vite.config.ts
```

## src/

```
src/
├── App.tsx                     # Root: routes, Suspense, auth guards
├── main.tsx                    # Entry: QueryClientProvider, BrowserRouter, AuthProvider
├── index.css                   # Tailwind directives + Inter font import
│
├── components/
│   ├── BlockEditor.tsx         # Admin lesson content editor (14 block types)
│   ├── BlockRenderer.tsx       # Renders lesson blocks (video, text, quiz, etc.)
│   ├── CourseAppendix.tsx      # Supplementary course appendix display
│   ├── CourseIndex.tsx         # Course table-of-contents / lesson list
│   ├── ErrorBoundary.tsx       # Global React error boundary with reload UI
│   └── Sidebar.tsx             # Navigation sidebar with NavLink active states
│
├── contexts/
│   └── AuthContext.tsx         # Auth state: user, isAdmin, signIn/signOut, refreshUser
│
├── lib/
│   ├── api.ts                  # All Supabase queries and mutations (single data layer)
│   ├── blocks.ts               # Block type definitions for course content
│   ├── reportData.ts           # Static data for Reports page charts
│   ├── sanitize.ts             # DOMPurify wrapper — safeHtml() for dangerouslySetInnerHTML
│   ├── supabase.ts             # Supabase client singleton
│   └── utils.ts                # Shared utilities (formatDate, etc.)
│
└── pages/
    ├── AdminPanel.tsx          # Admin: user management, enrollment overview
    ├── Assessments.tsx         # Quiz center: take, submit, view results; admin builder
    ├── AuthPage.tsx            # Login/signup form with auth redirect
    ├── Certificates.tsx        # Certificate gallery + PDF download
    ├── CourseBuilder.tsx       # Admin: create/edit courses and lessons
    ├── CourseDetail.tsx        # Lesson viewer with progress tracking
    ├── CourseLibrary.tsx       # Browse and enroll in published courses
    ├── Dashboard.tsx           # Home: stats, continue course, activity feed
    ├── MyCourses.tsx           # Enrolled courses with progress
    ├── Reports.tsx             # Analytics charts (admin view)
    ├── SalesOnboardingCourse.tsx # Dedicated phased Sales Onboarding journey
    └── Settings.tsx            # User profile edit
```

## supabase/migrations/ (ordered)

| # | File | Purpose |
|---|------|---------|
| 01 | 20260619075856_create_profiles_table.sql | profiles table + RLS |
| 02 | 20260619075929_create_courses_and_progress_tables.sql | courses, lessons, enrollments, lesson_progress |
| 03 | 20260619080017_create_assessments_and_certificates_tables.sql | assessments, questions, attempts, certificates, activities |
| 04 | 20260619084458_add_role_and_course_status.sql | profiles.role, courses.status, lessons.section |
| 05 | 20260619134936_confirm_seed_user_emails.sql | confirm test user emails |
| 06 | 20260620120238_fix_rls_infinite_recursion.sql | replace admin RLS subqueries to avoid recursion |
| 07 | 20260622065028_add_sales_onboarding_course.sql | Sales Onboarding course + lessons seed data |
| 08–17 | 20260622065106…071531 | Seed questions and visual content for Sales modules |
| 18 | 20260622072619_create_phase_progress_table.sql | phase_progress, task_submissions tables |
| 19–20 | 20260622…20260623 | Additional content and role-protection migration |

## Key Conventions

- **Data access:** All Supabase calls go through `src/lib/api.ts`. Pages never import `supabase` directly.
- **Server state:** All data fetching uses `useQuery`/`useMutation` from `@tanstack/react-query`.
- **Routing:** React Router v6 `<Route>` elements in `App.tsx`. Admin routes wrapped in `<RequireAdmin>`.
- **HTML safety:** All `dangerouslySetInnerHTML` values pass through `safeHtml()` from `sanitize.ts`.
- **Code splitting:** All page imports are `React.lazy()`. Pages load on first visit only.
