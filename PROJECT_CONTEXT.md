# PROJECT_CONTEXT.md
> Single source of truth for any engineer (or AI assistant) picking up this codebase.
> Keep this file updated after every significant change session.
> Last updated: 2026-06-24

---

## What This Is

**Employee Onboarding LMS** — a React + TypeScript single-page application that delivers structured onboarding courses to new employees, tracks their progress, runs assessments, and generates certificates. Admins build and manage courses; employees consume them.

- **Supabase project ref:** `cthnljvcfnzxluedquxf`
- **Git user:** aman.singh@leapswitch.com
- **Live branch:** `master` (main branch for PRs: `main`)

---

## Tech Stack

| Layer | Choice |
|---|---|
| Framework | React 18.3.1 + TypeScript 5.7.2 |
| Build | Vite 6.0.7 |
| Styling | Tailwind CSS 3.4.17 |
| Backend | Supabase (PostgreSQL + Auth + RLS) |
| Data fetching | TanStack Query v5 (`@tanstack/react-query`) |
| Routing | React Router DOM v6 |
| Icons | lucide-react |
| PDF export | jspdf + html2canvas (lazy-loaded) |
| HTML sanitisation | dompurify (via `src/lib/sanitize.ts`) |
| Class merging | clsx + tailwind-merge via `cn()` in `src/lib/cn.ts` |

---

## Repository Layout

```
src/
├── main.tsx                      # Entry — QueryClientProvider wraps App
├── App.tsx                       # BrowserRouter, route guards, CourseRouteWrapper
├── index.css                     # Tailwind directives + global resets
│
├── contexts/
│   └── AuthContext.tsx           # Auth state, signIn/signUp/signOut, isAdmin
│
├── pages/
│   ├── AuthPage.tsx
│   ├── Dashboard.tsx
│   ├── MyCourses.tsx
│   ├── CourseLibrary.tsx
│   ├── CourseDetail.tsx          # Generic course — overview + LessonWorkspace
│   ├── SalesOnboardingCourse.tsx # Bespoke course with phase accordion + reader
│   ├── Assessments.tsx
│   ├── Certificates.tsx
│   ├── Reports.tsx
│   ├── Settings.tsx
│   ├── AdminPanel.tsx
│   └── CourseBuilder.tsx
│
├── components/
│   ├── Sidebar.tsx               # Responsive sidebar, mobile drawer + a11y
│   ├── BlockRenderer.tsx         # Renders a single content block by type
│   ├── BlockEditor.tsx           # Admin block editor (used in CourseBuilder)
│   ├── CourseIndex.tsx           # Phase-accordion curriculum (shared)
│   ├── LessonWorkspace.tsx       # Step-based lesson reader (full-screen overlay)
│   ├── CourseAppendix.tsx
│   ├── ErrorBoundary.tsx
│   └── ui/
│       ├── Button.tsx
│       ├── ProgressBar.tsx
│       ├── Badge.tsx
│       ├── Card.tsx
│       ├── EmptyState.tsx
│       ├── Modal.tsx
│       ├── Skeleton.tsx
│       ├── Spinner.tsx
│       └── index.ts
│
└── lib/
    ├── supabase.ts               # Supabase client (anon key — safe to commit)
    ├── api.ts                    # All DB calls (fetchCourse, upsertEnrollment, …)
    ├── blocks.ts                 # BlockBase type + 14 block type definitions
    ├── reportData.ts             # Client-side progress cache helpers
    ├── sanitize.ts               # safeHtml() via DOMPurify
    ├── cn.ts                     # cn() — clsx + twMerge
    └── utils.ts                  # Misc formatters

docs/                             # All project documentation
adr/                              # Architecture Decision Records
```

---

## Routing

All routes live in `App.tsx`. The special sales course is handled via `CourseRouteWrapper`:

```
/                     → Dashboard
/my-courses           → MyCourses
/course-library       → CourseLibrary
/course/:courseId     → CourseDetail   (generic)
                        SalesOnboardingCourse if courseId === 'cdbf91e9-7a4a-430d-8def-7a119a90e4b4'
/assessments          → Assessments
/certificates         → Certificates
/reports              → Reports
/settings             → Settings
/admin                → AdminPanel        (RequireAdmin guard)
/course-builder       → CourseBuilder     (RequireAdmin guard)
```

All page components are **lazy-loaded** with `React.lazy` + `Suspense`.

---

## Authentication & Authorisation

- **Auth:** Supabase Auth (email + password). Session in `AuthContext`.
- **Roles:** stored in `profiles.role` (`'admin'` | `'employee'`). Protected by RLS.
- **Route guards:** `RequireAuth` (all protected routes), `RequireAdmin` (`/admin`, `/course-builder`).
- **Security rules:**
  - `VITE_SUPABASE_ANON_KEY` is public by design — safe to commit.
  - Service role key must **never** appear in client code or git.

---

## Key Components

### CourseIndex (`src/components/CourseIndex.tsx`)

Phase-accordion curriculum shared by `CourseDetail` and `SalesOnboardingCourse`.

**Behaviour:**
- All phases **collapsed by default** (empty `Set`).
- Single-open accordion: clicking a phase closes all others.
- `defaultExpandedPhases?: number[]` prop — overrides initial state (SalesOnboarding passes `[currentPhaseNum]`).
- "Expand all / Collapse all" header control.
- Each phase is its own `bg-white rounded-xl border` card with `space-y-3` gap.
- CSS grid animation (`grid-rows-[0fr]` → `grid-rows-[1fr]`, 200ms) for smooth expand.
- `cleanPhaseName()` strips `"Phase N — "` prefix from section names (fixes "Phase 1 — Phase 1 —" duplication).

**Props:**
```ts
interface CourseIndexProps {
  courseId: string;
  userId: string;
  phases: IndexPhase[];
  getPhaseStatus: (phaseNum: number) => PhaseStatus;
  getModuleStatus: (module: IndexModule, lessonIndex: number) => ModuleStatus;
  isPhaseUnlocked: (phaseNum: number) => boolean;
  isAdmin: boolean;
  onModuleClick: (lessonIndex: number) => void;
  defaultExpandedPhases?: number[];
}
```

---

### LessonWorkspace (`src/components/LessonWorkspace.tsx`)

Full-screen step-based lesson reader. Used by `CourseDetail` when `view === 'reader'`.

**Architecture:**
- `fixed inset-0 z-[60]` overlay over the entire viewport.
- Parses `lesson.video_url` into `ParsedStep[]`: text blocks are split on `<h2>` boundaries; non-text blocks become individual steps.
- **Two-panel layout** (desktop): left = `ConceptCard` (prose + key takeaway), right = `KeyPointsPanel` (dark slate, extracted H3/list items) or `BlockRenderer` for visual blocks.
- **Mobile:** stacked vertically, main area scrolls.
- Step dot indicator with click-to-jump.
- Bottom nav: Previous / step label + count / context-aware Next button.
- "Contents" drawer at `z-[80]` showing all steps.
- Step transition: `wsIn` keyframe (200ms fade + 10px slide).
- Resets to step 0 when `lesson.id` changes.

**Props:**
```ts
interface LessonWorkspaceProps {
  lesson: Lesson;
  course: Course;
  userId: string;
  lessonIndex: number;
  isCurrentCompleted: boolean;
  isLastLesson: boolean;
  isCourseDone: boolean;
  onBack: () => void;
  onMarkComplete: () => Promise<void>;
  onPrevLesson: () => void;
  onNextLesson: () => void;
  onAssessment: () => void;
}
```

---

### CourseDetail (`src/pages/CourseDetail.tsx`)

Generic course page with two views:

| `view` | What renders |
|---|---|
| `'overview'` | Breadcrumb + course header card (title, description, progress bar, CTA) + `CourseIndex` |
| `'reader'` | `LessonWorkspace` (full-screen overlay) |

Congrats overlay at `z-[90]` is a sibling of `LessonWorkspace` (not nested), so its z-index is correct.

---

### SalesOnboardingCourse (`src/pages/SalesOnboardingCourse.tsx`)

Bespoke page for course `cdbf91e9-7a4a-430d-8def-7a119a90e4b4`. Has its own phase/lesson state machine and its own reader (not using `LessonWorkspace`). Key differences from `CourseDetail`:

- **Overview header:** dark navy hero card (`bg-primary-900`) with icon, full title, description, stats, and progress bar.
- **CTA:** state-aware label — "Start Course" / "Continue Learning" / "View Certificate".
- **CourseIndex:** passes `defaultExpandedPhases={[currentPhaseNum]}` (only active phase starts open).
- **Reader header:** 3-column layout (`w-[30%]` left/right, `flex-1` center) to prevent long course title from squeezing the lesson title.

---

## Content Block System

Lesson content is stored as JSON in `lessons.video_url`. Each block has:

```ts
interface BlockBase {
  id: string;
  type: BlockType; // one of 14 types below
  data: Record<string, any>;
}

type BlockType =
  | 'text' | 'callout' | 'key_takeaway' | 'learning_objectives'
  | 'stat_card' | 'two_column' | 'accordion' | 'image_caption'
  | 'knowledge_check' | 'checklist' | 'quote' | 'flashcard'
  | 'download_resource';
```

`BlockRenderer` switches on `block.type` and renders the appropriate component.

Legacy content: if `video_url` is not a JSON array, it is treated as raw HTML (`type: 'text'`).

---

## Z-Index Stack

| Layer | z-index | What |
|---|---|---|
| Sidebar | 40 | Desktop persistent sidebar |
| Mobile hamburger | 50 | Fixed top-left trigger |
| Lesson workspace | 60 | `LessonWorkspace` full-screen overlay |
| Curriculum / Contents drawer | 80 | Slide-in drawer (sibling of workspace) |
| Congrats overlay | 90 | Course completion modal |
| Skip link | 200 | Keyboard skip-to-content |

---

## Design Tokens (Tailwind)

Primary colour scale (configured in `tailwind.config.js`):

| Token | Hex | Usage |
|---|---|---|
| `primary-50` | `#EFF6FF` | Hover backgrounds, light badges |
| `primary-100` | `#DBEAFE` | Avatar backgrounds |
| `primary-500` | `#3B82F6` | Progress bars, active dots |
| `primary-700` | `#1D4ED8` | Badge text |
| `primary-800` | `#1E3A8A` | Primary button, sidebar brand |
| `primary-900` | `#172554` | SalesOnboarding hero card bg |

Border radius convention: `rounded-xl` (cards), `rounded-2xl` (workspace panels), `rounded-full` (badges, dots).

---

## API Layer (`src/lib/api.ts`)

All Supabase calls go through named functions. Never write inline `.from()` queries in page components.

Key functions:
- `fetchCourse(courseId)` — single course
- `fetchLessons(courseId)` — ordered lesson list
- `fetchLessonProgress(userId)` — all completed lesson IDs
- `upsertLessonProgress({user_id, lesson_id, completed, completed_at})`
- `upsertEnrollment({user_id, course_id, progress_percent, status, completed_at})`
- `insertActivity({user_id, type, title, description})`

---

## Environment Variables

```
VITE_SUPABASE_URL        — Supabase project URL (public, safe to commit)
VITE_SUPABASE_ANON_KEY   — Anon key (public by design, safe to commit)
```

Service role key: **never** in `.env` committed to git, **never** in client code.

---

## Recent Work (as of 2026-06-24)

| Commit | Change |
|---|---|
| `16cf664` | SalesOnboarding overview redesign (dark navy hero), curriculum defaults, 3-col reader header |
| `0da0706` | CourseDetail redesign — course overview card + focused lesson reader |
| `5452621` | Responsive app shell, mobile sidebar a11y, skip link |
| `b8efe11` | Shared UI component foundation (Button, ProgressBar, Badge, Card, …) |
| `8d51e74` | Code splitting, lazy-load pages, react-query migration |

**Post-commit changes (not yet committed):**
- `CourseIndex` rewritten: separate card per phase, all-collapsed default, single-open accordion, CSS grid animation, "Expand all / Collapse all", status badges.
- `CourseDetail` overview: removed `max-w-md` from progress section and `max-w-2xl` from description — full-width alignment. Breadcrumb truncation tightened to `32ch`/`48ch`.
- `LessonWorkspace` created: step-based two-panel lesson reader replacing the old PDF-scroll reader in `CourseDetail`.

---

## Known Patterns & Conventions

- **`cn()`** — always use for conditional className merging. Never string concatenation.
- **No inline Supabase queries** — always go through `src/lib/api.ts`.
- **`safeHtml()`** — always wrap any HTML from the DB before `dangerouslySetInnerHTML`.
- **`useMemo` for derived data** — `indexPhases`, `completedLessons`, block parsing, etc.
- **`useQuery` for remote data** — invalidate with `queryClient.invalidateQueries` after mutations.
- **Fixed overlay pattern** — `fixed inset-0 z-[60] flex flex-col` for full-screen views. Siblings (drawers, modals) live outside the overlay div so their z-index works from the root stacking context.
- **Admin bypass** — all access-control checks have `if (isAdmin) return true/allowed`.

---

## Do Not Change Without Discussion

- Database schema, API function signatures, Supabase auth flow.
- The `courseId` hardcoded in `CourseRouteWrapper` for SalesOnboarding (`cdbf91e9-…`).
- RLS policies (documented in `docs/DB_MIGRATION_ROLE_RLS.md`).
- Service role key handling — must stay server-side only.
