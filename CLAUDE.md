# CLAUDE.md

Guidance for Claude Code (and any AI assistant) working in this repository.
Start here, then read [PROJECT_CONTEXT.md](PROJECT_CONTEXT.md) and
[docs/AI_HANDOFF.md](docs/AI_HANDOFF.md) for current state.

---

## What this is

**Employee / Sales Onboarding LMS** — React 18 + TypeScript + Vite SPA on
Supabase (Postgres + Auth + RLS). Admins build courses; learners consume
structured lessons, track progress, take assessments, earn certificates.

The flagship surface is the **Module 1 premium lesson reader** (`LessonWorkspace`)
— a dark course rail + light reading canvas that renders data-driven visual
blocks. See [docs/MEMORY.md](docs/MEMORY.md) for the design decisions behind it.

## Commands

```bash
npx tsc --noEmit        # type check — MUST be 0 errors before any commit
npm run build           # production build (vite) — must succeed
npx supabase db push    # apply new SQL migrations to the remote DB
```

## Critical conventions (do not break)

1. **Lesson content comes ONLY from original source material** — never invent
   facts (dates, names, numbers, claims). New work may add *presentation*
   (layout, icons, illustrations), never new facts. Trace each fact to its
   source migration. See [docs/MEMORY.md](docs/MEMORY.md).
2. **All Supabase access goes through `src/lib/api.ts`** — pages/components
   never import the client directly.
3. **All `dangerouslySetInnerHTML` uses `safeHtml()`** (DOMPurify wrapper).
4. **`tsc --noEmit` is 0 errors and `npm run build` passes before every commit.**
5. **Theme:** dark navigation chrome (`CourseSidebar`, `#191B1F`) + light reading
   canvas (`#FAFAF8`); brand red `#ED3237` is the only accent. No black
   backgrounds on *content* surfaces. One lucide icon system — never raw emoji
   (resolve names via `src/components/blocks/icons.tsx`).
6. **Service role key never in client code or git;** the anon key is public by
   design (protected by RLS).
7. **Commit only when asked.** End commit messages with the Co-Authored-By
   trailer. `git remote origin` is stored token-free.

## Premium design principles (Phase 1 — apply to every lesson screen)

Target: enterprise-grade LMS (Coursera / LinkedIn Learning / MS Learn) where every
screen feels complete even when source content is minimal.
- **No dead space.** Tight, consistent rhythm (one spacing scale); no oversized top/
  bottom padding, no large inter-section gaps, no near-empty cards.
- **Visually complete.** Short lessons get a relevant visual (diagram / timeline /
  comparison / illustration / key-facts) — auto-chosen from content, never decorative.
- **Equal cards.** Cards in a row share width AND height; a shorter card fills via
  internal layout (distribute/centre content), never by empty stretch. `VisualShell`
  is `flex flex-col` with a `flex-1` body so stretched cards can fill.
- **One icon system** (`blocks/icons.tsx`, lucide; never emoji), consistent radius/
  shadow/padding, brand red accent, readable measure (`max-w-[70ch]` prose).
- **Content-aware layout** per topic (diagram beside text, diagram+cards row, etc.) —
  not one template for all. Facts come only from source (see content rule).

## Key code locations

| Area | Path |
|------|------|
| Lesson reader (shell, topic layout, content-aware pairing) | `src/components/LessonWorkspace.tsx` |
| Course chrome (dark sidebar, top bar, header, nav, callout) | `src/components/course/` |
| Visual block components + central renderer | `src/components/blocks/` |
| Block type system / data schemas | `src/lib/blocks.ts` |
| Icon registry (semantic name → lucide) | `src/components/blocks/icons.tsx` |
| Vector illustration library + inference | `src/components/course/TopicIllustration.tsx` |
| Lesson illustration assets | `public/illustrations/` |
| All DB queries | `src/lib/api.ts` |
| Migrations | `supabase/migrations/` |

## Verification pattern

Lesson visuals are verified with a temporary Vite harness that imports a
migration's SQL via `?raw`, renders the real components, and is screenshotted
with headless Chrome — then the harness and any temporary exports are removed.

## Documentation maintenance rule

**On every significant change, update the docs**: append to
[docs/CHANGELOG.md](docs/CHANGELOG.md), refresh [docs/AI_HANDOFF.md](docs/AI_HANDOFF.md)
(current state / next step) and [docs/MEMORY.md](docs/MEMORY.md) (durable
decisions), and add any new doc to the index below.

---

## Documentation index (`docs/`)

### Start here / continuity
- [PROJECT_CONTEXT.md](PROJECT_CONTEXT.md) — single source of truth for picking up the codebase (root)
- [docs/PROJECT_OVERVIEW.md](docs/PROJECT_OVERVIEW.md) — high-level product + system overview
- [docs/AI_HANDOFF.md](docs/AI_HANDOFF.md) — AI continuity: current state, invariants, next phase
- [docs/MEMORY.md](docs/MEMORY.md) — durable decisions, conventions, gotchas
- [docs/CHANGELOG.md](docs/CHANGELOG.md) — chronological record of changes
- [docs/QUICK_REFERENCE.md](docs/QUICK_REFERENCE.md) — cheat sheet of commands/patterns

### Architecture & code
- [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) — app architecture & data flow
- [docs/ADR-STATE-MANAGEMENT.md](docs/ADR-STATE-MANAGEMENT.md) — state-management decision record
- [docs/FOLDER_STRUCTURE.md](docs/FOLDER_STRUCTURE.md) — directory layout
- [docs/COMPONENT_GUIDELINES.md](docs/COMPONENT_GUIDELINES.md) — component conventions
- [docs/DEVELOPER_GUIDE.md](docs/DEVELOPER_GUIDE.md) — local dev setup & workflow
- [docs/API_DOCUMENTATION.md](docs/API_DOCUMENTATION.md) — `api.ts` surface
- [docs/TECH_DEBT.md](docs/TECH_DEBT.md) — known technical debt
- [docs/FUTURE_IMPROVEMENTS.md](docs/FUTURE_IMPROVEMENTS.md) — backlog of ideas
- [docs/IMPLEMENTATION_ROADMAP.md](docs/IMPLEMENTATION_ROADMAP.md) — phased plan
- [docs/MASTER_REFACTOR_INSTRUCTIONS.md](docs/MASTER_REFACTOR_INSTRUCTIONS.md) — refactor brief
- [docs/FEATURE_INVENTORY.md](docs/FEATURE_INVENTORY.md) — feature catalogue

### Database & deployment
- [docs/DATABASE_SCHEMA.md](docs/DATABASE_SCHEMA.md) — tables, columns, RLS
- [docs/DATABASE_MIGRATIONS.md](docs/DATABASE_MIGRATIONS.md) — migration workflow
- [docs/DB_MIGRATION_ROLE_RLS.md](docs/DB_MIGRATION_ROLE_RLS.md) — role/RLS migration notes
- [docs/DEPLOYMENT_GUIDE.md](docs/DEPLOYMENT_GUIDE.md) — deploy process
- [docs/OBSERVABILITY.md](docs/OBSERVABILITY.md) — logging/monitoring plan

### Design & UX
- [docs/DESIGN_SYSTEM.md](docs/DESIGN_SYSTEM.md) — brand tokens & UI system
- [docs/LMS_VISUAL_REFERENCE_IMPLEMENTATION_SPEC.md](docs/LMS_VISUAL_REFERENCE_IMPLEMENTATION_SPEC.md) — lesson-reader visual spec
- [docs/MODULE1_VISUAL_MAPPING.md](docs/MODULE1_VISUAL_MAPPING.md) — Module 1 content → visual-block mapping
- [docs/RESPONSIVE_GUIDELINES.md](docs/RESPONSIVE_GUIDELINES.md) — responsive rules
- [docs/UX_RESEARCH.md](docs/UX_RESEARCH.md) — UX research notes
- [docs/PRODUCT_DECISIONS.md](docs/PRODUCT_DECISIONS.md) — product decision log

### Audits & reports
- [docs/AI_CODE_REVIEW.md](docs/AI_CODE_REVIEW.md) · [docs/CODE_REVIEW_REPORT.md](docs/CODE_REVIEW_REPORT.md) — code review
- [docs/SECURITY_AUDIT.md](docs/SECURITY_AUDIT.md) · [docs/SECURITY_CHECKLIST.md](docs/SECURITY_CHECKLIST.md) — security
- [docs/ACCESSIBILITY_REPORT.md](docs/ACCESSIBILITY_REPORT.md) — a11y (WCAG)
- [docs/PERFORMANCE_AUDIT.md](docs/PERFORMANCE_AUDIT.md) · [docs/PERFORMANCE_REPORT.md](docs/PERFORMANCE_REPORT.md) — performance
- [docs/RESPONSIVE_AUDIT.md](docs/RESPONSIVE_AUDIT.md) · [docs/RESPONSIVE_TEST_REPORT.md](docs/RESPONSIVE_TEST_REPORT.md) — responsive testing
- [docs/UX_AUDIT.md](docs/UX_AUDIT.md) — UX audit
- [docs/UI_CONSISTENCY_REPORT.md](docs/UI_CONSISTENCY_REPORT.md) — UI consistency
- [docs/TESTING_STRATEGY.md](docs/TESTING_STRATEGY.md) — testing approach
- [docs/AUDIT_SUMMARY.md](docs/AUDIT_SUMMARY.md) — consolidated audit summary
- [docs/CLEANUP_REPORT.md](docs/CLEANUP_REPORT.md) — cleanup log
