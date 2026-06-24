# Accessibility Report

> Audit date: 2026-06-24 (post-P2 baseline)
> Standard: WCAG 2.1 Level AA
> Method: Manual code review + automated rule application
> Status: **BASELINE — Remediation required in P3**

## Summary

| Category | Status | Issues Found |
|----------|--------|-------------|
| Semantic HTML | ⚠️ Partial | Non-semantic elements used for interactive controls |
| Keyboard navigation | ❌ Incomplete | Many interactive elements not keyboard-reachable |
| Focus management | ❌ Missing | No focus trap in modals; no skip link |
| Screen reader support | ⚠️ Partial | Missing labels on icon-only buttons |
| Color contrast | ✅ Mostly OK | Slate-500 on white: ~4.7:1 (passes AA) |
| Touch targets | ❌ Undersized | Multiple elements below 44×44px |
| Motion / animation | ⚠️ No preference | No `prefers-reduced-motion` check |
| Form accessibility | ⚠️ Partial | Some inputs missing associated labels |

---

## Findings

### 1. Semantic HTML

**Issue:** Several interactive elements use `<div onClick>` or `<span onClick>` patterns instead of `<button>`.
- BlockRenderer quiz items
- Some sidebar navigation elements in legacy patterns

**Impact:** Screen readers cannot identify these as interactive. Keyboard users cannot activate them.

**Fix:** Replace all `<div onClick>` / `<span onClick>` interactive elements with `<button type="button">`.

---

### 2. Icon-Only Buttons

**Issue:** Buttons that show only an icon have no visible or accessible label.
- Sidebar collapse (not yet implemented)
- Certificate modal close button (`<X>` icon)
- BlockEditor delete/move buttons
- Lesson navigation arrows

**Impact:** Screen readers announce "button" with no context. User cannot know the button's purpose.

**Fix:** Add `aria-label` to all icon-only buttons:
```tsx
<button aria-label="Close certificate preview" onClick={...}>
  <X className="w-5 h-5" />
</button>
```

---

### 3. Modal Focus Management

**Issue:** The certificate preview modal (`Certificates.tsx`) uses a `fixed` overlay but:
- Does not trap focus within the modal
- Does not return focus to the trigger button on close
- Does not respond to `Escape` key

**Impact:** Keyboard users can tab behind the overlay. Screen readers are not informed that a dialog is open.

**Fix:**
- Add `role="dialog"` and `aria-modal="true"` to the modal container
- Add `aria-labelledby` pointing to the modal heading
- Implement focus trap (loop Tab within modal)
- Add `onKeyDown` handler for `Escape` key

---

### 4. Form Labels

**Issue:** Some form inputs in `Settings.tsx` and `Assessments.tsx` builder use visually-adjacent `<label>` elements, but the `for`/`htmlFor` association is missing on some inputs.

**Fix:** Ensure all `<label>` elements have `htmlFor` matching the input's `id`:
```tsx
<label htmlFor="full-name">Full Name</label>
<input id="full-name" type="text" ... />
```

---

### 5. Color Contrast

Tested against WCAG 2.1 AA (4.5:1 for normal text, 3:1 for large text):

| Element | Foreground | Background | Ratio | Pass? |
|---------|-----------|-----------|-------|-------|
| Body text `slate-800` | `#1e293b` | `#ffffff` | ~13:1 | ✅ |
| Secondary text `slate-500` | `#64748b` | `#ffffff` | ~4.7:1 | ✅ |
| Caption `slate-400` | `#94a3b8` | `#ffffff` | ~2.9:1 | ❌ |
| Primary button text | `#ffffff` | `#1E3A8A` | ~8:1 | ✅ |
| Badge text `green-700` | `#15803d` | `#f0fdf4` | ~4.5:1 | ✅ |
| Badge text `slate-500` | `#64748b` | `#f8fafc` | ~4.4:1 | ⚠️ Borderline |

**Fix:** Darken `slate-400` caption text to `slate-500` minimum in all caption/metadata contexts.

---

### 6. Touch Targets

See `RESPONSIVE_TEST_REPORT.md` — touch target section. Multiple elements below 44×44px.

---

### 7. Reduced Motion

**Issue:** Spinner animations, card hover transitions, and progress bar transitions have no `prefers-reduced-motion` media query check.

**Fix:** Add Tailwind's `motion-reduce:` modifier or a global CSS rule:
```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

### 8. Skip Navigation Link

**Issue:** No skip-to-main-content link at page top.

**Impact:** Keyboard users must Tab through the entire sidebar on every page before reaching main content.

**Fix:** Add a visually-hidden skip link that becomes visible on focus:
```tsx
<a href="#main-content" className="sr-only focus:not-sr-only focus:absolute ...">
  Skip to content
</a>
```

---

### 9. ARIA Live Regions

**Issue:** Dynamic state changes (quiz answer selection, loading states, save confirmations in Settings) have no ARIA live region announcements.

**Impact:** Screen reader users are not informed when the page state changes dynamically.

**Fix:** Add `aria-live="polite"` to status message containers:
```tsx
<div role="status" aria-live="polite">
  {message && <span>{message}</span>}
</div>
```

---

## P3 Accessibility Deliverables

| Priority | Item | Effort |
|----------|------|--------|
| High | `aria-label` on all icon-only buttons | Small |
| High | Modal focus trap + Escape key + `role="dialog"` | Medium |
| High | Form `htmlFor`/`id` associations | Small |
| Medium | Replace `<div onClick>` with `<button>` | Medium |
| Medium | Skip navigation link | Small |
| Medium | Caption text contrast (`slate-400` → `slate-500`) | Small |
| Medium | `prefers-reduced-motion` global CSS | Small |
| Low | ARIA live regions for status messages | Medium |
| Low | Full keyboard navigation audit | Large |
