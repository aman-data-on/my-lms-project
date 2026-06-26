# MEMORY.md

Durable project memory — decisions, conventions, and gotchas that aren't
obvious from the code. Update this on every significant change (see the rule in
[../CLAUDE.md](../CLAUDE.md)).

> Last updated: 2026-06-26

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
- Only **Module 1** uses the new reader. **Modules 2–6** still render legacy
  hardcoded slides in `SalesOnboardingCourse.tsx` (`MODULE_SLIDES`) and are the
  next migration target.

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
