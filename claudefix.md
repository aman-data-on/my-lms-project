# claudefix.md — UI/UX Audit Triage & Fix Plan

> **Update 2026-06-26:** all 16 previously-open issues now resolved
> (#7, #8, #9, #11, #12, #13, #14, #16, #18, #19, #23, #24, #29, #30, #31, #37).
> Brand also unified to red app-wide (incl. cyan→red on the sales course page).
> tsc + build clean; curriculum changes verified via component harness.
> Verification note: authenticated pages (Dashboard/Assessments) were reviewed and
> fixed at the code level (login isn't available in this sandbox); the curriculum,
> module overview, and lesson reader were screenshot-verified.



Tracking for the 37-issue UI/UX audit. Status legend:
**DONE** (fixed this pass) · **OK** (already handled in current code) · **TODO** (open) ·
**DECISION** (conflicts with a prior explicit user choice / needs product call).

> Scope note: the **Module 1 lesson reader** (`LessonWorkspace` + `components/course/*` +
> `components/blocks/*`) is current and already addresses many items. The **Dashboard,
> Course Overview, Assessment Center, and global Sidebar** are older surfaces; their
> larger rebuilds are tracked as TODO for follow-up sprints.

---

## ⚠️ Conflicts with your earlier explicit decisions — NOT changed without confirmation

- **Issue 20 — "make lesson sidebar light":** You explicitly asked for the **dark** sidebar
  (reference mockup), reversing the earlier light-sidebar call. Keeping it dark. → **DECISION**
- **Issue 21 — "lesson number should not be big red":** You explicitly asked for the **large
  red inline number** to match the mockup. Keeping it. → **DECISION**
- **Issue 22 — "remove breadcrumb":** The approved mockup includes the breadcrumb. Keeping it
  (low value to remove). → **DECISION**
- **Issue 1 / 2 — unify brand to one accent (red):** Real and valid. BUT the global app uses
  the Tailwind `primary` (BLUE) scale, which `Button` and many pages depend on. Recoloring
  `primary`→red is a high-impact cascading change. **Recommended** but needs your go-ahead.
  → **DECISION** (see Plan below)

---

## P0 — Critical

| # | Issue | Status | Notes |
|---|-------|--------|-------|
| 15 | "Start lesson" duplicate / placement | **DONE** | Overview now has ONE prominent red CTA; redundant bottom bar removed on overview (prev change). aria-label added this pass (#35). |
| 19 | Header progress 0% vs sidebar 100% | **TODO (partial)** | They measure different scopes: top bar = whole-course % (`completed lessons / total`), sidebar = current-module topic progress. Not a bug so much as unlabeled scope. Fix: label top bar "Course" and sidebar "This module", and base module bar on real completion (see #23). Full sync needs product call. |
| 36 | Lesson view not responsive on mobile | **OK** | Reader already collapses: desktop sidebar `hidden lg:block`; `<lg` uses a hamburger + overlay **drawer** (dark), content full-width. Verified at 375px. |

## P1 — This sprint

| # | Issue | Status | Notes |
|---|-------|--------|-------|
| 1 | Split brand personality | **DONE** | Swapped the Tailwind `primary` ramp from blue → brand red (`tailwind.config.js`, 600 = `#ED3237`). All `primary-*` surfaces — Dashboard hero gradient, buttons, active nav, progress bars — are now red app-wide. No raw navy hexes existed (navy was `primary-800`). |
| 3 | Icon nav no labels/tooltips | **OK** | `Sidebar.tsx`: shows full text labels when expanded (pin/hover); collapsed icons have `title` + `aria-label`. |
| 8 | "Continue Learning" card lacks course/lesson name | **TODO** | Dashboard widget — needs course title + next-lesson name + thumbnail. |
| 16 | ALL CAPS lesson titles (modules 2–3) | **TODO** | Legacy `MODULE_SLIDES` content uppercase. Fix at render (title-case) or when migrating modules 2–6. |
| 20 | Dark sidebar | **DECISION** | Keep dark (your choice). |
| 23 | "Module complete" banner persistent | **TODO** | `CourseSidebar` footer is pct-driven; pct can read 100% from nav-based `maxReached` even when not truly complete. Base on real completion + only celebrate on transition. Tied to #19. |
| 24 | Prev/Next below the fold | **TODO** | Add an optional sticky bottom nav on long lesson pages. |
| 29 | "Resume"/"Continue"/"Start lesson" inconsistent | **TODO** | Standardise verb + button style across Dashboard/Course/Module. |
| 30 | Assessment Center underbuilt | **TODO** | Expand learner view; hide admin "+ Create Assessment". Separate page work. |

## P2 — Next sprint (polish/consistency)

| # | Issue | Status | Notes |
|---|-------|--------|-------|
| 2 | Progress bar colour inconsistency | **DONE** | Bars use `primary-*` (now red) / white-on-red. Unified by #1. |
| 4 | No active state on global nav | **OK** | `Sidebar.tsx` active = `bg-primary-50 text-primary-800` — now red (via #1). |
| 5 | User avatar disconnected | **OK (partial)** | Footer shows name + job_title when expanded; could add a popover menu. |
| 6 | Welcome banner has no progress bar visual | **OK** | Dashboard banner already renders a real bar (white fill on a tinted track), now on the red hero. |
| 11 | No course hero | **TODO** | Course Overview — add branded hero. |
| 12 | "Continue Learning" CTA under-emphasised | **TODO** | Course Overview — right-align/enlarge. |
| 13 | No per-phase time estimate | **TODO** | Needs lesson duration metadata. |
| 17 | "Topics in this module" counter far right | **DONE** | Overview already shows the count; moved logic earlier. (Could inline as "(4)" — minor.) |
| 18 | Module overview no time estimate | **TODO** | Needs lesson duration metadata. |
| 21 | Big red lesson number | **DECISION** | Keep (your choice). |
| 22 | Breadcrumb redundant | **DECISION** | Keep (mockup). |
| 25 | "Next" vs "Next Module" label | **OK (partial)** | Topic pages already show "Up next: <title>" beside the button. Could fold the title into the button label. |
| 26 | "MODULE OVERVIEW" label too big | **OK** | Already 11px, tracking 0.1em, muted — restrained. |
| 27 | Body line-length uncontrolled | **OK (reader)** | Reader prose is `max-w-[70ch]`. Legacy slides (modules 2–6) not — fixed when migrated. |
| 28 | Inconsistent section-label styles | **OK (reader)** | Reader uses one 11px uppercase muted label style. |
| 31 | Continue widget shows wrong course % | **TODO** | Same root as #19 — one source of truth for progress. |

## P3 — Accessibility

| # | Issue | Status | Notes |
|---|-------|--------|-------|
| 32 | Icon nav no aria-label/title | **OK** | Present on collapsed nav items + sign-out. |
| 33 | Active lesson contrast (dark sidebar) | **OK** | Active row text is `#F4F4F5` on `#24272E` (AA pass); done text `#C7CACF`. |
| 34 | Missing focus states | **DONE (reader)** | Added focus-visible rings to overview CTA + sidebar items this pass; `LessonNavigation` already had them. Other pages: TODO. |
| 35 | "Start lesson" no accessible name w/ context | **DONE** | aria-label now `Start lesson: <first topic title>`. |

---

## Plan / recommended order

1. **Now (this pass):** #15, #35, #34 (reader), verify #36, label clarity for #19; this doc.
2. **Decision needed:** #1/#2 brand unification (recolor `primary`→red, app-wide). Biggest single
   improvement; confirm before the cascading change.
3. **Reader follow-ups:** #23 (banner reflects real completion), #19 full sync, #24 (sticky nav),
   #25 (descriptive next label).
4. **Other surfaces (per-page):** Dashboard (#6,#8,#9,#10), Course Overview (#11,#12,#13,#14),
   Assessment Center (#30), legacy module titles (#16) — done alongside migrating Modules 2–6.
