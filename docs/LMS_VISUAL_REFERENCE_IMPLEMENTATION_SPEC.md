# LMS Learning Workspace — Visual Reference Implementation Spec

## Purpose

Implement the existing LMS so its learning experience follows the attached visual reference: a polished, content-aware course workspace that feels like a modern LMS rather than a slide deck.

This is a **design and component specification**, not an instruction to copy the image pixel-for-pixel. Preserve the existing project architecture, routes, database content, progress/completion logic, and reusable `VisualBlockRenderer` system. Improve the presentation layer and compose existing/new components around it.

---

## Design Principles

1. **Learning-first, not slide-first**  
   Lessons use natural document flow. Do not force each topic into a fixed-height slide or vertically centered frame.

2. **Content-aware layouts**  
   Short content uses a compact, intentional layout. Rich concepts use diagrams, comparisons, timelines, feature-benefit blocks, scenario cards, or knowledge checks where they improve comprehension.

3. **Meaningful visual density**  
   Avoid blank screens. Fill space only with content that helps learning: a relationship diagram, milestone timeline, key facts, objective callout, or relevant illustration. Never add generic decoration merely to occupy space.

4. **One coherent system**  
   Typography, surfaces, borders, spacing, icons, progress, and navigation must use shared tokens and reusable components.

5. **Responsive by design**  
   Desktop is a workspace; mobile is a focused single-column lesson reader. Do not shrink desktop UI into mobile.

---

## Required Application Shell

### A. Desktop layout (`>= 1200px`)

Use a three-area learning workspace:

```
┌──────────── Sidebar ────────────┬──────────── Main workspace ────────────┐
│ Brand / course identity          │ Top application bar                     │
│ Module title + module progress   │ Breadcrumbs / progress / user controls  │
│ Lesson navigation list           │ Lesson content                           │
│ Module completion card           │ Lesson navigation                         │
└─────────────────────────────────┴─────────────────────────────────────────┘
```

#### 1. Course sidebar

Create a persistent left sidebar, approximately `260–300px` wide.

Required elements:
- Brand/logo area.
- Current module number and module title.
- Module progress: completed lessons / total lessons and progress bar.
- Ordered lesson navigation list:
  - lesson number
  - lesson title
  - active state
  - completed state
  - locked/upcoming state when applicable
- Bottom module completion/progress card.

Behavior:
- Sidebar should be sticky within the viewport on desktop.
- Active lesson is immediately recognizable through a restrained accent treatment, not excessive borders.
- Completed lessons use a clear completion icon/state.
- Long lesson names wrap cleanly; do not truncate essential names.
- Sidebar must not become a second independently scrolling experience unless the lesson list genuinely exceeds viewport height.

#### 2. Top application bar

Use a compact top bar in the main workspace:
- Mobile menu trigger / sidebar collapse trigger where relevant.
- Course name.
- Overall course progress indicator.
- Optional help, notification, and profile controls if these already exist in the application.

Rules:
- Keep this bar compact.
- Do not duplicate large page titles here.
- Use subtle bottom border or surface separation only.

#### 3. Main lesson workspace

Use a centered content container with:
- Desktop max width approximately `1120–1280px`.
- Inner reading content max width approximately `720–800px` when text-only.
- Wider content area for diagrams, timelines, comparisons, and visual blocks.
- Consistent horizontal padding: `32–48px` desktop.
- Top alignment with `32–48px` top padding.
- Natural height; no vertical centering for normal lesson content.

---

## Lesson Composition

### Standard lesson header

Use this hierarchy:

1. Breadcrumbs: `Module 1 > Company Overview > 1.1 Who We Are`
2. Compact topic metadata: `1.1` and optional category label
3. Topic title
4. Optional short lead/summary

Do **not** use:
- oversized numeric badge
- oversized all-caps metadata
- giant title that consumes most of the viewport
- a large empty outer card around every lesson

### Example: “Who We Are” lesson

Recommended composition:

1. Breadcrumbs
2. Topic number + title: `1.1 Who We Are — Leapswitch Networks`
3. Two-column desktop intro:
   - Left: concise lead paragraph
   - Right: relevant purpose-built illustration or ecosystem visual
4. Learning objective callout:
   - icon
   - label: `Your goal`
   - concise objective text
5. Full-width Growth Timeline visual
6. Optional factual highlight strip only if supported by canonical data
7. Bottom lesson navigation

On mobile:
- title and lead first
- illustration below lead
- objective callout
- timeline stacked vertically
- navigation at the natural end of content

---

## Essential Reusable Components

Build or refine these components using the existing design system and `VisualBlockRenderer`.

### 1. `CourseSidebar`
Props should support:
- course identity
- module metadata
- lessons array
- active lesson id
- completion/lock status
- module progress
- callbacks/routes

### 2. `CourseTopBar`
Includes:
- course title
- progress
- menu/sidebar toggle
- existing utility actions where applicable

### 3. `LessonHeader`
Props:
- breadcrumbs
- lesson number
- title
- optional category
- optional lead text

### 4. `LessonHero` / `TopicIntro`
A responsive content-and-visual composition:
- text column
- optional meaningful illustration/diagram column
- stacks on tablet/mobile
- no decorative image if no learning purpose exists

### 5. `LearningObjectiveCallout`
Compact callout with:
- icon
- label
- objective text
- accessible contrast
- no excessive padding or empty space

### 6. `VisualBlockRenderer`
Continue using the central renderer. It must render the correct visual type from structured JSON and gracefully fall back for malformed/unknown data.

Supported visual block types:
- `timeline`
- `comparison`
- `ecosystem_diagram`
- `process_flow`
- `architecture_diagram`
- `feature_benefit`
- `use_case_cards`
- `scenario_cards`
- `data_visualization`
- `flashcards`
- `knowledge_check`

### 7. `TimelineBlock`
Desktop:
- use available width
- horizontal milestone progression where the number of milestones is manageable
- each milestone includes year, title, concise explanation
- no internal/nested scrollbar

Mobile:
- vertical timeline
- readable cards/nodes
- no horizontal overflow

Rules:
- no random emoji as primary icons
- use a consistent icon system
- timeline must be readable at all breakpoints
- let the page scroll naturally

### 8. `KeyFactsStrip` (optional)
Use only when facts are canonical and useful. Examples:
- customer count
- geographic reach
- product/service scope

Rules:
- maximum 3–4 facts
- do not invent data
- hide the entire component if no validated facts exist

### 9. `LessonNavigation`
At the end of the content:
- secondary: `Previous`
- contextual text: `Up next: [Topic name]`
- primary CTA: `Next →`

Rules:
- `Next →` is the primary action, not the topic name itself.
- Desktop: aligned with content end; may be sticky only if it remains connected to learning flow.
- Mobile: full-width or comfortably tappable actions.
- Do not make navigation feel detached like a slideshow control bar.

---

## Visual Style Direction

### Surfaces
- Use a clean neutral/light learning canvas.
- Use dark sidebar only if it matches existing brand direction.
- Use subtle borders and restrained shadows.
- Avoid stacking multiple large bordered cards inside one another.
- Accent color should be used for active states, progress, CTAs, and selective emphasis—not every component.

### Typography
Implement responsive tokens using `clamp()` or equivalent.

Suggested hierarchy:
- Page/topic title: controlled and prominent, not oversized.
- Lead text: comfortable reading size.
- Body text: readable at normal viewing distance.
- Metadata: smaller but accessible.
- CTA text: clear and strong.

Rules:
- Essential text must meet accessible contrast on both light and dark surfaces.
- Do not use faint grey for primary learning content.
- Avoid excessive letter spacing and all-caps labels.
- Maintain readable line length (`~55–75 characters` for prose).

### Spacing
Use a consistent spacing scale. Suggested intent:
- compact gaps for metadata
- moderate gaps between header, lead, and objective
- generous but not wasteful gaps between learning sections
- avoid fixed-height empty regions

---

## Responsive Requirements

### Desktop (`>= 1200px`)
- Persistent sidebar.
- Main content uses a centered max-width workspace.
- Intro can be two columns.
- Timelines/comparisons can use horizontal layouts.
- Visual blocks use available width without becoming excessively stretched.

### Laptop / tablet landscape (`1024px–1199px`)
- Sidebar may collapse to narrower rail or drawer.
- Main workspace remains comfortable.
- Two-column layouts may remain only if each column has sufficient width.

### Tablet portrait (`768px–1023px`)
- Sidebar becomes collapsible drawer.
- Main content is single column unless a visual specifically supports two columns.
- Visual blocks stack or simplify without reducing text below readable size.

### Mobile (`< 768px`)
- No persistent sidebar; use drawer triggered from top bar.
- Single-column lesson flow.
- Horizontal timelines become vertical.
- Comparison tables become stacked comparison cards.
- Buttons meet touch target requirements.
- No horizontal page overflow.
- No nested scroll containers for normal learning content.
- Content padding approximately `16–20px`.
- Bottom navigation remains easy to reach and does not cover content.

Test at:
- 1440px
- 1280px
- 1024px
- 768px
- 430px
- 375px

---

## Module 1 Content Rules

- Keep the Module Summary on the Module 1 overview/landing screen, before the topic list.
- Do not make a 29–50 word summary a full standalone page.
- Use visuals only when they improve learning:
  - company evolution → timeline
  - Leapswitch → CloudPe → customer relationship → ecosystem diagram
  - capabilities/value propositions → feature-benefit mapping
- Do not create data charts from insufficient data.
- Use only canonical DB content. Record legacy-only content separately until validated.

---

## Acceptance Criteria

The implementation is ready for review only when all of the following are true:

- Module 1 no longer looks like a hardcoded slideshow inside a web page.
- No vertically centered normal lesson pages.
- No giant empty cards around short content.
- No nested scrollbar inside short timeline or visual blocks.
- Desktop has a coherent LMS workspace with sidebar, top bar, learning area, and end-of-content navigation.
- Mobile is a focused, readable single-column learning experience.
- Typography is readable, responsive, and accessible.
- Every visual block has a learning purpose.
- Existing progress/completion behavior remains functional.
- No horizontal overflow at tested breakpoints.
- Screenshots are provided for desktop and mobile:
  - Module overview
  - Who We Are / intro lesson
  - Timeline lesson
  - feature-benefit lesson
  - ecosystem lesson
