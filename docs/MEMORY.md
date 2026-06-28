# MEMORY.md

Durable project memory — decisions, conventions, and gotchas that aren't
obvious from the code. Update this on every significant change (see the rule in
[../CLAUDE.md](../CLAUDE.md)).

> Last updated: 2026-06-28

---

## Non-negotiable rules

- **Content authenticity.** Lesson content (text, timelines, facts, labels) is
  drawn ONLY from the original course source already in the repo — never
  invented. Module 1's source is the seeded HTML in
  `supabase/migrations/20260622070811_update_module1_timeline_visual.sql`. New
  work may add *presentation* (block structure, icons, illustrations, colors,
  layout); it must not add facts. If a visual needs data the source lacks, omit
  it or ask.
- **`tsc --noEmit` = 0 errors and `npm run build` passes before any commit.**
- **DB access only via `src/lib/api.ts`; `safeHtml()` for all injected HTML.**

## Design model (Module 1 reader)

- **Theme:** dark navigation chrome + light reading canvas.
  - Sidebar/drawer: dark `#191B1F`, border `#2B2E35`, brand red `#ED3237` accent,
    green `#34D399` for completed checks, `Lock` for not-yet-reached lessons.
  - Top bar: white `h-16` (aligns with the sidebar brand band), programme title +
    overall progress + Help/Bell/Avatar (account actions are visual only for now).
  - Content canvas: `#FAFAF8`, container `max-w-[1320px]`, prose `max-w-[70ch]`.
  - "No black backgrounds" applies to **content** surfaces only; the dark sidebar
    is the approved exception (reversed the earlier light-sidebar decision per a
    user-supplied reference mockup).
- **Iconography:** one lucide system via `src/components/blocks/icons.tsx`
  (`resolveBlockIcon(name)`); block data uses semantic names, never emoji.
- **Illustrations:** flat inline-SVG vector set in
  `src/components/course/TopicIllustration.tsx`, auto-inferred from a topic's
  title/text (`inferIllustrationKind`). A topic can override with an explicit
  image via the text block's `illustration` field (falls back to the vector if
  the image fails). Bespoke "Who We Are" art at
  `public/illustrations/who-we-are.svg`.

## Lesson layout engine (`LessonWorkspace.tsx`)

- `buildModule()` pairs each text block with the visual blocks that follow it
  into a **topic**; topic 0 also yields a Module Overview screen.
- Intro is two-column: prose (+ "Your goal" callout) on the left, a compact
  diagram or illustration on the right. Wider visuals stack full-width below.
- **Content-aware pairing:** a diagram (`architecture`/`ecosystem`) followed by a
  card grid (`use_case_cards`/`comparison`/`scenario_cards`, NOT
  `feature_benefit`) renders as an equal-height, equal-width horizontal row
  (e.g. "What CloudPe Offers" beside "Built for Every Team"). When paired, the
  diagram leaves the intro and the lead spans full width.

## Migrations & content state

- Module 1 ("Module 1 — Company Overview") content lives as a JSON block array in
  `lessons.video_url`. Current state built by migrations `20260625000001` →
  `20260626000006` (json conversion → content-aware visuals → key_facts → icons →
  who-we-are image → svg path → key-facts server icon).
- Editing an already-applied migration needs `supabase migration repair`; prefer
  adding a NEW migration. Targeted tweaks use SQL `replace(video_url, ...)` to
  avoid rewriting the whole block array.
- **All six Phase-1 modules** now render through the generalized `Module1Reader`
  (`CourseDetail` routes to it when the lesson's section is the first/Phase-1
  section; Phase 2+ uses `LessonWorkspace`). The legacy `SalesOnboardingCourse.tsx`
  (`MODULE_SLIDES`, course id `cdbf91e9…`) is superseded by the canonical
  `CourseDetail` path (live course `6c3c352c…`).

## Progression & completion (phase1-lms-redesign)

- **Topic-level progression** layers on top of `lesson_progress` (still the unlock
  authority). `topic_progress` (own-row RLS) tracks per-topic state;
  `src/lib/completion.ts` holds the completion model (per-topic-type rules,
  weighting) and rolls up to `lesson_progress` when every required topic is done.
  Resume order: first-incomplete-required → last-visited → first-topic. No SQL
  backfill; backward-compatible.
- **A module's "learning objective" = the authored "Goal:" line** in its first
  text block — there is NO `learning_objective` column; lesson content blocks live
  as JSON in `lessons.video_url`. `lessonObjective(video_url)` (Module1Reader)
  parses it for the completion modal. Never invent objective copy.
- **Module-completion modal** (`ModuleCompleteModal`) replaces auto-advance: mark
  complete → unlock next → show the modal (no navigation until the user chooses).
  Progress shown is **course-wide (X / total lessons)**, not per-phase (user
  decision). "Back to Dashboard" + ESC + backdrop → the global dashboard
  (`onNavigate('dashboard')`). No confetti (course *completion* keeps its own
  confetti overlay).

## Feedback & reliability

- **Toasts are the canonical success/error channel.** `useToast()` →
  `toast(msg, variant)` (`src/contexts/ToastContext.tsx`, mounted at root). Wire
  every mutation to it; never `console.log`-and-swallow. Standard for any action:
  loading → disabled + spinner; error → toast; validation → message; success only
  on confirmed success; never a clickable button that goes nowhere.

## Repo / git

- Origin: `https://github.com/aman-data-on/my-lms-project.git` (stored
  token-free). Branch `main`. First push landed commit `967586c`.
- `.claude/` is gitignored (local agent config).

## Gotchas

- Headless-Chrome screenshots can fire `<img onError>` before a lazy image loads;
  use `--virtual-time-budget`. A harness `?raw` + `.replace()` may show stale
  content due to Vite caching — trust the DB/migration, not the harness string.
- `Date.now()`/`Math.random()` etc. are fine in app code but unavailable in
  Workflow scripts.
- **Supabase to-one embeds are OBJECTS at runtime**, not arrays — read
  `row.courses.id`, not `row.courses[0].id` (the latter silently yields
  `undefined`; this broke the dashboard "Continue Learning" button).
- **`.upsert()` must pass `onConflict`** on the natural key when the unique
  constraint isn't the PK: `lesson_progress` → `user_id,lesson_id`; `enrollments`
  → `user_id,course_id`; `topic_progress` → `user_id,lesson_id,topic_key`.
  Otherwise a pre-existing row 409s (was masked by immediate navigation).
