# Design System

> Reflects actual styles in use as of 2026-06-24. This is a descriptive document — no formal design token library exists yet (P3 deliverable).

## Typography

| Role | Value | Usage |
|------|-------|-------|
| Font family | `Inter, system-ui, sans-serif` | All text (configured in `tailwind.config.js`) |
| Display heading | `text-2xl font-bold text-slate-800` | Page titles (h2) |
| Section heading | `text-xl font-bold text-slate-800` | Card/section titles |
| Card title | `font-semibold text-slate-800` | Course cards, assessment cards |
| Body | `text-sm text-slate-500` | Descriptions, subtitles |
| Label | `text-sm font-medium text-slate-700` | Form labels |
| Caption | `text-xs text-slate-400` | Metadata, timestamps |
| Mono | `text-sm font-mono text-slate-700` | Certificate IDs, code |

## Color Palette

### Primary (Blue) — from `tailwind.config.js`

| Token | Hex | Usage |
|-------|-----|-------|
| `primary-50` | `#EFF6FF` | Hover backgrounds, light badges |
| `primary-100` | `#DBEAFE` | Avatar backgrounds |
| `primary-200` | `#BFDBFE` | Spinner track color |
| `primary-500` | `#3B82F6` | Progress bars, active indicators |
| `primary-600` | `#2563EB` | Spinner active arc |
| `primary-700` | `#1D4ED8` | Badge text |
| `primary-800` | `#1E3A8A` | Primary button, sidebar, certificate border |
| `primary-900` | `#172554` | Button hover state |

### Neutral (Slate)

| Token | Usage |
|-------|-------|
| `slate-50` | Alternate row / input background |
| `slate-100` | Borders, dividers, skeleton backgrounds |
| `slate-200` | Card borders, input borders |
| `slate-400` | Icon defaults, placeholder text |
| `slate-500` | Body text, subtitles |
| `slate-700` | Labels, form values |
| `slate-800` | Headings, primary text |

### Semantic Colors

| Color | Usage |
|-------|-------|
| `green-50/700` | Success states, passed assessments, completed badges |
| `red-50/700` | Error states, failed assessments |
| `amber-50/600` | Warning states, manual-grading badges, gold seal |
| `blue-50/700` | In-progress states |
| `rose-50/700` | HR department badge |
| `emerald-50/700` | Finance department badge |
| `purple-50/700` | Marketing department badge |

### Department Badge Colors

| Department | Background | Text | Border |
|-----------|-----------|------|--------|
| HR | `rose-50` | `rose-700` | `rose-200` |
| IT | `blue-50` | `blue-700` | `blue-200` |
| Finance | `emerald-50` | `emerald-700` | `emerald-200` |
| Sales | `amber-50` | `amber-700` | `amber-200` |
| Operations | `slate-50` | `slate-700` | `slate-200` |
| Marketing | `purple-50` | `purple-700` | `purple-200` |

---

## Spacing

Tailwind default 4px base unit. Common values in use:

| Token | Value | Usage |
|-------|-------|-------|
| `gap-2` | 8px | Icon + label pairs |
| `gap-3` | 12px | Form field groups |
| `gap-4` | 16px | Card content sections |
| `gap-6` | 24px | Card grid gap, section spacing |
| `p-5` | 20px | Card body padding |
| `p-6` | 24px | Large card / modal body |
| `p-8` | 32px | Certificate modal padding |
| `space-y-6` | 24px vertical | Page-level section spacing |

---

## Border Radius

| Token | Value | Usage |
|-------|-------|-------|
| `rounded-lg` | 8px | Buttons, inputs, small cards |
| `rounded-xl` | 12px | Cards, modals, form containers |
| `rounded-2xl` | 16px | Large modals |
| `rounded-full` | 50% | Badges, avatars, progress pills |

---

## Shadows

| Token | Usage |
|-------|-------|
| `shadow-sm` | Default card shadow |
| `shadow-md` | Card hover state |
| `shadow-lg` | Modal / overlay |
| `shadow-2xl` | Certificate preview modal |

---

## Component Patterns

### Primary Button
```html
<button class="px-4 py-2.5 bg-primary-800 text-white text-sm font-medium rounded-lg
               hover:bg-primary-900 transition-colors disabled:opacity-50">
  Action
</button>
```

### Secondary Button
```html
<button class="px-4 py-2.5 bg-primary-50 text-primary-700 text-sm font-medium rounded-lg
               hover:bg-primary-100 transition-colors">
  Action
</button>
```

### Ghost Button
```html
<button class="px-4 py-2.5 border border-slate-200 text-slate-600 text-sm font-medium
               rounded-lg hover:bg-slate-50 transition-colors">
  Action
</button>
```

### Text Input
```html
<input class="w-full px-4 py-2.5 border border-slate-200 rounded-lg
              focus:ring-2 focus:ring-primary-500 focus:border-primary-500
              outline-none text-sm" />
```

### Badge / Status Pill
```html
<span class="px-2.5 py-1 bg-green-50 text-green-700 text-xs font-medium rounded-full">
  Completed
</span>
```

### Card
```html
<div class="bg-white rounded-xl border border-slate-100 shadow-sm p-6
            hover:shadow-md transition-shadow">
  <!-- content -->
</div>
```

### Spinner (Loading State)
```html
<div class="w-8 h-8 border-4 border-primary-200 border-t-primary-600
            rounded-full animate-spin" />
```

---

## Sidebar

- Width: fixed (not specified in CSS; sidebar takes natural width)
- Background: `bg-primary-800` (deep navy `#1E3A8A`)
- Active link: `bg-primary-900` with white text
- Inactive link: white text at 70% opacity → `text-white/70`
- Icons: 20px (`w-5 h-5`)

---

## Gaps and P3 Priorities

The current design system is **implicit** — conventions exist in code but are not enforced by a shared token library or component library. P3 will:

1. Extract color, spacing, and typography tokens to `src/lib/tokens.ts` or CSS custom properties
2. Create reusable `<Button>`, `<Input>`, `<Badge>`, `<Card>`, `<Modal>` components in `src/components/ui/`
3. Ensure responsive behavior is consistent across all breakpoints (see `RESPONSIVE_GUIDELINES.md`)
4. Define and document animation/transition standards
