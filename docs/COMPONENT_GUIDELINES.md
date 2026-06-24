# Component Guidelines

> Current state (post-P2): components are functional but not yet standardized.
> This document describes conventions to follow and the P3 component library plan.

## Current Component Inventory

### Shared Components (`src/components/`)

| Component | Purpose | Reusability | Notes |
|-----------|---------|-------------|-------|
| `ErrorBoundary` | Catch render errors; show reload UI | ✅ High | Used at app root |
| `Sidebar` | Nav links, user info, logout | ✅ High | Always visible (no mobile collapse yet) |
| `BlockRenderer` | Renders 14 lesson block types | ✅ High | All `dangerouslySetInnerHTML` sanitized |
| `BlockEditor` | Admin editor for lesson blocks | ⚠️ Admin-only | Heavy, lazy-loaded via route |
| `CourseIndex` | Lesson list / TOC for a course | ✅ Medium | Used in CourseDetail |
| `CourseAppendix` | Supplementary course content | ⚠️ Narrow | Sales-course specific patterns |

### No UI Primitives Exist Yet

There are no reusable `<Button>`, `<Input>`, `<Card>`, `<Badge>`, `<Modal>`, or `<Spinner>` components. All styling is done inline with Tailwind classes, duplicated across pages.

---

## Current Conventions (follow these now)

### Props naming
- Boolean props: no `is` prefix needed for simple toggles — use `disabled`, `loading`, `selected`
- Event handlers: prefix with `on` — `onClick`, `onChange`, `onNavigate`
- Children content: prefer composition over `label` or `content` string props

### Component file structure
```typescript
// 1. Imports
// 2. Types / Interfaces (local to this file)
// 3. Constants (module-level)
// 4. Default export component
// 5. Sub-components (same file if small, separate file if large)
```

### Data fetching
- Pages: use `useQuery` / `useMutation` from react-query; data from `api.ts`
- Components: receive data as props; do NOT fetch inside shared components
- Loading states: render the Tailwind spinner pattern inside the component that owns the fetch

### HTML safety
- Any string rendered via `dangerouslySetInnerHTML` MUST pass through `safeHtml()` from `src/lib/sanitize.ts`
- No exceptions, even for "trusted" admin content

### Error states
- `useQuery` errors: show a simple message — do not crash silently
- `useMutation` errors: use `onError` callback; surface to UI via local state

---

## Planned P3 Component Library

### `src/components/ui/` (to be created in P3)

| Component | API sketch |
|-----------|-----------|
| `Button` | `variant: 'primary' \| 'secondary' \| 'ghost'`, `size: 'sm' \| 'md' \| 'lg'`, `loading`, `disabled` |
| `Input` | Wraps `<input>` with label, error, icon slot |
| `Select` | Consistent select styling with chevron |
| `Badge` | `variant: 'success' \| 'warning' \| 'error' \| 'info' \| 'neutral'` |
| `Card` | Padded white card with optional hover shadow |
| `Modal` | Overlay + escape-key close + focus trap |
| `Spinner` | Consistent loading spinner |
| `ProgressBar` | Animated progress bar with percentage |
| `EmptyState` | Centered icon + heading + optional CTA |
| `Tooltip` | Hover tooltip for icon-only buttons |

### Migration strategy
1. Build new UI components in P3 with Storybook or a component showcase page
2. Progressively replace inline Tailwind patterns in pages with shared components
3. Do NOT do a big-bang refactor; replace as pages are touched for UX work

---

## Anti-Patterns to Avoid

- **Inline `supabase` calls in components** — always go through `api.ts`
- **Prop drilling beyond 2 levels** — use context or co-locate state closer to usage
- **Page-level components doing their own data formatting** — formatting belongs in `api.ts` or `utils.ts`
- **Duplicated spinner markup** — reuse the `<Spinner>` component once created
- **`any` types on component props** — define interfaces for all props
- **Direct `document` manipulation** — use React refs instead

---

## Accessibility Baseline (for new components)

All new components in P3 must:
- Use semantic HTML elements (`<button>` not `<div onClick>`)
- Have visible keyboard focus states (`:focus-visible` ring)
- Have `aria-label` on icon-only interactive elements
- Support `disabled` state with `aria-disabled`
- Not rely on color alone to convey meaning
