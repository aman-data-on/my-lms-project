# Responsive Guidelines

> Target: mobile-first, 320px → 1920px+
> Framework: Tailwind CSS breakpoints

## Breakpoints

| Name | Min width | Tailwind prefix | Target device |
|------|-----------|----------------|---------------|
| xs (base) | 320px | (none) | Small mobile |
| sm | 640px | `sm:` | Large mobile |
| md | 768px | `md:` | Tablet portrait |
| lg | 1024px | `lg:` | Tablet landscape / laptop |
| xl | 1280px | `xl:` | Desktop |
| 2xl | 1536px | `2xl:` | Large desktop |

---

## Layout Rules

### App Shell
- **Mobile:** Sidebar collapses (not yet implemented — P3 deliverable). Full-width content area.
- **Tablet+:** Sidebar visible at fixed width; content takes remaining space.
- **Max content width:** Not capped — content fills available space. Consider `max-w-7xl mx-auto` in P3 for very large screens.

### Grid Systems
- **Course grids:** `grid-cols-1 md:grid-cols-2 xl:grid-cols-3`
- **Assessment grids:** Same pattern
- **Settings form:** `grid-cols-1 md:grid-cols-2`
- **Dashboard stats:** Use `grid-cols-2 md:grid-cols-4` (currently varies)

### Content Width Caps
- Assessment take/result views: `max-w-3xl mx-auto` / `max-w-2xl mx-auto` ✅
- Certificate modal: `max-w-4xl w-full` ✅
- Settings: Full width ⚠️ — consider capping at `max-w-3xl` on large screens

---

## Typography Scaling

Currently not responsive — all font sizes are fixed. P3 should introduce responsive type scale:

```css
/* Proposed P3 additions */
h2 { @apply text-xl md:text-2xl; }
p  { @apply text-sm md:text-base; }
```

---

## Navigation

### Current (P2)
- Sidebar always visible — no mobile hamburger menu
- On mobile, sidebar pushes content off-screen or overlaps

### Required (P3)
- Sidebar hidden by default on mobile (`< md`)
- Hamburger button in top bar opens sidebar as overlay or drawer
- Active route closes mobile sidebar automatically
- Keyboard-accessible focus trap when sidebar is open on mobile

---

## Tables and Data-Dense Views

| View | Mobile behaviour |
|------|-----------------|
| Course cards | Single column ✅ |
| Assessment cards | Single column ✅ |
| Reports charts | Scrollable container needed ⚠️ |
| AdminPanel user table | Horizontal scroll needed ⚠️ |
| Settings form | Single column stacks ✅ |

All wide tables should be wrapped in `overflow-x-auto` containers to prevent body horizontal scroll.

---

## Forms

- Inputs use `w-full` ✅
- Grid wraps to single column on mobile via `grid-cols-1 md:grid-cols-2` ✅
- Select elements use `appearance-none bg-white` for cross-browser consistency ✅
- Labels and inputs always stack vertically (not inline) ✅

---

## Images

- Course thumbnails: `w-full h-full object-cover` inside fixed-height containers ✅
- No `max-width` constraint violations observed
- Alt text: empty `alt=""` on decorative images ✅

---

## Touch Targets

WCAG 2.1 SC 2.5.5 requires 44×44px minimum touch targets.

| Component | Current size | Compliant? |
|-----------|-------------|-----------|
| Primary button (`px-4 py-2.5`) | ~40px height | ⚠️ Borderline |
| Icon-only buttons (sidebar, close) | `p-2` = ~32px | ❌ |
| Lesson navigation arrows | `p-1.5` = ~26px | ❌ |

P3 must audit and correct all touch targets.

---

## P3 Responsive Deliverables

1. Mobile sidebar (hamburger + drawer)
2. Responsive typography scale
3. Touch target audit and corrections
4. Reports page: chart containers with overflow-x-auto
5. AdminPanel user table: responsive or card-based on mobile
6. Formal responsive testing at 320px, 375px, 768px, 1024px, 1440px
