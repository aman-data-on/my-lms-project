# UX Research

> Scope: LMS and SaaS dashboard benchmarking to inform P3 design direction.
> Date: 2026-06-24

## Benchmarked Products

Products reviewed for navigation, course/content patterns, and assessment UX:

| Product | Category | Key patterns observed |
|---------|---------|----------------------|
| Coursera | LMS | Course cards with progress rings, structured module view, certificate gallery |
| TalentLMS | LMS | Dashboard widgets, course catalog with filters, quiz builder |
| Moodle | LMS | Course grid, gradebook, activity completion tracking |
| Notion | Productivity | Sidebar nav, breadcrumb hierarchy, clean typography |
| Linear | Task management | Keyboard-first navigation, minimal chrome, status badges |

---

## Navigation Patterns

### What works in leading products

**Clear information hierarchy**
- Top-level nav in sidebar with clear icons + labels
- Breadcrumbs for deep views (course → lesson)
- Active state immediately visible

**Consistent back navigation**
- Back button always returns to parent context (not browser back)
- Breadcrumb trail for 3+ levels deep

**Search / filter at the top of list views**
- Filters visible immediately — no extra click to reveal
- Search debounced, results live

### Current LMS gaps

| Gap | Severity | P3 Fix |
|-----|---------|--------|
| No mobile sidebar (hamburger) | High | Add collapsible sidebar drawer |
| No breadcrumbs in CourseDetail | Medium | Add lesson/course breadcrumb |
| Sidebar has no section groupings | Low | Group: Learning, Admin, Account |
| No global search | Low | Phase 4 feature |

---

## Dashboard Patterns

### Industry standard dashboard for LMS

Top products use a structured layout:
1. **Stats row** — enrolled, completed, certificates, pending (4 KPIs)
2. **Continue learning** — single prominent card, not a list
3. **Activity feed** — recent actions, timestamped
4. **Upcoming** — next due assessment or deadline

**Current LMS dashboard:** Matches this pattern ✅. P3 should focus on visual polish and responsive layout.

---

## Course Discovery Patterns

**Card grid with filters** (Coursera, TalentLMS pattern):
- Filter by department, status, duration
- Sort by enrollment date, title, progress
- Search inline
- Status badge on card: Not Started, In Progress, Completed

**Current CourseLibrary:** Filter by department and status ✅. Missing: sort controls, duration filter.

---

## Assessment UX Patterns

**Leading patterns:**
- One question per screen with clear progress indicator (Google Forms style)
- Timer always visible in fixed position
- Previous/Next navigation; submission requires explicit confirmation
- Results show score, pass/fail, and per-question breakdown immediately

**Current Assessments:** Matches all of these ✅. P3 improvement areas:
- Add "Submit" confirmation dialog (currently immediate on click)
- Progress indicator (current question X of Y already shown ✅)
- Better timer styling when time is critical (already red ✅)

---

## Empty State Patterns

**Best practice (from Linear/Notion):**
- Illustration or icon that relates to the empty content type
- Short, action-oriented message
- Primary CTA button to resolve the empty state

**Current LMS empty states:**
- MyCourses: icon + "Browse Courses" button ✅
- Certificates: icon + message ✅ (no CTA to take an assessment)
- Assessments: icon + message ✅

**P3 improvement:** Add CTA button to Certificates empty state → "Take an assessment"

---

## Loading State Patterns

**Current:** Centered spinner for page-level loading. Consistent across all pages ✅.

**P3 improvement:** Consider skeleton screens for the dashboard and course list, which feel less jarring than a blank → content flash.

---

## User Journey Analysis

### New employee (primary persona)

1. Receive onboarding email → login
2. Dashboard → see Welcome + pending enrollments
3. Browse Course Library → enroll in department course
4. MyCourses → continue learning
5. Complete all lessons → take assessment
6. Pass assessment → receive certificate
7. View certificate → download PDF

**Friction points identified:**
- After login, user lands on Dashboard with no guidance if no enrollments exist
- No "recommended courses" surface — discovery is entirely self-directed
- No progress notifications or reminders
- Certificate download requires 2 clicks (View then Download) — could be 1

### Admin persona

1. Login → Dashboard shows employee stats
2. AdminPanel → manage users, view enrollments
3. CourseBuilder → create/edit courses
4. Assessments → create assessments for course
5. Reports → view completion rates

**Friction points:**
- No admin dashboard with aggregate stats (enrolled, passing rate, avg score)
- No way to message or notify employees
- Assessments and CourseBuilder are separate flows — admin must context-switch

---

## P3 UX Priorities

| Priority | Feature | Source |
|----------|---------|--------|
| High | Mobile sidebar | Responsiveness benchmark |
| High | Skeleton loading on Dashboard/CourseLibrary | Perceived performance |
| Medium | Certificates empty state CTA | User journey gap |
| Medium | Submit assessment confirmation dialog | Assessment UX best practice |
| Medium | Sort controls in CourseLibrary | Discovery patterns |
| Low | Breadcrumbs in CourseDetail | Navigation clarity |
| Low | Sidebar section groupings | Navigation clarity |
