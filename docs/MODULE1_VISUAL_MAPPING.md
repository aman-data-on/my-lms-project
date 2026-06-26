# Module 1 — Company Overview · Visual Mapping

How each topic in Module 1 was mapped to a learning visual, and why. This is the
first validation of the reusable visual block system (foundation release).

## Selection rule applied

For every topic: (1) what should the learner understand? (2) would text alone make
it harder? (3) which format best explains it? If text alone suffices, a strong
reading layout is used — **no visual is added just to fill space.**

## Topic → block type → learning reason

| # | Topic (DB section) | Block type | Why this visual |
|---|---|---|---|
| 1 | 1.1 Who We Are — Leapswitch Networks | `text` (reading) + `timeline` | The intro is narrative → reading. Company history is a sequence of dated milestones → a **timeline** makes the evolution scannable and memorable. |
| 2 | What Leapswitch Provides | `text` (reading) + `feature_benefit` | The offering paragraph is narrative. The "Why customers choose Leapswitch" value props are each *capability → why it matters*, which is exactly what **feature → benefit** mapping teaches reps to do. |
| 3 | 1.2 Who We Are — CloudPe | `text` (reading) + `ecosystem_diagram` | CloudPe's definition is narrative. The key concept — *how Leapswitch and CloudPe relate* — is a relationship, not a list, so it uses an **ecosystem diagram** (Leapswitch → CloudPe → Customers), exactly as requested. |
| 4 | CloudPe in Practice | `text` (reading, closing) + `feature_benefit` | CloudPe's differentiators are value props → **feature → benefit**. The **module summary** is folded into this final reading card as the closing Key Takeaway (compact), **not** a separate full-page topic. |

Block order in the migration = on-screen pairing: `buildSteps` pairs each `text`
block with the following non-text block into a two-panel `text_with_visual` step.
Result: **4 focused two-panel steps**, each with a purpose-built visual.

## UX decisions

- **Module summary** lives as the closing Key Takeaway on the final step (≈40 words),
  satisfying "do not make a 29–50 word summary a separate full-page topic." Compact,
  on the last screen — not its own empty page.
- **Navigation CTA** is consistent everywhere: secondary context **"Up next: [Topic]"**
  then a primary **Next →**. Verified on desktop, tablet, and narrow widths.
- **Compact vs full layouts**: short reading content uses the compact card; two-panel
  steps fill the viewport on desktop and stack (concept → visual) on tablet/mobile.

## Block types built but **not** used in Module 1 (and why)

These were built for the reusable system but Module 1 has no content that genuinely
needs them — they are reserved for the modules where they fit:

| Block type | Natural home (later modules) |
|---|---|
| `comparison` | M9 — competitive battle cards (us vs competitor) |
| `process_flow` | M10 — the sales cycle; M12 — LACE framework |
| `architecture_diagram` | M3 — infrastructure portfolio / product stack |
| `use_case_cards` | M4 — CloudPe portfolio; M7 — ideal customer profiles |
| `scenario_cards` | M5 — customer challenge → recommended solution |
| `data_visualization` | any module with **real** metrics (see note below) |
| `flashcard`, `knowledge_check` | M16 glossary; end-of-concept checks |

## Content that could NOT be mapped cleanly (reported, not invented)

- **`data_visualization` in Module 1**: the only genuine figures are "founded 2006"
  and "22,000+ customers". That is too thin for an honest chart, and the founding
  year is already carried by the timeline. Per the rule "never invent data just to
  create a chart," **no data visualization was added** to Module 1.
- **Leadership team & exact growth-year list**: the legacy hardcoded slides
  (`SalesOnboardingCourse.tsx`) listed specific leadership names and a slightly
  different year list. These were **not** carried into the structured content because
  they weren't in the canonical DB lesson text and could not be verified — flagging
  rather than inventing. Confirm if you want them added.

## Verification

Rendered the real `LessonWorkspace` + `VisualBlockRenderer` against the actual
migration data (no mocks of the content):

- **Desktop (1280px)** — two-panel concept + dark timeline, correct per-step titles,
  "Up next: What Leapswitch Provides" + Next →.
- **Tablet (768px)** — stacked, up-next + Next → visible.
- **Narrow (≤500px)** — stacked, **no horizontal overflow** (`scrollWidth == innerWidth`),
  text wraps, Next → CTA.
- **All four visuals on dark *and* light surfaces** render with accessible contrast.
- **Malformed / unknown block data** falls back gracefully (no page crash).
