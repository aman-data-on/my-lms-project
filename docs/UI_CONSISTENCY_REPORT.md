# UI Consistency Report

> Audit date: 2026-06-24
> Scope: All 11 pages across src/pages/

---

## Button Variants

The codebase uses inline Tailwind rather than a shared Button component. This creates variance across pages.

| Pattern | Pages | Example class string |
|---------|-------|---------------------|
| Primary blue | Dashboard, MyCourses, CourseLibrary | `bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg` |
| Primary blue (sm) | CourseDetail | `bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-md text-sm` |
| Ghost/outline | Assessments, Settings | `border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50` |
| Danger red | AdminPanel | `bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg` |

**Inconsistency:** `rounded-lg` vs `rounded-md` used interchangeably. `px-3 py-1.5` vs `px-4 py-2` for same-size intent. P3 action: extract `<Button>` component.

---

## Card Patterns

| Page | Card style | Shadow | Radius |
|------|-----------|--------|--------|
| Dashboard | `bg-white rounded-xl shadow-sm border border-gray-100` | sm | xl |
| MyCourses | `bg-white rounded-lg shadow-sm` | sm | lg |
| CourseLibrary | `bg-white rounded-xl shadow-sm border border-gray-100` | sm | xl |
| Assessments | `bg-white rounded-xl shadow-sm` | sm | xl |
| Certificates | `bg-white rounded-xl shadow-sm border border-gray-100` | sm | xl |
| AdminPanel | `bg-white rounded-lg shadow` | default | lg |

**Inconsistency:** AdminPanel uses `shadow` (not `shadow-sm`), `rounded-lg` (not `rounded-xl`), and omits the `border border-gray-100`. Recommendation: standardize on `rounded-xl shadow-sm border border-gray-100`.

---

## Loading States

| Page | Loading pattern |
|------|----------------|
| Dashboard | `<LoadingSpinner />` centered |
| MyCourses | `<LoadingSpinner />` centered |
| CourseLibrary | `<LoadingSpinner />` centered |
| CourseDetail | `<LoadingSpinner />` centered |
| Assessments | Inline `<div className="flex justify-center...">` |
| Settings | `<LoadingSpinner />` centered |
| Certificates | `<LoadingSpinner />` centered |
| AdminPanel | `<LoadingSpinner />` centered |

**Inconsistency:** Assessments uses an inline spinner rather than `<LoadingSpinner />`. P3: standardize all loading states to `<LoadingSpinner />`.

---

## Empty States

| Page | Empty state | Has CTA |
|------|------------|---------|
| MyCourses | Icon + message + "Browse Courses" button | ✅ |
| Assessments | Icon + "No assessments available" | ❌ |
| Certificates | Icon + "No certificates yet" | ❌ |
| AdminPanel users | "No users found" text only | ❌ |

**Inconsistency:** Some pages have actionable empty states; others don't. P3: all empty states should have a CTA or explanation of how to resolve the state.

---

## Error Handling

| Page | Error display |
|------|--------------|
| Assessments | Raw `error.message` from Supabase in an alert-style div |
| Settings | Red paragraph below form |
| Auth (Login) | Inline red text |
| CourseDetail | No user-visible error display |

**Inconsistency:** No shared error component. Supabase error strings are sometimes user-visible (e.g., "duplicate key value violates unique constraint"). P3: create `<ErrorMessage>` component with human-friendly messages.

---

## Form Inputs

All form inputs use consistent styling:
```
border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500
```

**No inconsistency found** in input styles. Settings and Auth both use this pattern.

---

## Typography

| Element | Pattern | Pages following it |
|---------|---------|-------------------|
| Page title | `text-2xl font-bold text-gray-900` | Most pages |
| Section heading | `text-lg font-semibold text-gray-800` | Dashboard, Assessments |
| Card label | `text-sm font-medium text-gray-500` | All pages |
| Body text | `text-gray-600` | All pages |

**Minor inconsistency:** CourseDetail uses `text-gray-700` where others use `text-gray-600` for body copy. AdminPanel page title is `text-xl font-bold` instead of `text-2xl font-bold`.

---

## Color Usage

| Semantic color | Usage | Hex |
|---------------|-------|-----|
| Primary action | `blue-600` | #2563EB |
| Success | `green-600` | #16A34A |
| Warning | `yellow-500` | #EAB308 |
| Danger | `red-600` | #DC2626 |
| Neutral background | `gray-50` | #F9FAFB |
| Card background | `white` | #FFFFFF |

**No semantic color inconsistencies found.** Blue-600 is used exclusively for primary actions.

---

## P3 Remediation Plan

| Issue | Fix | Effort |
|-------|-----|--------|
| Button variants not shared | Create `<Button variant size>` component | Medium |
| Card style variance (AdminPanel) | Standardize `rounded-xl shadow-sm border border-gray-100` | Small |
| Assessments inline spinner | Replace with `<LoadingSpinner />` | Small |
| Empty states without CTAs | Add CTA to Assessments, Certificates, AdminPanel | Small |
| Raw Supabase error strings | Create `<ErrorMessage>` + normalize errors in api.ts | Medium |
| AdminPanel typography | Align to `text-2xl font-bold` | Small |
